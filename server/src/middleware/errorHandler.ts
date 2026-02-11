import type { Request, Response, NextFunction } from 'express'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(`[Error] ${err.message}`)

  if (err.message.includes('No data found') || err.message.includes('Not Found')) {
    res.status(404).json({ error: 'Symbol not found' })
    return
  }

  res.status(500).json({ error: 'Internal server error' })
}
