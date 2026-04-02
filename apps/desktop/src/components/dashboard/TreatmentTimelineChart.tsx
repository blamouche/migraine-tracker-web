import { useMemo } from 'react'
import { useTreatmentStore } from '@/stores/treatmentStore'
import { useCrisisStore } from '@/stores/crisisStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import {
  THERAPEUTIC_CLASS_LABELS,
  VERDICT_COLORS,
} from '@/types/treatment'
import type { TreatmentEntry } from '@/types/treatment'

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

interface MonthData {
  key: string
  label: string
  crisisCount: number
}

function buildMonthRange(from: Date, to: Date, crises: { date: string }[]): MonthData[] {
  const months: MonthData[] = []
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1)
  const end = new Date(to.getFullYear(), to.getMonth(), 1)

  while (cursor <= end) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
    const label = `${MONTH_LABELS[cursor.getMonth()]} ${String(cursor.getFullYear()).slice(2)}`
    months.push({ key, label, crisisCount: 0 })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  for (const c of crises) {
    const d = new Date(c.date + 'T00:00:00')
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const month = months.find((m) => m.key === key)
    if (month) month.crisisCount++
  }

  return months
}

function treatmentSpan(t: TreatmentEntry, months: MonthData[]): { start: number; width: number } | null {
  if (months.length === 0) return null
  const firstMonth = months[0]!.key
  const lastMonth = months[months.length - 1]!.key

  const tStart = t.dateDebut.slice(0, 7) // YYYY-MM
  const tEnd = t.dateFin ? t.dateFin.slice(0, 7) : lastMonth

  if (tEnd < firstMonth || tStart > lastMonth) return null

  const effectiveStart = tStart < firstMonth ? firstMonth : tStart
  const effectiveEnd = tEnd > lastMonth ? lastMonth : tEnd

  const startIdx = months.findIndex((m) => m.key === effectiveStart)
  const endIdx = months.findIndex((m) => m.key === effectiveEnd)

  if (startIdx === -1 || endIdx === -1) return null

  return {
    start: startIdx,
    width: endIdx - startIdx + 1,
  }
}

export function TreatmentTimelineChart() {
  const treatments = useTreatmentStore((s) => s.treatments)
  const crises = useCrisisStore((s) => s.crises)
  const getDateRange = useDashboardStore((s) => s.getDateRange)
  const { from, to } = getDateRange()

  const months = useMemo(() => buildMonthRange(from, to, crises), [from, to, crises])
  const maxCrisis = useMemo(() => Math.max(1, ...months.map((m) => m.crisisCount)), [months])

  const fondTreatments = useMemo(
    () => treatments.filter((t) => t.type === 'fond'),
    [treatments],
  )
  const criseTreatments = useMemo(
    () => treatments.filter((t) => t.type === 'crise'),
    [treatments],
  )

  if (treatments.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-(--radius-lg) bg-(--color-bg-elevated)">
        <p className="text-sm text-(--color-text-muted)">
          Aucun traitement enregistré — ajoutez vos traitements pour voir la timeline
        </p>
      </div>
    )
  }

  const colWidth = months.length > 0 ? 100 / months.length : 100
  const barHeight = 28
  const gap = 4
  const headerHeight = 60 // crisis frequency bar area
  const allTreatments = [...fondTreatments, ...criseTreatments]

  return (
    <div className="rounded-(--radius-lg) bg-(--color-bg-elevated) p-4 overflow-x-auto">
      {/* Crisis frequency bars (top) */}
      <div className="relative mb-4" style={{ height: headerHeight }}>
        <div className="flex h-full">
          {months.map((m) => (
            <div
              key={m.key}
              className="flex flex-col items-center justify-end"
              style={{ width: `${colWidth}%` }}
            >
              <div
                className="w-3/4 rounded-t-(--radius-sm) bg-(--color-brand)"
                style={{
                  height: `${(m.crisisCount / maxCrisis) * (headerHeight - 16)}px`,
                  opacity: m.crisisCount > 0 ? 0.7 : 0,
                  minHeight: m.crisisCount > 0 ? 4 : 0,
                }}
                title={`${m.label}: ${m.crisisCount} crise${m.crisisCount !== 1 ? 's' : ''}`}
              />
              {m.crisisCount > 0 && (
                <span className="text-[10px] text-(--color-text-muted)">{m.crisisCount}</span>
              )}
            </div>
          ))}
        </div>
        <p className="absolute -top-1 left-0 text-[10px] font-medium text-(--color-text-muted)">
          Crises / mois
        </p>
      </div>

      {/* Month labels */}
      <div className="flex border-b border-(--color-border) pb-1 mb-2">
        {months.map((m) => (
          <div
            key={m.key}
            className="text-center text-[10px] text-(--color-text-muted)"
            style={{ width: `${colWidth}%` }}
          >
            {m.label}
          </div>
        ))}
      </div>

      {/* Treatment Gantt bars */}
      {allTreatments.length > 0 && (
        <div className="relative" style={{ minHeight: allTreatments.length * (barHeight + gap) }}>
          {allTreatments.map((t, idx) => {
            const span = treatmentSpan(t, months)
            if (!span) return null

            const color = VERDICT_COLORS[t.efficacite.verdict]
            const isActive = !t.dateFin

            return (
              <div
                key={t.id}
                className="absolute flex items-center rounded-(--radius-sm) px-2 text-xs font-medium text-white truncate"
                style={{
                  left: `${span.start * colWidth}%`,
                  width: `${span.width * colWidth}%`,
                  top: idx * (barHeight + gap),
                  height: barHeight,
                  backgroundColor: color,
                  opacity: 0.85,
                  borderRight: isActive ? '3px solid var(--color-brand)' : undefined,
                }}
                title={`${t.nom} (${THERAPEUTIC_CLASS_LABELS[t.classe]}) — ${t.dateDebut}${t.dateFin ? ` → ${t.dateFin}` : ' → en cours'}`}
              >
                {t.nom}
                <span className="ml-1 opacity-70 text-[10px]">
                  {THERAPEUTIC_CLASS_LABELS[t.classe]}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 border-t border-(--color-border) pt-3">
        <LegendItem color="var(--color-success)" label="Efficace" />
        <LegendItem color="var(--color-warning)" label="Partiel" />
        <LegendItem color="var(--color-danger)" label="Inefficace" />
        <LegendItem color="var(--color-text-muted)" label="Non évalué" />
      </div>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs text-(--color-text-muted)">{label}</span>
    </div>
  )
}
