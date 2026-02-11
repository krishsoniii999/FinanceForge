import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ChartSettingsState {
  activeIndicators: string[]
  toggleIndicator: (id: string) => void
  setIndicators: (indicators: string[]) => void
}

export const useChartSettingsStore = create<ChartSettingsState>()(
  persist(
    (set) => ({
      activeIndicators: [],
      toggleIndicator: (id) =>
        set((state) => ({
          activeIndicators: state.activeIndicators.includes(id)
            ? state.activeIndicators.filter((i) => i !== id)
            : [...state.activeIndicators, id],
        })),
      setIndicators: (indicators) => set({ activeIndicators: indicators }),
    }),
    { name: 'financeforge-chart-settings' }
  )
)
