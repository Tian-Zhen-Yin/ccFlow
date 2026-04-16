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
