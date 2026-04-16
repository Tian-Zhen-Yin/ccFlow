import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProjectBySlug, getProjects } from '@/lib/content'
import MarkdownRenderer from '@/components/blog/MarkdownRenderer'
import TechTag from '@/components/ui/TechTag'
import ScrollReveal from '@/components/ui/ScrollReveal'
import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug)
  if (!project) return { title: '未找到' }
  return {
    title: project.title,
    description: project.description,
  }
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug)
  if (!project) notFound()

  return (
    <article className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <Link
            href="/projects"
            className="text-text-secondary hover:text-primary transition-colors text-sm mb-8 inline-block"
          >
            &larr; 返回作品集
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
                {project.title}
              </h1>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                project.status === 'online'
                  ? 'bg-green-500/10 text-green-400'
                  : project.status === 'dev'
                  ? 'bg-yellow-500/10 text-yellow-400'
                  : 'bg-gray-500/10 text-gray-400'
              }`}>
                {project.status === 'online' ? '在线' : project.status === 'dev' ? '开发中' : '已归档'}
              </span>
            </div>
            <p className="text-text-secondary text-lg">{project.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {project.tech.map(t => (
                <TechTag key={t} name={t} />
              ))}
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-border hover:border-primary rounded-lg text-text-secondary hover:text-primary transition-colors text-sm"
              >
                GitHub 源码
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm"
              >
                在线演示
              </a>
            )}
          </div>

          <div className="border-t border-border pt-8">
            <MarkdownRenderer content={project.content} />
          </div>
        </ScrollReveal>
      </div>
    </article>
  )
}
