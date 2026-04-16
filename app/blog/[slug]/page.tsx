import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBlogBySlug, getBlogs } from '@/lib/content'
import MarkdownRenderer from '@/components/blog/MarkdownRenderer'
import ScrollReveal from '@/components/ui/ScrollReveal'
import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateStaticParams() {
  const blogs = await getBlogs()
  return blogs.map(b => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await getBlogBySlug(params.slug)
  if (!blog) return { title: '未找到' }
  return {
    title: blog.title,
    description: blog.excerpt ?? blog.title,
  }
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = await getBlogBySlug(params.slug)
  if (!blog) notFound()

  const dateStr = new Date(blog.date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <Link
            href="/blog"
            className="text-text-secondary hover:text-primary transition-colors text-sm mb-8 inline-block"
          >
            &larr; 返回博客
          </Link>

          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {blog.title}
            </h1>
            <div className="flex items-center gap-4 text-text-secondary text-sm">
              <time className="font-mono">{dateStr}</time>
              {blog.readingTime && (
                <span>&middot; {blog.readingTime} 分钟阅读</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {blog.tags.map(tag => (
                <span key={tag} className="text-xs text-accent">#{tag}</span>
              ))}
            </div>
          </header>

          {blog.headings.length > 0 && (
            <nav className="mb-8 p-4 bg-surface rounded-lg border border-border">
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                目录
              </h2>
              <ul className="space-y-1">
                {blog.headings.map(heading => (
                  <li key={heading.id} className={heading.level === 3 ? 'ml-4' : ''}>
                    <a
                      href={`#${heading.id}`}
                      className="text-sm text-text-secondary hover:text-primary transition-colors"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="border-t border-border pt-8">
            <MarkdownRenderer content={blog.content} />
          </div>
        </ScrollReveal>
      </div>
    </article>
  )
}
