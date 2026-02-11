import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useChatStore } from '../../stores/useChatStore'
import { useAiChat } from '../../hooks/useAiChat'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { QuickActions } from './QuickActions'
import { X, Sparkles, Trash2 } from 'lucide-react'

export function ChatPanel() {
  const { messages, isOpen, isStreaming, currentSymbol, setOpen, clearMessages } = useChatStore()
  const { sendMessage, stopStreaming } = useAiChat()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Cmd+J shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault()
        setOpen(!isOpen)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, setOpen])

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />

          {/* Panel - full width on mobile, 400px on desktop */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] sm:max-w-[calc(100vw-60px)] z-50 flex flex-col border-l border-white/[0.06] bg-bg-primary/95 backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-accent-blue/20 flex items-center justify-center">
                  <Sparkles size={14} className="text-accent-blue" />
                </div>
                <div>
                  <span className="text-sm font-semibold">FinanceForge AI</span>
                  {currentSymbol && (
                    <span className="text-[10px] text-text-tertiary ml-2">
                      Viewing {currentSymbol}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearMessages}
                    className="p-2 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-white/[0.04] transition-colors"
                    title="Clear chat"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-white/[0.04] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-4 sm:px-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center mb-4">
                    <Sparkles size={24} className="text-accent-blue" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1">FinanceForge AI</h3>
                  <p className="text-xs text-text-tertiary leading-relaxed mb-6">
                    Your AI research assistant. Ask about stocks, analyze companies, or get help with your portfolio.
                  </p>
                  <QuickActions symbol={currentSymbol} onAction={sendMessage} />
                </div>
              ) : (
                <div className="space-y-4 p-3 sm:p-4">
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions when there are messages */}
            {messages.length > 0 && !isStreaming && (
              <QuickActions symbol={currentSymbol} onAction={sendMessage} />
            )}

            {/* Input */}
            <ChatInput
              onSend={sendMessage}
              onStop={stopStreaming}
              isStreaming={isStreaming}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
