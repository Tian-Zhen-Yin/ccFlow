---
title: "Express + Prisma 全栈应用部署到 Vercel Serverless 的完整指南"
slug: "panghu-vercel-deploy"
date: "2026-04-28"
tags:
  - Vercel
  - Serverless
  - Express
  - Prisma
  - 部署
  - Vue
published: true
excerpt: "记录胖虎（哈吉咪养成计划）从本地 Express+Prisma+Vue 全栈应用到 Vercel Serverless 部署的完整过程，包含 esbuild 打包、Prisma 适配、数据库连接池、7 个踩坑记录"
readingTime: 20
---

将一个 Express + Prisma + Vue 3 的全栈应用部署到 Vercel Serverless，远比想象中复杂。本文记录了胖虎（哈吉咪养成计划）从本地开发到线上运行的完整过程，包含 7 个实际踩过的坑和对应的解决方案。

## 项目背景

胖虎是一个猫咪养护应用，技术栈：

- **后端**: Express + Prisma ORM + PostgreSQL (Supabase) + ZhipuAI
- **前端**: Vue 3 + Vite + Element Plus + Pinia
- **部署目标**: Vercel Serverless Functions（前后端同仓库）

```
用户请求
  ↓
Vercel CDN / Edge Network
  ↓
vercel.json rewrites 路由分发
  ├── /api/*     → api/[[...path]].js (Serverless Function)
  │                 ↓ lazy load
  │               api/_server.js (esbuild bundle)
  │                 ↓
  │               Express app → Prisma → Supabase PostgreSQL
  └── /*         → frontend/dist/index.html (静态 SPA)
```

## 仓库结构

```
PangHu/
├── api/                        # Vercel Serverless Function 入口
│   ├── [[...path]].js          # catch-all 路由入口
│   └── _server.js              # esbuild 打包后的后端 bundle
├── backend/                    # Express 后端源码
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── server.ts
│   │   ├── config/database.ts
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
├── frontend/                   # Vue 3 前端
│   ├── src/
│   └── package.json
├── scripts/
│   └── vercel-postinstall.js   # Prisma Client 复制脚本
├── vercel.json
└── package.json                # 根 package.json（构建入口）
```

## 第一步：esbuild 打包策略

Vercel Serverless Function 需要将 Express 应用打包为单文件。关键在于哪些包打入 bundle，哪些排除在外。

```json
{
  "scripts": {
    "build": "mkdir -p ../api && prisma generate && esbuild src/server.ts --bundle --platform=node --target=node20 --format=cjs --outfile=../api/_server.js --external:@prisma/client --external:@prisma/adapter-pg --external:pg"
  }
}
```

**关键决策**:
- `--external` 标记 Prisma 和 pg 相关包不打入 bundle，运行时从 `node_modules` 加载（Prisma 的原生引擎需要如此）
- `--format=cjs` 因为 Vercel Serverless Function 使用 CommonJS
- `--platform=node --target=node20` 匹配 Vercel 的 Node.js 运行时

## 第二步：Prisma Client 位置映射

Prisma Client 生成在 `backend/node_modules/.prisma/client`，但 Serverless Function 从根目录加载 `@prisma/client`。需要一个 postinstall 脚本复制到正确位置。

```javascript
// scripts/vercel-postinstall.js
const src = path.join(rootDir, 'backend', 'node_modules', '.prisma')
const dest = path.join(rootDir, 'node_modules', '.prisma')

if (fs.existsSync(src)) {
  fs.cpSync(src, dest, { recursive: true })
}
```

同时，Prisma Schema 需要指定 Vercel 运行时的 binaryTarget：

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "darwin-arm64", "rhel-openssl-3.0.x"]
}
```

`rhel-openssl-3.0.x` 对应 Vercel 的运行时平台，不加这个会报找不到引擎二进制文件的错误。

## 第三步：Serverless Function 入口

```javascript
// api/[[...path]].js
let _app = null

