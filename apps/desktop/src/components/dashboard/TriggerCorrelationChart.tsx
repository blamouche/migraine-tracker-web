import { useMemo } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { useCrisisStore } from '@/stores/crisisStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { nivoTheme } from '@/lib/nivoTheme'

interface TriggerStat {
  trigger: string
  avgIntensity: number
  count: number
  [key: string]: string | number
}

function buildCorrelationData(
  crises: { date: string; triggers: string[]; intensity: number }[],
  from: Date,
  to: Date,
): TriggerStat[] {
  const acc = new Map<string, { sum: number; count: number }>()

  for (const c of crises) {
    const d = new Date(c.date + 'T00:00:00')
    if (d < from || d > to) continue

    for (const t of c.triggers) {
      const prev = acc.get(t) ?? { sum: 0, count: 0 }
      prev.sum += c.intensity
      prev.count += 1
      acc.set(t, prev)
    }
  }

  return [...acc.entries()]
    .filter(([, v]) => v.count >= 2)
    .map(([trigger, v]) => ({
      trigger,
      avgIntensity: Math.round((v.sum / v.count) * 10) / 10,
      count: v.count,
    }))
    .sort((a, b) => b.avgIntensity - a.avgIntensity)
    .slice(0, 10)
}

export function TriggerCorrelationChart() {
  const crises = useCrisisStore((s) => s.crises)
  const getDateRange = useDashboardStore((s) => s.getDateRange)
  const { from, to } = getDateRange()

  const data = useMemo(() => buildCorrelationData(crises, from, to), [crises, from, to])

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-(--radius-lg) bg-(--color-bg-elevated)">
        <p className="text-sm text-(--color-text-muted)">
          Pas assez de données pour les corrélations (min. 2 crises par déclencheur)
        </p>
      </div>
    )
  }

  return (
    <div className="h-64 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
      <ResponsiveBar
        data={data}
        keys={['avgIntensity']}
        indexBy="trigger"
        layout="horizontal"
        margin={{ top: 10, right: 20, bottom: 30, left: 130 }}
        padding={0.3}
        colors={['var(--color-danger)']}
        borderRadius={4}
        theme={nivoTheme}
        enableLabel
        label={(d) => `${d.value}/10`}
        labelTextColor="var(--color-text-inverse)"
        tooltip={({ indexValue, data: row }) => (
          <div
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 13,
            }}
          >
            <strong>{indexValue}</strong>
            <br />
            Intensité moy. : {(row as unknown as TriggerStat).avgIntensity}/10
            <br />
            Sur {(row as unknown as TriggerStat).count} crise{(row as unknown as TriggerStat).count > 1 ? 's' : ''}
          </div>
        )}
      />
    </div>
  )
}
