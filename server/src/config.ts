import 'dotenv/config'

export const config = {
  port: Number(process.env.PORT) || 3001,
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: 'claude-sonnet-4-5-20250929',
    maxTokens: 1024,
  },
  finnhub: {
    apiKey: process.env.FINNHUB_API_KEY || '',
    baseUrl: 'https://finnhub.io/api/v1',
  },
  cache: {
    quoteTTL: 15,
    chartIntradayTTL: 60,
    chartDailyTTL: 300,
    summaryTTL: 3600,
    searchTTL: 600,
    trendingTTL: 300,
    newsTTL: 300,
    ratingsTTL: 3600,
  },
}
