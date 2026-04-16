import { getBlogs } from '@/lib/content'
import PostList from '@/components/blog/PostList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '博客',
  description: '技术分享与开发笔记',
}

export default async function BlogPage() {
  const blogs = await getBlogs()
  return <PostList posts={blogs} />
}
