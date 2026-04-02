import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import type { CalendarModule } from './calendarHelpers'
import { getQuickAddOptions, getModuleMeta } from './calendarHelpers'

interface CalendarQuickAddProps {
  date: string
  enabledModules: Set<CalendarModule>
  onClose: () => void
  anchorRect?: DOMRect | null
}

export function CalendarQuickAdd({ date, enabledModules, onClose, anchorRect }: CalendarQuickAddProps) {
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)
  const options = getQuickAddOptions(enabledModules)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const dayLabel = new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  })

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />

      <div
        ref={ref}
        className="fixed z-50 w-56 rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg-elevated) p-1 shadow-xl"
        style={
          anchorRect
            ? {
                top: Math.min(anchorRect.bottom + 4, window.innerHeight - 300),
                left: Math.min(anchorRect.left, window.innerWidth - 240),
              }
            : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
        }
        role="menu"
        aria-label={`Ajouter une entrée pour le ${dayLabel}`}
      >
        <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-(--color-text-muted)">
          Ajouter — {dayLabel}
        </p>
        {options.map((opt) => {
          const meta = getModuleMeta(opt.module)
          return (
            <button
              key={opt.module}
              type="button"
              role="menuitem"
              onClick={() => {
                // Navigate with date param in search string
                navigate(`${opt.path}?date=${date}`)
                onClose()
              }}
              className="flex w-full items-center gap-2.5 rounded-(--radius-md) px-2 py-2 text-sm text-(--color-text-primary) transition-colors hover:bg-(--color-bg-subtle)"
            >
              <span className="text-sm" style={{ color: meta.color }}>{meta.icon}</span>
              <span>{opt.label}</span>
            </button>
          )
        })}
        {options.length === 0 && (
          <p className="px-2 py-2 text-xs text-(--color-text-muted)">Aucun module activé</p>
        )}
      </div>
    </>
  )
}
