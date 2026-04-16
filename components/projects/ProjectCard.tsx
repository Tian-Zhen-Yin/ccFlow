import Link from 'next/link'
import type { Project } from '@/lib/types'
import GlowCard from '@/components/ui/GlowCard'
import TechTag from '@/components/ui/TechTag'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.slug}`}>
      <GlowCard>
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
            {project.title}
          </h3>
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
        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.tech.map(t => (
            <TechTag key={t} name={t} />
          ))}
        </div>
      </GlowCard>
    </Link>
  )
}
