---
title: "AI Code Review Agent"
slug: "code-review-agent"
description: "智能代码审查代理，自动检测代码质量、安全漏洞和最佳实践违规"
tech:
  - Python
  - LLM
  - GitHub API
status: "dev"
featured: false
github: "https://github.com/panghu/code-review-agent"
demoEmbed: false
date: "2026-03-20"
order: 2
---

## 项目简介

AI Code Review Agent 是一个基于大语言模型的智能代码审查工具。它能够自动分析 Pull Request，提供关于代码质量、安全性和可维护性的建议。

## 核心能力

- **安全检测：** 自动识别 OWASP Top 10 安全漏洞
- **代码质量：** 检测代码异味（Code Smell）和反模式
- **最佳实践：** 推荐语言/框架特定的最佳实践
- **自动评论：** 直接在 PR 中添加审查意见

## 技术栈

- Python 3.11+ 后端
- OpenAI / Anthropic API 集成
- GitHub Webhooks 实时响应
