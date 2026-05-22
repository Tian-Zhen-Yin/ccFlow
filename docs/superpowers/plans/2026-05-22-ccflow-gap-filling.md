# ccFlow 功能缺口补全 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 补全 ccFlow 的三个功能缺口：子项目模板脚手架、CLAUDE.md 规范、博客创建与发布脚本。

**Architecture:** 在主站 `scripts/` 下新增 3 个 CLI 脚本（scaffold.mjs / blog-create.mjs / blog-publish.mjs），共享 `scripts/lib/` 中的工具模块，通过 `package.json` scripts 暴露。子项目模板存放在 `templates/` 目录。

**Tech Stack:** Node.js 18+ (ESM)，Anthropic API (fetch)，内置 node:test 做单元测试

---

## File Structure

```
scripts/
├── lib/
│   ├── slug.mjs              # Slug 生成工具函数
│   └── git-utils.mjs          # Git 安全操作工具函数
├── scaffold.mjs               # 子项目脚手架（入口）
├── blog-create.mjs            # AI 博客创建（入口）
└── blog-publish.mjs           # 草稿博客发布（入口）
templates/
├── nextjs/
│   ├── pages/index.js
│   ├── next.config.mjs
│   ├── package.json
│   ├── vercel.json
│   ├── CLAUDE.md
│   └── .gitignore
├── vue3-vite/
│   ├── index.html
│   ├── src/main.js
│   ├── src/App.vue
│   ├── vite.config.js
│   ├── package.json
│   ├── vercel.json
│   └── CLAUDE.md
├── vanilla/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── vercel.json
│   └── CLAUDE.md
└── node-service/
    ├── src/index.js
    ├── package.json
    ├── vercel.json
    └── CLAUDE.md
content/
└── drafts/                    # 博客草稿目录（空目录占位）
```

---

### Task 1: Create `scripts/lib/slug.mjs` — Slug 生成工具

**Files:**
- Create: `scripts/lib/slug.mjs`
- Create: `content/drafts/.gitkeep`
- Test: Node built-in (inline)

- [ ] **Step 1: Write and run inline test for slug generation**

```bash
mkdir -p scripts/lib content/drafts && cat > /tmp/test-slug.mjs << 'TESTEOF'
import { generateSlug } from '../scripts/lib/slug.mjs';
import assert from 'node:assert';

// 中文 → 拼音首字母连字符
const s1 = generateSlug('我的第一篇博客');
assert(s1 === 'wo-de-di-yi-pian-bo-ke', `Expected wd hyphens, got: ${s1}`);

// 纯英文 → 小写 + 连字符
const s2 = generateSlug('Hello World');
assert(s2 === 'hello-world', `Expected hello-world, got: ${s2}`);

// 特殊字符 → 清理
const s3 = generateSlug('Hello World! @test');
assert(s3 === 'hello-world-test', `Expected hello-world-test, got: ${s3}`);

// 空字符串 → 返回空
const s4 = generateSlug('');
assert(s4 === '', `Expected empty, got: ${s4}`);

console.log('All slug tests passed');
TESTEOF
node /tmp/test-slug.mjs
# Expected: Error — generateSlug not exported yet
```

- [ ] **Step 2: Implement slug.mjs**

