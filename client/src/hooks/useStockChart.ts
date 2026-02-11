import { useQuery } from '@tanstack/react-query'
import { getChart } from '../lib/api'
import { CHART_INTERVALS, type TimeRange } from '../lib/constants'

export interface ChartDataPoint {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface IndicatorData {
  sma20?: Array<{ time: string; value: number }>
  sma50?: Array<{ time: string; value: number }>
  sma200?: Array<{ time: string; value: number }>
  ema20?: Array<{ time: string; value: number }>
  bollinger?: Array<{ time: string; upper: number; middle: number; lower: number }>
  rsi?: Array<{ time: string; value: number }>
  macd?: Array<{ time: string; macd: number; signal: number; histogram: number }>
  volume?: Array<{ time: string; value: number; color: string }>
}

export interface ChartResponse {
  candles: ChartDataPoint[]
  indicators?: IndicatorData
}

export function useStockChart(symbol: string, range: TimeRange, activeIndicators: string[] = []) {
  const interval = CHART_INTERVALS[range]

  return useQuery<ChartResponse>({
    queryKey: ['chart', symbol, range, activeIndicators.sort().join(',')],
    queryFn: async () => {
      const result = await getChart(symbol, range, interval, activeIndicators)
      // API returns plain array when no indicators, or { candles, indicators } when indicators requested
      if (Array.isArray(result)) {
        return { candles: result }
      }
      return result
    },
    enabled: !!symbol,
    staleTime: range === '1D' ? 60_000 : 5 * 60_000,
  })
}
