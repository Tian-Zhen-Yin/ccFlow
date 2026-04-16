import Link from 'next/link'
import type { Blog } from '@/lib/types'
import GlowCard from '@/components/ui/GlowCard'

interface PostCardProps {
  post: Blog
}

export default function PostCard({ post }: PostCardProps) {
  const dateStr = new Date(post.date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Link href={`/blog/${post.slug}`}>
      <GlowCard>
        <time className="text-text-muted text-sm font-mono">{dateStr}</time>
        <h3 className="text-lg font-semibold text-text-primary mt-2 mb-3 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-text-secondary text-sm line-clamp-3">{post.excerpt}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-4">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs text-accent">#{tag}</span>
          ))}
        </div>
      </GlowCard>
    </Link>
  )
}
