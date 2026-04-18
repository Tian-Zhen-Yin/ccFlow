'use client'

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'strict',
})

interface MarkdownRendererProps {
  content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const mermaidDivs = ref.current.querySelectorAll<HTMLDivElement>('.mermaid')
    if (mermaidDivs.length === 0) return

    const renderAll = async () => {
      for (let i = 0; i < mermaidDivs.length; i++) {
        const el = mermaidDivs[i]
        const chart = el.textContent ?? ''
        try {
          const { svg } = await mermaid.render(`mermaid-${i}-${Date.now()}`, chart)
          el.innerHTML = svg
        } catch {
          el.innerHTML = '<pre class="text-red-400 text-sm p-4 bg-surface rounded border border-red-500/30">Mermaid 渲染失败</pre>'
        }
      }
    }

    renderAll()
  }, [content])

  return (
    <div
      ref={ref}
      className="prose prose-invert max-w-none
        prose-headings:text-text-primary
        prose-p:text-text-secondary
        prose-a:text-primary hover:prose-a:text-primary-hover
        prose-code:text-accent prose-code:before:content-[''] prose-code:after:content-['']
        prose-pre:bg-surface prose-pre:border prose-pre:border-border
        prose-strong:text-text-primary
        prose-li:text-text-secondary
        prose-blockquote:border-primary prose-blockquote:text-text-secondary
        [&_.mermaid]:bg-surface [&_.mermaid]:rounded-lg [&_.mermaid]:p-4 [&_.mermaid]:my-6 [&_.mermaid_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
