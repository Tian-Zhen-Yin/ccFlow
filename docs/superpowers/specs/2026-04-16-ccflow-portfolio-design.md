---
name: ccFlow Portfolio Design
date: 2026-04-16
status: approved
---

# ccFlow 个人作品集主站 — 详细设计文档

> **品牌：** PangHu（域名复用，视觉风格独立）
> **定位：** 作品展示 + 博客内容并重
> **视觉风格：** 暗黑科技风
> **语言：** 纯中文
> **部署：** GitHub + Vercel（全自动 CI/CD）
> **架构策略：** 方案 A（文档原版独立仓库）+ 方案 C 渐进增强（iframe 嵌入）

---

## 一、整体架构

### 1.1 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                   PangHu Portfolio                       │
│              (panghu.vercel.app)                         │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  首页    │  │  作品集  │  │   博客   │  │  关于   │ │
│  │  Hero    │  │ Projects │  │   Blog   │  │  About  │ │
│  └──────────┘  └────┬─────┘  └──────────┘  └─────────┘ │
│                     │                                    │
│          ┌──────────┼──────────┐                         │
│          ▼          ▼          ▼                         │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│   │ 项目卡片 │ │ 项目详情 │ │ iframe   │               │
│   │ 列表页   │ │ Markdown │ │ Demo嵌入 │               │
│   └──────────┘ └──────────┘ └────┬─────┘               │
│                                   │                      │
└───────────────────────────────────┼──────────────────────┘
                                    │ 外部链接 / iframe
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              ┌──────────┐   ┌──────────┐   ┌──────────┐
              │ 子项目 A  │   │ 子项目 B  │   │ 子项目 C  │
              │ 独立仓库  │   │ 独立仓库  │   │ 独立仓库  │
              │ 独立域名  │   │ 独立域名  │   │ 独立域名  │
              └──────────┘   └──────────┘   └──────────┘
