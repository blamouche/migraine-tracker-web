import { useMemo, useState, useCallback } from 'react'
import type { ConsolidatedDayData, DayIndicator, CalendarModule } from './calendarHelpers'
import { getModuleMeta, getIndicatorLabel } from './calendarHelpers'

interface CalendarDayCellProps {
  day: number
  iso: string
  dayData: ConsolidatedDayData | undefined
  isToday: boolean
  isSelected: boolean
  isFuture: boolean
  onDayClick: (date: string) => void
  onQuickAdd: (date: string) => void
  enabledModules: Set<CalendarModule>
}

export function CalendarDayCell({
  day,
  iso,
  dayData,
  isToday,
  isSelected,
  isFuture,
  onDayClick,
  onQuickAdd,
  enabledModules,
}: CalendarDayCellProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const indicators = dayData?.indicators ?? []
  const hasData = indicators.length > 0
  const isEmpty = !hasData && !isFuture

  const tooltipText = useMemo(() => {
    if (indicators.length === 0) return 'Aucune donnée enregistrée'
    return indicators.map(getIndicatorLabel).join('\n')
  }, [indicators])

  const handleClick = useCallback(() => {
    if (hasData) {
      onDayClick(iso)
    } else if (isEmpty) {
      onQuickAdd(iso)
    }
  }, [hasData, isEmpty, iso, onDayClick, onQuickAdd])

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      className={`relative flex min-h-[72px] flex-col items-start rounded-(--radius-md) border p-1.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-(--color-brand) ${
        isSelected
          ? 'border-(--color-brand) bg-(--color-bg-interactive) ring-1 ring-(--color-brand)'
          : isToday
            ? 'border-(--color-brand)/40 bg-(--color-bg-elevated)'
            : isEmpty
              ? 'border-(--color-border) bg-(--color-bg-subtle)/50'
              : 'border-(--color-border) bg-(--color-bg-elevated) hover:border-(--color-brand)/30'
      } ${isFuture ? 'opacity-40' : ''}`}
      aria-label={`${iso}${hasData ? ` — ${indicators.length} indicateur${indicators.length > 1 ? 's' : ''}` : ''}`}
      tabIndex={0}
    >
      {/* Day number */}
      <span
        className={`text-[11px] font-semibold ${
          isToday
            ? 'flex h-5 w-5 items-center justify-center rounded-full bg-(--color-brand) text-white'
            : 'text-(--color-text-primary)'
        }`}
      >
        {day}
      </span>

      {/* Indicators */}
      {hasData && (
        <div className="mt-0.5 flex flex-wrap gap-0.5">
          {indicators.map((ind) => (
            <IndicatorBadge key={ind.module} indicator={ind} />
          ))}
        </div>
      )}

      {/* Empty day: "+" badge */}
      {isEmpty && (
        <span className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-(--color-bg-subtle) text-[10px] text-(--color-text-muted) transition-colors group-hover:bg-(--color-brand) group-hover:text-white">
          +
        </span>
      )}

      {/* Tooltip */}
      {showTooltip && !isFuture && (
        <div
          className="absolute -top-2 left-1/2 z-50 -translate-x-1/2 -translate-y-full whitespace-pre-line rounded-(--radius-md) bg-(--color-text-primary) px-2.5 py-1.5 text-[10px] leading-relaxed text-(--color-bg-elevated) shadow-lg"
          role="tooltip"
        >
          {tooltipText}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-(--color-text-primary)" />
        </div>
      )}
    </button>
  )
}

// ─── Indicator badges per module ───

function IndicatorBadge({ indicator }: { indicator: DayIndicator }) {
  const meta = getModuleMeta(indicator.module)

  switch (indicator.module) {
    case 'crisis':
      return (
        <span
          className="flex items-center gap-0.5 rounded-sm px-1 py-0.5 text-[9px] font-bold text-white"
          style={{ backgroundColor: meta.color }}
          title={getIndicatorLabel(indicator)}
        >
          {meta.icon} {indicator.intensity}
        </span>
      )

    case 'pain':
      return (
        <span
          className="flex h-1.5 w-6 rounded-full"
          style={{
            background: `linear-gradient(to right, #22c55e, ${indicator.niveau > 5 ? '#ef4444' : '#f97316'})`,
            opacity: 0.3 + (indicator.niveau / 10) * 0.7,
          }}
          title={getIndicatorLabel(indicator)}
        />
      )

    case 'food':
      return (
        <span
          className="text-[10px]"
          style={{ color: indicator.hasRiskFood ? '#ef4444' : meta.color }}
          title={getIndicatorLabel(indicator)}
        >
          {meta.icon}
        </span>
      )

    case 'treatment':
      return (
        <span
          className="text-[10px]"
          style={{ color: indicator.taken ? meta.color : '#9ca3af' }}
          title={getIndicatorLabel(indicator)}
        >
          {meta.icon}
        </span>
      )

    case 'sport':
      return (
        <span className="text-[10px]" style={{ color: meta.color }} title={getIndicatorLabel(indicator)}>
          {meta.icon}
        </span>
      )

    case 'transport':
      return (
        <span className="text-[10px]" style={{ color: meta.color }} title={getIndicatorLabel(indicator)}>
          {meta.icon}
        </span>
      )

    case 'cycle':
      return (
        <span className="text-[8px]" style={{ color: meta.color }} title={getIndicatorLabel(indicator)}>
          ●
        </span>
      )

    case 'chargeMentale': {
      const level = indicator.niveau <= 3 ? 'basse' : indicator.niveau <= 6 ? 'moy.' : 'haute'
      const barColor = indicator.niveau <= 3 ? '#22c55e' : indicator.niveau <= 6 ? '#f59e0b' : '#ef4444'
      return (
        <span
          className="flex items-center gap-0.5 text-[9px]"
          style={{ color: barColor }}
          title={getIndicatorLabel(indicator)}
        >
          {meta.icon}
          <span className="text-[8px]">{level}</span>
        </span>
      )
    }

    case 'consultation':
      return (
        <span
          className="rounded-sm px-1 py-0.5 text-[8px] font-semibold text-white"
          style={{ backgroundColor: meta.color }}
          title={getIndicatorLabel(indicator)}
        >
          RDV
        </span>
      )

    case 'weather':
      return (
        <span className="text-[10px]" style={{ color: meta.color }} title={getIndicatorLabel(indicator)}>
          {meta.icon}
        </span>
      )
  }
}