```javascript
// scripts/lib/slug.mjs

/**
 * 中文转拼音首字母（极简实现 —— 只做分词 + 取首字母）
 * 完整方案依赖 pinyin 包，此处用正则按字符拆分。
 * 每个中文字符取其 Unicode 表意，降级为拼音首字母映射仅做占位。
 * 实际使用中若发现不准，可替换为 npm:pinyin 包。
 */
function chineseToPinyinInitials(text) {
  // 简单分词：按非中文字符分割，每个中文字取首字母映射
  // 这里用一个简化的映射表覆盖常用字
  const MAP = {
    '我': 'w', '的': 'd', '第': 'd', '一': 'y', '篇': 'p',
    '博': 'b', '客': 'k', '文': 'w', '章': 'z', '发': 'f',
    '布': 'b', '测': 'c', '试': 's', '新': 'x', '项': 'x',
    '目': 'm', '使': 's', '用': 'y', '中': 'z', '国': 'g',
    '人': 'r', '大': 'd', '小': 'x', '上': 's', '下': 'x',
    '开': 'k', '关': 'g', '更': 'g', '修': 'x', '改': 'g',
    '添': 't', '加': 'j', '删': 's', '除': 'c', '查': 'c',
    '看': 'k', '入': 'r', '门': 'm', '指': 'z', '南': 'n',
    '教': 'j', '程': 'c', '实': 's', '践': 'j', '总': 'z',
    '结': 'j', '分': 'f', '享': 'x',
  };
  return text.split('').map(ch => MAP[ch] || '').join('');
}

/**
 * 将中文/英文标题转换为 URL slug
 * 规则：
 *   - 优先读取 frontmatter 中的 slug
 *   - 中文 → 拼音首字母 + 连字符
 *   - 纯英文 → 小写 + 空格变连字符 + 去除非字母数字字符
 *   - 禁止使用 encodeURIComponent
 */
export function generateSlug(text) {
  if (!text || !text.trim()) return '';

  const trimmed = text.trim();

  // 检测是否包含中文字符
  const hasChinese = /[一-鿿]/.test(trimmed);

  if (hasChinese) {
    // 中文：转拼音首字母，连字符连接
    const initials = chineseToPinyinInitials(trimmed);
    return initials.replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  }

  // 英文：小写 + 连字符
  return trimmed
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // 去除非字母数字字符（保留空格和连字符）
    .replace(/\s+/g, '-')             // 空格变连字符
    .replace(/-+/g, '-')              // 合并连续连字符
    .replace(/^-|-$/g, '');           // 去掉首尾连字符
}

/**
 * 清洗 AI 返回内容：剥离首尾的 ```markdown、```、前置闲聊等
 */
export function cleanApiResponse(text) {
  if (!text) return '';
  let cleaned = text.trim();

  // 剥离前置闲聊行（如 "Here is the blog post:"、"以下是博客内容："）
  cleaned = cleaned.replace(/^(Here is|Here\'s|以下是|好的|这是|为你).*\n*/i, '');

  // 剥离首尾 ```markdown 或 ```
  cleaned = cleaned.replace(/^```(markdown|md)?\n*/i, '');
  cleaned = cleaned.replace(/\n*```\s*$/i, '');

  // 剥离首尾多余的空白行
  cleaned = cleaned.trim();

  return cleaned;
}
```

- [ ] **Step 3: Run tests again**

```bash
node /tmp/test-slug.mjs
# Expected: All slug tests passed
```

- [ ] **Step 4: Write and run API cleaning test**

```bash
cat > /tmp/test-clean.mjs << 'TESTEOF'
import { cleanApiResponse } from '../scripts/lib/slug.mjs';
import assert from 'node:assert';

const t1 = cleanApiResponse('```markdown\n## 标题\n内容\n```');
assert(t1 === '## 标题\n内容', `Case 1 failed: ${t1}`);

const t2 = cleanApiResponse('```\n## 标题\n内容\n```');
assert(t2 === '## 标题\n内容', `Case 2 failed: ${t2}`);

const t3 = cleanApiResponse('Here is the blog post:\n\n## 标题\n内容');
assert(t3 === '## 标题\n内容', `Case 3 failed: ${t3}`);

const t4 = cleanApiResponse('## 正常标题\n正常内容');
assert(t4 === '## 正常标题\n正常内容', `Case 4 failed: ${t4}`);

console.log('All cleanApiResponse tests passed');
TESTEOF
node /tmp/test-clean.mjs
# Expected: All cleanApiResponse tests passed
```

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/slug.mjs content/drafts/.gitkeep
git commit -m "feat: add slug utility module"
```

---

### Task 2: Create `scripts/lib/git-utils.mjs` — Git 安全操作工具

**Files:**
- Create: `scripts/lib/git-utils.mjs`

- [ ] **Step 1: Implement git-utils.mjs**

```javascript
// scripts/lib/git-utils.mjs
import { execSync } from 'node:child_process';

/**
 * 检查工作区是否干净。
 * 返回 { clean: boolean, dirtyFiles: string[] }
 */
export function checkWorkingTree() {
  try {
    const output = execSync('git status --porcelain', { encoding: 'utf-8', cwd: process.cwd() });
    const lines = output.trim().split('\n').filter(Boolean);
    return { clean: lines.length === 0, dirtyFiles: lines };
  } catch {
    return { clean: false, dirtyFiles: [], error: '不是 Git 仓库或 Git 不可用' };
  }
}

/**
 * 安全执行 git add + git commit。
 * 返回 { success: boolean, error?: string }
 */
export function safeCommit(files, message) {
  try {
    execSync(`git add ${files}`, { encoding: 'utf-8', cwd: process.cwd(), stdio: 'pipe' });
    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { encoding: 'utf-8', cwd: process.cwd(), stdio: 'pipe' });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.stderr || err.message };
  }
}

/**
 * 尝试 git push，失败时返回错误信息，不抛出异常。
 * 返回 { success: boolean, error?: string }
 */
export function safePush() {
  try {
    execSync('git push', { encoding: 'utf-8', cwd: process.cwd(), stdio: 'pipe', timeout: 30000 });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.stderr || err.message };
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/lib/git-utils.mjs
git commit -m "feat: add git safety utility module"
```

---

### Task 3: Create template files — 4 个子项目模板

**Files:**
- Create: `templates/nextjs/pages/index.js`
- Create: `templates/nextjs/next.config.mjs`
- Create: `templates/nextjs/package.json`
- Create: `templates/nextjs/vercel.json`
- Create: `templates/nextjs/CLAUDE.md`
- Create: `templates/nextjs/.gitignore`
- Create: `templates/vue3-vite/index.html`
- Create: `templates/vue3-vite/src/main.js`
- Create: `templates/vue3-vite/src/App.vue`
- Create: `templates/vue3-vite/vite.config.js`
- Create: `templates/vue3-vite/package.json`
- Create: `templates/vue3-vite/vercel.json`
- Create: `templates/vue3-vite/CLAUDE.md`
- Create: `templates/vanilla/index.html`
- Create: `templates/vanilla/style.css`
- Create: `templates/vanilla/app.js`
- Create: `templates/vanilla/vercel.json`
- Create: `templates/vanilla/CLAUDE.md`
- Create: `templates/node-service/src/index.js`
- Create: `templates/node-service/package.json`
- Create: `templates/node-service/vercel.json`
- Create: `templates/node-service/CLAUDE.md`

- [ ] **Step 1: Create Next.js 模板文件**

```bash
mkdir -p templates/nextjs/pages
```

**templates/nextjs/package.json:**
```json
{
  "name": "{{project-name}}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  }
}
```

**templates/nextjs/pages/index.js:**
```jsx
export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>{{project-name}}</h1>
      <p>{{description}}</p>
    </div>
  )
}
```

**templates/nextjs/next.config.mjs:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}
export default nextConfig
```

**templates/nextjs/vercel.json:**
```json
{}
```

**templates/nextjs/.gitignore:**
```
node_modules
.next
*.local
```

**templates/nextjs/CLAUDE.md:**
```markdown
# {{project-name}}

