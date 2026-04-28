import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import remarkMermaid from './remark-mermaid'
import type { Heading } from './types'

interface ParseResult {
  frontmatter: Record<string, unknown>
  html: string
}

export async function parseMarkdown(raw: string): Promise<ParseResult> {
  const { data: frontmatter, content } = matter(raw)

  const processor = unified()
    .use(remarkParse)
    .use(remarkMermaid)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeHighlight)
    .use(rehypeStringify, { allowDangerousHtml: true })

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