```

### 1.2 页面结构

| 页面 | 路由 | 核心内容 | 渲染策略 |
|------|------|----------|----------|
| 首页 | `/` | Hero + 精选项目 + 最新博客 | SSG |
| 作品列表 | `/projects` | 项目卡片网格 | SSG |
| 作品详情 | `/projects/[slug]` | Markdown + Demo 嵌入 | ISR (revalidate: 3600) |
| 博客列表 | `/blog` | 博客列表（按日期排序） | SSG |
| 博客详情 | `/blog/[slug]` | Markdown + 目录 + 代码高亮 | ISR (revalidate: 3600) |
| 关于 | `/about` | 个人介绍 + 技能栈 | SSG |

---

## 二、暗黑科技风视觉系统

### 2.1 Design Token

```css
:root {
  /* 品牌色 */
  --color-primary: #6C63FF;           /* 电光紫 — 品牌主色 */
  --color-primary-hover: #7B73FF;
  --color-primary-soft: rgba(108, 99, 255, 0.15);
  --color-accent: #00D9FF;            /* 赛博蓝 — 强调/CTA */
  --color-accent-hover: #33E1FF;

  /* 渐变 */
  --gradient-hero: linear-gradient(135deg, #6C63FF, #00D9FF);
  --gradient-card-border: linear-gradient(135deg, rgba(108,99,255,0.5), rgba(0,217,255,0.5));

  /* 背景 */
  --color-bg-base: #0A0A0F;          /* 深空黑 — 页面底色 */
  --color-bg-surface: #1A1A2E;        /* 暗紫 — 卡片背景 */
  --color-bg-surface-hover: #2A2A3E;  /* 深紫灰 — 悬停态 */

  /* 文字 */
  --color-text-primary: #E0E0E0;      /* 银灰 — 正文 */
  --color-text-secondary: #888888;    /* 次要文字 */
  --color-text-muted: #555555;        /* 辅助文字 */

  /* 边框 */
  --color-border: #1A1A2E;
  --color-border-hover: #6C63FF;

  /* 功能色 */
  --color-error: #FF6B6B;
  --color-success: #4ADE80;
  --color-warning: #FBBF24;

  /* 阴影 */
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.3);
  --shadow-card-hover: 0 8px 32px rgba(108, 99, 255, 0.15);
  --shadow-glow: 0 0 20px rgba(108, 99, 255, 0.3);
}
```

### 2.2 动效规范

| 层级 | 效果 | 实现 |
|------|------|------|
| Hero 区域 | 粒子背景 + 打字机效果标语 | Canvas API + CSS animation |
| 卡片悬停 | glow 发光边框 + 上浮 4px + 投影扩散 | CSS transition + box-shadow |
| 滚动动画 | fadeInUp 进入视口时触发 | IntersectionObserver + CSS |
| 路由切换 | opacity 渐变过渡 | Next.js transition (200ms) |
| 技术标签 | 微光扫描动效（shimmer） | CSS @keyframes gradient |
| 无障碍 | prefers-reduced-motion 下禁用所有动画 | CSS media query |

### 2.3 字体方案

| 用途 | 字体 | 加载方式 |
|------|------|----------|
| 标题 | Inter (700) | next/font/google |
| 正文 | Inter (400) | next/font/google |
| 代码 | JetBrains Mono (400) | next/font/google |
| 中文回退 | 系统字体（苹方/微软雅黑） | CSS font-family fallback |

---

## 三、目录结构

```
panghu-portfolio/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx                # 全局布局（导航 + 页脚 + 暗黑主题）
│   ├── page.tsx                  # 首页 Hero + 精选项目 + 最新博客
│   ├── globals.css               # Design Token + Tailwind 暗黑变量
│   ├── blog/
│   │   ├── page.tsx              # 博客列表页（按日期排序）
│   │   └── [slug]/
│   │       └── page.tsx          # 博客详情页（Markdown 渲染）
│   ├── projects/
│   │   ├── page.tsx              # 作品列表页（卡片网格）
│   │   └── [slug]/
│   │       └── page.tsx          # 作品详情 + Demo 嵌入区
│   └── about/
│       └── page.tsx              # 关于页（个人介绍 + 技能栈）
│
├── components/                   # UI 组件
│   ├── layout/
│   │   ├── Navbar.tsx            # 顶部导航（固定 + 毛玻璃效果）
│   │   └── Footer.tsx            # 页脚（社交链接 + 版权）
│   ├── home/
│   │   ├── Hero.tsx              # 首屏 Hero（粒子 + 打字机标语）
│   │   ├── FeaturedProjects.tsx  # 精选作品展示
│   │   └── LatestPosts.tsx       # 最新博客预览
│   ├── projects/
│   │   ├── ProjectCard.tsx       # 项目卡片（glow 悬停效果）
│   │   ├── ProjectGrid.tsx       # 项目网格布局
│   │   └── DemoEmbed.tsx         # iframe 嵌入组件（渐进增强）
│   ├── blog/
│   │   ├── PostCard.tsx          # 博客卡片
│   │   ├── PostList.tsx          # 博客列表
│   │   └── MarkdownRenderer.tsx  # MD 渲染器（代码高亮 + 目录）
│   └── ui/
│       ├── GlowCard.tsx          # 通用发光卡片
│       ├── TechTag.tsx           # 技术标签（shimmer 动效）
│       ├── SectionHeading.tsx    # 统一章节标题
│       └── ScrollReveal.tsx      # 滚动动画包装器
│
├── content/                      # Markdown 内容
│   ├── projects/                 # 项目描述 *.md
│   └── blogs/                    # 博客文章 *.md
│
├── lib/                          # 工具函数
│   ├── markdown.ts               # Markdown 解析（gray-matter + remark）
│   ├── content.ts                # 内容读取（getProjects / getBlogs）
│   └── constants.ts              # 站点配置常量
│
├── public/                       # 静态资源
│   ├── images/                   # 项目截图、OG 图片
│   └── fonts/                    # 字体文件（如需本地加载）
│
├── tailwind.config.ts            # Tailwind 配置（暗黑 token）
├── next.config.ts                # Next.js 配置
├── package.json
└── vercel.json                   # Vercel 部署配置
```

---

## 四、组件架构

### 4.1 组件依赖关系

```
layout.tsx
├── Navbar (fixed, backdrop-blur)
│   └── Logo + NavLinks
├── {children} ← 各页面
│   │
│   ├── page.tsx (首页)
│   │   ├── Hero (粒子Canvas + Typewriter)
│   │   ├── FeaturedProjects → ProjectCard[] → GlowCard + TechTag[]
│   │   └── LatestPosts → PostCard[]
│   │
│   ├── projects/page.tsx (作品列表)
│   │   └── ProjectGrid → ProjectCard[]
│   │
│   ├── projects/[slug]/page.tsx (作品详情)
│   │   ├── MarkdownRenderer (MDXContent)
│   │   ├── DemoEmbed (iframe, 可选)
│   │   └── TechTag[]
│   │
│   ├── blog/page.tsx (博客列表)
│   │   └── PostList → PostCard[]
│   │
│   └── blog/[slug]/page.tsx (博客详情)
│       └── MarkdownRenderer (MDXContent + TOC)
│
└── Footer (社交链接 + GitHub + 版权)
```

### 4.2 Markdown 解析链

```
.md 文件 → gray-matter (提取 frontmatter)
         → remark (Markdown → AST)
         → rehype (AST → HTML)
         → rehype-highlight (代码高亮)
         → remark-toc (目录生成，仅博客)
         → 输出静态 HTML
