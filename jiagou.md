个人作品集 + 多项目部署

Claude Code 驱动架构设计（精准、可落地）

一、整体定位

	•	主体：个人作品集主站（展示 + 博客）
	•	子项目：每个作品独立应用、独立域名、独立部署
	•	驱动工具：Claude Code（VS Code） 负责全流程生成 / 修改 / 配置
	•	部署：GitHub + Vercel（全自动 CI/CD）
	•	数据：纯 Markdown（无数据库、零维护）



二、整体架构图（文字版）

plaintext





┌─────────────────────────────────────────────────────┐
│                  你（指挥者）                        │
└───────────────────────┬─────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│               Claude Code（执行层）                  │
│  ┌──────────┬─────────┬────────┬──────────────────┐  │
│  │ 生成代码 │ 修改BUG │ 写配置 │ 生成README/博客  │  │
│  └──────────┴─────────┴────────┴──────────────────┘  │
└───────────────────────┬─────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│               代码结构（本地）                       │
│  ┌─────────────┐   ┌──────────┐   ┌─────────────┐  │
│  │  主站项目   │   │ 子项目1  │   │   子项目2   │  │
│  │(Portfolio) │   │Project A │   │ Project B   │  │
│  └─────────────┘   └──────────┘   └─────────────┘  │
└───────────────────────┬─────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                  GitHub（源码托管）                  │
│  ┌─────────────┐   ┌──────────┐   ┌─────────────┐  │
│  │  repo-1     │   │  repo-2  │   │   repo-3   │  │
│  │(主站)       │   │(项目A)   │   │(项目B)     │  │
│  └─────────────┘   └──────────┘   └─────────────┘  │
└───────────────────────┬─────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                  Vercel（自动部署）                  │
│  ┌─────────────┐   ┌──────────┐   ┌─────────────┐  │
│  │ 主站域名    │   │项目A域名 │   │ 项目B域名  │  │
│  └─────────────┘   └──────────┘   └─────────────┘  │
└─────────────────────────────────────────────────────┘




三、主站架构（Next.js 14 App Router）

1. 技术选型

	•	框架：Next.js 14（App Router）
	•	样式：Tailwind CSS
	•	内容：Markdown + frontmatter
	•	部署：Vercel
	•	无 CMS、无数据库、无 API

2. 目录架构（标准、可扩展）

plaintext





portfolio-main/
├── app/                    # 路由页面
│   ├── page.js             # 首页
│   ├── layout.js           # 全局布局
│   ├── blog/
│   │   └── [slug]/page.js  # 博客详情
│   └── projects/
│       └── [slug]/page.js  # 项目详情
├── content/
│   ├── blogs/              # *.md 博客
│   └── projects/           # *.md 项目
├── lib/
│   ├── markdown.js         # 解析 md
│   └── data.js             # 读取项目/博客数据
├── public/                 # 图片、静态资源
├── package.json
├── next.config.js
├── tailwind.config.js
└── vercel.json             # Vercel 部署配置


3. 数据结构（Markdown 规范）

projects/xxx.md

plaintext





---
title: 项目名称
slug: 唯一标识
description: 描述
tech: [Vue3, Java, Spring Boot]
github: https://...
demo: https://...
image: /images/xxx.png
---
内容...


blogs/xxx.md

plaintext





---
title: 博客标题
slug: 唯一标识
date: 2026-04-16
tags: [开发笔记, Claude]
---
内容...




四、子项目架构（独立部署）

原则：

每个子项目 = 独立 GitHub 仓库 = 独立 Vercel 部署

子项目技术栈可任意：

	•	Vue / React / Vanilla JS / 小程序前端
	•	甚至轻量 Node 服务（Vercel 支持）

目录结构（通用）

plaintext





project-demo/
├── src/
├── public/
├── package.json
├── README.md
└── vercel.json




五、Claude Code 工作流架构（核心）

分层职责

1. Prompt 层（你输入）

	•	生成主站
	•	生成子项目
	•	写博客
	•	改样式、修 BUG
	•	生成部署脚本

2. 执行层（Claude Code）

	•	文件创建
	•	代码写入
	•	配置自动修复
	•	构建检查
	•	README 生成

3. 部署层（自动化）

	•	git push → GitHub
	•	Vercel 自动构建
	•	自动 HTTPS + 全球 CDN



六、部署架构（全自动 CI/CD）

主站：

	•	GitHub: your-portfolio
	•	Vercel: yourname.vercel.app

子项目 N：

	•	GitHub: project-xxx
	•	Vercel: project-xxx.vercel.app

关联方式：

主站通过 Markdown 链接指向子项目 DEMO

无代码耦合、无部署依赖、互不影响
