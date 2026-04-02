import { useMemo } from 'react'
import { MonthCalendar } from '@/components/shared/MonthCalendar'
import type { CalendarDayData } from '@/components/shared/MonthCalendar'
import type { ConsultationEntry } from '@/types/consultation'
import { CONSULTATION_TYPE_LABELS } from '@/types/consultation'

function consultationColor(value: number): string {
  if (value <= 1) return 'var(--color-brand)'
  if (value <= 2) return 'var(--color-pain-5)'
  return 'var(--color-pain-7)'
}

interface ConsultationCalendarProps {
  entries: ConsultationEntry[]
  onDayClick?: (date: string) => void
  selectedDate?: string | null
}

export function ConsultationCalendar({ entries, onDayClick, selectedDate }: ConsultationCalendarProps) {
  const data = useMemo(() => {
    const map = new Map<string, CalendarDayData>()
    for (const e of entries) {
      const existing = map.get(e.date)
      if (existing) {
        existing.value = (existing.value ?? 0) + 1
        existing.count = existing.value
        existing.label = `${existing.value} consultations`
      } else {
        map.set(e.date, {
          value: 1,
          label: `${e.medecin} · ${e.specialite} · ${CONSULTATION_TYPE_LABELS[e.type]}`,
        })
      }
    }
    return map
  }, [entries])

  return (
    <MonthCalendar
      data={data}
      colorFn={consultationColor}
      legendLabel="Consultations"
      legendMax={3}
      onDayClick={onDayClick}
      selectedDate={selectedDate}
    />
  )
}
