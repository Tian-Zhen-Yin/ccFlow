---
title: "用 Claude Code 从零构建个人作品集：全流程实录"
slug: "building-portfolio-with-claude-code"
date: "2026-04-18"
tags:
  - Claude Code
  - Next.js
  - Vercel
  - AI编程
  - 个人作品集
published: true
excerpt: "记录使用 Claude Code 从设计文档到代码实现、再到 Vercel 部署的完整过程，包括踩坑记录和解决方案"
readingTime: 15
---

## 项目背景

作为一个开发者，拥有一个展示自己作品的个人网站是很有必要的。我决定使用 Claude Code（Anthropic 的 AI 编程助手）来辅助完成这个项目——从设计文档到代码实现，再到最终部署上线。

这篇文章记录了整个过程中遇到的问题和解决方案，希望能帮助到同样想用 AI 工具构建项目的开发者。

## 技术选型

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14.2 | 全栈框架（App Router） |
| TypeScript | 5.x | 类型安全 |
| Tailwind CSS | 3.4 | 暗黑科技风主题 |
| Markdown + gray-matter | - | 内容管理 |
| Jest | 29.7 | 单元测试 |
| Vercel | - | 部署托管 |
| GitHub Actions | - | CI 流水线 |

## 第一步：编写设计文档

在动手写代码之前，我先准备了三份文档：

1. **架构文档（jiagou.md）** — 定义技术栈、目录结构、组件分层
2. **设计思维（thinkFile.md）** — 记录设计决策的理由和权衡
3. **详细设计规格（design spec）** — 包含配色方案、组件规格、交互细节

这个步骤至关重要。好的设计文档让 AI 生成的代码更符合预期，也避免了反复修改。

### 主题设计

我选择了暗黑科技风（Dark Sci-Fi）作为视觉方向：

- **主色**：`#6C63FF`（紫蓝渐变）
- **强调色**：`#00D9FF`（霓虹蓝）
- **背景**：`#0A0A0F` → `#1A1A2E`（深色层次）
- **字体**：Inter + JetBrains Mono

## 第二步：生成实施计划

使用 Claude Code 的 **writing-plans** 技能，将设计文档转化为 13 个可执行的任务：

1. 项目脚手架和配置
2. 类型定义和常量
3. Markdown 解析工具
4. 内容读取器
5. 布局组件（Navbar + Footer）
6. 首页组件（Hero 粒子动画）
7. 项目卡片和列表
8. 博客卡片和列表
9. 作品集详情页（ISR）
10. 博客详情页（TOC + ISR）
11. 关于页面
12. 生产配置和安全头
13. GitHub Actions CI

每个任务包含完整的测试代码、实现代码和提交命令。

## 第三步：代码实现（Subagent-Driven Development）

采用 **子代理驱动开发** 模式：

- 每个任务由独立的 AI 子代理实现
- 实现完成后先进行**规格合规审查**
- 再进行**代码质量审查**
- 所有审查通过后才标记完成

### 关键实现细节

#### Server Components 为主

```typescript
// 大部分组件是 Server Component，不打包到客户端
export default async function BlogPage() {
  const blogs = await getBlogs()
  return <PostList posts={blogs} />
}
```

仅在需要浏览器 API 时使用 `'use client'`：
- **Hero** — Canvas 粒子动画
- **Navbar** — 滚动状态和移动端菜单
- **ScrollReveal** — IntersectionObserver
- **DemoEmbed** — iframe 交互

#### ISR 策略

```typescript
// 详情页每小时重新生成
export const revalidate = 3600

export async function generateStaticParams() {
  const blogs = await getBlogs()
  return blogs.map(b => ({ slug: b.slug }))
}
```

#### Markdown 渲染管线

```
gray-matter → remark-parse → remark-rehype → rehype-slug → rehype-highlight → rehype-stringify
```

### 踩坑记录

**坑 1：ESM 模块在 Jest 中无法解析**

unified/remark/rehype 是 ESM 包，Jest 默认会忽略 node_modules。需要在 `jest.config.ts` 中配置 `transformIgnorePatterns` 过滤这些包。

**坑 2：next.config.ts 不被支持**

Next.js 14.2.x 不支持 TypeScript 配置文件，必须使用 `.mjs` 后缀。

**坑 3：Google Fonts SSL 错误**

在本地构建环境中访问 Google Fonts 会遇到 `UNABLE_TO_GET_ISSUER_CERT_LOCALLY` 错误。解决方案是通过 CSS 变量设置系统字体作为 fallback：

```css
--font-inter: "Inter", ui-sans-serif, system-ui, sans-serif;
--font-jetbrains-mono: "JetBrains Mono", ui-monospace, monospace;
```

**坑 4：Tailwind Typography 没有 prose-surface**

`prose-surface` 不是 Tailwind Typography 插件的内置类。使用 `prose-invert` 替代。

## 第四步：GitHub Actions CI

配置了三阶段 CI 流水线：

