import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const app = express()

// ── Supabase ──────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

// ── Anthropic ─────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })

// ── Middleware ────────────────────────────────────────────
app.use(helmet())
app.use(cors({ origin: '*' }))
app.use(express.json())
app.use('/api', rateLimit({ windowMs: 60_000, max: 100, standardHeaders: true, legacyHeaders: false }))

// ── Constants ─────────────────────────────────────────────
const USER_ID = 'default'
const STARTING_CASH = 100_000
const FINNHUB_KEY = process.env.FINNHUB_API_KEY || ''
const FINNHUB_BASE = 'https://finnhub.io/api/v1'

// ── Helpers ───────────────────────────────────────────────
async function getFinnhubQuote(symbol: string) {
  const url = `${FINNHUB_BASE}/quote?symbol=${symbol}&token=${FINNHUB_KEY}`
  const r = await fetch(url)
  const d = await r.json() as any
  if (!d || !d.c) throw new Error(`No quote data for ${symbol}`)
  return { price: d.c, change: d.d, changePercent: d.dp, open: d.o, high: d.h, low: d.l, prevClose: d.pc }
}

async function getOrCreatePortfolio() {
  const { data } = await supabase.from('portfolios').select('*').eq('user_id', USER_ID).single()
  if (data) return data
  const { data: created } = await supabase.from('portfolios').insert({ user_id: USER_ID, cash: STARTING_CASH }).select().single()
  return created
}

// ── Health ────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// ── Market ────────────────────────────────────────────────
app.get('/api/market/quote/:symbol', async (req, res, next) => {
  try {
    const quote = await getFinnhubQuote(req.params.symbol.toUpperCase())
    res.json({ symbol: req.params.symbol.toUpperCase(), ...quote })
  } catch (err) { next(err) }
})

app.get('/api/market/quotes', async (req, res, next) => {
  try {
    const symbols = String(req.query.symbols || '').split(',').filter(Boolean)
    const quotes = await Promise.all(symbols.map(async s => {
      try { return { symbol: s, ...(await getFinnhubQuote(s)) } } catch { return { symbol: s, price: 0 } }
    }))
    res.json(quotes)
  } catch (err) { next(err) }
})

app.get('/api/market/search', async (req, res, next) => {
  try {
    const q = String(req.query.q || '')
    if (!q) { res.json([]); return }
    const r = await fetch(`${FINNHUB_BASE}/search?q=${encodeURIComponent(q)}&token=${FINNHUB_KEY}`)
    const d = await r.json() as any
    res.json((d.result || []).slice(0, 10).map((s: any) => ({ symbol: s.symbol, name: s.description, type: s.type })))
  } catch (err) { next(err) }
})

app.get('/api/market/chart/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params
    const range = String(req.query.range || '1mo')
    const rangeMap: Record<string, { from: number; resolution: string }> = {
      '1d':  { from: Date.now()/1000 - 86400,      resolution: '5'   },
      '1wk': { from: Date.now()/1000 - 604800,     resolution: '15'  },
      '1mo': { from: Date.now()/1000 - 2592000,    resolution: '60'  },
      '3mo': { from: Date.now()/1000 - 7776000,    resolution: 'D'   },
      '1y':  { from: Date.now()/1000 - 31536000,   resolution: 'W'   },
    }
    const { from, resolution } = rangeMap[range] || rangeMap['1mo']
    const to = Math.floor(Date.now() / 1000)
    const r = await fetch(`${FINNHUB_BASE}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${Math.floor(from)}&to=${to}&token=${FINNHUB_KEY}`)
    const d = await r.json() as any
    if (!d || d.s !== 'ok' || !d.t) { res.json({ candles: [] }); return }
    const candles = d.t.map((t: number, i: number) => ({
      time: t, open: d.o[i], high: d.h[i], low: d.l[i], close: d.c[i], volume: d.v[i],
    }))
    res.json({ candles })
  } catch (err) { next(err) }
})

app.get('/api/market/summary/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params
    const [quoteR, profileR] = await Promise.all([
      fetch(`${FINNHUB_BASE}/quote?symbol=${symbol}&token=${FINNHUB_KEY}`),
      fetch(`${FINNHUB_BASE}/stock/profile2?symbol=${symbol}&token=${FINNHUB_KEY}`),
    ])
    const [quote, profile] = await Promise.all([quoteR.json(), profileR.json()]) as any[]
    res.json({ symbol, name: profile.name || symbol, price: quote.c, change: quote.d, changePercent: quote.dp, marketCap: profile.marketCapitalization, pe: profile.pe, industry: profile.finnhubIndustry, logo: profile.logo, weburl: profile.weburl })
  } catch (err) { next(err) }
})

