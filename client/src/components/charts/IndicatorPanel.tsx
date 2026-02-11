import { cn } from '../../lib/utils'
import { useChartSettingsStore } from '../../stores/useChartSettingsStore'
import { INDICATOR_DEFINITIONS } from '../../lib/constants'

export function IndicatorPanel() {
  const { activeIndicators, toggleIndicator } = useChartSettingsStore()

  const overlays = INDICATOR_DEFINITIONS.filter((d) => d.type === 'overlay')
  const subcharts = INDICATOR_DEFINITIONS.filter((d) => d.type === 'subchart')

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {[...overlays, ...subcharts].map((indicator) => {
        const active = activeIndicators.includes(indicator.id)
        return (
          <button
            key={indicator.id}
            onClick={() => toggleIndicator(indicator.id)}
            className={cn(
              'px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 border',
              active
                ? 'border-accent-blue/30 bg-accent-blue/15 text-accent-blue'
                : 'border-white/[0.06] bg-white/[0.03] text-text-tertiary hover:text-text-secondary hover:bg-white/[0.05]'
            )}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
              style={{ backgroundColor: active ? indicator.color : 'rgba(255,255,255,0.15)' }}
            />
            {indicator.label}
          </button>
        )
      })}
    </div>
  )
}
