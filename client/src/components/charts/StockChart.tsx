import { useEffect, useRef, useCallback } from 'react'
import { createChart, type IChartApi, ColorType, CandlestickSeries, AreaSeries, LineSeries } from 'lightweight-charts'
import type { ChartDataPoint, IndicatorData } from '../../hooks/useStockChart'
import { chartColors } from '../../styles/theme'
import { INDICATOR_DEFINITIONS } from '../../lib/constants'

interface StockChartProps {
  data: ChartDataPoint[]
  indicators?: IndicatorData
  activeIndicators?: string[]
  type?: 'area' | 'candlestick'
  height?: number
}

export function StockChart({ data, indicators, activeIndicators = [], type = 'area', height = 400 }: StockChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  const initChart = useCallback(() => {
    if (!containerRef.current || !data?.length) return

    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
    }

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: chartColors.grid },
        horzLines: { color: chartColors.grid },
      },
      crosshair: {
        vertLine: { color: chartColors.crosshair, width: 1, style: 0, labelVisible: true },
        horzLine: { color: chartColors.crosshair, width: 1, style: 0, labelVisible: true },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.06)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.06)',
        timeVisible: true,
      },
      handleScroll: { vertTouchDrag: false },
    })

    chartRef.current = chart

    if (type === 'candlestick') {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: chartColors.upColor,
        downColor: chartColors.downColor,
        borderDownColor: chartColors.downColor,
        borderUpColor: chartColors.upColor,
        wickDownColor: chartColors.downColor,
        wickUpColor: chartColors.upColor,
      })
      series.setData(
        data.map((d) => ({
          time: d.time as any,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
      )
    } else {
      const series = chart.addSeries(AreaSeries, {
        lineColor: chartColors.line,
        topColor: chartColors.areaTop,
        bottomColor: chartColors.areaBottom,
        lineWidth: 2,
      })
      series.setData(
        data.map((d) => ({
          time: d.time as any,
          value: d.close,
        }))
      )
    }

    // Overlay indicators
    if (indicators) {
      const overlayKeys = ['sma20', 'sma50', 'sma200', 'ema20'] as const
      for (const key of overlayKeys) {
        if (activeIndicators.includes(key) && indicators[key]) {
          const def = INDICATOR_DEFINITIONS.find((d) => d.id === key)
          const lineSeries = chart.addSeries(LineSeries, {
            color: def?.color || '#888',
            lineWidth: 2,
            priceLineVisible: false,
            lastValueVisible: false,
          })
          lineSeries.setData(
            (indicators[key] as Array<{ time: string; value: number }>).map((d) => ({
              time: d.time as any,
              value: d.value,
            }))
          )
        }
      }

      // Bollinger Bands
      if (activeIndicators.includes('bollinger') && indicators.bollinger) {
        const bollingerColor = INDICATOR_DEFINITIONS.find((d) => d.id === 'bollinger')?.color || '#6366f1'
        const upperSeries = chart.addSeries(LineSeries, {
          color: bollingerColor,
          lineWidth: 1,
          lineStyle: 2,
          priceLineVisible: false,
          lastValueVisible: false,
        })
        const middleSeries = chart.addSeries(LineSeries, {
          color: bollingerColor,
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        })
        const lowerSeries = chart.addSeries(LineSeries, {
          color: bollingerColor,
          lineWidth: 1,
          lineStyle: 2,
          priceLineVisible: false,
          lastValueVisible: false,
        })

        upperSeries.setData(indicators.bollinger.map((d) => ({ time: d.time as any, value: d.upper })))
        middleSeries.setData(indicators.bollinger.map((d) => ({ time: d.time as any, value: d.middle })))
        lowerSeries.setData(indicators.bollinger.map((d) => ({ time: d.time as any, value: d.lower })))
      }
    }

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
  }, [data, indicators, activeIndicators, type, height])

  useEffect(() => {
    const cleanup = initChart()
    return cleanup
  }, [initChart])

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{ height }}
    />
  )
}