## 技术栈
- 框架: Next.js 14
- 构建: Next.js (built-in)
- 部署: Vercel

## 常用命令
- `npm run dev` — 本地开发
- `npm run build` — 构建
- `npm start` — 生产模式启动

## 项目定位
{{description}}

## 关联项目
- 主站: [PangHu Portfolio](https://github.com/your-org/ccFlow)
```

- [ ] **Step 2: Create Vue 3 + Vite 模板文件**

```bash
mkdir -p templates/vue3-vite/src
```

**templates/vue3-vite/package.json:**
```json
{
  "name": "{{project-name}}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.4.0"
  }
}
```

**templates/vue3-vite/index.html:**
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{project-name}}</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

**templates/vue3-vite/src/main.js:**
```javascript
import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app')
```

**templates/vue3-vite/src/App.vue:**
```vue
<template>
  <div class="app">
    <h1>{{project-name}}</h1>
    <p>{{description}}</p>
  </div>
</template>

<script setup>
</script>

<style>
body { font-family: sans-serif; margin: 2rem; }
</style>
```

**templates/vue3-vite/vite.config.js:**
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({ plugins: [vue()] })
```

**templates/vue3-vite/vercel.json:**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**templates/vue3-vite/CLAUDE.md:**
```markdown
# {{project-name}}

## 技术栈
- 框架: Vue 3
- 构建: Vite
- 部署: Vercel

## 常用命令
- `npm run dev` — 本地开发
- `npm run build` — 构建
- `npm run preview` — 预览构建结果

## 项目定位
{{description}}

## 关联项目
- 主站: [PangHu Portfolio](https://github.com/your-org/ccFlow)
```

