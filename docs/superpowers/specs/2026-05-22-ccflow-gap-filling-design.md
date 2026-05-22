---
name: ccFlow Gap Filling Design
date: 2026-05-22
status: approved
---

# ccFlow 功能缺口补全 — 详细设计文档

> **定位：** 补全 jiagou.md 中描述但未实现的三个功能缺口
> **策略：** 方案 B（主站 npm scripts 扩展）
> **技术栈：** Node.js 脚本 + 已有项目结构 + Anthropic API

---

## 一、整体架构

### 1.1 新增目录结构

```
ccFlow/
├── scripts/
│   ├── scaffold.mjs          # 子项目脚手架
│   ├── blog-create.mjs       # AI 辅助博客创建
│   └── blog-publish.mjs      # 草稿博客发布
├── templates/
│   ├── nextjs/               # Next.js 模板 + CLAUDE.md
│   ├── vue3-vite/            # Vue3+Vite 模板 + CLAUDE.md
│   ├── vanilla/              # Vanilla JS 模板 + CLAUDE.md
│   └── node-service/         # Node.js 服务模板 + CLAUDE.md
├── content/
│   └── drafts/               # 博客草稿目录（新增）
└── package.json              # 新增 3 条 scripts
```

### 1.2 新增 npm scripts

```json
{
  "scripts": {
    "scaffold": "node scripts/scaffold.mjs",
    "blog:create": "node scripts/blog-create.mjs",
    "blog:publish": "node scripts/blog-publish.mjs"
  }
}
```

---

## 二、子项目脚手架（scaffold.mjs）

### 2.1 用法

```bash
npm run scaffold -- --name my-project --template nextjs --desc "项目描述"
npm run scaffold -- -n my-project -t vue3-vite -d "项目描述"
npm run scaffold -- -n existing-project -t vanilla --force   # 覆盖已有目录
```

### 2.2 支持的模板

| 模板名 | 技术栈 | 输出内容 |
|--------|--------|----------|
| `nextjs` | Next.js 14 + Tailwind | pages/index.js, next.config.mjs, tailwind.config.js, vercel.json, CLAUDE.md |
| `vue3-vite` | Vue 3 + Vite + Tailwind | src/main.js, src/App.vue, vite.config.js, tailwind.config.js, vercel.json, CLAUDE.md |
| `vanilla` | 纯 HTML/CSS/JS | index.html, style.css, app.js, vercel.json, CLAUDE.md |
| `node-service` | Node.js + Express | src/index.js, package.json, vercel.json, CLAUDE.md |

### 2.3 工作流

1. 从 `templates/<type>/` 复制到目标目录 `./<name>/`
2. 替换模板变量（`{{project-name}}`、`{{description}}`、`{{year}}` 等）
3. 若无特殊指定，默认 `--template nextjs`
4. **幂等性：** 目标目录已存在时，默认报错退出，除非传入 `--force` / `-f` 参数允许覆盖
5. 输出成功信息和下一步指引

### 2.4 输出示例

```
✔ 项目 my-project 已创建，使用 nextjs 模板
下一步：
  cd my-project
  npm install
  git init && git add .
  gh repo create my-project --public --push
  # 或手动推送到已有仓库
```

---

## 三、CLAUDE.md 模板规范

每个子项目模板的根目录包含 `CLAUDE.md`，结构如下：

```markdown
# {{project-name}}

## 技术栈
- 框架: {{framework}}
- 构建: {{build-tool}}
- 部署: Vercel

## 常用命令
- `npm run dev` — 本地开发
- `npm run build` — 构建

## 项目定位
{{description}}

## 关联项目
- 主站: [PangHu Portfolio](https://github.com/your-org/ccFlow)
```

---

## 四、博客创建与发布（优化版）

### 4.1 AI 辅助创建（blog-create.mjs）

**用法：**

```bash
npm run blog:create -- "文章标题" --tags "Claude Code,Next.js"
```

**工作流优化：**
1. 读取参数 -> 2. 调用 Anthropic API（带严格格式 Prompt 约束） -> 3. **清洗响应体（剥离首尾 Markdown 围栏）** -> 4. 组装 frontmatter -> 5. 写入文件 -> 6. 本地 Git Commit -> 7. **尝试 Push（失败则降级提示，不阻塞脚本结束）**。

