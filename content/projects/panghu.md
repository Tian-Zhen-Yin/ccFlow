---
title: "胖虎 — 哈吉咪养成计划"
slug: "panghu"
description: "全栈猫咪养护应用，从幼猫到成猫的终身养护指南，集成 AI 宠物健康顾问"
tech:
  - Vue 3
  - Express
  - TypeScript
  - Prisma
  - PostgreSQL
  - ZhipuAI
  - Vercel
status: "online"
featured: true
github: "https://github.com/Tian-Zhen-Yin/PangHu"
demo: "https://pang-hu.vercel.app"
demoEmbed: false
date: "2026-04-28"
order: 2
---

## 项目简介

胖虎（哈吉咪养成计划）是一款全栈猫咪养护应用，提供从幼猫到成猫的终身养护指导。集成 AI 宠物健康顾问"喵喵医生"，基于 RAG（检索增强生成）技术提供专业养猫建议。

## 核心特性

- **多猫管理：** 支持多只猫咪档案、健康追踪、体重趋势图表
- **成长时间线：** 覆盖 6 个生命阶段（新生、奶猫、幼猫、少年、青年、成年）的成长记录
- **知识指南：** 6 大分类、20+ 篇专业养猫文章
- **AI 聊天：** 基于 ZhipuAI GLM-4-flash + RAG 的 SSE 流式对话
- **疫苗追踪：** 疫苗接种记录与定时提醒
- **养护计划：** 任务模板、日常护理提醒
- **响应式设计：** 桌面端侧边栏 + 移动端 Tab 栏自适应

## 技术架构

```
Vue 3 + Vite (SPA)
       ↓ /api/*
Express (Serverless Function)
       ↓
Prisma ORM → Supabase PostgreSQL
ZhipuAI GLM-4-flash → RAG Pipeline → SSE Streaming
```

### 前端

| 技术 | 用途 |
|------|------|
| Vue 3 (Composition API) | 响应式框架 |
| TypeScript | 类型安全 |
| Vite | 构建工具 |
| Element Plus | UI 组件库 |
| Tailwind CSS | 原子化样式 |
| Pinia | 状态管理 |
| ECharts | 体重趋势图表 |

### 后端

| 技术 | 用途 |
|------|------|
| Express | Web 框架 |
| Prisma ORM | 数据库 ORM |
| PostgreSQL (Supabase) | 生产数据库 |
| ZhipuAI GLM-4-flash | AI 对话模型 |
| JWT + bcryptjs | 认证授权 |
| esbuild | Serverless 打包 |

### 部署

- **Vercel Serverless Functions** 前后端同仓库部署
- esbuild 打包 Express 为单文件 bundle，Prisma/pg 运行时 external 加载
- Supabase 连接池模式（PgBouncer）适配 Serverless 短连接

## 项目亮点

### AI + RAG 对话系统

构建了完整的 RAG 流水线：知识库文档 → 向量化 → 相似度检索 → 上下文注入 → GLM-4-flash 生成回答。通过 SSE（Server-Sent Events）实现流式输出，用户可以看到 AI 逐字生成回答。

### Serverless 适配

Express + Prisma 应用部署到 Vercel Serverless 需要解决多个关键问题：Prisma Client 生成位置映射、只读文件系统下的上传目录适配、连接池模式配置、esbuild external 包处理等。踩坑经验已整理为完整的部署指南。

### 品牌视觉

设计了完整的品牌视觉语言——包含吉祥物"胖虎"设计规范、色彩系统（暖橙 + 猫咪灰）、圆角与阴影 Token、以及响应式布局系统。
