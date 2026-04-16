export interface Project {
  title: string
  slug: string
  description: string
  tech: string[]
  status: 'online' | 'dev' | 'archived'
  featured: boolean
  github?: string
  demo?: string
  demoEmbed: boolean
  image?: string
  date: string
  order?: number
}

export interface ProjectDetail extends Project {
  content: string
}

export interface Blog {
  title: string
  slug: string
  date: string
  tags: string[]
  published: boolean
  excerpt?: string
  coverImage?: string
  readingTime?: number
}

export interface BlogDetail extends Blog {
  content: string
  headings: Heading[]
}

export interface Heading {
  id: string
  text: string
  level: number
}

export interface NavLink {
  label: string
  href: string
}
