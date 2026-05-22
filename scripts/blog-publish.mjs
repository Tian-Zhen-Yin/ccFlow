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
 * 解析草稿文件。支持两种格式：
 *   1. 有 frontmatter（--- 包裹），直接读取 slug、title、date、tags
 *   2. 无 frontmatter，从第一个 # 提取标题，slug 自动生成
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
