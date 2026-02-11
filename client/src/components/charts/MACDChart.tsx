import { useEffect, useRef } from 'react'
import { createChart, ColorType, HistogramSeries, LineSeries } from 'lightweight-charts'
import { chartColors } from '../../styles/theme'

interface MACDDataPoint {
  time: string
  macd: number
  signal: number
  histogram: number
}

interface MACDChartProps {
  data: MACDDataPoint[]
  height?: number
}

export function MACDChart({ data, height = 120 }: MACDChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !data.length) return

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
        fontSize: 10,
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: chartColors.grid },
        horzLines: { color: chartColors.grid },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.06)',
      },
      timeScale: { visible: false },
      crosshair: {
        vertLine: { color: chartColors.crosshair, width: 1 },
        horzLine: { color: chartColors.crosshair, width: 1 },
      },
    })

    // Histogram
    const histogramSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
    })
    histogramSeries.setData(
      data.map((d) => ({
        time: d.time as any,
        value: d.histogram,
        color: d.histogram >= 0 ? '#22c55e80' : '#ef444480',
      }))
    )

    // MACD line
    const macdSeries = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
    })
    macdSeries.setData(
      data.map((d) => ({ time: d.time as any, value: d.macd }))
    )

    // Signal line
    const signalSeries = chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 1,
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
    })
    signalSeries.setData(
      data.map((d) => ({ time: d.time as any, value: d.signal }))
    )

    chart.timeScale().fitContent()

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width })
      }
    })
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
    }
  }, [data, height])

  return (
    <div>
      <div className="px-4 py-1 text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
        MACD (12, 26, 9)
      </div>
      <div ref={containerRef} style={{ height }} />
    </div>
  )
}
