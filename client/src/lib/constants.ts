export const API_BASE = '/api'

export const DEFAULT_WATCHLIST = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'SPY'
]

export const MARKET_INDICES = [
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: 'QQQ', name: 'NASDAQ' },
  { symbol: 'DIA', name: 'DOW' },
]

export const STARTING_CASH = 100_000

export const TIME_RANGES = ['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const
export type TimeRange = typeof TIME_RANGES[number]

export const CHART_INTERVALS: Record<TimeRange, string> = {
  '1D': '5m',
  '1W': '15m',
  '1M': '1d',
  '3M': '1d',
  '1Y': '1wk',
  'ALL': '1mo',
}

export const INDICATOR_DEFINITIONS = [
  { id: 'sma20', label: 'SMA 20', type: 'overlay' as const, color: '#f59e0b' },
  { id: 'sma50', label: 'SMA 50', type: 'overlay' as const, color: '#8b5cf6' },
  { id: 'sma200', label: 'SMA 200', type: 'overlay' as const, color: '#ef4444' },
  { id: 'ema20', label: 'EMA 20', type: 'overlay' as const, color: '#06b6d4' },
  { id: 'bollinger', label: 'Bollinger', type: 'overlay' as const, color: '#6366f1' },
  { id: 'rsi', label: 'RSI', type: 'subchart' as const, color: '#8b5cf6' },
  { id: 'macd', label: 'MACD', type: 'subchart' as const, color: '#3b82f6' },
  { id: 'volume', label: 'Volume', type: 'subchart' as const, color: '#22c55e' },
]
