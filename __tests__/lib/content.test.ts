import { getProjects, getBlogs, getProjectBySlug, getBlogBySlug } from '@/lib/content'
import fs from 'fs'
import path from 'path'

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
