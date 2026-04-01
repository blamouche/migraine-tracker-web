import { useDashboardStore } from '@/stores/dashboardStore'
import type { DateRangePreset } from '@/types/dashboard'

const PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: '7d', label: '7j' },
  { value: '1m', label: '1 mois' },
  { value: '3m', label: '3 mois' },
  { value: '6m', label: '6 mois' },
  { value: '1y', label: '1 an' },
  { value: 'all', label: 'Tout' },
]

interface DateRangeSelectorProps {
  chartId: string
}

export function DateRangeSelector({ chartId }: DateRangeSelectorProps) {
  const { dateRanges, setPreset } = useDashboardStore()
  const current = dateRanges[chartId] ?? '3m'

  return (
    <div className="flex gap-1">
      {PRESETS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setPreset(chartId, value)}
          className={`rounded-(--radius-md) px-3 py-1 text-xs font-medium transition-colors ${
            current === value
              ? 'bg-(--color-brand) text-(--color-text-inverse)'
              : 'bg-(--color-bg-subtle) text-(--color-text-secondary) hover:bg-(--color-bg-interactive)'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
