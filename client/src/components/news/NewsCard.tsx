import { formatDistanceToNow } from 'date-fns'
import { ExternalLink } from 'lucide-react'
import { SentimentBadge } from './SentimentBadge'
import type { NewsArticle } from '../../hooks/useStockNews'

interface NewsCardProps {
  article: NewsArticle
}

export function NewsCard({ article }: NewsCardProps) {
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-4 hover:bg-white/[0.02] transition-colors"
    >
      <div className="flex items-start gap-3">
        {article.thumbnail && (
          <img
            src={article.thumbnail}
            alt=""
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-white/[0.04]"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
              {article.publisher}
            </span>
            <span className="text-[10px] text-text-tertiary">
              {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
            </span>
            <SentimentBadge sentiment={article.sentiment} />
          </div>
          <h3 className="text-sm font-medium text-text-primary leading-snug group-hover:text-accent-blue transition-colors line-clamp-2">
            {article.title}
          </h3>
        </div>
        <ExternalLink size={12} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
      </div>
    </a>
  )
}