app.get('/api/market/trending', async (_req, res) => {
  res.json(['AAPL','MSFT','GOOGL','AMZN','TSLA','NVDA','META','SPY'].map(s => ({ symbol: s })))
})

// ── Portfolio ─────────────────────────────────────────────
app.get('/api/portfolio', async (_req, res, next) => {
  try {
    const portfolio = await getOrCreatePortfolio()
    if (!portfolio) { res.json({ cashBalance: STARTING_CASH, holdings: [], transactions: [] }); return }
    const [{ data: holdings }, { data: trades }] = await Promise.all([
      supabase.from('holdings').select('*').eq('portfolio_id', portfolio.id),
      supabase.from('trades').select('*').eq('portfolio_id', portfolio.id).order('created_at', { ascending: false }),
    ])
    res.json({
      cashBalance: Number(portfolio.cash),
      holdings: (holdings || []).map((h: any) => ({ symbol: h.symbol, shares: Number(h.shares), avgCostBasis: Number(h.avg_cost), purchaseDate: h.created_at })),
      transactions: (trades || []).map((t: any) => ({ id: t.id, type: t.action, symbol: t.symbol, shares: Number(t.shares), price: Number(t.price), total: Number(t.total), timestamp: t.created_at })),
    })
  } catch (err) { next(err) }
})

app.post('/api/portfolio/trade', async (req, res, next) => {
  try {
    const { symbol, action, shares } = req.body
    if (!symbol || !action || !shares || shares <= 0) { res.status(400).json({ error: 'Invalid trade parameters' }); return }
    if (action !== 'buy' && action !== 'sell') { res.status(400).json({ error: 'Action must be buy or sell' }); return }
    const upper = symbol.toUpperCase()
    const quote = await getFinnhubQuote(upper)
    const price = quote.price
    const total = price * shares
    const portfolio = await getOrCreatePortfolio()
    if (!portfolio) { res.status(500).json({ error: 'Portfolio error' }); return }
    const currentCash = Number(portfolio.cash)
    if (action === 'buy') {
      if (total > currentCash) { res.status(400).json({ error: `Insufficient funds. Need $${total.toFixed(2)} but have $${currentCash.toFixed(2)}` }); return }
      await supabase.from('portfolios').update({ cash: currentCash - total }).eq('id', portfolio.id)
      const { data: existing } = await supabase.from('holdings').select('*').eq('portfolio_id', portfolio.id).eq('symbol', upper).single()
      if (existing) {
        const totalShares = Number(existing.shares) + shares
        const newAvg = (Number(existing.avg_cost) * Number(existing.shares) + price * shares) / totalShares
        await supabase.from('holdings').update({ shares: totalShares, avg_cost: newAvg }).eq('id', existing.id)
      } else {
        await supabase.from('holdings').insert({ portfolio_id: portfolio.id, symbol: upper, shares, avg_cost: price })
      }
    } else {
      const { data: existing } = await supabase.from('holdings').select('*').eq('portfolio_id', portfolio.id).eq('symbol', upper).single()
      if (!existing || Number(existing.shares) < shares) { res.status(400).json({ error: `Insufficient shares` }); return }
      await supabase.from('portfolios').update({ cash: currentCash + total }).eq('id', portfolio.id)
      const remaining = Number(existing.shares) - shares
      if (remaining === 0) { await supabase.from('holdings').delete().eq('id', existing.id) }
      else { await supabase.from('holdings').update({ shares: remaining }).eq('id', existing.id) }
    }
    const { data: trade } = await supabase.from('trades').insert({ portfolio_id: portfolio.id, symbol: upper, action, shares, price, total }).select().single()
    res.json({ trade: trade ? { id: trade.id, type: trade.action, symbol: trade.symbol, shares: Number(trade.shares), price: Number(trade.price), total: Number(trade.total), timestamp: trade.created_at } : null })
  } catch (err) { next(err) }
})

app.get('/api/portfolio/history', async (_req, res, next) => {
  try {
    const portfolio = await getOrCreatePortfolio()
    if (!portfolio) { res.json([]); return }
    const { data } = await supabase.from('trades').select('*').eq('portfolio_id', portfolio.id).order('created_at', { ascending: false })
    res.json((data || []).map((t: any) => ({ id: t.id, type: t.action, symbol: t.symbol, shares: Number(t.shares), price: Number(t.price), total: Number(t.total), timestamp: t.created_at })))
  } catch (err) { next(err) }
})

