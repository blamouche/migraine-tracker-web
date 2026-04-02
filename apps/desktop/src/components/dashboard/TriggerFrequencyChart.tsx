import { useMemo } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { useCrisisStore } from '@/stores/crisisStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { nivoTheme } from '@/lib/nivoTheme'

function buildTriggerData(
  crises: { date: string; triggers: string[] }[],
  from: Date,
  to: Date,
): { trigger: string; count: number }[] {
  const counts = new Map<string, number>()

  for (const c of crises) {
    const d = new Date(c.date + 'T00:00:00')
    if (d < from || d > to) continue

    for (const t of c.triggers) {
      counts.set(t, (counts.get(t) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([trigger, count]) => ({ trigger, count }))
}

export function TriggerFrequencyChart() {
  const crises = useCrisisStore((s) => s.crises)
  const getDateRange = useDashboardStore((s) => s.getDateRange)
  const { from, to } = getDateRange()

  const data = useMemo(() => buildTriggerData(crises, from, to), [crises, from, to])

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-(--radius-lg) bg-(--color-bg-elevated)">
        <p className="text-sm text-(--color-text-muted)">Aucun déclencheur enregistré sur cette période</p>
      </div>
    )
  }

  return (
    <div className="h-64 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
      <ResponsiveBar
        data={data}
        keys={['count']}
        indexBy="trigger"
        layout="horizontal"
        margin={{ top: 10, right: 20, bottom: 30, left: 130 }}
        padding={0.3}
        colors={['var(--color-warning)']}
        borderRadius={4}
        theme={nivoTheme}
        enableLabel
        labelTextColor="var(--color-text-inverse)"
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
