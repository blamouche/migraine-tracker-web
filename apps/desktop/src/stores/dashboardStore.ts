import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DateRangePreset, DateRange, DashboardTab } from '@/types/dashboard'

interface DashboardState {
  activeTab: DashboardTab
  globalPreset: DateRangePreset | null
  globalCustomRange: DateRange | null

  setActiveTab: (tab: DashboardTab) => void
  setPreset: (preset: DateRangePreset) => void
  setCustomRange: (range: DateRange) => void
  getDateRange: () => { from: Date; to: Date }
}

function presetToDateRange(preset: DateRangePreset): { from: Date; to: Date } {
  const to = new Date()
  const from = new Date()

  switch (preset) {
    case '7d':
      from.setDate(to.getDate() - 7)
      break
    case '1m':
      from.setMonth(to.getMonth() - 1)
      break
    case '3m':
      from.setMonth(to.getMonth() - 3)
      break
    case '6m':
      from.setMonth(to.getMonth() - 6)
      break
    case '1y':
      from.setFullYear(to.getFullYear() - 1)
      break
    case 'ytd':
      from.setMonth(0, 1)
      from.setHours(0, 0, 0, 0)
      to.setMonth(11, 31)
      to.setHours(23, 59, 59, 999)
      break
    case 'all':
      from.setFullYear(2020, 0, 1)
      break
  }

  return { from, to }
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      activeTab: 'crises',
      globalPreset: '3m',
      globalCustomRange: null,

      setActiveTab: (tab) => set({ activeTab: tab }),

      setPreset: (preset) =>
        set({ globalPreset: preset, globalCustomRange: null }),

      setCustomRange: (range) =>
        set({ globalCustomRange: range, globalPreset: null }),

      getDateRange: () => {
        const state = get()
        if (state.globalPreset) return presetToDateRange(state.globalPreset)

        if (state.globalCustomRange) {
          return {
            from: new Date(state.globalCustomRange.from + 'T00:00:00'),
            to: new Date(state.globalCustomRange.to + 'T23:59:59'),
          }
        }

        return presetToDateRange('3m')
      },
    }),
    {
      name: 'migraine-ai-dashboard',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeTab: state.activeTab,
        globalPreset: state.globalPreset,
        globalCustomRange: state.globalCustomRange,
      }),
    },
  ),
)
