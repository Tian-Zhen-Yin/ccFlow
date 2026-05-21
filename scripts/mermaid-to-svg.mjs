/**
 * Mermaid → SVG 自动化管线
 *
 * 扫描 content/**\/*.md 中的所有 ```mermaid 代码块，
 * 使用 @mermaid-js/mermaid-cli 渲染为暗黑科技风 SVG，
 * 并将代码块替换为 Markdown 图片引用。
 *
 * 用法:  node scripts/mermaid-to-svg.mjs
 *        npm run mermaid:build
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import matter from 'gray-matter';
import { optimize as optimizeSvg } from 'svgo';
import svgoConfig from './svgo.config.mjs';
import { enhanceSvg } from './svg-enhancer.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const CONTENT_DIR = path.join(ROOT, 'content');
const OUTPUT_DIR = path.join(ROOT, 'public', 'images', 'generated-svg');
const THEME_CONFIG = path.join(__dirname, 'mermaid-theme.json');

const MERMAID_RE = /```mermaid\n([\s\S]*?)```/g;

/* ── helpers ─────────────────────────────────────────── */

function findMdFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMdFiles(full));
    } else if (entry.name.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

function slugFromFrontmatter(raw) {
  try {
    const { data } = matter(raw);
    return data.slug || null;
  } catch {
    return null;
  }
}

function safeSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, '-')
    .replace(/(^-|-$)/g, '')
    || 'diagram';
}

/* ── main ────────────────────────────────────────────── */

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const mdFiles = findMdFiles(CONTENT_DIR);
  let totalConverted = 0;

  for (const filePath of mdFiles) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const slug = slugFromFrontmatter(raw)
      || safeSlug(path.basename(filePath, '.md'));

    // Collect all mermaid blocks
    const blocks = [];
    MERMAID_RE.lastIndex = 0;
    let match;
    while ((match = MERMAID_RE.exec(raw)) !== null) {
      blocks.push({ full: match[0], code: match[1].trim() });
    }

    if (blocks.length === 0) {
      console.log(`  – ${path.basename(filePath)} (no mermaid blocks)`);
      continue;
    }

    let content = raw;

    for (let i = 0; i < blocks.length; i++) {
      const { full, code } = blocks[i];
      const idx = i + 1;
      const filename = `${slug}-chart-${idx}.svg`;
      const outputPath = path.join(OUTPUT_DIR, filename);
      const tempMmd = path.join(OUTPUT_DIR, `${slug}-chart-${idx}.mmd`);

      // Write temp .mmd file
      fs.writeFileSync(tempMmd, code, 'utf8');

      // Render via mmdc
      const cmd = [
        'npx', '--yes', 'mmdc',
        '-i', JSON.stringify(tempMmd),
        '-o', JSON.stringify(outputPath),
        '-c', JSON.stringify(THEME_CONFIG),
        '-b', 'transparent',
        '-w', '960',
      ].join(' ');

      try {
        execSync(cmd, { stdio: 'pipe', cwd: ROOT, timeout: 30000 });

        // Post-process: inject cyber grid, glow filters, enhance fonts
        const rendered = fs.readFileSync(outputPath, 'utf8');
        const enhanced = enhanceSvg(rendered);
        fs.writeFileSync(outputPath, enhanced, 'utf8');

        // SVGO optimization
        const optimized = optimizeSvg(
          fs.readFileSync(outputPath, 'utf8'),
          { ...svgoConfig, path: outputPath },
        );
        fs.writeFileSync(outputPath, optimized.data, 'utf8');

        console.log(`  ✓ ${filename}`);
        totalConverted++;
      } catch (err) {
        const stderr = err.stderr?.toString().trim() || err.message;
        console.error(`  ✗ ${filename}: ${stderr.slice(0, 120)}`);
        // Replace with a fallback marker so the file stays consistent
        const imageSyntax = `![Diagram ${idx} (render failed)](/images/generated-svg/${filename})`;
        content = content.replace(full, imageSyntax);
        continue;
      } finally {
        if (fs.existsSync(tempMmd)) fs.unlinkSync(tempMmd);
      }

      // Replace mermaid block with image tag (first occurrence only)
      const imageSyntax = `![${slug}-chart-${idx}](/images/generated-svg/${filename})`;
      content = content.replace(full, imageSyntax);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ ${path.basename(filePath)}  (${blocks.length} blocks)`);
  }

  console.log(`\n✅ 完成！共转换 ${totalConverted} 个 Mermaid 图为 SVG。`);
}

run().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