```

策略：构建时静态生成（SSG/ISR），零运行时解析开销。

### 4.3 性能策略

| 维度 | 策略 | 工具 |
|------|------|------|
| 渲染 | SSG 首页/列表页，ISR 详情页 | Next.js generateStaticParams |
| 图片 | 自动 WebP + 懒加载 + 尺寸优化 | next/image |
| 字体 | 零布局偏移加载 | next/font |
| 粒子 | 尊重无障碍偏好 | Canvas + prefers-reduced-motion |
| iframe | 按需加载，不阻塞首屏 | dynamic import DemoEmbed |
| Bundle | Tree-shaking + 代码分割 | Next.js 自动 |

---

## 五、Markdown 内容规范

### 5.1 项目 Frontmatter

```yaml
---
title: "项目名称"              # 必填：显示标题
slug: "project-slug"           # 必填：URL 标识
description: "项目描述"         # 必填：卡片摘要
tech:                          # 必填：技术标签数组
  - Vue3
  - Spring Boot
status: "online"               # 必填：online | dev | archived
featured: true                 # 必填：是否首页精选展示
github: "https://github.com/..."  # 可选：源码链接
demo: "https://xxx.vercel.app"    # 可选：在线 Demo 链接
demoEmbed: false               # 可选：是否支持 iframe 嵌入（默认 false）
image: "/images/xxx.png"       # 可选：封面图
date: "2026-04-16"             # 必填：创建日期
order: 1                       # 可选：展示排序权重
---
```

### 5.2 博客 Frontmatter

```yaml
---
title: "博客标题"              # 必填：显示标题
slug: "blog-slug"              # 必填：URL 标识
date: "2026-04-16"             # 必填：发布日期
tags:                          # 必填：标签数组
  - Next.js
  - Claude Code
published: true                # 必填：是否发布（支持草稿）
excerpt: "文章摘要..."          # 可选：列表页摘要（自动取前 200 字）
coverImage: "/images/xxx.png"  # 可选：封面图
readingTime: 8                 # 可选：预估阅读分钟（可自动计算）
---
```

### 5.3 与文档原版的差异

**项目新增字段：** `status`, `featured`, `demoEmbed`, `order`
**博客新增字段：** `published`, `excerpt`, `coverImage`, `readingTime`

这些字段支持：项目状态管理、首页精选控制、草稿机制、iframe 嵌入开关。

---

## 六、部署架构

### 6.1 CI/CD 流程

```
Claude Code 生成/修改代码
        │
        ▼
 ┌──────────────┐
 │  本地开发    │  npm run dev (localhost:3000)
 └──────┬───────┘
        │ git push
        ▼
 ┌──────────────┐
 │   GitHub     │  repo: panghu-portfolio
 └──────┬───────┘
        │ webhook 自动触发
        ▼
 ┌──────────────┐
 │   Vercel     │  自动构建 + 部署
 │              │  ├─ SSG 静态页面（首页/列表页）
 │              │  ├─ ISR 增量生成（详情页，revalidate: 3600）
 │              │  └─ 自动 HTTPS + 全球 CDN
 └──────────────┘
