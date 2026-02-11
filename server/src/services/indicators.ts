interface OHLCV {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface TimeValue {
  time: string
  value: number
}

export function calculateSMA(data: OHLCV[], period: number): TimeValue[] {
  const result: TimeValue[] = []
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close
    }
    result.push({ time: data[i].time, value: sum / period })
  }
  return result
}

export function calculateEMA(data: OHLCV[], period: number): TimeValue[] {
  if (data.length < period) return []
  const multiplier = 2 / (period + 1)
  const result: TimeValue[] = []

  let ema = 0
  for (let i = 0; i < period; i++) {
    ema += data[i].close
  }
  ema /= period
  result.push({ time: data[period - 1].time, value: ema })

  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema
    result.push({ time: data[i].time, value: ema })
  }
  return result
}

export function calculateRSI(data: OHLCV[], period: number = 14): TimeValue[] {
  if (data.length < period + 1) return []
  const result: TimeValue[] = []
  const changes: number[] = []

  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i - 1].close)
  }

  let avgGain = 0
  let avgLoss = 0

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) avgGain += changes[i]
    else avgLoss += Math.abs(changes[i])
  }
  avgGain /= period
  avgLoss /= period

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
  result.push({ time: data[period].time, value: 100 - 100 / (1 + rs) })

  for (let i = period; i < changes.length; i++) {
    const gain = changes[i] > 0 ? changes[i] : 0
    const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0

    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period

    const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
    result.push({ time: data[i + 1].time, value: rsi })
  }
  return result
}

interface MACDPoint {
  time: string
  macd: number
  signal: number
  histogram: number
}

export function calculateMACD(
  data: OHLCV[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDPoint[] {
  const fastEMA = calculateEMA(data, fastPeriod)
  const slowEMA = calculateEMA(data, slowPeriod)

  if (fastEMA.length === 0 || slowEMA.length === 0) return []

  // Build time-indexed maps
  const slowMap = new Map(slowEMA.map((d) => [d.time, d.value]))

  // MACD = fast EMA - slow EMA (aligned by time)
  const macdLine: TimeValue[] = []
  for (const fast of fastEMA) {
    const slow = slowMap.get(fast.time)
    if (slow !== undefined) {
      macdLine.push({ time: fast.time, value: fast.value - slow })
    }
  }

  if (macdLine.length < signalPeriod) return []

  // Signal = EMA of MACD line
  const signalMultiplier = 2 / (signalPeriod + 1)
  let signalEma = 0
  for (let i = 0; i < signalPeriod; i++) {
    signalEma += macdLine[i].value
  }
  signalEma /= signalPeriod

  const result: MACDPoint[] = []
  result.push({
    time: macdLine[signalPeriod - 1].time,
    macd: macdLine[signalPeriod - 1].value,
    signal: signalEma,
    histogram: macdLine[signalPeriod - 1].value - signalEma,
  })

  for (let i = signalPeriod; i < macdLine.length; i++) {
    signalEma =
      (macdLine[i].value - signalEma) * signalMultiplier + signalEma
    result.push({
      time: macdLine[i].time,
      macd: macdLine[i].value,
      signal: signalEma,
      histogram: macdLine[i].value - signalEma,
    })
  }
  return result
}

interface BollingerPoint {
  time: string
  upper: number
  middle: number
  lower: number
}

export function calculateBollingerBands(
  data: OHLCV[],
  period: number = 20,
  stdDevMultiplier: number = 2
): BollingerPoint[] {
  if (data.length < period) return []
  const result: BollingerPoint[] = []

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close
    }
    const middle = sum / period

    let variance = 0
    for (let j = i - period + 1; j <= i; j++) {
      variance += (data[j].close - middle) ** 2
    }
    const stdDev = Math.sqrt(variance / period)

    result.push({
      time: data[i].time,
      upper: middle + stdDevMultiplier * stdDev,
      middle,
      lower: middle - stdDevMultiplier * stdDev,
    })
  }
  return result
}

export function formatVolume(
  data: OHLCV[]
): Array<{ time: string; value: number; color: string }> {
  return data.map((d, i) => ({
    time: d.time,
    value: d.volume,
    color:
      i > 0 && d.close >= data[i - 1].close ? '#22c55e80' : '#ef444480',
  }))
}

export function calculateIndicators(
  data: OHLCV[],
  requested: string[]
): Record<string, any> {
  const result: Record<string, any> = {}

  for (const id of requested) {
    switch (id) {
      case 'sma20':
        result.sma20 = calculateSMA(data, 20)
        break
      case 'sma50':
        result.sma50 = calculateSMA(data, 50)
        break
      case 'sma200':
        result.sma200 = calculateSMA(data, 200)
        break
      case 'ema20':
        result.ema20 = calculateEMA(data, 20)
        break
      case 'rsi':
        result.rsi = calculateRSI(data, 14)
        break
      case 'macd':
        result.macd = calculateMACD(data)
        break
      case 'bollinger':
        result.bollinger = calculateBollingerBands(data, 20, 2)
        break
      case 'volume':
        result.volume = formatVolume(data)
        break
    }
  }

  return result
}
