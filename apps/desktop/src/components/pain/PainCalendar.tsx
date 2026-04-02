import { useMemo } from 'react'
import { MonthCalendar } from '@/components/shared/MonthCalendar'
import type { CalendarDayData } from '@/components/shared/MonthCalendar'
import type { DailyPainEntry } from '@/types/dailyPain'
import { PAIN_NIVEAU_LABELS } from '@/types/dailyPain'

function painColor(value: number): string {
  if (value === 0) return 'var(--color-pain-0, #e2e8f0)'
  if (value <= 2) return 'var(--color-pain-1)'
  if (value <= 4) return 'var(--color-pain-3)'
  if (value <= 6) return 'var(--color-pain-5)'
  if (value <= 8) return 'var(--color-pain-7)'
  return 'var(--color-pain-9)'
}

interface PainCalendarProps {
  entries: DailyPainEntry[]
  onDayClick?: (date: string) => void
  selectedDate?: string | null
}

export function PainCalendar({ entries, onDayClick, selectedDate }: PainCalendarProps) {
  const data = useMemo(() => {
    const map = new Map<string, CalendarDayData>()
    for (const e of entries) {
      map.set(e.date, {
        value: e.niveau,
        label: `${PAIN_NIVEAU_LABELS[e.niveau]} (${e.niveau}/10)${e.lieeACrise ? ' · Crise' : ''}`,
      })
    }
    return map
  }, [entries])

  return (
    <MonthCalendar
      data={data}
      colorFn={painColor}
      legendLabel="Niveau de douleur"
      onDayClick={onDayClick}
      selectedDate={selectedDate}
    />
  )
}
