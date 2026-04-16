# ccFlow Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the PangHu personal portfolio site — a dark sci-fi themed website with project showcase and blog, driven by Claude Code and deployed to Vercel.

**Architecture:** Next.js 14 App Router with SSG for list pages and ISR for detail pages. Markdown content with frontmatter, parsed at build time via gray-matter + remark + rehype pipeline. No database, no CMS — pure static files. Each sub-project lives in its own repo and deploys independently; the portfolio links out to demos (Phase 1) with iframe embedding reserved for Phase 2.

**Tech Stack:** Next.js 14, TypeScript 5, Tailwind CSS 3.4, gray-matter, unified/remark/rehype, Jest 29, React Testing Library

**Out of scope (Phase 3 — future work):** Site search (flexsearch/pagefind), RSS feed, Giscus comments, Vercel Analytics.

**Notable deviations from spec:**
- TOC extraction uses a custom `extractHeadings()` regex instead of `remark-toc` (simpler, same result).
- Route transition animation (spec Section 2.2) omitted — adds runtime complexity for marginal UX gain. Can be added later via `template.tsx`.
- `next/image` is configured in next.config but not used in components since no actual image assets exist yet. Add `<Image>` when real project screenshots are available.

---

## File Structure

```
ccFlow/
├── app/                              # Next.js 14 App Router
│   ├── globals.css                   # Design tokens + Tailwind imports + custom animations
│   ├── layout.tsx                    # Root layout (Navbar + Footer + fonts)
│   ├── page.tsx                      # Home page (Hero + FeaturedProjects + LatestPosts)
│   ├── blog/
│   │   ├── page.tsx                  # Blog list page (SSG, sorted by date)
│   │   └── [slug]/
│   │       └── page.tsx              # Blog detail (ISR, Markdown + TOC)
│   ├── projects/
│   │   ├── page.tsx                  # Projects list page (SSG, card grid)
│   │   └── [slug]/
│   │       └── page.tsx              # Project detail (ISR, Markdown + DemoEmbed)
│   └── about/
│       └── page.tsx                  # About page (personal intro + skill stack)
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                # Fixed navbar with backdrop-blur + mobile menu (client)
│   │   └── Footer.tsx                # Footer with social links + copyright (server)
│   ├── home/
│   │   ├── Hero.tsx                  # Particles canvas + typewriter effect (client)
│   │   ├── FeaturedProjects.tsx      # Featured projects section (server)
│   │   └── LatestPosts.tsx           # Latest blog posts section (server)
│   ├── projects/
│   │   ├── ProjectCard.tsx           # Project card with glow hover (server)
│   │   ├── ProjectGrid.tsx           # Grid layout wrapper (server)
│   │   └── DemoEmbed.tsx             # iframe embed with dynamic import (client)
│   ├── blog/
│   │   ├── PostCard.tsx              # Blog post card (server)
│   │   ├── PostList.tsx              # Blog list layout (server)
│   │   └── MarkdownRenderer.tsx      # HTML renderer with typography styles (server)
│   └── ui/
│       ├── GlowCard.tsx              # Reusable card with glow border (server)
│       ├── TechTag.tsx               # Technology tag with shimmer CSS (server)
│       ├── SectionHeading.tsx        # Consistent section title style (server)
│       └── ScrollReveal.tsx          # IntersectionObserver scroll animation (client)
│
├── content/
│   ├── projects/                     # Project markdown files
│   │   ├── ccflow.md                 # Sample project 1
│   │   └── code-review-agent.md      # Sample project 2
│   └── blogs/                        # Blog markdown files
│       ├── building-with-claude.md   # Sample blog 1
│       └── nextjs-portfolio.md       # Sample blog 2
│
├── lib/
│   ├── types.ts                      # TypeScript interfaces (Project, Blog, etc.)
│   ├── constants.ts                  # Site metadata, navigation links
│   ├── markdown.ts                   # Markdown → HTML pipeline (gray-matter + remark + rehype)
│   └── content.ts                    # Content reader functions (getProjects, getBlogs, etc.)
│
├── __tests__/
│   ├── lib/
│   │   ├── markdown.test.ts          # Tests for markdown parser
│   │   └── content.test.ts           # Tests for content reader
│   └── components/
│       └── Navbar.test.tsx           # Tests for Navbar component
│
├── public/
│   └── images/                       # Project screenshots, OG images
│
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind with custom dark theme
├── postcss.config.mjs                # PostCSS for Tailwind
├── jest.config.ts                    # Jest + next/jest configuration
├── jest.setup.ts                     # Jest setup (@testing-library/jest-dom)
├── .gitignore                        # Git ignore rules
└── vercel.json                       # Vercel deployment config
```

---

### Task 1: Project Scaffolding & Testing Infrastructure

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `jest.config.ts`
- Create: `jest.setup.ts`
- Create: `.gitignore`
- Create: `app/globals.css`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "panghu-portfolio",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "gray-matter": "^4.0.3",
    "unified": "^11.0.0",
    "remark-parse": "^11.0.0",
    "remark-rehype": "^11.0.0",
    "rehype-stringify": "^10.0.0",
    "rehype-highlight": "^7.0.0",
    "rehype-slug": "^6.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/node": "^20.0.0",
    "tailwindcss": "^3.4.0",
    "@tailwindcss/typography": "^0.5.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "jest": "^29.7.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@types/jest": "^29.5.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-jest": "^29.1.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: Dependencies installed successfully, `node_modules/` created, `package-lock.json` generated.

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create next.config.ts**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {}

export default nextConfig
```

- [ ] **Step 5: Create postcss.config.mjs**

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config
```

- [ ] **Step 6: Create tailwind.config.ts (basic — will be extended in Task 2)**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
```

- [ ] **Step 7: Create jest.config.ts**

```typescript
import nextJest from 'next/jest'
import type { Config } from 'jest'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterSetup: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default createJestConfig(config)
```

- [ ] **Step 8: Create jest.setup.ts**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 9: Create .gitignore**

```
# dependencies
node_modules/
.pnp
.pnp.js

# testing
coverage/

# next.js
.next/
out/

# production
build/

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 10: Create app/globals.css (minimal — extended in Task 2)**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #0A0A0F;
  color: #E0E0E0;
}
```

- [ ] **Step 11: Create app/layout.tsx (minimal shell)**

```tsx
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
  title: 'PangHu — 个人作品集',
  description: '用代码构建未来，探索无限可能',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 12: Create app/page.tsx (placeholder)**

