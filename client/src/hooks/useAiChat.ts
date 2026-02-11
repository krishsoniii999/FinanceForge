import { useCallback, useRef } from 'react'
import { useChatStore } from '../stores/useChatStore'
import { usePortfolioStore } from '../stores/usePortfolioStore'
import { API_BASE } from '../lib/constants'

export function useAiChat() {
  const abortRef = useRef<AbortController | null>(null)
  const {
    messages,
    isStreaming,
    currentSymbol,
    addMessage,
    appendToLastMessage,
    finishStreaming,
  } = useChatStore()
  const { cashBalance, holdings } = usePortfolioStore()

  const sendMessage = useCallback(async (content: string) => {
    if (isStreaming) return

    // Add user message
    addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    })

    // Add placeholder assistant message
    addMessage({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    })

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: messages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            symbol: currentSymbol,
            portfolio: {
              cashBalance,
              holdings,
            },
          },
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        appendToLastMessage('Sorry, I had trouble connecting. Make sure Ollama is running locally (`ollama serve`) with a model pulled (`ollama pull llama3.2`).')
        finishStreaming()
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        finishStreaming()
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                appendToLastMessage(data.content)
              }
              if (data.done) {
                finishStreaming()
              }
            } catch {
              // skip malformed JSON
            }
          }
          if (line.startsWith('event: error')) {
            appendToLastMessage('\n\n[Error occurred during streaming]')
            finishStreaming()
          }
        }
      }

      finishStreaming()
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        appendToLastMessage('Failed to connect to AI service. Make sure Ollama is running locally.')
        finishStreaming()
      }
    }
  }, [isStreaming, messages, currentSymbol, cashBalance, holdings, addMessage, appendToLastMessage, finishStreaming])

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    finishStreaming()
  }, [finishStreaming])

  return { sendMessage, stopStreaming }
}
