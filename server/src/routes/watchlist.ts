import { Router } from 'express'
import { supabase } from '../services/supabase'

const router = Router()
const USER_ID = 'default'

router.get('/', async (_req, res, next) => {
  try {
    const { data } = await supabase
      .from('watchlist').select('symbol').eq('user_id', USER_ID).order('added_at', { ascending: true })
    res.json((data || []).map((r: any) => r.symbol))
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { symbol } = req.body
    if (!symbol) { res.status(400).json({ error: 'Symbol required' }); return }

    await supabase.from('watchlist').upsert(
      { user_id: USER_ID, symbol: symbol.toUpperCase(), added_at: new Date().toISOString() },
      { onConflict: 'user_id,symbol' }
    )

    const { data } = await supabase
      .from('watchlist').select('symbol').eq('user_id', USER_ID).order('added_at', { ascending: true })
    res.json((data || []).map((r: any) => r.symbol))
  } catch (err) {
    next(err)
  }
})

router.delete('/:symbol', async (req, res, next) => {
  try {
    await supabase.from('watchlist').delete().eq('user_id', USER_ID).eq('symbol', req.params.symbol.toUpperCase())

    const { data } = await supabase
      .from('watchlist').select('symbol').eq('user_id', USER_ID).order('added_at', { ascending: true })
    res.json((data || []).map((r: any) => r.symbol))
  } catch (err) {
    next(err)
  }
})

router.put('/reorder', async (req, res, next) => {
  try {
    const { symbols } = req.body
    if (!Array.isArray(symbols)) { res.status(400).json({ error: 'Symbols array required' }); return }

    await supabase.from('watchlist').delete().eq('user_id', USER_ID)

    if (symbols.length > 0) {
      await supabase.from('watchlist').insert(
        symbols.map((s: string, i: number) => ({
          user_id: USER_ID,
          symbol: s.toUpperCase(),
          added_at: new Date(Date.now() + i).toISOString(),
        }))
      )
    }
    res.json(symbols)
  } catch (err) {
    next(err)
  }
})

export default router
