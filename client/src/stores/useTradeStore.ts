import { create } from 'zustand'

interface TradeModalState {
  isOpen: boolean
  symbol: string | null
  defaultAction: 'buy' | 'sell'
  open: (symbol: string, action?: 'buy' | 'sell') => void
  close: () => void
}

export const useTradeStore = create<TradeModalState>((set) => ({
  isOpen: false,
  symbol: null,
  defaultAction: 'buy',
  open: (symbol, action = 'buy') =>
    set({ isOpen: true, symbol: symbol.toUpperCase(), defaultAction: action }),
  close: () => set({ isOpen: false, symbol: null }),
}))
