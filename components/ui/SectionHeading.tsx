interface SectionHeadingProps {
  title: string
  subtitle?: string
}

export default function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-text-secondary text-lg">{subtitle}</p>
      )}
    </div>
  )
}