```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold text-[#6C63FF]">PangHu Portfolio</h1>
    </main>
  )
}
```

- [ ] **Step 13: Run build to verify scaffolding**

Run: `npm run build`
Expected: Build completes successfully with no errors.

- [ ] **Step 14: Run test to verify Jest setup**

Run: `npm test`
Expected: "No tests found" message (expected — no test files yet).

- [ ] **Step 15: Initialize git and first commit**

```bash
git init
git add package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs tailwind.config.ts jest.config.ts jest.setup.ts .gitignore app/globals.css app/layout.tsx app/page.tsx
git commit -m "chore: scaffold Next.js 14 project with TypeScript, Tailwind, and Jest"
```

---

### Task 2: Design System Foundation (Tailwind Config + CSS Tokens + Fonts)

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: Update tailwind.config.ts with custom dark theme**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C63FF',
          hover: '#7B73FF',
          soft: 'rgba(108, 99, 255, 0.15)',
        },
        accent: {
          DEFAULT: '#00D9FF',
          hover: '#33E1FF',
        },
        surface: {
          base: '#0A0A0F',
          DEFAULT: '#1A1A2E',
          hover: '#2A2A3E',
        },
        text: {
          primary: '#E0E0E0',
          secondary: '#888888',
          muted: '#555555',
        },
        border: {
          DEFAULT: '#1A1A2E',
          hover: '#6C63FF',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 32px rgba(108, 99, 255, 0.15)',
        glow: '0 0 20px rgba(108, 99, 255, 0.3)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #6C63FF, #00D9FF)',
        'gradient-card-border': 'linear-gradient(135deg, rgba(108,99,255,0.5), rgba(0,217,255,0.5))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config
```

- [ ] **Step 2: Update app/globals.css with full design tokens and animations**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Brand colors */
  --color-primary: #6C63FF;
  --color-primary-hover: #7B73FF;
  --color-primary-soft: rgba(108, 99, 255, 0.15);
  --color-accent: #00D9FF;
  --color-accent-hover: #33E1FF;

  /* Gradients */
  --gradient-hero: linear-gradient(135deg, #6C63FF, #00D9FF);
  --gradient-card-border: linear-gradient(135deg, rgba(108,99,255,0.5), rgba(0,217,255,0.5));

  /* Backgrounds */
  --color-bg-base: #0A0A0F;
  --color-bg-surface: #1A1A2E;
  --color-bg-surface-hover: #2A2A3E;

  /* Text */
  --color-text-primary: #E0E0E0;
  --color-text-secondary: #888888;
  --color-text-muted: #555555;

  /* Border */
  --color-border: #1A1A2E;
  --color-border-hover: #6C63FF;

  /* Functional */
  --color-error: #FF6B6B;
  --color-success: #4ADE80;
  --color-warning: #FBBF24;

  /* Shadows */
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.3);
  --shadow-card-hover: 0 8px 32px rgba(108, 99, 255, 0.15);
  --shadow-glow: 0 0 20px rgba(108, 99, 255, 0.3);
}

body {
  background-color: var(--color-bg-base);
  color: var(--color-text-primary);
}

/* Scrollbar */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--color-bg-base); }
::-webkit-scrollbar-thumb { background: var(--color-bg-surface); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-primary); }

/* TechTag shimmer animation */
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

/* ScrollReveal animation */
.scroll-reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.scroll-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Accessibility: reduced motion */
@media (prefers-reduced-motion: reduce) {
  .scroll-reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
  @keyframes shimmer {
    0%, 100% { background-position: center; }
  }
}
```

- [ ] **Step 3: Verify build succeeds**

Run: `npm run build`
Expected: Build completes with no errors. Tailwind picks up custom theme tokens.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "feat: add dark sci-fi design system with tokens, animations, and Tailwind theme"
```

---

### Task 3: TypeScript Types & Site Constants

**Files:**
- Create: `lib/types.ts`
- Create: `lib/constants.ts`

- [ ] **Step 1: Create lib/types.ts with all TypeScript interfaces**

```typescript
export interface Project {
  title: string
  slug: string
  description: string
  tech: string[]
  status: 'online' | 'dev' | 'archived'
  featured: boolean
  github?: string
  demo?: string
  demoEmbed: boolean
  image?: string
  date: string
  order?: number
}

export interface ProjectDetail extends Project {
  content: string
}

export interface Blog {
  title: string
  slug: string
  date: string
  tags: string[]
  published: boolean
  excerpt?: string
  coverImage?: string
  readingTime?: number
}

export interface BlogDetail extends Blog {
  content: string
  headings: Heading[]
}

export interface Heading {
  id: string
  text: string
  level: number
}

export interface NavLink {
  label: string
  href: string
}
```

- [ ] **Step 2: Create lib/constants.ts with site config**

```typescript
import type { NavLink } from './types'

export const SITE_NAME = 'PangHu'
export const SITE_DESCRIPTION = '用代码构建未来，探索无限可能'
export const SITE_URL = 'https://panghu.vercel.app'

export const NAV_LINKS: NavLink[] = [
  { label: '首页', href: '/' },
  { label: '作品集', href: '/projects' },
  { label: '博客', href: '/blog' },
  { label: '关于', href: '/about' },
]

export const SOCIAL_LINKS = {
  github: 'https://github.com/panghu',
} as const

export const CONTENT_DIR = {
  projects: 'content/projects',
  blogs: 'content/blogs',
} as const
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds. Types are valid.

- [ ] **Step 4: Commit**

```bash
git add lib/types.ts lib/constants.ts
git commit -m "feat: add TypeScript types and site constants"
```

---

### Task 4: Markdown Processing Pipeline (TDD)

**Files:**
- Create: `__tests__/lib/markdown.test.ts`
- Create: `lib/markdown.ts`

- [ ] **Step 1: Write the failing test for markdown parser**

```typescript
import { parseMarkdown, extractHeadings } from '@/lib/markdown'

describe('parseMarkdown', () => {
  it('extracts frontmatter and converts markdown to HTML', async () => {
    const raw = `---
title: 测试项目
slug: test-project
---

# Hello World

This is **bold** text.

\`\`\`javascript
const x = 1
\`\`\`
`
    const result = await parseMarkdown(raw)
    expect(result.frontmatter.title).toBe('测试项目')
    expect(result.frontmatter.slug).toBe('test-project')
    expect(result.html).toContain('<h1')
    expect(result.html).toContain('<strong>')
  })

  it('handles markdown without frontmatter', async () => {
    const raw = '# Just a heading'
    const result = await parseMarkdown(raw)
    expect(result.frontmatter).toEqual({})
    expect(result.html).toContain('<h1')
  })

  it('produces code blocks with highlighting classes', async () => {
    const raw = '```js\nconsole.log("hello")\n```'
    const result = await parseMarkdown(raw)
    expect(result.html).toContain('hljs')
  })
})

