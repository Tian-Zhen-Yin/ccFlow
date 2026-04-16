interface MarkdownRendererProps {
  content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div
      className="prose prose-invert max-w-none
        prose-headings:text-text-primary
        prose-p:text-text-secondary
        prose-a:text-primary hover:prose-a:text-primary-hover
        prose-code:text-accent prose-code:before:content-[''] prose-code:after:content-['']
        prose-pre:bg-surface prose-pre:border prose-pre:border-border
        prose-strong:text-text-primary
        prose-li:text-text-secondary
        prose-blockquote:border-primary prose-blockquote:text-text-secondary"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
