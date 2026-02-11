import { useMemo } from 'react'

interface MiniChartProps {
  positive?: boolean
  data?: number[]
}

function generateRandomData(length: number): number[] {
  const data: number[] = []
  let value = 50 + Math.random() * 20
  for (let i = 0; i < length; i++) {
    value += (Math.random() - 0.48) * 3
    data.push(value)
  }
  return data
}

export function MiniChart({ positive = true, data }: MiniChartProps) {
  const chartData = useMemo(() => data || generateRandomData(30), [data])

  const min = Math.min(...chartData)
  const max = Math.max(...chartData)
  const range = max - min || 1

  const width = 120
  const height = 40
  const padding = 2

  const points = chartData.map((value, index) => {
    const x = padding + (index / (chartData.length - 1)) * (width - padding * 2)
    const y =
      height -
      padding -
      ((value - min) / range) * (height - padding * 2)
    return `${x},${y}`
  })

  const linePath = `M ${points.join(' L ')}`

  // Area path (line + close at bottom)
  const areaPath = `${linePath} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`

  const color = positive ? '#22c55e' : '#ef4444'
  const gradientId = `mini-gradient-${positive ? 'green' : 'red'}-${Math.random().toString(36).slice(2, 6)}`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}
