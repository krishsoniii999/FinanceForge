import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  isStreaming?: boolean
}

interface ChatState {
  messages: ChatMessage[]
  isOpen: boolean
  isStreaming: boolean
  currentSymbol: string | null
  setOpen: (open: boolean) => void
  toggleOpen: () => void
  addMessage: (msg: ChatMessage) => void
  appendToLastMessage: (content: string) => void
  finishStreaming: () => void
  setCurrentSymbol: (symbol: string | null) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isOpen: false,
      isStreaming: false,
      currentSymbol: null,
      setOpen: (open) => set({ isOpen: open }),
      toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),
      addMessage: (msg) =>
        set((s) => ({
          messages: [...s.messages, msg],
          isStreaming: msg.isStreaming ?? false,
        })),
      appendToLastMessage: (content) =>
        set((s) => {
          const msgs = [...s.messages]
          const last = msgs[msgs.length - 1]
          if (last && last.role === 'assistant') {
            msgs[msgs.length - 1] = { ...last, content: last.content + content }
          }
          return { messages: msgs }
        }),
      finishStreaming: () =>
        set((s) => {
          const msgs = [...s.messages]
          const last = msgs[msgs.length - 1]
          if (last) {
            msgs[msgs.length - 1] = { ...last, isStreaming: false }
          }
          return { messages: msgs, isStreaming: false }
        }),
      setCurrentSymbol: (symbol) => set({ currentSymbol: symbol }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'financeforge-chat',
      partialize: (state) => ({
        messages: state.messages.filter((m) => !m.isStreaming).slice(-50),
      }),
    }
  )
)