describe('extractHeadings', () => {
  it('extracts h2 and h3 headings with ids', () => {
    const html = '<h2 id="intro">Introduction</h2><h3 id="details">Details</h3><p>text</p>'
    const headings = extractHeadings(html)
    expect(headings).toEqual([
      { id: 'intro', text: 'Introduction', level: 2 },
      { id: 'details', text: 'Details', level: 3 },
    ])
  })

  it('returns empty array for HTML with no headings', () => {
    const html = '<p>Just a paragraph</p>'
    const headings = extractHeadings(html)
    expect(headings).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/lib/markdown.test.ts --passWithNoTests 2>&1 || true`
Expected: FAIL — `Cannot find module '@/lib/markdown'`

- [ ] **Step 3: Create lib/markdown.ts**

```typescript
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import type { Heading } from './types'

interface ParseResult {
  frontmatter: Record<string, unknown>
  html: string
}

export async function parseMarkdown(raw: string): Promise<ParseResult> {
  const { data: frontmatter, content } = matter(raw)

  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeHighlight)
    .use(rehypeStringify)

  const file = await processor.process(content)
  const html = String(file)

  return { frontmatter, html }
}

export function extractHeadings(html: string): Heading[] {
  const headings: Heading[] = []
  const regex = /<h([2-3])\s+id="([^"]+)">([^<]+)<\/h[2-3]>/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1], 10),
      id: match[2],
      text: match[3],
    })
  }

  return headings
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/lib/markdown.test.ts --verbose`
Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add __tests__/lib/markdown.test.ts lib/markdown.ts
git commit -m "feat: add markdown parsing pipeline with gray-matter, remark, rehype (TDD)"
```

---

### Task 5: Content Reader Functions (TDD)

**Files:**
- Create: `__tests__/lib/content.test.ts`
- Create: `lib/content.ts`

- [ ] **Step 1: Write the failing test for content reader**

```typescript
import { getProjects, getBlogs, getProjectBySlug, getBlogBySlug } from '@/lib/content'
import fs from 'fs'
import path from 'path'

// Create temporary test content
const PROJECTS_DIR = path.join(process.cwd(), 'content', 'projects')
const BLOGS_DIR = path.join(process.cwd(), 'content', 'blogs')

beforeAll(() => {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true })
  fs.mkdirSync(BLOGS_DIR, { recursive: true })

  fs.writeFileSync(path.join(PROJECTS_DIR, 'test-project.md'), `---
title: 测试项目
slug: test-project
description: 一个测试项目
tech:
  - React
  - Node.js
status: online
featured: true
demoEmbed: false
date: "2026-04-16"
---

# 测试项目内容

这是项目描述。
`)

  fs.writeFileSync(path.join(BLOGS_DIR, 'test-blog.md'), `---
title: 测试博客
slug: test-blog
date: "2026-04-16"
tags:
  - Testing
published: true
excerpt: 这是一篇测试博客
---

# 测试博客内容

这是博客正文。
`)

  fs.writeFileSync(path.join(BLOGS_DIR, 'draft-blog.md'), `---
title: 草稿博客
slug: draft-blog
date: "2026-04-15"
tags:
  - Draft
published: false
---

# 草稿内容
`)
})

afterAll(() => {
  fs.rmSync(path.join(PROJECTS_DIR, 'test-project.md'), { force: true })
  fs.rmSync(path.join(BLOGS_DIR, 'test-blog.md'), { force: true })
  fs.rmSync(path.join(BLOGS_DIR, 'draft-blog.md'), { force: true })
})

describe('getProjects', () => {
  it('reads all projects from content directory', async () => {
    const projects = await getProjects()
    expect(projects.length).toBeGreaterThanOrEqual(1)
    const testProject = projects.find(p => p.slug === 'test-project')
    expect(testProject).toBeDefined()
    expect(testProject!.title).toBe('测试项目')
    expect(testProject!.tech).toEqual(['React', 'Node.js'])
  })
})

describe('getBlogs', () => {
  it('returns only published blogs sorted by date descending', async () => {
    const blogs = await getBlogs()
    const draftBlog = blogs.find(b => b.slug === 'draft-blog')
    expect(draftBlog).toBeUndefined()
    const testBlog = blogs.find(b => b.slug === 'test-blog')
    expect(testBlog).toBeDefined()
    expect(testBlog!.published).toBe(true)
  })
})

describe('getProjectBySlug', () => {
  it('returns project detail with rendered content', async () => {
    const project = await getProjectBySlug('test-project')
    expect(project).not.toBeNull()
    expect(project!.title).toBe('测试项目')
    expect(project!.content).toContain('<h1')
  })

  it('returns null for non-existent slug', async () => {
    const project = await getProjectBySlug('non-existent')
    expect(project).toBeNull()
  })
})

describe('getBlogBySlug', () => {
  it('returns blog detail with headings', async () => {
    const blog = await getBlogBySlug('test-blog')
    expect(blog).not.toBeNull()
    expect(blog!.title).toBe('测试博客')
    expect(blog!.content).toContain('<h1')
  })

  it('returns null for non-existent slug', async () => {
    const blog = await getBlogBySlug('non-existent')
    expect(blog).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/lib/content.test.ts --verbose`
Expected: FAIL — `Cannot find module '@/lib/content'`

- [ ] **Step 3: Create lib/content.ts**

