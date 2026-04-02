import { useMemo } from 'react'
import { MonthCalendar } from '@/components/shared/MonthCalendar'
import type { CalendarDayData } from '@/components/shared/MonthCalendar'
import type { TreatmentEntry } from '@/types/treatment'
import { VERDICT_LABELS } from '@/types/treatment'

function treatmentCountColor(value: number): string {
  if (value <= 1) return 'var(--color-pain-1)'
  if (value <= 2) return 'var(--color-pain-3)'
  if (value <= 3) return 'var(--color-pain-5)'
  if (value <= 4) return 'var(--color-pain-7)'
  return 'var(--color-pain-9)'
}

interface TreatmentCalendarProps {
  treatments: TreatmentEntry[]
  onDayClick?: (date: string) => void
  selectedDate?: string | null
}

export function TreatmentCalendar({ treatments, onDayClick, selectedDate }: TreatmentCalendarProps) {
  const data = useMemo(() => {
    const map = new Map<string, { names: string[]; verdicts: string[] }>()

    for (const t of treatments) {
      const start = new Date(t.dateDebut + 'T00:00:00')
      const end = t.dateFin ? new Date(t.dateFin + 'T00:00:00') : new Date()
      const cursor = new Date(start)

      while (cursor <= end) {
        const iso = cursor.toISOString().slice(0, 10)
        const existing = map.get(iso)
        if (existing) {
          existing.names.push(t.nom)
          existing.verdicts.push(VERDICT_LABELS[t.efficacite.verdict as keyof typeof VERDICT_LABELS] ?? '?')
        } else {
          map.set(iso, {
            names: [t.nom],
            verdicts: [VERDICT_LABELS[t.efficacite.verdict as keyof typeof VERDICT_LABELS] ?? '?'],
          })
        }
        cursor.setDate(cursor.getDate() + 1)
      }
    }

    const result = new Map<string, CalendarDayData>()
    for (const [date, info] of map) {
      const dayData: CalendarDayData = {
        value: Math.min(5, info.names.length),
        label: info.names.join(', '),
      }
      if (info.names.length > 1) dayData.count = info.names.length
      result.set(date, dayData)
    }
    return result
  }, [treatments])

  return (
    <MonthCalendar
      data={data}
      colorFn={treatmentCountColor}
      legendLabel="Traitements actifs"
      legendMax={5}
      onDayClick={onDayClick}
      selectedDate={selectedDate}
    />
  )
}
