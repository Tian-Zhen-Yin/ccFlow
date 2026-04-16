interface TechTagProps {
  name: string
}

export default function TechTag({ name }: TechTagProps) {
  return (
    <span
      className="inline-block px-3 py-1 text-xs font-mono rounded-full
        bg-primary-soft text-primary border border-primary/20"
      style={{
        backgroundSize: '200% auto',
        backgroundImage: 'linear-gradient(90deg, rgba(108,99,255,0.15) 0%, rgba(0,217,255,0.25) 50%, rgba(108,99,255,0.15) 100%)',
        animation: 'shimmer 3s linear infinite',
      }}
    >
      {name}
    </span>
  )
}
