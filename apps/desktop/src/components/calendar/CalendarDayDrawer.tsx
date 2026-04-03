import { useNavigate } from 'react-router'
import type { ConsolidatedDayData } from './calendarHelpers'
import { getModuleMeta, getIndicatorLabel, getEditRouteForModule } from './calendarHelpers'

interface CalendarDayDrawerProps {
  date: string
  dayData: ConsolidatedDayData | undefined
  onClose: () => void
}

const DAY_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const MONTH_NAMES = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

function formatDateFr(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

export function CalendarDayDrawer({ date, dayData, onClose }: CalendarDayDrawerProps) {
  const navigate = useNavigate()
  const indicators = dayData?.indicators ?? []

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-(--color-bg-elevated) shadow-xl"
        role="dialog"
        aria-label={`Détail du ${formatDateFr(date)}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--color-border) px-5 py-4">
          <div>
            <h2 className="text-base font-semibold capitalize text-(--color-text-primary)">
              {formatDateFr(date)}
            </h2>
            <p className="mt-0.5 text-xs text-(--color-text-muted)">
              {indicators.length > 0
                ? `${indicators.length} type${indicators.length > 1 ? 's' : ''} de données`
                : 'Aucune donnée enregistrée'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-(--radius-md) text-(--color-text-muted) transition-colors hover:bg-(--color-bg-subtle)"
            aria-label="Fermer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {indicators.length === 0 ? (
            <p className="text-sm text-(--color-text-muted)">
              Aucune donnée enregistrée pour cette journée.
            </p>
          ) : (
            <ul className="space-y-3">
              {indicators.map((ind) => {
                const meta = getModuleMeta(ind.module)
                const editRoute = getEditRouteForModule(ind.module)

                return (
                  <li
                    key={ind.module}
                    className="flex items-start gap-3 rounded-(--radius-md) border border-(--color-border) p-3 transition-colors hover:bg-(--color-bg-subtle)"
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
                      style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                    >
                      {meta.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-(--color-text-primary)">{meta.label}</p>
                      <p className="mt-0.5 text-xs text-(--color-text-secondary)">
                        {getIndicatorLabel(ind)}
                      </p>
                    </div>
                    {editRoute && (
                      <button
                        type="button"
                        onClick={() => navigate(editRoute)}
                        className="shrink-0 rounded-(--radius-md) px-2.5 py-1 text-xs font-medium text-(--color-brand) transition-colors hover:bg-(--color-brand)/10"
                      >
                        Voir
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}
