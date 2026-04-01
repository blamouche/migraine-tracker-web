import { useMemo } from 'react'
import { useCrisisStore } from '@/stores/crisisStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import type { KpiData } from '@/types/dashboard'

function computeKpis(
  crises: { date: string; intensity: number; treatments: string[]; triggers: string[]; hit6Score: number | null; estimatedDuration: number | null; completionForcee: boolean }[],
  from: Date,
  to: Date,
): KpiData {
  const filtered = crises.filter((c) => {
    const d = new Date(c.date + 'T00:00:00')
    return d >= from && d <= to
  })

  const totalCrises = filtered.length
  const months = Math.max(1, (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24 * 30))
  const frequency = totalCrises / months

  const intensities = filtered.map((c) => c.intensity)
  const avgIntensity = intensities.length > 0 ? intensities.reduce((a, b) => a + b, 0) / intensities.length : 0

  const durations = filtered.map((c) => c.estimatedDuration).filter((d): d is number => d != null)
  const avgDurationMinutes = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0

  // Top treatments
  const treatmentCounts = new Map<string, number>()
  for (const c of filtered) {
    for (const t of c.treatments) {
      treatmentCounts.set(t, (treatmentCounts.get(t) ?? 0) + 1)
    }
  }
  const topTreatments = [...treatmentCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count, efficacy: 0 }))

  // Top triggers
  const triggerCounts = new Map<string, number>()
  for (const c of filtered) {
    for (const t of c.triggers) {
      triggerCounts.set(t, (triggerCounts.get(t) ?? 0) + 1)
    }
  }
  const topTriggers = [...triggerCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  // HIT-6
  const hit6Scores = filtered.filter((c) => !c.completionForcee && c.hit6Score != null).map((c) => c.hit6Score!)
  const avgHit6 = hit6Scores.length > 0 ? hit6Scores.reduce((a, b) => a + b, 0) / hit6Scores.length : null

  return {
    frequency: Math.round(frequency * 10) / 10,
    avgIntensity: Math.round(avgIntensity * 10) / 10,
    avgDurationMinutes: Math.round(avgDurationMinutes),
    totalCrises,
    topTreatments,
    topTriggers,
    avgHit6: avgHit6 != null ? Math.round(avgHit6) : null,
    highFrequency: frequency >= 4,
  }
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function KpiIndicators() {
  const crises = useCrisisStore((s) => s.crises)
  const getDateRange = useDashboardStore((s) => s.getDateRange)
  const { from, to } = getDateRange('kpi')

  const kpis = useMemo(() => computeKpis(crises, from, to), [crises, from, to])

  const cards: { label: string; value: string; warning?: boolean }[] = [
    {
      label: 'Fréquence mensuelle',
      value: `${kpis.frequency} crises/mois`,
      warning: kpis.highFrequency,
    },
    {
      label: 'Intensité moyenne',
      value: `${kpis.avgIntensity}/10`,
    },
    {
      label: 'Durée moyenne',
      value: formatDuration(kpis.avgDurationMinutes),
    },
    {
      label: 'Total crises',
      value: `${kpis.totalCrises}`,
    },
    ...(kpis.avgHit6 != null
      ? [{ label: 'Score HIT-6 moyen', value: `${kpis.avgHit6}` }]
      : []),
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-(--radius-lg) bg-(--color-bg-elevated) p-4 ${
              card.warning ? 'border-l-3 border-(--color-danger)' : ''
            }`}
          >
            <p className="text-xs text-(--color-text-muted)">{card.label}</p>
            <p className={`mt-1 text-xl font-bold ${card.warning ? 'text-(--color-danger)' : ''}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {kpis.topTriggers.length > 0 && (
        <div className="rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
          <p className="text-xs font-medium text-(--color-text-muted)">Top déclencheurs</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {kpis.topTriggers.map((t) => (
              <span
                key={t.name}
                className="rounded-(--radius-full) bg-(--color-bg-subtle) px-3 py-1 text-xs font-medium text-(--color-text-secondary)"
              >
                {t.name} ({t.count})
              </span>
            ))}
          </div>
        </div>
      )}

      {kpis.topTreatments.length > 0 && (
        <div className="rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
          <p className="text-xs font-medium text-(--color-text-muted)">Traitements utilisés</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {kpis.topTreatments.map((t) => (
              <span
                key={t.name}
                className="rounded-(--radius-full) bg-(--color-bg-subtle) px-3 py-1 text-xs font-medium text-(--color-text-secondary)"
              >
                {t.name} ({t.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