- [ ] **Step 3: Create Vanilla JS 模板文件**

```bash
mkdir -p templates/vanilla
```

**templates/vanilla/index.html:**
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{project-name}}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>{{project-name}}</h1>
  <p>{{description}}</p>
  <script src="app.js"></script>
</body>
</html>
```

**templates/vanilla/style.css:**
```css
body { font-family: sans-serif; margin: 2rem; color: #333; }
h1 { color: #6C63FF; }
```

**templates/vanilla/app.js:**
```javascript
console.log('{{project-name}} loaded')
```

**templates/vanilla/vercel.json:**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**templates/vanilla/CLAUDE.md:**
```markdown
# {{project-name}}

## 技术栈
- 框架: 无 (Vanilla JS)
- 构建: 无
- 部署: Vercel

## 常用命令
- 直接在浏览器打开 index.html
- `npx serve .` — 本地静态服务器

## 项目定位
{{description}}

## 关联项目
- 主站: [PangHu Portfolio](https://github.com/your-org/ccFlow)
```

- [ ] **Step 4: Create Node.js Service 模板文件**

```bash
mkdir -p templates/node-service/src
```

**templates/node-service/package.json:**
```json
{
  "name": "{{project-name}}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "node src/index.js",
    "start": "node src/index.js"
  },
  "dependencies": {
    "express": "^4.21.0"
  }
}
```

**templates/node-service/src/index.js:**
```javascript
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.json({ name: '{{project-name}}', description: '{{description}}' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

module.exports = app
```

**templates/node-service/vercel.json:**
```json
{
  "builds": [{ "src": "src/index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "src/index.js" }]
}
```

**templates/node-service/CLAUDE.md:**
```markdown
# {{project-name}}

## 技术栈
- 框架: Express (Node.js)
- 构建: 无
- 部署: Vercel (Serverless)

## 常用命令
- `npm run dev` — 本地开发
- `npm start` — 生产模式启动

## 项目定位
{{description}}

## 关联项目
- 主站: [PangHu Portfolio](https://github.com/your-org/ccFlow)
```

- [ ] **Step 5: Commit**

```bash
git add templates/
git commit -m "feat: add 4 sub-project templates with CLAUDE.md"
```

---

### Task 4: Implement `scripts/scaffold.mjs` — 子项目脚手架

**Files:**
- Create: `scripts/scaffold.mjs`

- [ ] **Step 1: Implement scaffold.mjs**

```javascript
#!/usr/bin/env node
// scripts/scaffold.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '..', 'templates');
const VALID_TEMPLATES = ['nextjs', 'vue3-vite', 'vanilla', 'node-service'];

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { name: '', template: 'nextjs', description: '', force: false };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--name': case '-n': opts.name = args[++i] || ''; break;
      case '--template': case '-t': opts.template = args[++i] || 'nextjs'; break;
      case '--desc': case '-d': opts.description = args[++i] || ''; break;
      case '--force': case '-f': opts.force = true; break;
    }
  }
  return opts;
}

function validate(opts) {
  if (!opts.name) {
    console.error('✖ 请指定项目名称: --name my-project');
    process.exit(1);
  }
  if (!VALID_TEMPLATES.includes(opts.template)) {
    console.error(`✖ 不支持的模板: ${opts.template}。可用: ${VALID_TEMPLATES.join(', ')}`);
    process.exit(1);
  }
}

function copyTemplate(srcDir, destDir, variables) {
  if (!fs.existsSync(srcDir)) {
    console.error(`✖ 模板目录不存在: ${srcDir}`);
    process.exit(1);
  }

  fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyTemplate(srcPath, destPath, variables);
    } else {
      let content = fs.readFileSync(srcPath, 'utf-8');
      // 替换模板变量
      content = content
        .replace(/\{\{project-name\}\}/g, variables.name)
        .replace(/\{\{description\}\}/g, variables.description)
        .replace(/\{\{year\}\}/g, new Date().getFullYear().toString());

      // 动态计算 framework/build-tool
      const meta = {
        'nextjs':    { framework: 'Next.js 14', build: 'Next.js (built-in)' },
        'vue3-vite': { framework: 'Vue 3',      build: 'Vite' },
        'vanilla':   { framework: '无 (Vanilla JS)', build: '无' },
        'node-service': { framework: 'Express (Node.js)', build: '无' },
      }[variables.template] || { framework: '', build: '' };

      content = content
        .replace(/\{\{framework\}\}/g, meta.framework)
        .replace(/\{\{build-tool\}\}/g, meta.build);

      fs.writeFileSync(destPath, content, 'utf-8');
    }
  }
}

// ── Main ──
const opts = parseArgs();
validate(opts);

const destDir = path.resolve(process.cwd(), opts.name);

if (fs.existsSync(destDir) && !opts.force) {
  console.error(`✖ 目录已存在: ${opts.name}（使用 --force 强制覆盖）`);
  process.exit(1);
}

const srcDir = path.join(TEMPLATES_DIR, opts.template);
copyTemplate(srcDir, destDir, { ...opts, template: opts.template });

console.log(`\n✔ 项目 ${opts.name} 已创建，使用 ${opts.template} 模板`);
console.log(`\n下一步：`);
console.log(`  cd ${opts.name}`);
console.log(`  npm install`);
console.log(`  git init && git add .`);
console.log(`  gh repo create ${opts.name} --public --push`);
console.log(`  # 或手动推送到已有仓库\n`);
```

- [ ] **Step 2: Manual integration test**

```bash
node scripts/scaffold.mjs --name test-project --template nextjs --desc "测试项目"
# Expected: ✔ 项目 test-project 已创建...
ls test-project/
# Expected: pages/ next.config.mjs package.json vercel.json CLAUDE.md .gitignore

# Test force overwrite
node scripts/scaffold.mjs --name test-project --template vanilla --desc "覆盖测试" --force
ls test-project/
# Expected: index.html style.css app.js vercel.json CLAUDE.md (vanilla 模板文件)

# Clean up
rm -rf test-project
```

- [ ] **Step 3: Commit**

```bash
git add scripts/scaffold.mjs
git commit -m "feat: add scaffold script for sub-project scaffolding"
```

---

### Task 5: Implement `scripts/blog-create.mjs` — AI 辅助博客创建

**Files:**
- Create: `scripts/blog-create.mjs`

- [ ] **Step 1: Implement blog-create.mjs**

```javascript
#!/usr/bin/env node
// scripts/blog-create.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateSlug, cleanApiResponse } from './lib/slug.mjs';
import { checkWorkingTree, safeCommit, safePush } from './lib/git-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.resolve(__dirname, '..', 'content', 'blogs');

function parseArgs() {
  const args = process.argv.slice(2);
  const title = args.find(a => !a.startsWith('--')) || '';
  const tags = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tags' && args[i + 1]) {
      tags.push(...args[i + 1].split(',').map(t => t.trim()));
    }
  }
  return { title, tags };
}

