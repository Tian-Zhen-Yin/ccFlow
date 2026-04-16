---
title: "Next.js 14 个人作品集开发指南"
slug: "nextjs-portfolio"
date: "2026-04-14"
tags:
  - Next.js
  - React
  - 前端开发
published: true
excerpt: "从零开始使用 Next.js 14 App Router 构建暗黑科技风个人作品集网站的完整指南"
---

## 为什么选择 Next.js 14

Next.js 14 的 App Router 带来了全新的开发体验：

- **Server Components：** 默认服务端渲染，更小的客户端 bundle
- **Streaming SSR：** 渐进式页面加载
- **静态生成：** SSG + ISR 完美平衡性能与实时性

## 技术选型

| 技术 | 用途 |
|------|------|
| Next.js 14 | 框架 |
| Tailwind CSS | 样式 |
| TypeScript | 类型安全 |
| Markdown | 内容管理 |

## 项目结构

```
app/          → 路由页面
components/   → UI 组件
content/      → Markdown 内容
lib/          → 工具函数
```

## 关键实现

### SSG + ISR 策略

列表页使用 SSG（构建时生成），详情页使用 ISR（增量静态再生成）：

```typescript
// 详情页 ISR 配置
export const revalidate = 3600 // 每小时重新生成
```

## 总结

Next.js 14 是构建个人作品集的绝佳选择。开箱即用的性能优化、灵活的渲染策略，配合 Tailwind CSS 和 Markdown，能快速搭建一个美观且高性能的个人站点。
