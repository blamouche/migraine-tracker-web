import { useMemo } from 'react'
import { MonthCalendar } from '@/components/shared/MonthCalendar'
import type { CalendarDayData } from '@/components/shared/MonthCalendar'
import type { CrisisEntry } from '@/types/crisis'

function intensityColor(value: number): string {
  if (value <= 2) return 'var(--color-pain-1)'
  if (value <= 4) return 'var(--color-pain-3)'
  if (value <= 6) return 'var(--color-pain-5)'
  if (value <= 8) return 'var(--color-pain-7)'
  return 'var(--color-pain-9)'
}

interface CrisisCalendarProps {
  crises: CrisisEntry[]
  onDayClick?: (date: string) => void
  selectedDate?: string | null
}

export function CrisisCalendar({ crises, onDayClick, selectedDate }: CrisisCalendarProps) {
  const data = useMemo(() => {
    const map = new Map<string, CalendarDayData>()
    for (const c of crises) {
      const existing = map.get(c.date)
      if (existing) {
        existing.value = Math.max(existing.value, c.intensity)
        existing.count = (existing.count ?? 1) + 1
        existing.label = `Intensité ${existing.value}/10 (${existing.count} crises)`
      } else {
        map.set(c.date, {
          value: c.intensity,
          count: 1,
          label: `Intensité ${c.intensity}/10`,
        })
      }
    }
    return map
  }, [crises])

  return (
    <MonthCalendar
      data={data}
      colorFn={intensityColor}
      legendLabel="Intensité de la crise"
      onDayClick={onDayClick}
      selectedDate={selectedDate}
    />
  )
}
