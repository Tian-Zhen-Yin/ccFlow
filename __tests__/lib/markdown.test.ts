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