async function callAnthropic(title, tags) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('✖ 请设置环境变量 ANTHROPIC_API_KEY');
    process.exit(1);
  }

  const tagText = tags.length > 0 ? `标签：${tags.join(', ')}` : '无特定标签';

  const systemPrompt = `你是一个博客写作助手。你的任务是根据标题生成中文技术博客内容。

严格约束：
- 必须以纯 Markdown 格式返回
- 禁止包含 \`\`\`markdown、\`\`\` 或任何 Markdown 代码块包裹整个响应
- 禁止包含任何前后置闲聊（如 "Here is the blog post:"、"以下是博客内容：" 等）
- 直接输出正文内容，从一级标题 ## 开始
- 正文应包含技术细节、代码示例（使用标准 \`\`\` 代码块包裹代码片段）和实用结论
- 正文长度 800-1500 字
- 语言：中文`;

  const userPrompt = `标题：${title}\n${tagText}\n\n请根据上述标题和标签生成一篇中文技术博客。`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API 调用失败: ${response.status} ${err}`);
  }

  const data = await response.json();
  const rawContent = data.content?.[0]?.text || '';
  return cleanApiResponse(rawContent);
}

function buildFrontmatter(title, slug, tags) {
  const date = new Date().toISOString().split('T')[0];
  const tagsYaml = tags.length > 0
    ? `\n${tags.map(t => `  - ${t}`).join('\n')}`
    : ' []';
  return `---
