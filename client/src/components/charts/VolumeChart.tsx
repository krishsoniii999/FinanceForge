import { useEffect, useRef } from 'react'
import { createChart, ColorType, HistogramSeries } from 'lightweight-charts'
import { chartColors } from '../../styles/theme'

interface VolumeDataPoint {
  time: string
  value: number
  color: string
}

interface VolumeChartProps {
  data: VolumeDataPoint[]
  height?: number
}

export function VolumeChart({ data, height = 100 }: VolumeChartProps) {
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

    const series = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
    })

    series.setData(
      data.map((d) => ({
        time: d.time as any,
        value: d.value,
        color: d.color,
      }))
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
        Volume
      </div>
      <div ref={containerRef} style={{ height }} />
    </div>
  )
}
