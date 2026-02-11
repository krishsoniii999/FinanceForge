import { Router } from 'express'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()
const DATA_DIR = path.join(__dirname, '..', 'data')
const WATCHLIST_FILE = path.join(DATA_DIR, 'watchlist.json')

const DEFAULT_WATCHLIST = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'SPY']

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function loadWatchlist(): string[] {
  ensureDataDir()
  if (!fs.existsSync(WATCHLIST_FILE)) {
    fs.writeFileSync(WATCHLIST_FILE, JSON.stringify(DEFAULT_WATCHLIST, null, 2))
    return DEFAULT_WATCHLIST
  }
  return JSON.parse(fs.readFileSync(WATCHLIST_FILE, 'utf-8'))
}

function saveWatchlist(symbols: string[]) {
  ensureDataDir()
  fs.writeFileSync(WATCHLIST_FILE, JSON.stringify(symbols, null, 2))
}

router.get('/', (_req, res) => {
  res.json(loadWatchlist())
})

router.post('/', (req, res) => {
  const { symbol } = req.body
  if (!symbol) {
    res.status(400).json({ error: 'Symbol required' })
    return
  }
  const watchlist = loadWatchlist()
  const upper = symbol.toUpperCase()
  if (!watchlist.includes(upper)) {
    watchlist.push(upper)
    saveWatchlist(watchlist)
  }
  res.json(watchlist)
})

router.delete('/:symbol', (req, res) => {
  const { symbol } = req.params
  let watchlist = loadWatchlist()
  watchlist = watchlist.filter((s) => s !== symbol.toUpperCase())
  saveWatchlist(watchlist)
  res.json(watchlist)
})

router.put('/reorder', (req, res) => {
  const { symbols } = req.body
  if (!Array.isArray(symbols)) {
    res.status(400).json({ error: 'Symbols array required' })
    return
  }
  saveWatchlist(symbols)
  res.json(symbols)
})

export default router