```typescript
import fs from 'fs'
import path from 'path'
import { parseMarkdown, extractHeadings } from './markdown'
import { CONTENT_DIR } from './constants'
import type { Project, ProjectDetail, Blog, BlogDetail } from './types'

function readFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter(file => file.endsWith('.md'))
    .map(file => fs.readFileSync(path.join(dir, file), 'utf-8'))
}

export async function getProjects(): Promise<Project[]> {
  const files = readFiles(CONTENT_DIR.projects)
  const projects: Project[] = []

  for (const raw of files) {
    const { frontmatter } = await parseMarkdown(raw)
    projects.push({
      title: String(frontmatter.title ?? ''),
      slug: String(frontmatter.slug ?? ''),
      description: String(frontmatter.description ?? ''),
      tech: Array.isArray(frontmatter.tech) ? frontmatter.tech as string[] : [],
      status: (frontmatter.status as Project['status']) ?? 'dev',
      featured: Boolean(frontmatter.featured),
      github: frontmatter.github ? String(frontmatter.github) : undefined,
      demo: frontmatter.demo ? String(frontmatter.demo) : undefined,
      demoEmbed: Boolean(frontmatter.demoEmbed),
      image: frontmatter.image ? String(frontmatter.image) : undefined,
      date: String(frontmatter.date ?? ''),
      order: frontmatter.order ? Number(frontmatter.order) : undefined,
    })
  }

  return projects.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
}

export async function getBlogs(): Promise<Blog[]> {
  const files = readFiles(CONTENT_DIR.blogs)
  const blogs: Blog[] = []

  for (const raw of files) {
    const { frontmatter } = await parseMarkdown(raw)
    const published = Boolean(frontmatter.published)
    if (!published) continue

    blogs.push({
      title: String(frontmatter.title ?? ''),
      slug: String(frontmatter.slug ?? ''),
      date: String(frontmatter.date ?? ''),
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags as string[] : [],
      published,
      excerpt: frontmatter.excerpt ? String(frontmatter.excerpt) : undefined,
      coverImage: frontmatter.coverImage ? String(frontmatter.coverImage) : undefined,
      readingTime: frontmatter.readingTime ? Number(frontmatter.readingTime) : undefined,
    })
  }

  return blogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  const filePath = path.join(CONTENT_DIR.projects, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { frontmatter, html } = await parseMarkdown(raw)

  return {
    title: String(frontmatter.title ?? ''),
    slug: String(frontmatter.slug ?? ''),
    description: String(frontmatter.description ?? ''),
    tech: Array.isArray(frontmatter.tech) ? frontmatter.tech as string[] : [],
    status: (frontmatter.status as Project['status']) ?? 'dev',
    featured: Boolean(frontmatter.featured),
    github: frontmatter.github ? String(frontmatter.github) : undefined,
    demo: frontmatter.demo ? String(frontmatter.demo) : undefined,
    demoEmbed: Boolean(frontmatter.demoEmbed),
    image: frontmatter.image ? String(frontmatter.image) : undefined,
    date: String(frontmatter.date ?? ''),
    order: frontmatter.order ? Number(frontmatter.order) : undefined,
    content: html,
  }
}

export async function getBlogBySlug(slug: string): Promise<BlogDetail | null> {
  const filePath = path.join(CONTENT_DIR.blogs, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { frontmatter, html } = await parseMarkdown(raw)
  const headings = extractHeadings(html)

  return {
    title: String(frontmatter.title ?? ''),
    slug: String(frontmatter.slug ?? ''),
    date: String(frontmatter.date ?? ''),
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags as string[] : [],
    published: Boolean(frontmatter.published),
    excerpt: frontmatter.excerpt ? String(frontmatter.excerpt) : undefined,
    coverImage: frontmatter.coverImage ? String(frontmatter.coverImage) : undefined,
    readingTime: frontmatter.readingTime ? Number(frontmatter.readingTime) : undefined,
    content: html,
    headings,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/lib/content.test.ts --verbose`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add __tests__/lib/content.test.ts lib/content.ts
git commit -m "feat: add content reader functions for projects and blogs (TDD)"
```

---

### Task 6: Sample Content Files

**Files:**
- Create: `content/projects/ccflow.md`
- Create: `content/projects/code-review-agent.md`
- Create: `content/blogs/building-with-claude.md`
- Create: `content/blogs/nextjs-portfolio.md`
- Create: `public/images/` (directory)

- [ ] **Step 1: Create content/projects/ directory and first sample project**

```markdown
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
```

Write to: `content/projects/ccflow.md`

- [ ] **Step 2: Create second sample project**

```markdown
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
```

Write to: `content/projects/code-review-agent.md`

- [ ] **Step 3: Create first sample blog post**

```markdown
---
title: "用 Claude Code 构建全栈项目"
slug: "building-with-claude"
date: "2026-04-15"
tags:
  - Claude Code
  - AI编程
  - 开发笔记
published: true
excerpt: "分享使用 Claude Code 从零构建全栈项目的实践经验，包括架构设计、代码生成和调试技巧"
---

## 为什么选择 Claude Code

在 AI 编程工具爆发的 2026 年，Claude Code 以其深度代码理解和上下文感知能力脱颖而出。相比传统的代码补全工具，Claude Code 更像一个真正的编程伙伴。

## 实践心得

### 1. 架构先行

使用 Claude Code 之前，先花时间明确项目架构。好的架构文档能让 AI 生成更符合预期的代码。

### 2. 增量开发

不要试图让 AI 一次生成整个项目。将任务拆分为小的、可验证的步骤：

```typescript
// 每个步骤都应该有明确的输入和输出
interface Step {
  input: string
  expected: string
  verify: (result: string) => boolean
}
```

### 3. 代码审查

AI 生成的代码需要人工审查。重点关注：

- 安全性（SQL 注入、XSS 等）
- 边界条件处理
- 性能优化机会
- 代码可读性

## 总结

