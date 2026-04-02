import { useState, useMemo } from 'react'

export interface CalendarDayData {
  value: number
  count?: number
  label?: string
}

interface MonthCalendarProps {
  /** Map of YYYY-MM-DD → day data */
  data: Map<string, CalendarDayData>
  /** Color function: value → CSS color string */
  colorFn: (value: number) => string
  /** Legend label (e.g. "Intensité de la crise") */
  legendLabel: string
  /** Max value for legend display */
  legendMax?: number
  /** Called when a day is clicked */
  onDayClick?: ((date: string) => void) | undefined
  /** Currently selected date (highlighted) */
  selectedDate?: string | null | undefined
}

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toIso(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

export function MonthCalendar({ data, colorFn, legendLabel, legendMax = 10, onDayClick, selectedDate }: MonthCalendarProps) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const cells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const startDow = (firstDay.getDay() + 6) % 7
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

    const result: { day: number | null; iso: string | null }[] = []
    for (let i = 0; i < startDow; i++) result.push({ day: null, iso: null })
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ day: d, iso: toIso(viewYear, viewMonth, d) })
    }
    return result
  }, [viewYear, viewMonth])

  const todayIso = toIso(today.getFullYear(), today.getMonth(), today.getDate())

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11) }
    else setViewMonth(viewMonth - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0) }
    else setViewMonth(viewMonth + 1)
  }

  return (
    <div className="rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={prevMonth} className="rounded-(--radius-md) px-2 py-1 text-sm text-(--color-text-secondary) hover:bg-(--color-bg-subtle)">‹</button>
        <h3 className="text-sm font-semibold text-(--color-text-primary)">{MONTH_NAMES[viewMonth]} {viewYear}</h3>
        <button type="button" onClick={nextMonth} className="rounded-(--radius-md) px-2 py-1 text-sm text-(--color-text-secondary) hover:bg-(--color-bg-subtle)">›</button>
      </div>

      {/* Day names */}
      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {DAY_NAMES.map((name) => (
          <div key={name} className="py-1 text-xs font-medium text-(--color-text-muted)">{name}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (cell.day === null) return <div key={`empty-${i}`} className="aspect-square" />

          const entry = cell.iso ? data.get(cell.iso) : undefined
          const isToday = cell.iso === todayIso
          const isSelected = cell.iso === selectedDate

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => cell.iso && onDayClick?.(cell.iso)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-(--radius-md) text-xs transition-colors ${
                isToday ? 'ring-1 ring-(--color-brand)' : ''
              } ${
                isSelected ? 'ring-2 ring-(--color-brand)' : ''
              } ${
                entry ? 'text-white font-bold hover:opacity-80' : 'text-(--color-text-secondary) hover:bg-(--color-bg-subtle)'
              }`}
              style={entry ? { backgroundColor: colorFn(entry.value) } : undefined}
              title={entry?.label}
            >
              <span>{cell.day}</span>
              {entry && entry.count != null && entry.count > 1 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-(--color-bg-elevated) text-[9px] font-bold text-(--color-text-primary)">
                  {entry.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-3 text-xs text-(--color-text-muted)">
        <div className="flex items-center gap-1">
          <div className="h-3 w-12 rounded-sm" style={{ background: `linear-gradient(to right, ${colorFn(1)}, ${colorFn(legendMax)})` }} />
          <span>0 — {legendMax}</span>
        </div>
        <span>{legendLabel}</span>
      </div>
    </div>
  )
}
