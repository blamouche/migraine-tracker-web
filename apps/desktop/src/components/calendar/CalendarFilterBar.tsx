import type { CalendarModule } from './calendarHelpers'
import { MODULE_META } from './calendarHelpers'

interface CalendarFilterBarProps {
  enabledModules: Set<CalendarModule>
  activeFilters: Set<CalendarModule>
  onToggleFilter: (module: CalendarModule) => void
}

export function CalendarFilterBar({ enabledModules, activeFilters, onToggleFilter }: CalendarFilterBarProps) {
  const visibleModules = MODULE_META.filter((m) => enabledModules.has(m.id))

  return (
    <div className="flex flex-wrap gap-2">
      {visibleModules.map((mod) => {
        const active = activeFilters.has(mod.id)
        return (
          <button
            key={mod.id}
            type="button"
            onClick={() => onToggleFilter(mod.id)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? 'border-transparent text-white'
                : 'border-(--color-border) bg-(--color-bg-elevated) text-(--color-text-muted) hover:border-(--color-text-muted)'
            }`}
            style={active ? { backgroundColor: mod.color } : undefined}
            aria-pressed={active}
          >
            <span className="text-sm">{mod.icon}</span>
            <span>{mod.label}</span>
          </button>
        )
      })}
    </div>
  )
}