Claude Code 是一个强大的开发辅助工具，但它不能替代工程师的判断力。最佳实践是将 AI 作为 pair programming 伙伴，而不是全自动代码工厂。
```

Write to: `content/blogs/building-with-claude.md`

- [ ] **Step 4: Create second sample blog post**

```markdown
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
```

Write to: `content/blogs/nextjs-portfolio.md`

- [ ] **Step 5: Create public/images/ directory**

Run: `mkdir -p public/images`

- [ ] **Step 6: Verify content reader works with real content**

Run: `npx jest __tests__/lib/content.test.ts --verbose`
Expected: All tests PASS (real sample content is now available alongside test fixtures).

- [ ] **Step 7: Commit**

```bash
git add content/ public/images/
git commit -m "feat: add sample project and blog content files"
```

---

### Task 7: Layout Shell (Navbar + Footer + Root Layout)

**Files:**
- Create: `components/layout/Navbar.tsx`
- Create: `components/layout/Footer.tsx`
- Modify: `app/layout.tsx`
- Create: `__tests__/components/Navbar.test.tsx`

- [ ] **Step 1: Create components/layout/Navbar.tsx**

```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_LINKS, SITE_NAME } from '@/lib/constants'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-surface-base/80 backdrop-blur-lg border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            {SITE_NAME}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors hover:text-primary ${
                  pathname === link.href
                    ? 'text-primary'
                    : 'text-text-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-text-primary p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-border">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-2 text-sm transition-colors hover:text-primary ${
                  pathname === link.href
                    ? 'text-primary'
                    : 'text-text-secondary'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Create components/layout/Footer.tsx**

```tsx
import { SITE_NAME, SOCIAL_LINKS } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-base">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-secondary text-sm">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Update app/layout.tsx with Navbar and Footer**

```tsx
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
  title: {
    default: 'PangHu — 个人作品集',
    template: '%s | PangHu',
  },
  description: '用代码构建未来，探索无限可能',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-surface-base text-text-primary min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Write Navbar test**

```tsx
import { render, screen } from '@testing-library/react'
import Navbar from '@/components/layout/Navbar'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

describe('Navbar', () => {
  it('renders the site name as logo', () => {
    render(<Navbar />)
    expect(screen.getByText('PangHu')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<Navbar />)
    expect(screen.getByText('首页')).toBeInTheDocument()
    expect(screen.getByText('作品集')).toBeInTheDocument()
    expect(screen.getByText('博客')).toBeInTheDocument()
    expect(screen.getByText('关于')).toBeInTheDocument()
  })

  it('renders mobile menu button', () => {
    render(<Navbar />)
    const button = screen.getByLabelText('Toggle navigation menu')
    expect(button).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Run tests and verify build**

Run: `npx jest __tests__/components/Navbar.test.tsx --verbose`
Expected: All 3 tests PASS.

Run: `npm run build`
Expected: Build succeeds. Layout renders Navbar + Footer.

- [ ] **Step 6: Commit**

```bash
git add components/layout/ app/layout.tsx __tests__/components/Navbar.test.tsx
git commit -m "feat: add Navbar with blur, mobile menu, and Footer with social links"
```

---

### Task 8: UI Primitive Components

**Files:**
- Create: `components/ui/GlowCard.tsx`
- Create: `components/ui/TechTag.tsx`
- Create: `components/ui/SectionHeading.tsx`
- Create: `components/ui/ScrollReveal.tsx`

- [ ] **Step 1: Create components/ui/GlowCard.tsx**

```tsx
import { ReactNode } from 'react'

interface GlowCardProps {
  children: ReactNode
  className?: string
}

export default function GlowCard({ children, className = '' }: GlowCardProps) {
  return (
    <div
      className={`group relative bg-surface rounded-xl border border-border p-6
        transition-all duration-300 hover:border-primary hover:shadow-glow
        hover:-translate-y-1 hover:shadow-card-hover ${className}`}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Create components/ui/TechTag.tsx**

```tsx
interface TechTagProps {
  name: string
}

export default function TechTag({ name }: TechTagProps) {
  return (
    <span
      className="inline-block px-3 py-1 text-xs font-mono rounded-full
        bg-primary-soft text-primary border border-primary/20"
      style={{
        backgroundSize: '200% auto',
        backgroundImage: 'linear-gradient(90deg, rgba(108,99,255,0.15) 0%, rgba(0,217,255,0.25) 50%, rgba(108,99,255,0.15) 100%)',
        animation: 'shimmer 3s linear infinite',
      }}
    >
      {name}
    </span>
  )
}
```

- [ ] **Step 3: Create components/ui/SectionHeading.tsx**

```tsx
interface SectionHeadingProps {
  title: string
  subtitle?: string
}

export default function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-text-secondary text-lg">{subtitle}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create components/ui/ScrollReveal.tsx**

```tsx
'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
}

export default function ScrollReveal({ children, className = '' }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      element.classList.add('visible')
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('visible')
          observer.unobserve(element)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`scroll-reveal ${className}`}>
      {children}
    </div>
  )
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: Build succeeds. All UI primitives compile without errors.

- [ ] **Step 6: Commit**

```bash
git add components/ui/
git commit -m "feat: add GlowCard, TechTag, SectionHeading, and ScrollReveal UI primitives"
```

---

### Task 9: Home Page (Hero + Featured Projects + Latest Posts)

**Files:**
- Create: `components/home/Hero.tsx`
- Create: `components/home/FeaturedProjects.tsx`
- Create: `components/home/LatestPosts.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create components/home/Hero.tsx**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'

const TYPING_TEXTS = [
  '用代码构建未来',
  '探索无限可能',
  '创造属于你的数字世界',
]

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [displayText, setDisplayText] = useState('')

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
    }

    const particles: Particle[] = []
    const count = 80
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      })
    }

    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(108, 99, 255, 0.6)'
        ctx.fill()
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(108, 99, 255, ${0.2 * (1 - dist / 150)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  // Typewriter effect
  useEffect(() => {
    let textIndex = 0
    let charIndex = 0
    let isDeleting = false
    let timeout: NodeJS.Timeout

    const tick = () => {
      const currentText = TYPING_TEXTS[textIndex]

      if (!isDeleting) {
        setDisplayText(currentText.substring(0, charIndex + 1))
        charIndex++
        if (charIndex === currentText.length) {
          isDeleting = true
          timeout = setTimeout(tick, 2000)
          return
        }
        timeout = setTimeout(tick, 100)
      } else {
        setDisplayText(currentText.substring(0, charIndex - 1))
        charIndex--
        if (charIndex === 0) {
          isDeleting = false
          textIndex = (textIndex + 1) % TYPING_TEXTS.length
          timeout = setTimeout(tick, 500)
          return
        }
        timeout = setTimeout(tick, 50)
      }
    }

    timeout = setTimeout(tick, 1000)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
          PangHu
        </h1>
        <p className="text-xl md:text-2xl text-text-primary h-8">
          {displayText}
          <span className="animate-pulse ml-0.5">|</span>
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="/projects"
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors font-medium"
          >
            查看作品
          </a>
          <a
            href="/about"
            className="px-6 py-3 border border-primary text-primary hover:bg-primary-soft rounded-lg transition-colors font-medium"
          >
            了解更多
          </a>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create components/home/FeaturedProjects.tsx**

```tsx
import Link from 'next/link'
import { getProjects } from '@/lib/content'
import ProjectCard from '@/components/projects/ProjectCard'
import SectionHeading from '@/components/ui/SectionHeading'
import ScrollReveal from '@/components/ui/ScrollReveal'

export default async function FeaturedProjects() {
  const projects = await getProjects()
  const featured = projects.filter(p => p.featured)

  if (featured.length === 0) return null

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <SectionHeading title="精选作品" subtitle="近期完成的项目" />
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((project, index) => (
            <ScrollReveal key={project.slug}>
              <ProjectCard project={project} />
            </ScrollReveal>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/projects"
            className="text-primary hover:text-primary-hover transition-colors font-medium"
          >
            查看全部作品 →
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create components/home/LatestPosts.tsx**

```tsx
import Link from 'next/link'
import { getBlogs } from '@/lib/content'
import PostCard from '@/components/blog/PostCard'
import SectionHeading from '@/components/ui/SectionHeading'
import ScrollReveal from '@/components/ui/ScrollReveal'

export default async function LatestPosts() {
  const blogs = await getBlogs()
  const latest = blogs.slice(0, 3)

  if (latest.length === 0) return null

  return (
    <section className="py-20 px-4 bg-surface/30">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <SectionHeading title="最新博客" subtitle="技术分享与开发笔记" />
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latest.map((post, index) => (
            <ScrollReveal key={post.slug}>
              <PostCard post={post} />
            </ScrollReveal>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/blog"
            className="text-primary hover:text-primary-hover transition-colors font-medium"
          >
            查看全部文章 →
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Create components/projects/ProjectCard.tsx (needed by FeaturedProjects)**

```tsx
import Link from 'next/link'
import type { Project } from '@/lib/types'
import GlowCard from '@/components/ui/GlowCard'
import TechTag from '@/components/ui/TechTag'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.slug}`}>
      <GlowCard>
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            project.status === 'online'
              ? 'bg-green-500/10 text-green-400'
              : project.status === 'dev'
              ? 'bg-yellow-500/10 text-yellow-400'
              : 'bg-gray-500/10 text-gray-400'
          }`}>
            {project.status === 'online' ? '在线' : project.status === 'dev' ? '开发中' : '已归档'}
          </span>
        </div>
        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.tech.map(t => (
            <TechTag key={t} name={t} />
          ))}
        </div>
      </GlowCard>
    </Link>
  )
}
```

- [ ] **Step 5: Create components/blog/PostCard.tsx (needed by LatestPosts)**

```tsx
import Link from 'next/link'
import type { Blog } from '@/lib/types'
import GlowCard from '@/components/ui/GlowCard'

