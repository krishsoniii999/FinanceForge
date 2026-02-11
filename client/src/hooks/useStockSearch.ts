import { useQuery } from '@tanstack/react-query'
import { searchStocks } from '../lib/api'
import { useState, useEffect } from 'react'

export interface SearchResult {
  symbol: string
  name: string
  type: string
  exchange: string
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export function useStockSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300)

  return useQuery<SearchResult[]>({
    queryKey: ['stockSearch', debouncedQuery],
    queryFn: () => searchStocks(debouncedQuery),
    enabled: debouncedQuery.length >= 1,
    staleTime: 10 * 60 * 1000,
  })
}
