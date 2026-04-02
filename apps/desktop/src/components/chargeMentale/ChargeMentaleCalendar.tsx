import { useMemo } from 'react'
import { MonthCalendar } from '@/components/shared/MonthCalendar'
import type { CalendarDayData } from '@/components/shared/MonthCalendar'
import type { ChargeMentaleEntry } from '@/types/chargeMentale'
import { CHARGE_DOMAINE_LABELS, HUMEUR_LABELS } from '@/types/chargeMentale'

function chargeColor(value: number): string {
  if (value <= 2) return 'var(--color-pain-1)'
  if (value <= 4) return 'var(--color-pain-3)'
  if (value <= 6) return 'var(--color-pain-5)'
  if (value <= 8) return 'var(--color-pain-7)'
  return 'var(--color-pain-9)'
}

interface ChargeMentaleCalendarProps {
  entries: ChargeMentaleEntry[]
  onDayClick?: (date: string) => void
  selectedDate?: string | null
}

export function ChargeMentaleCalendar({ entries, onDayClick, selectedDate }: ChargeMentaleCalendarProps) {
  const data = useMemo(() => {
    const map = new Map<string, CalendarDayData>()
    for (const e of entries) {
      map.set(e.date, {
        value: e.niveau,
        label: `Charge ${e.niveau}/10 · ${CHARGE_DOMAINE_LABELS[e.domaine]} · ${HUMEUR_LABELS[e.humeur]}`,
      })
    }
    return map
  }, [entries])

  return (
    <MonthCalendar
      data={data}
      colorFn={chargeColor}
      legendLabel="Niveau de charge mentale"
      onDayClick={onDayClick}
      selectedDate={selectedDate}
    />
  )
}
