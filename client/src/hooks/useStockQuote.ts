import { useQuery } from '@tanstack/react-query'
import { getQuote, getQuotes } from '../lib/api'

export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  previousClose: number
  open: number
  dayHigh: number
  dayLow: number
}

export function useStockQuote(symbol: string) {
  return useQuery<StockQuote>({
    queryKey: ['quote', symbol],
    queryFn: () => getQuote(symbol),
    enabled: !!symbol,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })
}

export function useStockQuotes(symbols: string[]) {
  return useQuery<StockQuote[]>({
    queryKey: ['quotes', symbols.join(',')],
    queryFn: () => getQuotes(symbols),
    enabled: symbols.length > 0,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })
}
