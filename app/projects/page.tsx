import { getProjects } from '@/lib/content'
import ProjectGrid from '@/components/projects/ProjectGrid'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '作品集',
  description: '所有项目作品展示',
}

export default async function ProjectsPage() {
  const projects = await getProjects()
  return <ProjectGrid projects={projects} />
}
