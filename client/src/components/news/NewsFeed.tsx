import { GlassCard } from '../ui/GlassCard'
import { Skeleton } from '../ui/Skeleton'
import { NewsCard } from './NewsCard'
import { useStockNews } from '../../hooks/useStockNews'
import { Newspaper } from 'lucide-react'

interface NewsFeedProps {
  symbol: string
  limit?: number
}

export function NewsFeed({ symbol, limit }: NewsFeedProps) {
  const { data: articles, isLoading } = useStockNews(symbol)

  const displayArticles = limit ? articles?.slice(0, limit) : articles

  return (
    <GlassCard padding="none">
      <div className="flex items-center gap-2 p-4 border-b border-white/[0.06]">
        <Newspaper size={14} className="text-accent-blue" />
        <h3 className="text-sm font-semibold">Latest News</h3>
        {articles && (
          <span className="text-[10px] text-text-tertiary ml-auto">
            {articles.length} articles
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="divide-y divide-white/[0.04]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="w-16 h-3" />
                <Skeleton className="w-20 h-3" />
              </div>
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-3/4 h-4" />
            </div>
          ))}
        </div>
      ) : !displayArticles?.length ? (
        <div className="p-8 text-center">
          <Newspaper size={24} className="text-text-tertiary mx-auto mb-2" />
          <p className="text-xs text-text-tertiary">No recent news found</p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {displayArticles.map((article, i) => (
            <NewsCard key={i} article={article} />
          ))}
        </div>
      )}
    </GlassCard>
  )
}
