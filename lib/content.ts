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
