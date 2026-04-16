import Link from 'next/link'
import { getBlogs } from '@/lib/content'
import PostCard from '@/components/blog/PostCard'
import SectionHeading from '@/components/ui/SectionHeading'
import ScrollReveal from '@/components/ui/ScrollReveal'

export default async function LatestPosts() {
  const blogs = await getBlogs()
  const latest = blogs.slice(0, 3)

  if (latest.length === 0) return null

  return (
    <section className="py-20 px-4 bg-surface/30">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <SectionHeading title="最新博客" subtitle="技术分享与开发笔记" />
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latest.map((post) => (
            <ScrollReveal key={post.slug}>
              <PostCard post={post} />
            </ScrollReveal>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/blog"
            className="text-primary hover:text-primary-hover transition-colors font-medium"
          >
            查看全部文章 →
          </Link>
        </div>
      </div>
    </section>
  )
}
