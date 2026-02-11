import { useEffect, useRef } from 'react'
import { PageTransition } from '../components/layout/PageTransition'
import { useChatStore } from '../stores/useChatStore'
import { useAiChat } from '../hooks/useAiChat'
import { ChatMessage } from '../components/ai/ChatMessage'
import { ChatInput } from '../components/ai/ChatInput'
import { QuickActions } from '../components/ai/QuickActions'
import { Sparkles } from 'lucide-react'

export function Research() {
  const { messages, isStreaming, currentSymbol } = useChatStore()
  const { sendMessage, stopStreaming } = useAiChat()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <PageTransition>
      <div className="flex flex-col h-[calc(100vh-5rem)] sm:h-[calc(100vh-7rem)] max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={20} className="text-accent-blue" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">AI Research</h1>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary">
            Ask questions about stocks, your portfolio, or investing in general
          </p>
        </div>

        {/* Messages area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto rounded-2xl border border-white/[0.06] bg-white/[0.01]"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent-blue/10 flex items-center justify-center mb-4">
                <Sparkles size={32} className="text-accent-blue" />
              </div>
              <h2 className="text-lg font-semibold mb-2">FinanceForge AI</h2>
              <p className="text-sm text-text-tertiary leading-relaxed mb-8 max-w-md">
                Your AI-powered financial research assistant. Ask about any stock,
                get portfolio advice, or learn about investing concepts.
              </p>
              <QuickActions symbol={currentSymbol} onAction={sendMessage} />
            </div>
          ) : (
            <div className="space-y-4 p-3 sm:p-6">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        {messages.length > 0 && !isStreaming && (
          <QuickActions symbol={currentSymbol} onAction={sendMessage} />
        )}

        {/* Input */}
        <div className="mt-2">
          <ChatInput
            onSend={sendMessage}
            onStop={stopStreaming}
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </PageTransition>
  )
}
