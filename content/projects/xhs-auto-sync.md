---
title: "小红书 → Obsidian 全自动同步系统"
slug: "xhs-auto-sync"
description: "全自动将小红书收藏的笔记同步到本地 Obsidian 知识库，支持增量同步、视频转写、OCR 和知识蒸馏"
tech:
  - Python
  - Playwright
  - Obsidian
  - faster-whisper
  - ZhipuAI
  - ffmpeg
status: "local"
featured: true
github: "https://github.com/Tian-Zhen-Yin/xhs_auto_sync"
date: "2026-05-21"
order: 3
---

## 项目简介

一个全自动系统，用于将小红书收藏的笔记（图文/视频）同步到本地 Obsidian 笔记库。通过 CDP 连接真实 Chrome 浏览器绕过风控检测，支持增量同步、视频口播转写、图片 OCR 和 Wiki 知识蒸馏。

## 核心特性

- **全自动同步：** macOS launchd 每天 08:30 定时执行，无需人工干预
- **增量去重：** 只同步新增笔记，基于 note_id 去重，遇已同步记录立即停止翻页
- **CDP 反检测：** 连接真实 Chrome 浏览器，使用真实设备指纹，移除全部 stealth 伪装代码
- **视频转写：** ffmpeg 提取音频 → faster-whisper 转写 → LLM 纠错/摘要/口播稿
- **图片 OCR：** rapidocr-onnxruntime 本地 OCR → LLM 文本整理
- **知识蒸馏：** LLM 实体/概念提取 → 自动生成 Wiki 页面（sources/entities/concepts）
- **Mac 通知：** 同步完成后通过 osascript 发送系统通知
- **优雅降级：** LLM 调用链（glm-5 → glm-4.7-flash → glm-4-flash → DeepSeek），全部不可用时降级为原文

## 技术架构

```
Shell (launchd 调度)
  └─ run_sync.sh (环境检查 + API Key + 编排流水线)
       └─ xhs_playwright_sync.py (CDP 连接真实 Chrome → 采集 → 下载 → 生成 Markdown)
            ├─ xhs_transcriber.py (视频音频提取 → Whisper 转写 → LLM 纠错/摘要/口播稿)
            ├─ xhs_ocr.py (截图 OCR → LLM 文本整理)
            └─ xhs_wiki_analyzer.py (笔记分析 → 实体/概念提取 → Wiki 页面生成)
```

### 核心组件

| 脚本 | 行数 | 职责 |
|------|------|------|
| xhs_playwright_sync.py | ~1189 | 主同步逻辑：CDP 连接、采集、下载、Markdown 生成 |
| xhs_transcriber.py | ~774 | 视频转写流水线：音频提取 → Whisper → LLM 纠错 |
| xhs_ocr.py | ~449 | 图片 OCR：文字提取 → LLM 整理 |
| xhs_wiki_analyzer.py | ~753 | 知识蒸馏：实体/概念提取 → Wiki 页面 |

### 反检测设计

- **CDP 连接真实 Chrome：** 真实设备指纹，无自动化标记
- **均匀随机间隔：** 翻页 3-7s、笔记详情 4-10s、图片下载 0.5-2s
- **行为模拟：** 采集前 30-60s 随机浏览 Feed，15% 概率插入"阅读"停顿
- **频率控制：** launchd 每天最多执行 1 次

## 相关文档

- [项目总结博客](/blog/xhs-auto-sync-obsidian) — 完整的项目设计与实现总结
- [CDP 迁移设计文档](/projects/xhs-cdp-migration-design) — Chrome DevTools Protocol 迁移方案