app.post('/api/portfolio/reset', async (_req, res, next) => {
  try {
    const portfolio = await getOrCreatePortfolio()
    if (portfolio) {
      await Promise.all([supabase.from('holdings').delete().eq('portfolio_id', portfolio.id), supabase.from('trades').delete().eq('portfolio_id', portfolio.id)])
      await supabase.from('portfolios').update({ cash: STARTING_CASH }).eq('id', portfolio.id)
    }
    res.json({ cashBalance: STARTING_CASH, holdings: [], transactions: [] })
  } catch (err) { next(err) }
})

// ── Watchlist ─────────────────────────────────────────────
app.get('/api/watchlist', async (_req, res, next) => {
  try {
    const { data } = await supabase.from('watchlist').select('symbol').eq('user_id', USER_ID).order('added_at', { ascending: true })
    res.json((data || []).map((r: any) => r.symbol))
  } catch (err) { next(err) }
})

app.post('/api/watchlist', async (req, res, next) => {
  try {
    const { symbol } = req.body
    if (!symbol) { res.status(400).json({ error: 'Symbol required' }); return }
    await supabase.from('watchlist').upsert({ user_id: USER_ID, symbol: symbol.toUpperCase(), added_at: new Date().toISOString() }, { onConflict: 'user_id,symbol' })
    const { data } = await supabase.from('watchlist').select('symbol').eq('user_id', USER_ID).order('added_at', { ascending: true })
    res.json((data || []).map((r: any) => r.symbol))
  } catch (err) { next(err) }
})

app.delete('/api/watchlist/:symbol', async (req, res, next) => {
  try {
    await supabase.from('watchlist').delete().eq('user_id', USER_ID).eq('symbol', req.params.symbol.toUpperCase())
    const { data } = await supabase.from('watchlist').select('symbol').eq('user_id', USER_ID).order('added_at', { ascending: true })
    res.json((data || []).map((r: any) => r.symbol))
  } catch (err) { next(err) }
})

// ── Lessons ───────────────────────────────────────────────
app.get('/api/lessons/progress', async (_req, res, next) => {
  try {
    const { data } = await supabase.from('lesson_progress').select('*').eq('user_id', USER_ID)
    const progress: Record<string, any> = {}
    for (const row of data || []) progress[row.lesson_id] = { completed: row.completed, lastAccessed: row.completed_at || new Date().toISOString() }
    res.json(progress)
  } catch (err) { next(err) }
})

app.post('/api/lessons/progress/:lessonId', async (req, res, next) => {
  try {
    const now = new Date().toISOString()
    await supabase.from('lesson_progress').upsert({ user_id: USER_ID, lesson_id: req.params.lessonId, completed: req.body.completed ?? true, completed_at: now }, { onConflict: 'user_id,lesson_id' })
    const { data } = await supabase.from('lesson_progress').select('*').eq('user_id', USER_ID)
    const progress: Record<string, any> = {}
    for (const row of data || []) progress[row.lesson_id] = { completed: row.completed, lastAccessed: row.completed_at || now }
    res.json(progress)
  } catch (err) { next(err) }
})

// ── News ──────────────────────────────────────────────────
app.get('/api/news/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params
    const to = new Date().toISOString().split('T')[0]
    const from = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
    const r = await fetch(`${FINNHUB_BASE}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_KEY}`)
    const d = await r.json() as any[]
    res.json((Array.isArray(d) ? d : []).slice(0, 20).map((n: any) => ({ id: String(n.id), title: n.headline, summary: n.summary, url: n.url, source: n.source, publishedAt: new Date(n.datetime * 1000).toISOString(), imageUrl: n.image })))
  } catch (err) { next(err) }
})

app.get('/api/news/:symbol/ratings', async (req, res, next) => {
  try {
    const r = await fetch(`${FINNHUB_BASE}/stock/recommendation?symbol=${req.params.symbol}&token=${FINNHUB_KEY}`)
    const d = await r.json() as any[]
    res.json(Array.isArray(d) ? d.slice(0, 3) : [])
  } catch (err) { next(err) }
})

// ── AI ────────────────────────────────────────────────────
app.get('/api/ai/health', (_req, res) => res.json({ status: 'ok', model: 'claude-sonnet-4-5-20250929' }))

app.post('/api/ai/chat', async (req, res, next) => {
  try {
    const { messages } = req.body
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: 'You are a knowledgeable financial advisor assistant for FinanceForge, a paper trading and education platform. Help users understand stocks, trading strategies, and financial concepts. Keep responses concise and educational.',
      messages,
    })
    res.json({ content: response.content[0].type === 'text' ? response.content[0].text : '' })
  } catch (err) { next(err) }
})

// ── Error handler ─────────────────────────────────────────
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

export default app
