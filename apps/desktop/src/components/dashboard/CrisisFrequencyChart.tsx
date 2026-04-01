import { useMemo } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { useCrisisStore } from '@/stores/crisisStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { nivoTheme } from '@/lib/nivoTheme'

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

function buildFrequencyData(
  crises: { date: string }[],
  from: Date,
  to: Date,
): { month: string; count: number }[] {
  const counts = new Map<string, number>()

  for (const c of crises) {
    const d = new Date(c.date + 'T00:00:00')
    if (d < from || d > to) continue

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, count]) => {
      const parts = key.split('-')
      const year = parts[0] ?? ''
      const monthIdx = parts[1] ?? '01'
      const label = `${MONTH_LABELS[parseInt(monthIdx, 10) - 1]} ${year.slice(2)}`
      return { month: label, count }
    })
}

export function CrisisFrequencyChart() {
  const crises = useCrisisStore((s) => s.crises)
  const getDateRange = useDashboardStore((s) => s.getDateRange)
  const { from, to } = getDateRange('frequency')

  const data = useMemo(() => buildFrequencyData(crises, from, to), [crises, from, to])

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-(--radius-lg) bg-(--color-bg-elevated)">
        <p className="text-sm text-(--color-text-muted)">Aucune donnée sur cette période</p>
      </div>
    )
  }

  return (
    <div className="h-64 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
      <ResponsiveBar
        data={data}
        keys={['count']}
        indexBy="month"
        margin={{ top: 10, right: 20, bottom: 40, left: 40 }}
        padding={0.3}
        colors={['var(--color-brand)']}
        borderRadius={4}
        axisBottom={{
          tickRotation: data.length > 6 ? -45 : 0,
        }}
        axisLeft={{
          tickValues: 5,
        }}
        theme={nivoTheme}
        enableLabel={false}
        tooltip={({ indexValue, value }) => (
          <div
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 13,
            }}
          >
            <strong>{indexValue}</strong> : {value} crise{value > 1 ? 's' : ''}
          </div>
        )}
      />
    </div>
  )
}
