import { useMemo } from 'react'
import { ResponsiveLine } from '@nivo/line'
import { useCrisisStore } from '@/stores/crisisStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { nivoTheme } from '@/lib/nivoTheme'

function formatIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Build one data point per day in the range.
 * Days with a crisis get intensity as y; days without get null (gap in the line).
 */
function buildIntensityData(
  crises: { date: string; intensity: number }[],
  from: Date,
  to: Date,
): { x: string; y: number | null }[] {
  // Index crises by date — if multiple crises on the same day, keep the max intensity
  const byDate = new Map<string, number>()
  for (const c of crises) {
    const d = new Date(c.date + 'T00:00:00')
    if (d >= from && d <= to) {
      const existing = byDate.get(c.date)
      byDate.set(c.date, existing != null ? Math.max(existing, c.intensity) : c.intensity)
    }
  }

  // Generate every day in the range
  const points: { x: string; y: number | null }[] = []
  const cursor = new Date(from)
  cursor.setHours(0, 0, 0, 0)
  const end = new Date(to)
  end.setHours(0, 0, 0, 0)

  while (cursor <= end) {
    const iso = formatIso(cursor)
    points.push({ x: iso, y: byDate.get(iso) ?? null })
    cursor.setDate(cursor.getDate() + 1)
  }

  return points
}

function pickTickValues(from: Date, to: Date): string[] | number {
  const days = Math.round((to.getTime() - from.getTime()) / 86400000)
  // For short ranges, show ticks every few days; for longer ranges, limit count
  if (days <= 14) return 'every day'  as unknown as string[]
  if (days <= 60) return 'every 5 days' as unknown as string[]
  if (days <= 180) return 'every 2 weeks' as unknown as string[]
  if (days <= 365) return 'every month' as unknown as string[]
  return 'every 2 months' as unknown as string[]
}

export function IntensityEvolutionChart() {
  const crises = useCrisisStore((s) => s.crises)
  const getDateRange = useDashboardStore((s) => s.getDateRange)
  const { from, to } = getDateRange()

  const points = useMemo(() => buildIntensityData(crises, from, to), [crises, from, to])
  const hasData = useMemo(() => points.some((p) => p.y !== null), [points])

  const tickValues = useMemo(() => pickTickValues(from, to), [from, to])
  const days = Math.round((to.getTime() - from.getTime()) / 86400000)

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center rounded-(--radius-lg) bg-(--color-bg-elevated)">
        <p className="text-sm text-(--color-text-muted)">Aucune donnée sur cette période</p>
      </div>
    )
  }

  return (
    <div className="h-64 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
      <ResponsiveLine
        data={[{ id: 'Intensité', data: points }]}
        margin={{ top: 10, right: 20, bottom: 40, left: 40 }}
        xScale={{
          type: 'time',
          format: '%Y-%m-%d',
          precision: 'day',
          useUTC: false,
        }}
        xFormat="time:%Y-%m-%d"
        yScale={{ type: 'linear', min: 0, max: 10 }}
        curve="monotoneX"
        colors={['var(--color-danger)']}
        lineWidth={2}
        pointSize={6}
        pointColor="var(--color-bg-elevated)"
        pointBorderWidth={2}
        pointBorderColor="var(--color-danger)"
        enableArea
        areaOpacity={0.1}
        axisBottom={{
          format: (v: Date) =>
            v.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          tickRotation: days > 30 ? -45 : 0,
          tickValues,
        }}
        axisLeft={{
          tickValues: [0, 2, 4, 6, 8, 10],
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
            {slice.points.map((point) => (
              <div key={point.id}>
                <strong>
                  {(point.data.x as unknown as Date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </strong>{' '}
                : {point.data.yFormatted}/10
              </div>
            ))}
          </div>
        )}
      />
    </div>
  )
}
