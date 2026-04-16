import { ReactNode } from 'react'

interface GlowCardProps {
  children: ReactNode
  className?: string
}

export default function GlowCard({ children, className = '' }: GlowCardProps) {
  return (
    <div
      className={`group relative bg-surface rounded-xl border border-border p-6
        transition-all duration-300 hover:border-primary hover:shadow-glow
        hover:-translate-y-1 hover:shadow-card-hover ${className}`}
    >
      {children}
    </div>
  )
}
