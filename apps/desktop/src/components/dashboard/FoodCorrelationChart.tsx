import { useMemo } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { useCrisisStore } from '@/stores/crisisStore'
import { useFoodStore } from '@/stores/foodStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { detectFoodCorrelations } from '@/lib/patterns/foodCorrelation'
import { nivoTheme } from '@/lib/nivoTheme'

interface BarDatum {
  food: string
  confidence: number
  label: string
  [key: string]: string | number
}

export function FoodCorrelationChart() {
  const crises = useCrisisStore((s) => s.crises)
  const foodEntries = useFoodStore((s) => s.entries)
  const getDateRange = useDashboardStore((s) => s.getDateRange)
  const { from, to } = getDateRange()

  const data = useMemo((): BarDatum[] => {
    // Filter entries and crises by date range
    const filteredEntries = foodEntries.filter((e) => {
      const d = new Date(e.date + 'T00:00:00')
      return d >= from && d <= to
    })
    const filteredCrises = crises.filter((c) => {
      const d = new Date(c.date + 'T00:00:00')
      return d >= from && d <= to
    })

    const correlations = detectFoodCorrelations(filteredEntries, filteredCrises)

    return correlations.slice(0, 10).map((c) => ({
      food: c.foodName,
      confidence: c.confidence,
      label: `${c.confidence}% (${c.crisisCount}/${c.occurrenceCount})`,
    }))
  }, [foodEntries, crises, from, to])

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-(--radius-lg) bg-(--color-bg-elevated)">
        <p className="text-sm text-(--color-text-muted)">
          Pas assez de données pour détecter des corrélations alimentaires (min. 5 occurrences par aliment, corrélation ≥ 60%)
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="h-64 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
        <ResponsiveBar
          data={data}
          keys={['confidence']}
          indexBy="food"
          layout="horizontal"
          margin={{ top: 10, right: 20, bottom: 30, left: 130 }}
          padding={0.3}
          colors={['var(--color-danger)']}
          borderRadius={4}
          theme={nivoTheme}
          enableLabel
          label={(d) => `${d.value}%`}
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
              {(row as unknown as BarDatum).label}
            </div>
          )}
        />
      </div>

      {/* Factual descriptions (US-03-05) */}
      <div className="space-y-1 px-1">
        {data.map((d) => (
          <p key={d.food} className="text-xs text-(--color-text-secondary)">
            {d.food} précède une crise dans <strong>{d.confidence}%</strong> des cas dans les 48h
          </p>
        ))}
      </div>
    </div>
  )
}
