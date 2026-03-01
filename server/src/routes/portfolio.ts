import { Router } from 'express'
import { supabase } from '../services/supabase'
import * as finnhub from '../services/finnhub'

const router = Router()
const USER_ID = 'default'
const STARTING_CASH = 100_000

async function getOrCreatePortfolio() {
  const { data } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', USER_ID)
    .single()

  if (data) return data

  const { data: created } = await supabase
    .from('portfolios')
    .insert({ user_id: USER_ID, cash: STARTING_CASH })
    .select()
    .single()

  return created
}

router.get('/', async (_req, res, next) => {
  try {
    const portfolio = await getOrCreatePortfolio()
    if (!portfolio) { res.json({ cashBalance: STARTING_CASH, holdings: [], transactions: [] }); return }

    const [{ data: holdings }, { data: trades }] = await Promise.all([
      supabase.from('holdings').select('*').eq('portfolio_id', portfolio.id),
      supabase.from('trades').select('*').eq('portfolio_id', portfolio.id).order('created_at', { ascending: false }),
    ])

    res.json({
      cashBalance: Number(portfolio.cash),
      holdings: (holdings || []).map((h: any) => ({
        symbol: h.symbol,
        shares: Number(h.shares),
        avgCostBasis: Number(h.avg_cost),
        purchaseDate: h.created_at || new Date().toISOString(),
      })),
      transactions: (trades || []).map((t: any) => ({
        id: t.id,
        type: t.action,
        symbol: t.symbol,
        shares: Number(t.shares),
        price: Number(t.price),
        total: Number(t.total),
        timestamp: t.created_at,
      })),
    })
  } catch (err) {
    next(err)
  }
})

router.post('/trade', async (req, res, next) => {
  try {
    const { symbol, action, shares } = req.body

    if (!symbol || !action || !shares || shares <= 0) {
      res.status(400).json({ error: 'Invalid trade parameters' }); return
    }
    if (action !== 'buy' && action !== 'sell') {
      res.status(400).json({ error: 'Action must be "buy" or "sell"' }); return
    }

    const upper = symbol.toUpperCase()
    const quote = await finnhub.getQuote(upper)
    const price = quote.price
    const total = price * shares

    const portfolio = await getOrCreatePortfolio()
    if (!portfolio) { res.status(500).json({ error: 'Failed to get portfolio' }); return }

    const currentCash = Number(portfolio.cash)

    if (action === 'buy') {
      if (total > currentCash) {
        res.status(400).json({ error: `Insufficient funds. Need $${total.toFixed(2)} but have $${currentCash.toFixed(2)}` }); return
      }

      await supabase.from('portfolios').update({ cash: currentCash - total }).eq('id', portfolio.id)

      const { data: existing } = await supabase
        .from('holdings').select('*').eq('portfolio_id', portfolio.id).eq('symbol', upper).single()

      if (existing) {
        const totalShares = Number(existing.shares) + shares
        const newAvg = (Number(existing.avg_cost) * Number(existing.shares) + price * shares) / totalShares
        await supabase.from('holdings').update({ shares: totalShares, avg_cost: newAvg }).eq('id', existing.id)
      } else {
        await supabase.from('holdings').insert({ portfolio_id: portfolio.id, symbol: upper, shares, avg_cost: price })
      }
    } else {
      const { data: existing } = await supabase
        .from('holdings').select('*').eq('portfolio_id', portfolio.id).eq('symbol', upper).single()

      if (!existing || Number(existing.shares) < shares) {
        res.status(400).json({ error: `Insufficient shares. Have ${existing ? Number(existing.shares) : 0} but trying to sell ${shares}` }); return
      }

      await supabase.from('portfolios').update({ cash: currentCash + total }).eq('id', portfolio.id)

      const remaining = Number(existing.shares) - shares
      if (remaining === 0) {
        await supabase.from('holdings').delete().eq('id', existing.id)
      } else {
        await supabase.from('holdings').update({ shares: remaining }).eq('id', existing.id)
      }
    }

    const { data: trade } = await supabase
      .from('trades')
      .insert({ portfolio_id: portfolio.id, symbol: upper, action, shares, price, total })
      .select().single()

    const [{ data: updatedPortfolio }, { data: updatedHoldings }] = await Promise.all([
      supabase.from('portfolios').select('*').eq('id', portfolio.id).single(),
      supabase.from('holdings').select('*').eq('portfolio_id', portfolio.id),
    ])

    res.json({
      trade: trade ? { id: trade.id, type: trade.action, symbol: trade.symbol, shares: Number(trade.shares), price: Number(trade.price), total: Number(trade.total), timestamp: trade.created_at } : null,
      portfolio: {
        cashBalance: Number(updatedPortfolio?.cash ?? currentCash),
        holdings: (updatedHoldings || []).map((h: any) => ({
          symbol: h.symbol, shares: Number(h.shares), avgCostBasis: Number(h.avg_cost), purchaseDate: h.created_at,
        })),
      },
    })
  } catch (err) {
    next(err)
  }
})

router.get('/history', async (_req, res, next) => {
  try {
    const portfolio = await getOrCreatePortfolio()
    if (!portfolio) { res.json([]); return }

    const { data: trades } = await supabase
      .from('trades').select('*').eq('portfolio_id', portfolio.id).order('created_at', { ascending: false })

    res.json((trades || []).map((t: any) => ({
      id: t.id, type: t.action, symbol: t.symbol,
      shares: Number(t.shares), price: Number(t.price), total: Number(t.total), timestamp: t.created_at,
    })))
  } catch (err) {
    next(err)
  }
})

router.post('/reset', async (_req, res, next) => {
  try {
    const portfolio = await getOrCreatePortfolio()
    if (portfolio) {
      await Promise.all([
        supabase.from('holdings').delete().eq('portfolio_id', portfolio.id),
        supabase.from('trades').delete().eq('portfolio_id', portfolio.id),
      ])
      await supabase.from('portfolios').update({ cash: STARTING_CASH }).eq('id', portfolio.id)
    }
    res.json({ cashBalance: STARTING_CASH, holdings: [], transactions: [] })
  } catch (err) {
    next(err)
  }
})

export default router