```

### 6.2 域名规划

| 项目 | GitHub Repo | Vercel 域名 |
|------|-------------|-------------|
| 主站 | panghu-portfolio | panghu.vercel.app |
| 子项目 N | project-xxx | project-xxx.vercel.app |

### 6.3 子项目接入规范

#### Phase 1：链接跳转（立即）

- 项目卡片点击 → 外部 Demo 链接（新窗口打开）
- 项目详情页展示 Markdown 描述 + 截图
- 每个新项目只需在 `content/projects/` 新增一个 `.md` 文件
- 零额外开发成本

#### Phase 2：iframe 嵌入（3+ 项目后按需启动）

- 项目详情页增加"在线体验"按钮
- 点击展开 DemoEmbed 组件（iframe 全屏/半屏模式）
- 子项目需配置 `X-Frame-Options` 允许嵌入
- 通过 frontmatter 中 `demoEmbed: true` 逐项目控制
- DemoEmbed 组件通过 dynamic import 按需加载
- iframe 默认宽度 100%、高度 600px，提供"全屏"和"新窗口打开"两个备选操作

#### Phase 3：可选增强（未来按需）

- 站内搜索（flexsearch / pagefind）
- RSS 订阅（博客）
- Giscus 评论系统（基于 GitHub Discussions）
- 访客统计（Vercel Analytics）

---

## 七、技术栈汇总

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 14 |
| 样式 | Tailwind CSS | 3 |
| 语言 | TypeScript | 5 |
| 内容 | Markdown + frontmatter | — |
| MD 解析 | gray-matter + remark + rehype | — |
| 代码高亮 | rehype-highlight | — |
| 字体 | Inter + JetBrains Mono | next/font |
| 部署 | Vercel | — |
| 源码 | GitHub | — |
| 包管理 | npm | — |

---

## 八、可行性分析

### 优势

1. **零运维成本：** 纯静态 + ISR，无数据库、无服务器维护
2. **Claude Code 友好：** 独立仓库、标准结构、Markdown 内容，生成效率极高
3. **渐进增强：** 从最简链接跳转开始，按需引入 iframe 和高级功能
4. **零耦合架构：** 子项目完全独立，互不影响
5. **SEO 友好：** SSG/ISR 保证搜索引擎可抓取

### 风险与缓解

| 风险 | 缓解措施 |
|------|----------|
| iframe 嵌入体验受限（移动端） | Phase 2 提供"新窗口打开"备选方案 |
| 暗黑主题对比度不足 | 使用 WCAG AA 标准校验所有文字/背景对比度 |
| 粒子动画影响低端设备性能 | prefers-reduced-motion 降级 + requestAnimationFrame 节流 |
| Markdown 内容增长后管理困难 | 按年份/标签分目录，content.ts 统一读取 |

---

## 九、优化点总结（对比文档原版）

1. **目录结构增强：** 拆分 `lib/` 为三个职责单一的模块，新增 `components/ui/` 复用层
2. **Frontmatter 扩展：** 新增 `status/featured/demoEmbed/order/published/excerpt` 等字段，支持更灵活的内容管理
3. **渲染策略细化：** 区分 SSG（列表页）和 ISR（详情页），平衡性能与实时性
4. **渐进增强路线：** 明确三阶段演进路径，避免过早优化
5. **无障碍考虑：** prefers-reduced-motion、WCAG AA 对比度、语义化 HTML
6. **DemoEmbed 预留：** 通过 dynamic import + frontmatter 开关，零成本预留 iframe 嵌入能力
