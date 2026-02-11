import { Router } from 'express'
import * as finnhub from '../services/finnhub'
import { calculateIndicators } from '../services/indicators'

const router = Router()

router.get('/quote/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params
    const quote = await finnhub.getQuote(symbol.toUpperCase())
    res.json(quote)
  } catch (err) {
    next(err)
  }
})

router.get('/quotes', async (req, res, next) => {
  try {
    const symbols = (req.query.symbols as string || '').split(',').filter(Boolean)
    if (symbols.length === 0) {
      res.status(400).json({ error: 'No symbols provided' })
      return
    }
    const quotes = await finnhub.getQuotes(symbols.map((s) => s.toUpperCase()))
    res.json(quotes)
  } catch (err) {
    next(err)
  }
})

router.get('/chart/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params
    const range = (req.query.range as string) || '1M'
    const interval = (req.query.interval as string) || '1d'
    const candles = await finnhub.getChart(symbol.toUpperCase(), range, interval)
    const indicatorParam = (req.query.indicators as string) || ''
    const requestedIndicators = indicatorParam.split(',').filter(Boolean)

    if (requestedIndicators.length > 0) {
      const indicators = calculateIndicators(candles, requestedIndicators)
      res.json({ candles, indicators })
    } else {
      res.json(candles)
    }
  } catch (err) {
    next(err)
  }
})

router.get('/search', async (req, res, next) => {
  try {
    const query = (req.query.q as string) || ''
    if (!query) {
      res.json([])
      return
    }
    const results = await finnhub.searchSymbols(query)
    res.json(results)
  } catch (err) {
    next(err)
  }
})

router.get('/trending', async (_req, res, next) => {
  try {
    // Return a curated list since Finnhub free doesn't have trending
    const trendingSymbols = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META', 'SPY']
    const quotes = await finnhub.getQuotes(trendingSymbols)
    res.json(quotes)
  } catch (err) {
    next(err)
  }
})

export default router
