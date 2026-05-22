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
      messages: [{ role: 'user', content: `标题：${title}\n${tagText}\n\n请根据上述标题和标签生成一篇中文技术博客。` }],
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