```yaml
jobs:
  test:    # 单元测试（14 个测试全部通过）
  build:   # 生产构建（needs: test）
  lint:    # 代码检查（与 test 并行）
```

关键配置：
- `concurrency` 控制避免重复构建
- `cancel-in-progress: true` 新推送自动取消旧的运行
- `permissions: contents: read` 最小权限原则

## 第五步：Vercel 部署（最难的部分）

部署过程比预期复杂得多，以下是完整的踩坑和解决过程。

### 问题 1：SSH 密钥权限

本地 SSH 密钥关联在 `tianzhengyin0-pixel` 账户，无法推送到 `Tian-Zhen-Yin` 的仓库。

**解决**：为不同 GitHub 账户生成独立密钥，配置 SSH config：

```
Host github.com-tianzhenyin
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_tianzhenyin
  IdentitiesOnly yes
```

### 问题 2：Vercel 框架检测错误

项目创建时 `framework` 被设置为 `null`（Other），导致：
- Vercel 将项目当作静态站点处理
- 查找 `public` 目录而非使用 Next.js builder
- 所有动态路由返回 404

**解决**：通过 Vercel API 修正：

```bash
curl -X PATCH "https://api.vercel.com/v9/projects/{id}" \
  -d '{"framework":"nextjs","nodeVersion":"20.x"}'
```

### 问题 3：生产分支不匹配

Vercel 默认生产分支为 `main`，但仓库使用的是 `master`。

**解决**：将本地分支重命名为 `main` 并推送：

```bash
git branch -m master main
git push -u origin main
```

### 问题 4：Node.js 版本兼容

Vercel 默认使用 Node.js 24.x，但 Next.js 14.2 需要更低版本。

**解决**：通过 API 将 Node 版本设为 `20.x`。

### 问题 5：SSL 证书问题

本地网络环境存在 SSL 证书拦截，导致 `vercel login` 和 `npx vercel deploy` 失败。

**解决**：临时绕过 SSL 验证：

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npx vercel login
NODE_TLS_REJECT_UNAUTHORIZED=0 npx vercel --prod
```

### 问题 6：CLI 上传模式失败

`npx vercel --prod` 上传项目文件后，Vercel 服务器构建失败，提示找不到 Next.js。

**解决**：使用 Git 集成部署（Vercel 从 GitHub 拉取代码构建），而非 CLI 上传模式。

### 最终部署方案

1. 通过 API 创建项目，正确设置 `framework: "nextjs"` 和 `nodeVersion: "20.x"`
2. 关联 GitHub 仓库 `Tian-Zhen-Yin/ccFlow`
3. 推送到 `main` 分支触发自动构建
4. 将成功的 Preview 部署提升为 Production

## 项目成果

- **14 个单元测试**全部通过
- **11 个页面**成功生成（含 SSG + ISR）
- **8 条路由**：首页、作品集列表/详情、博客列表/详情、关于页面
- **GitHub Actions CI** 自动化测试、构建、代码检查
- **Vercel 生产部署**成功上线

### 项目结构

```
ccFlow/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 首页
│   ├── layout.tsx         # 根布局
│   ├── projects/          # 作品集
│   ├── blog/              # 博客
│   └── about/             # 关于
├── components/            # React 组件
│   ├── home/              # 首页组件
│   ├── layout/            # 布局组件
│   ├── blog/              # 博客组件
│   ├── projects/          # 项目组件
│   └── ui/                # 通用 UI 组件
├── content/               # Markdown 内容
│   ├── projects/          # 项目描述
│   └── blogs/             # 博客文章
├── lib/                   # 工具函数
│   ├── types.ts           # 类型定义
│   ├── constants.ts       # 常量
│   ├── markdown.ts        # Markdown 解析
│   └── content.ts         # 内容读取
├── __tests__/             # 单元测试
└── .github/workflows/     # CI 配置
```

## 经验总结

### AI 辅助开发的优势

1. **速度**：从设计到部署，整个过程在一天内完成
2. **一致性**：代码风格、命名规范保持统一
3. **测试覆盖**：AI 天然遵循 TDD 流程，先写测试再实现
4. **文档化**：计划文档本身就是最好的项目文档

### 需要注意的地方

1. **设计文档是关键**：输入质量决定输出质量
2. **验证每一步**：AI 生成的代码需要人工审查
3. **部署环境差异**：本地能跑不代表线上能跑，注意 SSL、Node 版本、框架检测
4. **权限管理**：多账户 SSH 配置、Vercel API 权限要提前规划

### 适合 AI 辅助的项目

- 有明确设计文档的项目
- 标准技术栈（Next.js、React、Tailwind 等）
- 内容驱动型网站（博客、作品集、文档站）
- 需要快速原型的 MVP

---

*本文由 PangHu 撰写，使用 Claude Code 辅助开发和部署。项目源码：[github.com/Tian-Zhen-Yin/ccFlow](https://github.com/Tian-Zhen-Yin/ccFlow)*
