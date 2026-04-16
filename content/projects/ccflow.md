---
title: "ccFlow — Claude Code 工作流引擎"
slug: "ccflow"
description: "基于 Claude Code 驱动的自动化工作流引擎，实现代码生成、审查、部署全流程自动化"
tech:
  - Claude Code
  - Next.js
  - TypeScript
  - Tailwind CSS
status: "online"
featured: true
github: "https://github.com/panghu/ccflow"
demo: "https://ccflow.vercel.app"
demoEmbed: false
date: "2026-04-10"
order: 1
---

## 项目简介

ccFlow 是一个以 Claude Code 为核心驱动的工作流引擎，旨在通过 AI 辅助实现从需求分析到代码部署的全流程自动化。

## 核心特性

- **智能代码生成：** 基于 Claude Code 的上下文理解，生成高质量代码
- **自动化审查：** 自动检查代码质量、安全性和最佳实践
- **一键部署：** 与 Vercel 深度集成，推送即部署
- **Markdown 驱动：** 所有内容通过 Markdown 文件管理，零数据库依赖

## 技术架构

```
Claude Code → 代码生成 → Git Push → Vercel 自动部署
```

## 开发体验

使用 Claude Code 作为开发助手，整个项目的 80% 代码由 AI 生成，开发者主要负责架构设计和代码审查。
