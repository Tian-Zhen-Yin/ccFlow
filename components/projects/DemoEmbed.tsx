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
