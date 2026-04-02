import { useMemo } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { useCrisisStore } from '@/stores/crisisStore'
import { useEnvironnementStore } from '@/stores/environnementStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { nivoTheme } from '@/lib/nivoTheme'
import type { EnvironnementEntry } from '@/types/environnement'

interface WeatherComparison {
  metric: string
  'Jours de crise': number
  'Jours sans crise': number
  [key: string]: string | number
}

function buildComparisonData(
  entries: EnvironnementEntry[],
  crisisDates: Set<string>,
  from: Date,
  to: Date,
): WeatherComparison[] {
  const crisis = { temp: [] as number[], pressure: [] as number[], humidity: [] as number[], wind: [] as number[] }
  const noCrisis = { temp: [] as number[], pressure: [] as number[], humidity: [] as number[], wind: [] as number[] }

  for (const e of entries) {
    const d = new Date(e.date + 'T00:00:00')
    if (d < from || d > to) continue

    const bucket = crisisDates.has(e.date) ? crisis : noCrisis
    if (e.temperatureMax != null) bucket.temp.push(e.temperatureMax)
    if (e.pressionMoyenne != null) bucket.pressure.push(e.pressionMoyenne)
    if (e.humidite != null) bucket.humidity.push(e.humidite)
    if (e.vitesseVent != null) bucket.wind.push(e.vitesseVent)
  }

  const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length * 10) / 10 : 0

  const result: WeatherComparison[] = []

  if (crisis.pressure.length > 0 || noCrisis.pressure.length > 0) {
    result.push({ metric: 'Pression (hPa)', 'Jours de crise': avg(crisis.pressure), 'Jours sans crise': avg(noCrisis.pressure) })
  }
  if (crisis.temp.length > 0 || noCrisis.temp.length > 0) {
    result.push({ metric: 'Temp. max (°C)', 'Jours de crise': avg(crisis.temp), 'Jours sans crise': avg(noCrisis.temp) })
  }
  if (crisis.humidity.length > 0 || noCrisis.humidity.length > 0) {
    result.push({ metric: 'Humidité (%)', 'Jours de crise': avg(crisis.humidity), 'Jours sans crise': avg(noCrisis.humidity) })
  }
  if (crisis.wind.length > 0 || noCrisis.wind.length > 0) {
    result.push({ metric: 'Vent (km/h)', 'Jours de crise': avg(crisis.wind), 'Jours sans crise': avg(noCrisis.wind) })
  }

  return result
}

export function PressureCrisisChart() {
  const envEntries = useEnvironnementStore((s) => s.entries)
  const crises = useCrisisStore((s) => s.crises)
  const getDateRange = useDashboardStore((s) => s.getDateRange)
  const { from, to } = getDateRange()

  const crisisDates = useMemo(() => new Set(crises.map((c) => c.date)), [crises])
  const data = useMemo(() => buildComparisonData(envEntries, crisisDates, from, to), [envEntries, crisisDates, from, to])

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-(--radius-lg) bg-(--color-bg-elevated)">
        <p className="text-sm text-(--color-text-muted)">
          Pas assez de données météo pour comparer
        </p>
      </div>
    )
  }

  return (
    <div className="h-64 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
      <ResponsiveBar
        data={data}
        keys={['Jours de crise', 'Jours sans crise']}
        indexBy="metric"
        groupMode="grouped"
        margin={{ top: 10, right: 20, bottom: 40, left: 60 }}
        padding={0.3}
        colors={['var(--color-danger)', 'var(--color-brand)']}
        borderRadius={4}
        theme={nivoTheme}
        enableLabel
        labelTextColor="var(--color-text-inverse)"
        axisBottom={{
          tickRotation: -20,
        }}
        tooltip={({ id, indexValue, value }) => (
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
            {id} : {value}
          </div>
        )}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'top-right',
            direction: 'column',
            translateX: 0,
            translateY: -10,
            itemWidth: 140,
            itemHeight: 18,
            symbolSize: 10,
            symbolShape: 'circle',
            itemTextColor: 'var(--color-text-secondary)',
          },
        ]}
      />
    </div>
  )
}
