import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
import * as finnhub from '../services/finnhub'

const router = Router()
const DATA_DIR = path.join(__dirname, '..', 'data')
const PORTFOLIO_FILE = path.join(DATA_DIR, 'portfolio.json')

const STARTING_CASH = 100_000

interface Holding {
  symbol: string
  shares: number
  avgCostBasis: number
  purchaseDate: string
}

interface Transaction {
  id: string
  type: 'buy' | 'sell'
  symbol: string
  shares: number
  price: number
  total: number
  timestamp: string
}

interface PortfolioData {
  cashBalance: number
  holdings: Holding[]
  transactions: Transaction[]
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function loadPortfolio(): PortfolioData {
  ensureDataDir()
  if (!fs.existsSync(PORTFOLIO_FILE)) {
    const initial: PortfolioData = {
      cashBalance: STARTING_CASH,
      holdings: [],
      transactions: [],
    }
    fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(initial, null, 2))
    return initial
  }
  return JSON.parse(fs.readFileSync(PORTFOLIO_FILE, 'utf-8'))
}

function savePortfolio(data: PortfolioData) {
  ensureDataDir()
  fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(data, null, 2))
}

router.get('/', (_req, res) => {
  const portfolio = loadPortfolio()
  res.json(portfolio)
})

router.post('/trade', async (req, res, next) => {
  try {
    const { symbol, action, shares } = req.body

    if (!symbol || !action || !shares || shares <= 0) {
      res.status(400).json({ error: 'Invalid trade parameters' })
      return
    }

    if (action !== 'buy' && action !== 'sell') {
      res.status(400).json({ error: 'Action must be "buy" or "sell"' })
      return
    }

    // Get current price
    const quote = await finnhub.getQuote(symbol.toUpperCase())
    const price = quote.price
    const total = price * shares

    const portfolio = loadPortfolio()

    if (action === 'buy') {
      if (total > portfolio.cashBalance) {
        res.status(400).json({
          error: `Insufficient funds. Need ${total.toFixed(2)} but have ${portfolio.cashBalance.toFixed(2)}`,
        })
        return
      }

      portfolio.cashBalance -= total

      const existing = portfolio.holdings.find(
        (h) => h.symbol === symbol.toUpperCase()
      )
      if (existing) {
        const totalShares = existing.shares + shares
        existing.avgCostBasis =
          (existing.avgCostBasis * existing.shares + price * shares) /
          totalShares
        existing.shares = totalShares
      } else {
        portfolio.holdings.push({
          symbol: symbol.toUpperCase(),
          shares,
          avgCostBasis: price,
          purchaseDate: new Date().toISOString(),
        })
      }
    } else {
      // Sell
      const existing = portfolio.holdings.find(
        (h) => h.symbol === symbol.toUpperCase()
      )
      if (!existing || existing.shares < shares) {
        res.status(400).json({
          error: `Insufficient shares. Have ${existing?.shares || 0} but trying to sell ${shares}`,
        })
        return
      }

      portfolio.cashBalance += total
      existing.shares -= shares

      if (existing.shares === 0) {
        portfolio.holdings = portfolio.holdings.filter(
          (h) => h.symbol !== symbol.toUpperCase()
        )
      }
    }

    const transaction: Transaction = {
      id: uuidv4(),
      type: action,
      symbol: symbol.toUpperCase(),
      shares,
      price,
      total,
      timestamp: new Date().toISOString(),
    }

    portfolio.transactions.unshift(transaction)
    savePortfolio(portfolio)

    res.json({ trade: transaction, portfolio })
  } catch (err) {
    next(err)
  }
})

router.get('/history', (_req, res) => {
  const portfolio = loadPortfolio()
  res.json(portfolio.transactions)
})

router.post('/reset', (_req, res) => {
  const portfolio: PortfolioData = {
    cashBalance: STARTING_CASH,
    holdings: [],
    transactions: [],
  }
  savePortfolio(portfolio)
  res.json(portfolio)
})

export default router
