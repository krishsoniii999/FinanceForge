import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_WATCHLIST } from '../lib/constants'

interface WatchlistState {
  symbols: string[]
  addSymbol: (symbol: string) => void
  removeSymbol: (symbol: string) => void
  reorder: (symbols: string[]) => void
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set) => ({
      symbols: DEFAULT_WATCHLIST,
      addSymbol: (symbol) =>
        set((state) => ({
          symbols: state.symbols.includes(symbol)
            ? state.symbols
            : [...state.symbols, symbol],
        })),
      removeSymbol: (symbol) =>
        set((state) => ({
          symbols: state.symbols.filter((s) => s !== symbol),
        })),
      reorder: (symbols) => set({ symbols }),
    }),
    { name: 'financeforge-watchlist' }
  )
)