**API 调用细节：**

```
System Prompt:
你是一个博客写作助手。你的任务是根据标题生成中文技术博客内容。
约束：
- 必须以纯 Markdown 格式返回，禁止包含 ```markdown、``` 或任何其他 Markdown 代码块包裹整个响应
- 禁止包含任何前后置闲聊（如 "Here is the blog post:"、"以下是博客内容：" 等）
- 直接输出正文内容，从一级标题 ## 开始
- 内容应包含技术细节、代码示例（使用标准 ``` 代码块包裹代码片段）、和实用结论
```

**环境变量：** `ANTHROPIC_API_KEY`（缺失时提示并退出）

### 4.2 草稿发布（blog-publish.mjs）

**用法：**

```bash
npm run blog:publish -- ./content/drafts/my-draft.md
```

**工作流：**

1. 读取草稿文件内容
2. 解析 frontmatter（若无 frontmatter，从第一个 `#` 提取标题）
3. 统一生成 slug（先读 frontmatter 中的 slug，若无则按 §4.3 Slug 规则生成）
4. **Mermaid 渲染** — 通过 `import` 引入 `scripts/svg-enhancer.mjs` 和 `scripts/svgo.config.mjs` 中的工具函数，在脚本进程内完成 ```mermaid 代码块的替换（使用 `execSync` 调用 puppeteer 渲染，已依赖 `@mermaid-js/mermaid-cli`）
5. 写入 `content/blogs/<slug>.md`
6. 执行 Git 提交流程（详见 §4.4 Git 安全操作）

**草稿格式要求：** 普通 Markdown 即可（可带 frontmatter），` ``mermaid ` 代码块会被自动渲染为 SVG 图片引用。

> **关于 Mermaid 依赖说明：** `scripts/mermaid-to-svg.mjs` 已依赖 `@mermaid-js/mermaid-cli`（内含 Puppeteer）。blog-publish.mjs 通过模块化引入复用这部分逻辑，不新增额外依赖。设计约束 §五 已据此修正。

### 4.3 Slug 生成规则

blog-create 和 blog-publish 使用同一套规则：

1. 优先读取 frontmatter 中的 `slug` 字段
2. 若无 slug 字段，交互式提示用户输入英文短 URL
3. 若用户跳过输入，自动从标题转换：
   - 中文 → 拼音首字母 + 连字符（例如 `"我的第一篇博客"` → `"wo-de-di-yi-pian-bo-ke"`）
   - 纯英文 → 小写 + 空格替换为连字符 + 去除非字母数字字符

**禁止行为：** 不允许使用 `encodeURIComponent` 生成 `%XX%XX` 编码形式的 slug。

### 4.4 Git 安全操作

blog-create 和 blog-publish 共用同一套 Git 提交流程：

1. **前置检查：** 执行 `git status --porcelain` 确认工作区干净（无未提交的变更）
   - 若工作区不干净，提示用户先提交或 stash 现有改动，然后退出
2. **写入文件**到 `content/blogs/`
3. **Stage & Commit：** `git add content/blogs/<slug>.md && git commit -m "blog: add <title>"`
4. **Push：** 包裹在 `try...catch` 中：
   - 推送成功 → 输出博客在线 URL
   - 推送失败 → 提示用户：`✔ 博客已在本地生成并提交，但远程推送失败，请手动执行 git push`
5. 所有 git 操作使用 `execSync` 同步执行，设置 `stdio: 'pipe'` 并捕获错误

---

## 五、设计约束（优化版）

1. **独立于主站业务逻辑** — 脚本不引入 React/Next.js 依赖，纯 Node.js 运行。
2. **错误处理与降级** — Git Push 阶段若因网络或分支落后失败，脚本不抛出未捕获异常，需降级引导用户手动 Push。
3. **幂等性与强推** — scaffold 默认检测目标目录，存在则报错；支持 `--force` 参数强制覆盖。
4. **外部依赖限制** — 仅允许复用已有 `mermaid-to-svg.mjs` 及其配套的渲染依赖，脚本其余部分保持零外部依赖。
5. **语言** — 所有输出、提示、生成内容均为中文。

---

## 六、排除范围

- 不修改主站已有代码（app/、components/、lib/）
- 不引入新 npm 包
- 不修改 CI/CD 配置
- 不涉及子项目部署后的监控或运维
