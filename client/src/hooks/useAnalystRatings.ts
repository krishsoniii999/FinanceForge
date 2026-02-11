import { useQuery } from '@tanstack/react-query'
import { getAnalystRatings } from '../lib/api'

export interface RatingsTrend {
  period: string
  strongBuy: number
  buy: number
  hold: number
  sell: number
  strongSell: number
}

export interface AnalystRatingsData {
  recommendation: string
  targetMeanPrice: number | null
  targetHighPrice: number | null
  targetLowPrice: number | null
  currentPrice: number | null
  numberOfAnalysts: number
  trend: RatingsTrend[]
  upgrades: Array<{
    firm: string
    toGrade: string
    fromGrade: string
    action: string
    date: string
  }>
}

export function useAnalystRatings(symbol: string) {
  return useQuery<AnalystRatingsData>({
    queryKey: ['ratings', symbol],
    queryFn: () => getAnalystRatings(symbol),
    enabled: !!symbol,
    staleTime: 60 * 60_000,
  })
}
