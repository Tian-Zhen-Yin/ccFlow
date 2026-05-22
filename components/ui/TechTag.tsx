interface TechTagProps {
  name: string
}

export default function TechTag({ name }: TechTagProps) {
  return (
    <span className="inline-block px-3 py-1 text-xs font-mono rounded-full
      bg-primary-soft text-primary border border-primary/20 tech-tag-shimmer"
    >
      {name}
    </span>
  )
}
