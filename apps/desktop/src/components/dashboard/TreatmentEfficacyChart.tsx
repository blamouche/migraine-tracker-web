import { useMemo } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { useCrisisStore } from '@/stores/crisisStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { nivoTheme } from '@/lib/nivoTheme'

function buildTreatmentData(
  crises: { date: string; treatments: string[]; intensity: number }[],
  from: Date,
  to: Date,
): { treatment: string; utilisations: number }[] {
  const counts = new Map<string, number>()

  for (const c of crises) {
    const d = new Date(c.date + 'T00:00:00')
    if (d < from || d > to) continue

    for (const t of c.treatments) {
      counts.set(t, (counts.get(t) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([treatment, utilisations]) => ({ treatment, utilisations }))
}

export function TreatmentEfficacyChart() {
  const crises = useCrisisStore((s) => s.crises)
  const getDateRange = useDashboardStore((s) => s.getDateRange)
  const { from, to } = getDateRange('treatments')

  const data = useMemo(() => buildTreatmentData(crises, from, to), [crises, from, to])

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-(--radius-lg) bg-(--color-bg-elevated)">
        <p className="text-sm text-(--color-text-muted)">Aucune donnée de traitement sur cette période</p>
      </div>
    )
  }

  return (
    <div className="h-64 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
      <ResponsiveBar
        data={data}
        keys={['utilisations']}
        indexBy="treatment"
        layout="horizontal"
        margin={{ top: 10, right: 20, bottom: 30, left: 120 }}
        padding={0.3}
        colors={['var(--color-brand)']}
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
            <strong>{indexValue}</strong> : {value} utilisation{value > 1 ? 's' : ''}
          </div>
        )}
      />
    </div>
  )
}
