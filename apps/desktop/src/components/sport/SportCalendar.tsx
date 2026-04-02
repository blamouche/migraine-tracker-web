import { useMemo } from 'react'
import { MonthCalendar } from '@/components/shared/MonthCalendar'
import type { CalendarDayData } from '@/components/shared/MonthCalendar'
import type { SportEntry } from '@/types/sport'
import { SPORT_TYPE_LABELS } from '@/types/sport'

function intensityColor(value: number): string {
  if (value <= 1) return 'var(--color-success)'
  if (value <= 2) return 'var(--color-pain-1)'
  if (value <= 3) return 'var(--color-warning)'
  if (value <= 4) return 'var(--color-pain-7)'
  return 'var(--color-danger)'
}

interface SportCalendarProps {
  entries: SportEntry[]
  onDayClick?: (date: string) => void
  selectedDate?: string | null
}

export function SportCalendar({ entries, onDayClick, selectedDate }: SportCalendarProps) {
  const data = useMemo(() => {
    const map = new Map<string, CalendarDayData>()
    for (const e of entries) {
      const existing = map.get(e.date)
      if (existing) {
        existing.value = Math.max(existing.value, e.intensite)
        existing.count = (existing.count ?? 1) + 1
        existing.label = `${existing.count} activités · Intensité max ${existing.value}/5`
      } else {
        map.set(e.date, {
          value: e.intensite,
          count: 1,
          label: `${SPORT_TYPE_LABELS[e.type]} · Intensité ${e.intensite}/5 · ${e.dureeMinutes} min`,
        })
      }
    }
    return map
  }, [entries])

  return (
    <MonthCalendar
      data={data}
      colorFn={intensityColor}
      legendLabel="Intensité de l'effort"
      legendMax={5}
      onDayClick={onDayClick}
      selectedDate={selectedDate}
    />
  )
}
