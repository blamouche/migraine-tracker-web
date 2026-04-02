import { useMemo } from 'react'
import { ResponsiveLine } from '@nivo/line'
import { useCrisisStore } from '@/stores/crisisStore'
import { useEnvironnementStore } from '@/stores/environnementStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { nivoTheme } from '@/lib/nivoTheme'
import type { EnvironnementEntry } from '@/types/environnement'

const METRIC_COLORS = {
  'Temp. max': 'var(--color-danger)',
  'Temp. min': 'var(--color-brand)',
  'Pression (÷10)': '#a78bfa',
  'Humidité (÷10)': 'var(--color-success)',
}

function buildWeatherSeries(
  entries: EnvironnementEntry[],
  crisisDates: Set<string>,
  from: Date,
  to: Date,
) {
  const filtered = entries
    .filter((e) => {
      const d = new Date(e.date + 'T00:00:00')
      return d >= from && d <= to
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  if (filtered.length === 0) return { series: [], crisisMarkers: [] }

  const tempMax: { x: string; y: number | null }[] = []
  const tempMin: { x: string; y: number | null }[] = []
  const pressure: { x: string; y: number | null }[] = []
  const humidity: { x: string; y: number | null }[] = []
  const crisisMarkers: { x: string; y: number }[] = []

  for (const e of filtered) {
    tempMax.push({ x: e.date, y: e.temperatureMax })
    tempMin.push({ x: e.date, y: e.temperatureMin })
    // Scale pressure and humidity to fit on same axis as temperature
    pressure.push({ x: e.date, y: e.pressionMoyenne != null ? Math.round((e.pressionMoyenne - 950) / 5 * 10) / 10 : null })
    humidity.push({ x: e.date, y: e.humidite != null ? Math.round(e.humidite / 10 * 10) / 10 : null })

    if (crisisDates.has(e.date) && e.temperatureMax != null) {
      crisisMarkers.push({ x: e.date, y: e.temperatureMax })
    }
  }

  // Only include series that have at least one non-null value,
  // and filter out null points to avoid SVG path errors
  const raw = [
    { id: 'Temp. max', data: tempMax },
    { id: 'Temp. min', data: tempMin },
    { id: 'Pression (÷10)', data: pressure },
    { id: 'Humidité (÷10)', data: humidity },
  ]
  const series = raw
    .map((s) => ({ ...s, data: s.data.filter((p): p is { x: string; y: number } => p.y != null) }))
    .filter((s) => s.data.length > 0)

  return { series, crisisMarkers }
}

export function WeatherOverviewChart() {
  const envEntries = useEnvironnementStore((s) => s.entries)
  const crises = useCrisisStore((s) => s.crises)
  const getDateRange = useDashboardStore((s) => s.getDateRange)
  const { from, to } = getDateRange()

  const crisisDates = useMemo(
    () => new Set(crises.map((c) => c.date)),
    [crises],
  )

  const { series, crisisMarkers } = useMemo(
    () => buildWeatherSeries(envEntries, crisisDates, from, to),
    [envEntries, crisisDates, from, to],
  )

  if (series.length === 0 || series.every((s) => s.data.length === 0)) {
    return (
      <div className="flex h-72 items-center justify-center rounded-(--radius-lg) bg-(--color-bg-elevated)">
        <p className="text-sm text-(--color-text-muted)">
          Aucune donnée météo sur cette période
        </p>
      </div>
    )
  }

  const totalPoints = series[0]?.data.length ?? 0

  return (
    <div className="h-72 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
      <ResponsiveLine
        data={series}
        margin={{ top: 20, right: 20, bottom: 40, left: 45 }}
        xScale={{ type: 'time', format: '%Y-%m-%d', precision: 'day', useUTC: false }}
        xFormat="time:%Y-%m-%d"
        yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
        curve="monotoneX"
        colors={Object.values(METRIC_COLORS)}
        lineWidth={1.5}
        pointSize={0}
        enableArea={false}
        axisBottom={{
          format: (v: Date) =>
            v.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          tickRotation: totalPoints > 20 ? -45 : 0,
          tickValues: totalPoints > 60 ? 'every month' : totalPoints > 14 ? 'every week' : 'every 2 days',
        }}
        axisLeft={{
          legend: '°C / unité normalisée',
          legendOffset: -40,
          legendPosition: 'middle',
        }}
        theme={nivoTheme}
        enableSlices="x"
        sliceTooltip={({ slice }) => {
          const dateStr = String(
            (slice.points[0]?.data.x as unknown as Date)?.toLocaleDateString?.('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }) ?? '',
          )
          const isCrisis = crisisMarkers.some(
            (m) => m.x === slice.points[0]?.data.xFormatted,
          )
          return (
            <div
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 13,
              }}
            >
              <strong>{dateStr}</strong>
              {isCrisis && (
                <span style={{ color: 'var(--color-danger)', marginLeft: 6 }}>
                  (jour de crise)
                </span>
              )}
              {slice.points.map((point) => {
                const colors = METRIC_COLORS as Record<string, string>
                return (
                  <div key={point.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: colors[point.seriesId as string] ?? point.seriesColor,
                        display: 'inline-block',
                      }}
                    />
                    {point.seriesId} : {point.data.yFormatted}
                  </div>
                )
              })}
            </div>
          )
        }}
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
