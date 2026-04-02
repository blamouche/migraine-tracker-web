import { useMemo } from 'react'
import { MonthCalendar } from '@/components/shared/MonthCalendar'
import type { CalendarDayData } from '@/components/shared/MonthCalendar'
import type { FoodEntry, DailyFactors } from '@/types/alimentaire'

function mealCountColor(value: number): string {
  if (value <= 1) return 'var(--color-pain-1)'
  if (value <= 2) return 'var(--color-pain-3)'
  if (value <= 3) return 'var(--color-pain-5)'
  return 'var(--color-pain-7)'
}

interface FoodCalendarProps {
  entries: FoodEntry[]
  dailyFactors: DailyFactors[]
  onDayClick?: (date: string) => void
  selectedDate?: string | null
}

export function FoodCalendar({ entries, dailyFactors, onDayClick, selectedDate }: FoodCalendarProps) {
  const data = useMemo(() => {
    const map = new Map<string, CalendarDayData>()
    for (const e of entries) {
      const existing = map.get(e.date)
      if (existing) {
        existing.value = (existing.value ?? 0) + 1
        existing.count = existing.value
      } else {
        map.set(e.date, { value: 1, count: 1 })
      }
    }

    // Enrich labels with daily factors
    for (const [date, day] of map) {
      const factors = dailyFactors.find((f) => f.date === date)
      const parts = [`${day.value} repas`]
      if (factors) {
        parts.push(`Stress ${factors.stress}/5`)
        parts.push(`Sommeil ${factors.sleepQuality}/5`)
      }
      day.label = parts.join(' · ')
    }

    return map
  }, [entries, dailyFactors])

  return (
    <MonthCalendar
      data={data}
      colorFn={mealCountColor}
      legendLabel="Nombre de repas"
      legendMax={4}
      onDayClick={onDayClick}
      selectedDate={selectedDate}
    />
  )
}
