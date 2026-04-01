import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DateRangePreset, DateRange, DashboardTab } from '@/types/dashboard'

interface DashboardState {
  activeTab: DashboardTab
  dateRanges: Record<string, DateRangePreset>
  customRanges: Record<string, DateRange>

  setActiveTab: (tab: DashboardTab) => void
  setPreset: (chartId: string, preset: DateRangePreset) => void
  setCustomRange: (chartId: string, range: DateRange) => void
  getDateRange: (chartId: string) => { from: Date; to: Date }
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
      dateRanges: {},
      customRanges: {},

      setActiveTab: (tab) => set({ activeTab: tab }),

      setPreset: (chartId, preset) =>
        set((state) => ({
          dateRanges: { ...state.dateRanges, [chartId]: preset },
        })),

      setCustomRange: (chartId, range) =>
        set((state) => ({
          customRanges: { ...state.customRanges, [chartId]: range },
          dateRanges: { ...state.dateRanges, [chartId]: undefined as unknown as DateRangePreset },
        })),

      getDateRange: (chartId) => {
        const state = get()
        const preset = state.dateRanges[chartId]
        if (preset) return presetToDateRange(preset)

        const custom = state.customRanges[chartId]
        if (custom) {
          return {
            from: new Date(custom.from + 'T00:00:00'),
            to: new Date(custom.to + 'T23:59:59'),
          }
        }

        // Default: 3 months
        return presetToDateRange('3m')
      },
    }),
    {
      name: 'migraine-ai-dashboard',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeTab: state.activeTab,
        dateRanges: state.dateRanges,
        customRanges: state.customRanges,
      }),
    },
  ),
)
