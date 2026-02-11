import { useEffect, useRef } from 'react'
import { createChart, ColorType, LineSeries } from 'lightweight-charts'
import { chartColors } from '../../styles/theme'

interface RSIChartProps {
  data: Array<{ time: string; value: number }>
  height?: number
}

export function RSIChart({ data, height = 120 }: RSIChartProps) {
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
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: { visible: false },
      crosshair: {
        vertLine: { color: chartColors.crosshair, width: 1 },
        horzLine: { color: chartColors.crosshair, width: 1 },
      },
    })

    const series = chart.addSeries(LineSeries, {
      color: '#8b5cf6',
      lineWidth: 2,
      priceFormat: { type: 'price', precision: 1, minMove: 0.1 },
    })

    series.setData(data.map((d) => ({ time: d.time as any, value: d.value })))

    // Overbought/oversold lines
    series.createPriceLine({ price: 70, color: 'rgba(239, 68, 68, 0.3)', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: '70' })
    series.createPriceLine({ price: 30, color: 'rgba(34, 197, 94, 0.3)', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: '30' })

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
        RSI (14)
      </div>
      <div ref={containerRef} style={{ height }} />
    </div>
  )
}