module.exports = async (req, res) => {
  // 独立健康检查，不加载整个 bundle
  if (req.url === '/api/health') {
    res.statusCode = 200
    res.end(JSON.stringify({ status: 'ok' }))
    return
  }

  try {
    if (!_app) {
      const mod = require('./_server.js')
      _app = mod.default || mod
    }
    return _app(req, res)
  } catch (err) {
    res.statusCode = 500
    res.end(JSON.stringify({ error: err.message }))
  }
}
```

设计要点：懒加载避免冷启动时加载不必要的模块，独立健康检查端点方便调试环境变量问题。

## 第四步：Express 适配 Serverless

### 信任 Vercel 代理

```typescript
if (process.env.VERCEL) app.set('trust proxy', 1)
```

Vercel 使用反向代理，`express-rate-limit` 需要读取 `X-Forwarded-For` 头。不加这个会报 `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`。

### 上传目录适配

```typescript
const isVercel = !!process.env.VERCEL
const baseUploadDir = isVercel
  ? path.join('/tmp', 'uploads')
  : path.join(process.cwd(), 'uploads')
```

Vercel 函数运行时文件系统是只读的，只有 `/tmp` 可写。原代码使用 `process.cwd()` 下的 `uploads` 目录会导致 `mkdirSync` 崩溃。

### 不启动 HTTP 服务

```typescript
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server running on :${PORT}`))
}
```

Vercel 环境下 Express 不需要 `app.listen()`，Serverless Function handler 直接调用 Express 应用。

## 第五步：数据库连接池

Supabase 提供两种连接方式：

| 方式 | 端口 | 用途 |
|------|------|------|
| 直连 | 5432 | 本地开发 |
| 连接池 | 6543 | Serverless |

**必须使用连接池模式**，并添加 `?pgbouncer=true`：

```
postgresql://postgres.xxx:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Serverless Functions 频繁创建/销毁连接，直连会快速耗尽数据库连接数。

## 第六步：vercel.json 路由配置

```json
{
  "buildCommand": "npm run vercel-build && cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "npm install && cd backend && npm install && cd ../frontend && npm install",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/[[...path]]" },
    { "source": "/uploads/(.*)", "destination": "/api/[[...path]]" },
    { "source": "/cats/(.*)", "destination": "/api/[[...path]]" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 完整踩坑清单

### 坑 1：项目关联错误

`vercel link` 时关联到了错误的项目（cc-flow），所有环境变量设置在了错误项目上。

**解决**: 检查 `.vercel/project.json` 中的 `projectId`，用 `vercel link --project pang-hu` 重新关联。

### 坑 2：函数启动超时（API 504）

`mkdirSync('/var/task/uploads/pets')` 在 Vercel 只读文件系统上崩溃。

**解决**: 上传目录改为 `/tmp/uploads`。

### 坑 3：数据库连接失败（P1001）

环境变量在错误项目 + 使用直连而非连接池。

**解决**: 重新关联项目 + 使用 pooler URL + `?pgbouncer=true`。

### 坑 4：限流中间件报错

`ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` — Vercel 反向代理发送 `X-Forwarded-For`，Express 未配置 trust proxy。

**解决**: `app.set('trust proxy', 1)`。

### 坑 5：AI API Key 格式错误

`echo` 管道设置环境变量时引入了尾部换行符。

**解决**: 使用 `vercel env add ZHIPUAI_API_KEY --value "your-key"` 设置。

### 坑 6：注册验证失败

用户名 2 个中文字符，验证规则 `min: 3` 导致。

**解决**: 改为 `min: 2`，验证规则要考虑目标用户群的使用习惯。

### 坑 7：TLS 证书错误

本地网络环境（代理/VPN）SSL 证书不被信任。

**解决**: `NODE_TLS_REJECT_UNAUTHORIZED=0 vercel --prod`。

## 经验总结

1. **Serverless 不等于传统服务器**: 文件系统只读、无持久进程、短生命周期。任何依赖本地文件写入或后台任务的代码都需要适配。

2. **Prisma 在 Serverless 下的关键步骤**: `binaryTargets` 必须包含 Vercel 平台（`rhel-openssl-3.0.x`），生成产物必须复制到 Serverless Function 能找到的位置。

3. **数据库连接池是必需品**: Serverless 环境下每次请求可能创建新连接，不使用连接池会快速耗尽连接数。

4. **环境变量是第一大坑**: 项目关联错误、值包含换行符、在错误项目上配置——这类问题占了调试时间的大部分。

5. **esbuild bundle + external 是平衡点**: 把 Express 打包成单文件（快速加载），同时将 Prisma/pg 等需要原生二进制的包排除（运行时解析）。

---

*项目源码：[github.com/Tian-Zhen-Yin/PangHu](https://github.com/Tian-Zhen-Yin/PangHu)*

*在线演示：[pang-hu.vercel.app](https://pang-hu.vercel.app)*
