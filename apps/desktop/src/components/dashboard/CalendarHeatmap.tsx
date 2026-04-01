import { useMemo } from 'react'
import { ResponsiveCalendar } from '@nivo/calendar'
import { useCrisisStore } from '@/stores/crisisStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { nivoTheme } from '@/lib/nivoTheme'
import type { CalendarDay } from '@/types/dashboard'

function buildCalendarData(
  crises: { date: string; intensity: number }[],
  from: Date,
  to: Date,
): CalendarDay[] {
  const dayMap = new Map<string, CalendarDay>()

  for (const c of crises) {
    const d = new Date(c.date + 'T00:00:00')
    if (d < from || d > to) continue

    const existing = dayMap.get(c.date)
    if (existing) {
      // Multiple crises same day — use max intensity
      if (c.intensity > (existing.crisisIntensity ?? 0)) {
        existing.crisisIntensity = c.intensity
        existing.value = c.intensity
      }
    } else {
      dayMap.set(c.date, {
        day: c.date,
        value: c.intensity,
        hasCrisis: true,
        crisisIntensity: c.intensity,
      })
    }
  }

  return [...dayMap.values()]
}

export function CalendarHeatmap() {
  const crises = useCrisisStore((s) => s.crises)
  const getDateRange = useDashboardStore((s) => s.getDateRange)
  const { from, to } = getDateRange('calendar')

  const data = useMemo(() => buildCalendarData(crises, from, to), [crises, from, to])

  const fromStr = from.toISOString().slice(0, 10)
  const toStr = to.toISOString().slice(0, 10)

  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-(--radius-lg) bg-(--color-bg-elevated)">
        <p className="text-sm text-(--color-text-muted)">Aucune donnée sur cette période</p>
      </div>
    )
  }

  return (
    <div className="h-48 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
      <ResponsiveCalendar
        data={data.map((d) => ({ day: d.day, value: d.value }))}
        from={fromStr}
        to={toStr}
        emptyColor="var(--color-pain-0)"
        colors={[
          'var(--color-pain-1)',
          'var(--color-pain-3)',
          'var(--color-pain-5)',
          'var(--color-pain-7)',
          'var(--color-pain-9)',
        ]}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        yearSpacing={40}
        monthBorderColor="var(--color-border)"
        dayBorderWidth={1}
        dayBorderColor="var(--color-border)"
        theme={nivoTheme}
        tooltip={({ day, value }) => {
          const entry = data.find((d) => d.day === day)
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
              <strong>{new Date(day + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</strong>
              <br />
              Intensité : {value ?? 'N/A'}
              {entry?.hasCrisis && (
                <>
                  <br />
                  <span style={{ color: 'var(--color-crisis-marker)' }}>Jour de crise</span>
                </>
              )}
            </div>
          )
        }}
      />
      <div className="mt-2 flex items-center gap-4 text-xs text-(--color-text-muted)">
        <div className="flex items-center gap-1">
          <div className="h-3 w-12 rounded-sm" style={{ background: 'linear-gradient(to right, var(--color-pain-1), var(--color-pain-9))' }} />
          <span>0 — 10</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm border-2" style={{ borderColor: 'var(--color-crisis-marker)', background: 'var(--color-bg-subtle)' }} />
          <span>Jour de crise</span>
        </div>
      </div>
    </div>
  )
}
