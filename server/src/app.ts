import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { config } from './config'
import { errorHandler } from './middleware/errorHandler'
import marketRoutes from './routes/market'
import portfolioRoutes from './routes/portfolio'
import watchlistRoutes from './routes/watchlist'
import lessonRoutes from './routes/lessons'
import newsRoutes from './routes/news'
import aiRoutes from './routes/ai'

const app = express()

// Middleware
app.use(helmet())
app.use(cors({ origin: config.cors.origin }))
app.use(express.json())

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
})
app.use('/api', apiLimiter)

// Routes
app.use('/api/market', marketRoutes)
app.use('/api/portfolio', portfolioRoutes)
app.use('/api/watchlist', watchlistRoutes)
app.use('/api/lessons', lessonRoutes)
app.use('/api/news', newsRoutes)
app.use('/api/ai', aiRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handler
app.use(errorHandler)

export default app