interface PostCardProps {
  post: Blog
}

export default function PostCard({ post }: PostCardProps) {
  const dateStr = new Date(post.date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Link href={`/blog/${post.slug}`}>
      <GlowCard>
        <time className="text-text-muted text-sm font-mono">{dateStr}</time>
        <h3 className="text-lg font-semibold text-text-primary mt-2 mb-3 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-text-secondary text-sm line-clamp-3">{post.excerpt}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-4">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs text-accent">#{tag}</span>
          ))}
        </div>
      </GlowCard>
    </Link>
  )
}
```

- [ ] **Step 6: Update app/page.tsx**

```tsx
import Hero from '@/components/home/Hero'
import FeaturedProjects from '@/components/home/FeaturedProjects'
import LatestPosts from '@/components/home/LatestPosts'

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProjects />
      <LatestPosts />
    </>
  )
}
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: Build succeeds. Home page assembles Hero + FeaturedProjects + LatestPosts. SSG generates static HTML.

- [ ] **Step 8: Commit**

```bash
git add components/home/ components/projects/ProjectCard.tsx components/blog/PostCard.tsx app/page.tsx
git commit -m "feat: add home page with Hero particles, featured projects, and latest posts"
```

---

### Task 10: Projects Pages (List + Detail)

**Files:**
- Create: `components/projects/ProjectGrid.tsx`
- Create: `components/blog/MarkdownRenderer.tsx`
- Create: `app/projects/page.tsx`
- Create: `app/projects/[slug]/page.tsx`

- [ ] **Step 1: Create components/projects/ProjectGrid.tsx**

```tsx
import type { Project } from '@/lib/types'
import ProjectCard from '@/components/projects/ProjectCard'
import SectionHeading from '@/components/ui/SectionHeading'
import ScrollReveal from '@/components/ui/ScrollReveal'

interface ProjectGridProps {
  projects: Project[]
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <SectionHeading title="作品集" subtitle="所有项目作品" />
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ScrollReveal key={project.slug}>
              <ProjectCard project={project} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create components/blog/MarkdownRenderer.tsx**

```tsx
interface MarkdownRendererProps {
  content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div
      className="prose prose-invert max-w-none
        prose-headings:text-text-primary
        prose-p:text-text-secondary
        prose-a:text-primary hover:prose-a:text-primary-hover
        prose-code:text-accent prose-code:before:content-[''] prose-code:after:content-['']
        prose-pre:bg-surface prose-pre:border prose-pre:border-border
        prose-strong:text-text-primary
        prose-li:text-text-secondary
        prose-blockquote:border-primary prose-blockquote:text-text-secondary"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
```

- [ ] **Step 3: Create app/projects/page.tsx**

```tsx
import { getProjects } from '@/lib/content'
import ProjectGrid from '@/components/projects/ProjectGrid'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '作品集',
  description: '所有项目作品展示',
}

