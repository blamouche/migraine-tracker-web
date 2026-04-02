import { useState, useMemo } from 'react'
import type { CrisisEntry } from '@/types/crisis'

interface CrisisCalendarProps {
  crises: CrisisEntry[]
  onDayClick?: (date: string) => void
}

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function intensityColor(intensity: number): string {
  if (intensity <= 2) return 'var(--color-pain-1)'
  if (intensity <= 4) return 'var(--color-pain-3)'
  if (intensity <= 6) return 'var(--color-pain-5)'
  if (intensity <= 8) return 'var(--color-pain-7)'
  return 'var(--color-pain-9)'
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toIso(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

export function CrisisCalendar({ crises, onDayClick }: CrisisCalendarProps) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  // Index crises by date — keep max intensity per day
  const crisisMap = useMemo(() => {
    const map = new Map<string, { intensity: number; count: number }>()
    for (const c of crises) {
      const existing = map.get(c.date)
      if (existing) {
        existing.intensity = Math.max(existing.intensity, c.intensity)
        existing.count += 1
      } else {
        map.set(c.date, { intensity: c.intensity, count: 1 })
      }
    }
    return map
  }, [crises])

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1)
  // Monday = 0, Sunday = 6
  const startDow = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells: { day: number | null; iso: string | null }[] = []
  // Leading empty cells
  for (let i = 0; i < startDow; i++) cells.push({ day: null, iso: null })
  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, iso: toIso(viewYear, viewMonth, d) })
  }

  const todayIso = toIso(today.getFullYear(), today.getMonth(), today.getDate())

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1)
      setViewMonth(11)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1)
      setViewMonth(0)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  return (
    <div className="rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
      {/* Header: month navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-(--radius-md) px-2 py-1 text-sm text-(--color-text-secondary) hover:bg-(--color-bg-subtle)"
        >
          ‹
        </button>
        <h3 className="text-sm font-semibold text-(--color-text-primary)">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded-(--radius-md) px-2 py-1 text-sm text-(--color-text-secondary) hover:bg-(--color-bg-subtle)"
        >
          ›
        </button>
      </div>

      {/* Day names */}
      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {DAY_NAMES.map((name) => (
          <div key={name} className="text-xs font-medium text-(--color-text-muted) py-1">
            {name}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (cell.day === null) {
            return <div key={`empty-${i}`} className="aspect-square" />
          }

          const crisis = cell.iso ? crisisMap.get(cell.iso) : undefined
          const isToday = cell.iso === todayIso

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => cell.iso && onDayClick?.(cell.iso)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-(--radius-md) text-xs transition-colors ${
                isToday
                  ? 'ring-1 ring-(--color-brand)'
                  : ''
              } ${
                crisis
                  ? 'text-white font-bold hover:opacity-80'
                  : 'text-(--color-text-secondary) hover:bg-(--color-bg-subtle)'
              }`}
              style={crisis ? { backgroundColor: intensityColor(crisis.intensity) } : undefined}
              title={
                crisis
                  ? `${cell.day}/${pad(viewMonth + 1)} — Intensité ${crisis.intensity}/10${crisis.count > 1 ? ` (${crisis.count} crises)` : ''}`
                  : undefined
              }
            >
              <span>{cell.day}</span>
              {crisis && crisis.count > 1 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-(--color-bg-elevated) text-[9px] font-bold text-(--color-text-primary)">
                  {crisis.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-3 text-xs text-(--color-text-muted)">
        <div className="flex items-center gap-1">
          <div
            className="h-3 w-12 rounded-sm"
            style={{ background: 'linear-gradient(to right, var(--color-pain-1), var(--color-pain-9))' }}
          />
          <span>1 — 10</span>
        </div>
        <span>Intensité de la crise</span>
      </div>
    </div>
  )
}