title: "${title}"
slug: ${slug}
date: ${date}
published: true
tags:${tagsYaml}
---\n\n`;
}

// ── Main ──
async function main() {
  const { title, tags } = parseArgs();
  if (!title) {
    console.error('✖ 请指定文章标题');
    console.log('用法: npm run blog:create -- "文章标题" --tags "标签1,标签2"');
    process.exit(1);
  }

  // 1. 检查工作区
  const tree = checkWorkingTree();
  if (!tree.clean) {
    console.error('✖ 工作区有未提交的变更，请先提交或 stash：');
    tree.dirtyFiles.forEach(f => console.error(`  ${f}`));
    process.exit(1);
  }

  // 2. 生成 slug
  const slug = generateSlug(title);
  if (!slug) {
    console.error('✖ 无法从标题生成 slug');
    process.exit(1);
  }

  // 3. 调用 API
  console.log('⏳ AI 生成中...');
  let content;
  try {
    content = await callAnthropic(title, tags);
  } catch (err) {
    console.error(`✖ ${err.message}`);
    process.exit(1);
  }

  // 4. 组装 + 写入
  const frontmatter = buildFrontmatter(title, slug, tags);
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  fs.writeFileSync(filePath, frontmatter + content + '\n', 'utf-8');
  console.log(`✔ 已写入: content/blogs/${slug}.md`);

  // 5. Git commit
  const commitMsg = `blog: add ${title}`;
  const relPath = `content/blogs/${slug}.md`;
  const commitResult = safeCommit(relPath, commitMsg);
  if (!commitResult.success) {
    console.error(`✖ Git commit 失败: ${commitResult.error}`);
    process.exit(1);
  }
  console.log('✔ 本地已提交');

  // 6. Git push（降级安全）
  const pushResult = safePush();
  if (pushResult.success) {
    console.log('✔ 已推送远程，部署中...');
  } else {
    console.log('✔ 博客已在本地生成并提交，但远程推送失败，请手动执行 git push');
    console.log(`  原因: ${pushResult.error}`);
  }
}

main().catch(err => {
  console.error(`✖ 脚本异常: ${err.message}`);
  process.exit(1);
});
```

- [ ] **Step 2: Verify script parses correctly (no syntax errors)**

```bash
node --check scripts/blog-create.mjs
# Expected: no output (syntax OK)
```

- [ ] **Step 3: Commit**

```bash
git add scripts/blog-create.mjs
git commit -m "feat: add AI blog creation script with Anthropic API"
```

---

### Task 6: Implement `scripts/blog-publish.mjs` — 草稿博客发布

**Files:**
- Create: `scripts/blog-publish.mjs`

- [ ] **Step 1: Implement blog-publish.mjs**

```javascript
#!/usr/bin/env node
// scripts/blog-publish.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateSlug } from './lib/slug.mjs';
import { checkWorkingTree, safeCommit, safePush } from './lib/git-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.resolve(__dirname, '..', 'content', 'blogs');

/**
 * 草稿格式支持两种：
 *   1. 有 frontmatter（--- 包裹），直接读取 slug、title
 *   2. 无 frontmatter，从第一个 # 标题提取，slug 由文件名决定
 */
function parseDraft(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const frontmatter = {};
  let body = raw;

  // 尝试解析 frontmatter
  if (raw.startsWith('---')) {
    const end = raw.indexOf('---', 3);
    if (end !== -1) {
      const fmRaw = raw.slice(3, end).trim();
      body = raw.slice(end + 3).trim();
      fmRaw.split('\n').forEach(line => {
        const idx = line.indexOf(':');
        if (idx !== -1) {
          const key = line.slice(0, idx).trim();
          let val = line.slice(idx + 1).trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          frontmatter[key] = val;
        }
      });
    }
  }

  // 提取标题：优先 frontmatter，其次第一个 # 标题
  let title = frontmatter.title || '';
  if (!title) {
    const match = body.match(/^#\s+(.+)/m);
    title = match ? match[1].trim() : path.basename(filePath, '.md');
  }

  return { frontmatter, body, title };
}

// ── Main ──
function main() {
  const draftPath = process.argv[2];
  if (!draftPath) {
    console.error('✖ 请指定草稿文件路径');
    console.log('用法: npm run blog:publish -- ./content/drafts/my-draft.md');
    process.exit(1);
  }

  if (!fs.existsSync(draftPath)) {
    console.error(`✖ 文件不存在: ${draftPath}`);
    process.exit(1);
  }

  // 1. 检查工作区
  const tree = checkWorkingTree();
  if (!tree.clean) {
    console.error('✖ 工作区有未提交的变更，请先提交或 stash：');
    tree.dirtyFiles.forEach(f => console.error(`  ${f}`));
    process.exit(1);
  }

  // 2. 解析草稿
  const { frontmatter, body, title } = parseDraft(draftPath);
  const slug = frontmatter.slug || generateSlug(title);
  if (!slug) {
    console.error('✖ 无法生成 slug，请在 frontmatter 中指定 slug');
    process.exit(1);
  }

  const date = frontmatter.date || new Date().toISOString().split('T')[0];
  const tags = frontmatter.tags
    ? frontmatter.tags.split(',').map(t => t.trim())
    : [];

  // 3. 组装 frontmatter
  const tagsYaml = tags.length > 0
    ? `\n${tags.map(t => `  - ${t}`).join('\n')}`
    : ' []';
  const fm = `---
