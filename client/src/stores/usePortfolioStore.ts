import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STARTING_CASH } from '../lib/constants'

export interface Holding {
  symbol: string
  shares: number
  avgCostBasis: number
  purchaseDate: string
}

export interface Transaction {
  id: string
  type: 'buy' | 'sell'
  symbol: string
  shares: number
  price: number
  total: number
  timestamp: string
}

interface PortfolioState {
  cashBalance: number
  holdings: Holding[]
  transactions: Transaction[]
  setCashBalance: (amount: number) => void
  setHoldings: (holdings: Holding[]) => void
  addTransaction: (tx: Transaction) => void
  setTransactions: (txs: Transaction[]) => void
  reset: () => void
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      cashBalance: STARTING_CASH,
      holdings: [],
      transactions: [],
      setCashBalance: (amount) => set({ cashBalance: amount }),
      setHoldings: (holdings) => set({ holdings }),
      addTransaction: (tx) =>
        set((state) => ({ transactions: [tx, ...state.transactions] })),
      setTransactions: (txs) => set({ transactions: txs }),
      reset: () =>
        set({
          cashBalance: STARTING_CASH,
          holdings: [],
          transactions: [],
        }),
    }),
    { name: 'financeforge-portfolio' }
  )
)
