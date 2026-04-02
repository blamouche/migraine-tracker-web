import { useMemo } from 'react'
import { MonthCalendar } from '@/components/shared/MonthCalendar'
import type { CalendarDayData } from '@/components/shared/MonthCalendar'
import type { TransportEntry } from '@/types/transport'
import { TRANSPORT_MOYEN_LABELS } from '@/types/transport'

function durationColor(value: number): string {
  // value = total duration in 30-min buckets, capped at 5
  if (value <= 1) return 'var(--color-pain-1)'
  if (value <= 2) return 'var(--color-pain-3)'
  if (value <= 3) return 'var(--color-pain-5)'
  if (value <= 4) return 'var(--color-pain-7)'
  return 'var(--color-pain-9)'
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

interface TransportCalendarProps {
  entries: TransportEntry[]
  onDayClick?: (date: string) => void
  selectedDate?: string | null
}

export function TransportCalendar({ entries, onDayClick, selectedDate }: TransportCalendarProps) {
  const data = useMemo(() => {
    const byDate = new Map<string, TransportEntry[]>()
    for (const e of entries) {
      const list = byDate.get(e.date) ?? []
      list.push(e)
      byDate.set(e.date, list)
    }

    const map = new Map<string, CalendarDayData>()
    for (const [date, trips] of byDate) {
      const totalMin = trips.reduce((sum, t) => sum + t.dureeMinutes, 0)
      const moyens = [...new Set(trips.map((t) => TRANSPORT_MOYEN_LABELS[t.moyen]))]
      // Map duration to 1-5 scale (30min buckets, capped)
      const value = Math.min(5, Math.max(1, Math.ceil(totalMin / 30)))
      const dayData: CalendarDayData = {
        value,
        label: `${trips.length} trajet${trips.length > 1 ? 's' : ''} · ${formatDuration(totalMin)} · ${moyens.join(', ')}`,
      }
      if (trips.length > 1) dayData.count = trips.length
      map.set(date, dayData)
    }
    return map
  }, [entries])

  return (
    <MonthCalendar
      data={data}
      colorFn={durationColor}
      legendLabel="Durée de transport"
      legendMax={5}
      onDayClick={onDayClick}
      selectedDate={selectedDate}
    />
  )
}
