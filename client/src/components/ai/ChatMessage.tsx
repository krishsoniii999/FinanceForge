import { cn } from '../../lib/utils'
import { StreamingText } from './StreamingText'
import type { ChatMessage as ChatMessageType } from '../../stores/useChatStore'
import { Bot, User } from 'lucide-react'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
          isUser
            ? 'bg-accent-blue/20 text-accent-blue'
            : 'bg-white/[0.06] text-text-secondary'
        )}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-accent-blue/20 text-text-primary border border-accent-blue/20 rounded-tr-md'
            : 'bg-white/[0.04] text-text-secondary border border-white/[0.06] rounded-tl-md'
        )}
      >
        {message.isStreaming ? (
          <StreamingText content={message.content} isStreaming />
        ) : (
          <span className="whitespace-pre-wrap">{message.content}</span>
        )}
      </div>
    </div>
  )
}
