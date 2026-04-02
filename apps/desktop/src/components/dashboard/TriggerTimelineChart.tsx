import { useMemo } from 'react'
import { ResponsiveLine } from '@nivo/line'
import { useCrisisStore } from '@/stores/crisisStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { nivoTheme } from '@/lib/nivoTheme'

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

const SERIE_COLORS = [
  'var(--color-warning)',
  'var(--color-danger)',
  'var(--color-brand)',
  'var(--color-success)',
  '#a78bfa', // violet
]

interface MonthPoint {
  x: string
  y: number
}

function buildTimelineData(
  crises: { date: string; triggers: string[] }[],
  from: Date,
  to: Date,
): { id: string; data: MonthPoint[] }[] {
  // Count trigger occurrences per month
  const monthly = new Map<string, Map<string, number>>()
  const triggerTotals = new Map<string, number>()

  for (const c of crises) {
    const d = new Date(c.date + 'T00:00:00')
    if (d < from || d > to) continue

    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!monthly.has(monthKey)) monthly.set(monthKey, new Map())
    const monthMap = monthly.get(monthKey)!

    for (const t of c.triggers) {
      monthMap.set(t, (monthMap.get(t) ?? 0) + 1)
      triggerTotals.set(t, (triggerTotals.get(t) ?? 0) + 1)
    }
  }

  // Take top 5 triggers
  const topTriggers = [...triggerTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name)

  if (topTriggers.length === 0) return []

  // Build all month keys in range
  const allMonths: string[] = []
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1)
  const end = new Date(to.getFullYear(), to.getMonth(), 1)
  while (cursor <= end) {
    allMonths.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`)
    cursor.setMonth(cursor.getMonth() + 1)
  }

  // Build series
  return topTriggers.map((trigger) => ({
    id: trigger,
    data: allMonths.map((monthKey) => {
      const parts = monthKey.split('-')
      const year = parts[0] ?? ''
      const monthIdx = parseInt(parts[1] ?? '1', 10) - 1
      return {
        x: `${MONTH_LABELS[monthIdx]} ${year.slice(2)}`,
        y: monthly.get(monthKey)?.get(trigger) ?? 0,
      }
    }),
  }))
}

export function TriggerTimelineChart() {
  const crises = useCrisisStore((s) => s.crises)
  const getDateRange = useDashboardStore((s) => s.getDateRange)
  const { from, to } = getDateRange()

  const series = useMemo(() => buildTimelineData(crises, from, to), [crises, from, to])

  if (series.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-(--radius-lg) bg-(--color-bg-elevated)">
        <p className="text-sm text-(--color-text-muted)">Aucun déclencheur enregistré sur cette période</p>
      </div>
    )
  }

  const totalPoints = series[0]?.data.length ?? 0

  return (
    <div className="h-72 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
      <ResponsiveLine
        data={series}
        margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 0, stacked: false }}
        curve="monotoneX"
        colors={SERIE_COLORS}
        lineWidth={2}
        pointSize={5}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointColor="var(--color-bg-elevated)"
        axisBottom={{
          tickRotation: totalPoints > 6 ? -45 : 0,
          ...(totalPoints > 12 ? { tickValues: 6 } : {}),
        }}
        axisLeft={{
          tickValues: 5,
        }}
        theme={nivoTheme}
        enableSlices="x"
        sliceTooltip={({ slice }) => (
          <div
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 13,
            }}
          >
            <strong style={{ marginBottom: 4, display: 'block' }}>
              {String(slice.points[0]?.data.x ?? '')}
            </strong>
            {slice.points
              .filter((p) => (p.data.y as number) > 0)
              .map((point) => (
                <div key={point.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: point.seriesColor,
                      display: 'inline-block',
                    }}
                  />
                  {point.seriesId} : {point.data.yFormatted}
                </div>
              ))}
          </div>
        )}
        legends={[
          {
            anchor: 'top',
            direction: 'row',
            translateY: -20,
            itemWidth: 120,
            itemHeight: 16,
            symbolSize: 10,
            symbolShape: 'circle',
            itemTextColor: 'var(--color-text-secondary)',
          },
        ]}
      />
    </div>
  )
}
