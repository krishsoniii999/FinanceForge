import { useState, useRef, useEffect } from 'react'
import { Send, Square } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  onStop: () => void
  isStreaming: boolean
  disabled?: boolean
}

export function ChatInput({ onSend, onStop, isStreaming, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isStreaming) {
      inputRef.current?.focus()
    }
  }, [isStreaming])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || isStreaming || disabled) return
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex items-end gap-2 p-3 border-t border-white/[0.06]">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about stocks, your portfolio..."
        rows={1}
        disabled={disabled}
        className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-blue/30 resize-none min-h-[40px] max-h-[120px]"
        style={{ height: 'auto' }}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement
          target.style.height = 'auto'
          target.style.height = Math.min(target.scrollHeight, 120) + 'px'
        }}
      />
      {isStreaming ? (
        <button
          onClick={onStop}
          className="p-2.5 rounded-xl bg-loss/20 text-loss border border-loss/20 hover:bg-loss/30 transition-colors flex-shrink-0"
        >
          <Square size={16} />
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || disabled}
          className="p-2.5 rounded-xl bg-accent-blue/20 text-accent-blue border border-accent-blue/20 hover:bg-accent-blue/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send size={16} />
        </button>
      )}
    </div>
  )
}
