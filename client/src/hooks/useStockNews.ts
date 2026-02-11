import { useQuery } from '@tanstack/react-query'
import { getNews } from '../lib/api'

export interface NewsArticle {
  title: string
  publisher: string
  link: string
  publishedAt: string
  thumbnail?: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  sentimentScore: number
}

export function useStockNews(symbol: string) {
  return useQuery<NewsArticle[]>({
    queryKey: ['news', symbol],
    queryFn: () => getNews(symbol),
    enabled: !!symbol,
    staleTime: 5 * 60_000,
  })
}