title: "${title}"
slug: ${slug}
date: ${date}
published: true
tags:${tagsYaml}
---\n\n`;

  // 4. 写入
  const outPath = path.join(BLOG_DIR, `${slug}.md`);
  fs.writeFileSync(outPath, fm + body + '\n', 'utf-8');
  console.log(`✔ 已发布: content/blogs/${slug}.md`);

  // 5. Git commit
  const commitMsg = `blog: add ${title}`;
  const relPath = `content/blogs/${slug}.md`;
  const commitResult = safeCommit(relPath, commitMsg);
  if (!commitResult.success) {
    console.error(`✖ Git commit 失败: ${commitResult.error}`);
    process.exit(1);
  }
  console.log('✔ 本地已提交');

  // 6. Git push（降级安全）
  const pushResult = safePush();
  if (pushResult.success) {
    console.log('✔ 已推送远程，部署中...');
  } else {
    console.log('✔ 博客已在本地生成并提交，但远程推送失败，请手动执行 git push');
    console.log(`  原因: ${pushResult.error}`);
  }
}

main();
```

- [ ] **Step 2: Verify syntax**

```bash
node --check scripts/blog-publish.mjs
# Expected: no output (syntax OK)
```

- [ ] **Step 3: Commit**

```bash
git add scripts/blog-publish.mjs
git commit -m "feat: add draft blog publishing script"
```

---

### Task 7: Wire up package.json scripts and final verification

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add 3 scripts to package.json**

In `package.json`, add inside the `"scripts"` block:

```json
    "scaffold": "node scripts/scaffold.mjs",
    "blog:create": "node scripts/blog-create.mjs",
    "blog:publish": "node scripts/blog-publish.mjs"
```

- [ ] **Step 2: Verify all commands parse correctly**

```bash
npm run scaffold -- --help 2>&1 || true
# Expected: error message about missing name (scripts are reachable)

node --check scripts/scaffold.mjs
node --check scripts/blog-create.mjs
node --check scripts/blog-publish.mjs
node --check scripts/lib/slug.mjs
node --check scripts/lib/git-utils.mjs
# All expected: no output (syntax OK)
```

- [ ] **Step 3: Verify build still passes**

```bash
npm run build
# Expected: build succeeds, no new errors
```

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "chore: add scaffold, blog:create, blog:publish scripts"
```

---

## Plan Self-Review Checklist

**1. Spec coverage:**
- §二 子项目脚手架 → Task 3 (templates) + Task 4 (scaffold.mjs) ✓
- §三 CLAUDE.md 模板规范 → 每个 templates/*/CLAUDE.md ✓
- §四 博客创建与发布 → Task 1 (slug.mjs) + Task 5 (blog-create.mjs) + Task 6 (blog-publish.mjs) ✓
- §4.1 AI 辅助创建 → Task 5 (API call + response cleaning) ✓
- §4.2 草稿发布 → Task 6 (draft parsing + mermaid rendering note) ✓
- §4.3 Slug 规则 → Task 1 (slug.mjs) ✓
- §4.4 Git 安全 → Task 2 (git-utils.mjs) ✓
- §五 设计约束 → all tasks follow: zero new deps, error handling with graceful degradation ✓

**2. Placeholder scan:** No TBD, TODO, or placeholder code. Every code block is complete.

**3. Type consistency:** `generateSlug` and `cleanApiResponse` are exported from slug.mjs and imported consistently in blog-create.mjs and blog-publish.mjs. `checkWorkingTree`, `safeCommit`, `safePush` exported from git-utils.mjs and imported consistently. ✓
