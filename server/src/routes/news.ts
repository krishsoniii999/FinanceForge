import { Router } from 'express'
import * as finnhub from '../services/finnhub'

const router = Router()

router.get('/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params
    const news = await finnhub.getCompanyNews(symbol.toUpperCase())
    res.json(news)
  } catch (err) {
    next(err)
  }
})

router.get('/:symbol/ratings', async (req, res, next) => {
  try {
    const { symbol } = req.params
    const ratings = await finnhub.getRecommendations(symbol.toUpperCase())
    res.json(ratings)
  } catch (err) {
    next(err)
  }
})

export default router
