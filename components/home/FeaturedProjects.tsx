import Link from 'next/link'
import { getProjects } from '@/lib/content'
import ProjectCard from '@/components/projects/ProjectCard'
import SectionHeading from '@/components/ui/SectionHeading'
import ScrollReveal from '@/components/ui/ScrollReveal'

export default async function FeaturedProjects() {
  const projects = await getProjects()
  const featured = projects.filter(p => p.featured)

  if (featured.length === 0) return null

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <SectionHeading title="精选作品" subtitle="近期完成的项目" />
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((project) => (
            <ScrollReveal key={project.slug}>
              <ProjectCard project={project} />
            </ScrollReveal>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/projects"
            className="text-primary hover:text-primary-hover transition-colors font-medium"
          >
            查看全部作品 →
          </Link>
        </div>
      </div>
    </section>
  )
}
