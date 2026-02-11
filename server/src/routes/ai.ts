import { Router } from 'express'
import { isAvailable, streamChat } from '../services/claude'
import * as market from '../services/finnhub'

const router = Router()

router.get('/health', async (_req, res) => {
  res.json({
    available: isAvailable(),
    model: 'claude-sonnet-4-5',
  })
})

router.post('/chat', async (req, res) => {
  const { message, history = [], context = {} } = req.body

  if (!message) {
    res.status(400).json({ error: 'Message is required' })
    return
  }

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  // Build system prompt with context
  let systemContent = `You are FinanceForge AI, a financial research assistant for a paper trading education platform. You help users understand stocks, analyze companies, and make informed investment decisions.

Be concise but thorough. Use data to support your analysis. If you don't know something, say so honestly. Speak at a level appropriate for someone learning about investing. Use plain language, not jargon.

Format your responses with markdown when helpful (bold for emphasis, bullet points for lists, etc).`

  // Inject stock context if available
  if (context.symbol) {
    try {
      const quote = await market.getQuote(context.symbol).catch(() => null)

      if (quote) {
        systemContent += `\n\nThe user is currently viewing ${context.symbol}:
- Name: ${quote.name}
- Price: $${quote.price?.toFixed(2)} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent?.toFixed(2)}% today)
- Market Cap: $${(quote.marketCap / 1e9).toFixed(1)}B
- Day Range: $${quote.dayLow?.toFixed(2)} - $${quote.dayHigh?.toFixed(2)}`
      }
    } catch {
      // Context injection failed, continue without it
    }
  }

  // Inject portfolio context
  if (context.portfolio) {
    const { cashBalance, holdings } = context.portfolio
    if (holdings?.length > 0) {
      systemContent += `\n\nThe user's paper trading portfolio:
- Cash: $${cashBalance?.toLocaleString()}
- Holdings: ${holdings.map((h: any) => `${h.symbol} (${h.shares} shares @ $${h.avgCostBasis?.toFixed(2)})`).join(', ')}`
    }
  }

  // Build message array (user/assistant only for Claude)
  const messages = [
    ...history.slice(-8).map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content?.slice(0, 500) || '',
    })),
    { role: 'user' as const, content: message },
  ]

  // Stream response
  try {
    for await (const chunk of streamChat(systemContent, messages)) {
      if (chunk.error) {
        res.write(`event: error\ndata: ${JSON.stringify(chunk)}\n\n`)
        break
      }
      if (chunk.content) {
        res.write(`event: chunk\ndata: ${JSON.stringify({ content: chunk.content })}\n\n`)
      }
      if (chunk.done) {
        res.write(`event: done\ndata: ${JSON.stringify({ done: true })}\n\n`)
      }
    }
  } catch (err) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: 'stream_error' })}\n\n`)
  }

  res.end()
})

export default router
