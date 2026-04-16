import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PangHu — 个人作品集',
  description: '用代码构建未来，探索无限可能',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
