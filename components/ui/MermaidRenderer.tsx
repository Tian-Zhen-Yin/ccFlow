'use client'

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'strict',
})

interface MermaidRendererProps {
  chart: string
}

export default function MermaidRenderer({ chart }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 9)}`)

  useEffect(() => {
    if (!containerRef.current) return

    const render = async () => {
      try {
        const { svg } = await mermaid.render(idRef.current, chart)
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      } catch {
        if (containerRef.current) {
          containerRef.current.innerHTML = `<pre class="text-red-400 text-sm p-4 bg-surface rounded border border-red-500/30">Mermaid 渲染失败</pre>`
        }
      }
    }

    render()
  }, [chart])

  return <div ref={containerRef} className="my-6 flex justify-center overflow-x-auto" />
}
