import { useMemo } from 'react'
import { MonthCalendar } from '@/components/shared/MonthCalendar'
import type { CalendarDayData } from '@/components/shared/MonthCalendar'
import type { CycleEntry } from '@/types/cycle'
import { CYCLE_PHASE_LABELS } from '@/types/cycle'

function symptomColor(value: number): string {
  if (value <= 1) return 'var(--color-pain-1)'
  if (value <= 2) return 'var(--color-pain-3)'
  if (value <= 3) return 'var(--color-pain-5)'
  if (value <= 4) return 'var(--color-pain-7)'
  return 'var(--color-pain-9)'
}

interface CycleCalendarProps {
  entries: CycleEntry[]
  onDayClick?: (date: string) => void
  selectedDate?: string | null
}

export function CycleCalendar({ entries, onDayClick, selectedDate }: CycleCalendarProps) {
  const data = useMemo(() => {
    const map = new Map<string, CalendarDayData>()

    for (const e of entries) {
      const start = new Date(e.dateDebut + 'T00:00:00')
      for (let d = 0; d < e.dureeJours; d++) {
        const cursor = new Date(start)
        cursor.setDate(start.getDate() + d)
        const iso = cursor.toISOString().slice(0, 10)
        map.set(iso, {
          value: e.intensiteSymptomes,
          label: `${CYCLE_PHASE_LABELS[e.phase]} · Jour ${d + 1}/${e.dureeJours} · Intensité ${e.intensiteSymptomes}/5`,
        })
      }
    }

    return map
  }, [entries])

  return (
    <MonthCalendar
      data={data}
      colorFn={symptomColor}
      legendLabel="Intensité des symptômes"
      legendMax={5}
      onDayClick={onDayClick}
      selectedDate={selectedDate}
    />
  )
}