export default async function ProjectsPage() {
  const projects = await getProjects()
  return <ProjectGrid projects={projects} />
}
```

- [ ] **Step 4: Create app/projects/[slug]/page.tsx**

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProjectBySlug, getProjects } from '@/lib/content'
import MarkdownRenderer from '@/components/blog/MarkdownRenderer'
import TechTag from '@/components/ui/TechTag'
import ScrollReveal from '@/components/ui/ScrollReveal'
import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug)
  if (!project) return { title: '未找到' }
  return {
    title: project.title,
    description: project.description,
  }
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug)
  if (!project) notFound()

  return (
    <article className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          {/* Back link */}
          <Link
            href="/projects"
            className="text-text-secondary hover:text-primary transition-colors text-sm mb-8 inline-block"
          >
            ← 返回作品集
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
                {project.title}
              </h1>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                project.status === 'online'
                  ? 'bg-green-500/10 text-green-400'
                  : project.status === 'dev'
                  ? 'bg-yellow-500/10 text-yellow-400'
                  : 'bg-gray-500/10 text-gray-400'
              }`}>
                {project.status === 'online' ? '在线' : project.status === 'dev' ? '开发中' : '已归档'}
              </span>
            </div>
            <p className="text-text-secondary text-lg">{project.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {project.tech.map(t => (
                <TechTag key={t} name={t} />
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-4 mb-8">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-border hover:border-primary rounded-lg text-text-secondary hover:text-primary transition-colors text-sm"
              >
                GitHub 源码
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm"
              >
                在线演示
              </a>
            )}
          </div>

          {/* Content */}
          <div className="border-t border-border pt-8">
            <MarkdownRenderer content={project.content} />
          </div>
        </ScrollReveal>
      </div>
    </article>
  )
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: Build succeeds. `/projects` page SSG generates static HTML. `/projects/[slug]` generates pages for each project markdown file.

- [ ] **Step 6: Commit**

```bash
git add components/projects/ProjectGrid.tsx components/blog/MarkdownRenderer.tsx app/projects/
git commit -m "feat: add projects list page and detail page with ISR"
```

---

### Task 11: Blog Pages (List + Detail with TOC)

**Files:**
- Create: `components/blog/PostList.tsx`
- Create: `app/blog/page.tsx`
- Create: `app/blog/[slug]/page.tsx`

- [ ] **Step 1: Create components/blog/PostList.tsx**

```tsx
import type { Blog } from '@/lib/types'
import PostCard from '@/components/blog/PostCard'
import SectionHeading from '@/components/ui/SectionHeading'
import ScrollReveal from '@/components/ui/ScrollReveal'

interface PostListProps {
  posts: Blog[]
}

export default function PostList({ posts }: PostListProps) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <SectionHeading title="博客" subtitle="技术分享与开发笔记" />
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <ScrollReveal key={post.slug}>
              <PostCard post={post} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create app/blog/page.tsx**

```tsx
import { getBlogs } from '@/lib/content'
import PostList from '@/components/blog/PostList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '博客',
  description: '技术分享与开发笔记',
}

export default async function BlogPage() {
  const blogs = await getBlogs()
  return <PostList posts={blogs} />
}
```

- [ ] **Step 3: Create app/blog/[slug]/page.tsx**

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBlogBySlug, getBlogs } from '@/lib/content'
import MarkdownRenderer from '@/components/blog/MarkdownRenderer'
import ScrollReveal from '@/components/ui/ScrollReveal'
import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateStaticParams() {
  const blogs = await getBlogs()
  return blogs.map(b => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await getBlogBySlug(params.slug)
  if (!blog) return { title: '未找到' }
  return {
    title: blog.title,
    description: blog.excerpt ?? blog.title,
  }
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = await getBlogBySlug(params.slug)
  if (!blog) notFound()

  const dateStr = new Date(blog.date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          {/* Back link */}
          <Link
            href="/blog"
            className="text-text-secondary hover:text-primary transition-colors text-sm mb-8 inline-block"
          >
            ← 返回博客
          </Link>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {blog.title}
            </h1>
            <div className="flex items-center gap-4 text-text-secondary text-sm">
              <time className="font-mono">{dateStr}</time>
              {blog.readingTime && (
                <span>· {blog.readingTime} 分钟阅读</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {blog.tags.map(tag => (
                <span key={tag} className="text-xs text-accent">#{tag}</span>
              ))}
            </div>
          </header>

          {/* Table of Contents */}
          {blog.headings.length > 0 && (
            <nav className="mb-8 p-4 bg-surface rounded-lg border border-border">
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                目录
              </h2>
              <ul className="space-y-1">
                {blog.headings.map(heading => (
                  <li key={heading.id} className={heading.level === 3 ? 'ml-4' : ''}>
                    <a
                      href={`#${heading.id}`}
                      className="text-sm text-text-secondary hover:text-primary transition-colors"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Content */}
          <div className="border-t border-border pt-8">
            <MarkdownRenderer content={blog.content} />
          </div>
        </ScrollReveal>
      </div>
    </article>
  )
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds. `/blog` page SSG generates static HTML. `/blog/[slug]` generates pages for each blog markdown file with TOC.

- [ ] **Step 5: Commit**

```bash
git add components/blog/PostList.tsx app/blog/
git commit -m "feat: add blog list page and detail page with TOC and ISR"
```

---

### Task 12: About Page & DemoEmbed Component

**Files:**
- Create: `app/about/page.tsx`
- Create: `components/projects/DemoEmbed.tsx`
- Modify: `app/projects/[slug]/page.tsx`

- [ ] **Step 1: Create app/about/page.tsx**

