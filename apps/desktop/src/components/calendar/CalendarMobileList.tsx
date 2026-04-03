import type { ConsolidatedDayData } from './calendarHelpers'
import { getModuleMeta, getIndicatorLabel, getDaysInMonth } from './calendarHelpers'

interface CalendarMobileListProps {
  year: number
  month: number
  data: Map<string, ConsolidatedDayData>
  onDayClick: (date: string) => void
  onQuickAdd: (date: string) => void
}

const DAY_NAMES_SHORT = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam']

export function CalendarMobileList({ year, month, data, onDayClick, onQuickAdd }: CalendarMobileListProps) {
  const days = getDaysInMonth(year, month)
  const today = new Date()
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div className="space-y-1">
      {days.map((day) => {
        const dayData = data.get(day)
        const indicators = dayData?.indicators ?? []
        const hasData = indicators.length > 0
        const d = new Date(day + 'T00:00:00')
        const isFuture = day > todayIso
        const isToday = day === todayIso

        return (
          <button
            key={day}
            type="button"
            onClick={() => (hasData ? onDayClick(day) : !isFuture ? onQuickAdd(day) : undefined)}
            disabled={isFuture}
            className={`flex w-full items-center gap-3 rounded-(--radius-md) border px-3 py-2.5 text-left transition-colors ${
              isToday
                ? 'border-(--color-brand)/40 bg-(--color-bg-interactive)'
                : hasData
                  ? 'border-(--color-border) bg-(--color-bg-elevated) hover:bg-(--color-bg-subtle)'
                  : 'border-(--color-border) bg-(--color-bg-subtle)/50'
            } ${isFuture ? 'opacity-40' : ''}`}
          >
            {/* Date column */}
            <div className="flex w-12 shrink-0 flex-col items-center">
              <span className="text-[10px] uppercase text-(--color-text-muted)">
                {DAY_NAMES_SHORT[d.getDay()]}
              </span>
              <span
                className={`text-lg font-semibold ${
                  isToday
                    ? 'flex h-7 w-7 items-center justify-center rounded-full bg-(--color-brand) text-white'
                    : 'text-(--color-text-primary)'
                }`}
              >
                {d.getDate()}
              </span>
            </div>

            {/* Indicators */}
            <div className="flex-1 min-w-0">
              {hasData ? (
                <div className="flex flex-wrap gap-1.5">
                  {indicators.map((ind) => {
                    const meta = getModuleMeta(ind.module)
                    return (
                      <span
                        key={ind.module}
                        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                      >
                        <span>{meta.icon}</span>
                        <span className="truncate">{getIndicatorLabel(ind)}</span>
                      </span>
                    )
                  })}
                </div>
              ) : !isFuture ? (
                <span className="text-xs text-(--color-text-muted)">Aucune donnée — appuyez pour ajouter</span>
              ) : null}
            </div>

            {/* Arrow */}
            {hasData && (
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="shrink-0 text-(--color-text-muted)"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
          </button>
        )
      })}
    </div>
  )
}
