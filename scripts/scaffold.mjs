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
      content = content
        .replace(/\{\{project-name\}\}/g, variables.name)
        .replace(/\{\{description\}\}/g, variables.description)
        .replace(/\{\{year\}\}/g, new Date().getFullYear().toString());

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
