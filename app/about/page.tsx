import ScrollReveal from '@/components/ui/ScrollReveal'
import SectionHeading from '@/components/ui/SectionHeading'
import TechTag from '@/components/ui/TechTag'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '关于',
  description: '关于 PangHu — 个人介绍与技能栈',
}

const SKILL_CATEGORIES = [
  {
    category: '前端',
    skills: ['React', 'Next.js', 'Vue 3', 'TypeScript', 'Tailwind CSS', 'HTML/CSS'],
  },
  {
    category: '后端',
    skills: ['Node.js', 'Python', 'Java', 'Spring Boot'],
  },
  {
    category: 'AI / 工具',
    skills: ['Claude Code', 'LangChain', 'OpenAI API', 'Anthropic SDK'],
  },
  {
    category: 'DevOps',
    skills: ['Vercel', 'GitHub Actions', 'Docker', 'Linux'],
  },
]

export default function AboutPage() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <SectionHeading title="关于" subtitle="了解我是谁" />
        </ScrollReveal>

        <ScrollReveal>
          <div className="bg-surface rounded-xl border border-border p-8 mb-12">
            <p className="text-text-secondary text-lg leading-relaxed">
              你好，我是 PangHu — 一名热爱技术的开发者。
            </p>
            <p className="text-text-secondary text-lg leading-relaxed mt-4">
              我相信代码可以改变世界。通过 Claude Code 等 AI 工具的辅助，
              我能够更高效地将创意转化为现实。这个网站就是我工作成果的展示窗口。
            </p>
            <p className="text-text-secondary text-lg leading-relaxed mt-4">
              每个子项目都是独立开发、独立部署的完整应用。
              从前端到后端，从 AI 工具到 DevOps，我追求全栈能力的全面发展。
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">技能栈</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SKILL_CATEGORIES.map(({ category, skills }) => (
              <div key={category} className="bg-surface rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <TechTag key={skill} name={skill} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="mt-12 text-center">
            <p className="text-text-secondary mb-4">想要合作或交流？</p>
            <a
              href="https://github.com/panghu"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors font-medium inline-block"
            >
              在 GitHub 上找到我
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
