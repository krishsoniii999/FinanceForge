interface StreamingTextProps {
  content: string
  isStreaming?: boolean
}

export function StreamingText({ content, isStreaming }: StreamingTextProps) {
  return (
    <span>
      {content}
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 bg-accent-blue/70 ml-0.5 animate-pulse rounded-sm align-text-bottom" />
      )}
    </span>
  )
}
