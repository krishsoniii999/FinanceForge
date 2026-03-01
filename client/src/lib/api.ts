import axios from 'axios'
import { API_BASE } from './constants'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
})

// Market data
export async function getQuote(symbol: string) {
  const { data } = await api.get(`/market/quote/${symbol}`)
  return data
}

export async function getQuotes(symbols: string[]) {
  const { data } = await api.get(`/market/quotes`, {
    params: { symbols: symbols.join(',') },
  })
  return data
}

export async function getChart(symbol: string, range: string, interval: string, indicators?: string[]) {
  const params: Record<string, string> = { range, interval }
  if (indicators && indicators.length > 0) {
    params.indicators = indicators.join(',')
  }
  const { data } = await api.get(`/market/chart/${symbol}`, { params })
  return data
}

export async function searchStocks(query: string) {
  const { data } = await api.get(`/market/search`, {
    params: { q: query },
  })
  return data
}

export async function getStockSummary(symbol: string) {
  const { data } = await api.get(`/market/summary/${symbol}`)
  return data
}

export async function getTrending() {
  const { data } = await api.get(`/market/trending`)
  return data
}

// Portfolio
export async function getPortfolio() {
  const { data } = await api.get(`/portfolio`)
  return data
}

export async function executeTrade(trade: {
  symbol: string
  action: 'buy' | 'sell'
  shares: number
}) {
  const { data } = await api.post(`/portfolio/trade`, trade)
  return data
}

export async function getTradeHistory() {
  const { data } = await api.get(`/portfolio/history`)
  return data
}

export async function resetPortfolio() {
  const { data } = await api.post(`/portfolio/reset`)
  return data
}

// Watchlist
export async function getWatchlist() {
  const { data } = await api.get(`/watchlist`)
  return data
}

export async function addToWatchlist(symbol: string) {
  const { data } = await api.post(`/watchlist`, { symbol })
  return data
}

export async function removeFromWatchlist(symbol: string) {
  const { data } = await api.delete(`/watchlist/${symbol}`)
  return data
}

// Lessons
export async function getLessonProgress() {
  const { data } = await api.get(`/lessons/progress`)
  return data
}

export async function saveLessonProgress(lessonId: string, completed: boolean) {
  const { data } = await api.post(`/lessons/progress/${lessonId}`, { completed })
  return data
}

// News
export async function getNews(symbol: string) {
  const { data } = await api.get(`/news/${symbol}`)
  return data
}

export async function getAnalystRatings(symbol: string) {
  const { data } = await api.get(`/news/${symbol}/ratings`)
  return data
}

// AI
export async function getAiHealth() {
  const { data } = await api.get(`/ai/health`)
  return data
}

export async function getTradeCoach(payload: {
  symbol: string; action: string; shares: number; price: number; totalCost: number; cashBalance: number
}) {
  const { data } = await api.post(`/ai/trade-coach`, payload)
  return data as { whatTheyDo: string; whatItMeans: string; thingsToKnow: string[]; riskLevel: 'Low' | 'Medium' | 'High'; riskReason: string }
}

export async function explainTerm(term: string, context?: string) {
  const { data } = await api.post(`/ai/explain`, { term, context })
  return data as { explanation: string }
}

export async function getPortfolioDoctor(payload: {
  holdings: any[]; cashBalance: number; totalValue: number; totalPnL: number; totalPnLPercent: number
}) {
  const { data } = await api.post(`/ai/portfolio-doctor`, payload)
  return data as { grade: string; summary: string; strengths: string[]; improvements: string[]; tip: string }
}
