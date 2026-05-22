import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '航班比价 — 国内机票价格追踪',
  description: '实时对比携程、去哪儿、飞猪等平台国内机票价格，找到最低价航班',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-bg text-text-primary antialiased">
        <header className="border-b border-border sticky top-0 bg-bg/80 backdrop-blur-md z-50">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-bold text-lg">航班比价</span>
            </a>
            <span className="text-text-muted text-sm">国内机票价格追踪</span>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-border py-6 text-center text-text-muted text-sm">
          <p>数据来源：携程、去哪儿、飞猪、同程 | 价格仅供参考</p>
        </footer>
      </body>
    </html>
  )
}
