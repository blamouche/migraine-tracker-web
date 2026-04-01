import { useMemo } from 'react'
import { ResponsiveLine } from '@nivo/line'
import { useCrisisStore } from '@/stores/crisisStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { nivoTheme } from '@/lib/nivoTheme'

function buildIntensityData(
  crises: { date: string; intensity: number }[],
  from: Date,
  to: Date,
): { x: string; y: number }[] {
  return crises
    .filter((c) => {
      const d = new Date(c.date + 'T00:00:00')
      return d >= from && d <= to
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((c) => ({ x: c.date, y: c.intensity }))
}

export function IntensityEvolutionChart() {
  const crises = useCrisisStore((s) => s.crises)
  const getDateRange = useDashboardStore((s) => s.getDateRange)
  const { from, to } = getDateRange('intensity')

  const points = useMemo(() => buildIntensityData(crises, from, to), [crises, from, to])

  if (points.length === 0) {
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
        xScale={{ type: 'point' }}
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
          tickRotation: points.length > 10 ? -45 : 0,
          format: (v: string) => {
            const d = new Date(v + 'T00:00:00')
            return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
          },
          ...(points.length > 15 ? { tickValues: 8 } : {}),
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
                  {new Date(String(point.data.x) + 'T00:00:00').toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
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