```tsx
import ScrollReveal from '@/components/ui/ScrollReveal'
import SectionHeading from '@/components/ui/SectionHeading'
import TechTag from '@/components/ui/TechTag'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '关于',
  description: '关于 PangHu — 个人介绍与技能栈',
}

const SKILL_CATEGORIES = [
  {
    category: '前端',
    skills: ['React', 'Next.js', 'Vue 3', 'TypeScript', 'Tailwind CSS', 'HTML/CSS'],
  },
  {
    category: '后端',
    skills: ['Node.js', 'Python', 'Java', 'Spring Boot'],
  },
  {
    category: 'AI / 工具',
    skills: ['Claude Code', 'LangChain', 'OpenAI API', 'Anthropic SDK'],
  },
  {
    category: 'DevOps',
    skills: ['Vercel', 'GitHub Actions', 'Docker', 'Linux'],
  },
]

export default function AboutPage() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <SectionHeading title="关于" subtitle="了解我是谁" />
        </ScrollReveal>

        <ScrollReveal>
          <div className="bg-surface rounded-xl border border-border p-8 mb-12">
            <p className="text-text-secondary text-lg leading-relaxed">
              你好，我是 PangHu — 一名热爱技术的开发者。
            </p>
            <p className="text-text-secondary text-lg leading-relaxed mt-4">
              我相信代码可以改变世界。通过 Claude Code 等 AI 工具的辅助，
              我能够更高效地将创意转化为现实。这个网站就是我工作成果的展示窗口。
            </p>
            <p className="text-text-secondary text-lg leading-relaxed mt-4">
              每个子项目都是独立开发、独立部署的完整应用。
              从前端到后端，从 AI 工具到 DevOps，我追求全栈能力的全面发展。
            </p>
          </div>
        </ScrollReveal>

        {/* Skill Stack */}
        <ScrollReveal>
          <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">技能栈</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SKILL_CATEGORIES.map(({ category, skills }) => (
              <div key={category} className="bg-surface rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <TechTag key={skill} name={skill} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Contact */}
        <ScrollReveal>
          <div className="mt-12 text-center">
            <p className="text-text-secondary mb-4">想要合作或交流？</p>
            <a
              href="https://github.com/panghu"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors font-medium inline-block"
            >
              在 GitHub 上找到我
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create components/projects/DemoEmbed.tsx**

```tsx
'use client'

import { useState } from 'react'

interface DemoEmbedProps {
  url: string
  title: string
}

export default function DemoEmbed({ url, title }: DemoEmbedProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">在线体验</h3>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const iframe = document.querySelector('iframe')
              if (iframe?.requestFullscreen) iframe.requestFullscreen()
            }}
            className="text-sm text-text-secondary hover:text-primary transition-colors"
          >
            全屏
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-secondary hover:text-primary transition-colors"
          >
            新窗口打开
          </a>
        </div>
      </div>
      <div className="relative bg-surface rounded-lg border border-border overflow-hidden" style={{ height: '600px' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-text-secondary">加载中...</div>
          </div>
        )}
        <iframe
          src={url}
          title={title}
          className="w-full h-full border-0"
          onLoad={() => setIsLoading(false)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update app/projects/[slug]/page.tsx to use DemoEmbed**

Add the dynamic import at the top of the file (after existing imports):

```tsx
import dynamic from 'next/dynamic'

const DemoEmbed = dynamic(() => import('@/components/projects/DemoEmbed'), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-surface rounded-lg border border-border animate-pulse" />,
})
```

Then add the DemoEmbed section in the JSX, after the "Links" div and before the "Content" div:

```tsx
          {/* Demo Embed (Phase 2 — only for projects with demoEmbed: true) */}
          {project.demoEmbed && project.demo && (
            <DemoEmbed url={project.demo} title={project.title} />
          )}
```

Full updated file for `app/projects/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { getProjectBySlug, getProjects } from '@/lib/content'
import MarkdownRenderer from '@/components/blog/MarkdownRenderer'
import TechTag from '@/components/ui/TechTag'
import ScrollReveal from '@/components/ui/ScrollReveal'
import type { Metadata } from 'next'

const DemoEmbed = dynamic(() => import('@/components/projects/DemoEmbed'), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-surface rounded-lg border border-border animate-pulse" />,
})

export const revalidate = 3600

export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug)
  if (!project) return { title: '未找到' }
  return {
    title: project.title,
    description: project.description,
  }
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug)
  if (!project) notFound()

  return (
    <article className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          {/* Back link */}
          <Link
            href="/projects"
            className="text-text-secondary hover:text-primary transition-colors text-sm mb-8 inline-block"
          >
            ← 返回作品集
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
                {project.title}
              </h1>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                project.status === 'online'
                  ? 'bg-green-500/10 text-green-400'
                  : project.status === 'dev'
                  ? 'bg-yellow-500/10 text-yellow-400'
                  : 'bg-gray-500/10 text-gray-400'
              }`}>
                {project.status === 'online' ? '在线' : project.status === 'dev' ? '开发中' : '已归档'}
              </span>
            </div>
            <p className="text-text-secondary text-lg">{project.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {project.tech.map(t => (
                <TechTag key={t} name={t} />
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-4 mb-8">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-border hover:border-primary rounded-lg text-text-secondary hover:text-primary transition-colors text-sm"
              >
                GitHub 源码
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm"
              >
                在线演示
              </a>
            )}
          </div>

          {/* Demo Embed (Phase 2 — only for projects with demoEmbed: true) */}
          {project.demoEmbed && project.demo && (
            <DemoEmbed url={project.demo} title={project.title} />
          )}

          {/* Content */}
          <div className="border-t border-border pt-8">
            <MarkdownRenderer content={project.content} />
          </div>
        </ScrollReveal>
      </div>
    </article>
  )
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds. About page and DemoEmbed compile without errors.

- [ ] **Step 5: Commit**

```bash
git add app/about/page.tsx components/projects/DemoEmbed.tsx app/projects/\[slug\]/page.tsx
git commit -m "feat: add about page with skill stack and DemoEmbed component"
```

---

### Task 13: Deployment Configuration & Build Verification

**Files:**
- Create: `vercel.json`
- Modify: `next.config.ts`

- [ ] **Step 1: Update next.config.ts for production optimization**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],
}

export default nextConfig
```

- [ ] **Step 2: Create vercel.json**

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

- [ ] **Step 3: Run full test suite**

Run: `npx jest --verbose`
Expected: All tests pass (markdown parser tests, content reader tests, Navbar tests).

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: Build succeeds with all routes:
- `/` (SSG)
- `/projects` (SSG)
- `/projects/ccflow` (ISR)
- `/projects/code-review-agent` (ISR)
- `/blog` (SSG)
- `/blog/building-with-claude` (ISR)
- `/blog/nextjs-portfolio` (ISR)
- `/about` (SSG)

- [ ] **Step 5: Verify local dev server**

Run: `npm run dev`
Expected: Dev server starts at http://localhost:3000. All pages render correctly:
- Home page shows Hero with particles, featured projects, latest posts
- `/projects` shows project card grid
- `/projects/ccflow` shows project detail with markdown content
- `/blog` shows blog list
- `/blog/building-with-claude` shows blog detail with TOC
- `/about` shows personal intro and skill stack

- [ ] **Step 6: Final commit**

```bash
git add next.config.ts vercel.json
git commit -m "chore: add production config, security headers, and Vercel deployment settings"
```

