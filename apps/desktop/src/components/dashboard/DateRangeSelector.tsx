import { useState, useRef, useEffect } from 'react'
import { useDashboardStore } from '@/stores/dashboardStore'
import type { DateRangePreset } from '@/types/dashboard'

const PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: '7d', label: '7j' },
  { value: '1m', label: '1 mois' },
  { value: '3m', label: '3 mois' },
  { value: '6m', label: '6 mois' },
  { value: '1y', label: '1 an' },
  { value: 'ytd', label: 'Cette année' },
  { value: 'all', label: 'Tout' },
]

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function DateRangeSelector() {
  const { globalPreset, globalCustomRange, setPreset, setCustomRange } = useDashboardStore()
  const [showCustom, setShowCustom] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  const today = formatDate(new Date())
  const [customFrom, setCustomFrom] = useState(
    globalCustomRange?.from ?? formatDate(new Date(Date.now() - 90 * 86400000)),
  )
  const [customTo, setCustomTo] = useState(globalCustomRange?.to ?? today)

  useEffect(() => {
    if (globalCustomRange) {
      setCustomFrom(globalCustomRange.from)
      setCustomTo(globalCustomRange.to)
    }
  }, [globalCustomRange])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowCustom(false)
      }
    }
    if (showCustom) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCustom])

  const isCustomActive = globalPreset === null && globalCustomRange !== null

  function handleApplyCustom() {
    if (customFrom && customTo && customFrom <= customTo) {
      setCustomRange({ from: customFrom, to: customTo })
      setShowCustom(false)
    }
  }

  const customLabel = isCustomActive && globalCustomRange
    ? `${formatDisplayDate(globalCustomRange.from)} – ${formatDisplayDate(globalCustomRange.to)}`
    : 'Personnalisé'

  return (
    <div className="flex items-center gap-1">
      {PRESETS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => {
            setPreset(value)
            setShowCustom(false)
          }}
          className={`rounded-(--radius-md) px-3 py-1 text-xs font-medium transition-colors ${
            globalPreset === value
              ? 'bg-(--color-brand) text-(--color-text-inverse)'
              : 'bg-(--color-bg-subtle) text-(--color-text-secondary) hover:bg-(--color-bg-interactive)'
          }`}
        >
          {label}
        </button>
      ))}

      {/* Custom date range button + popover */}
      <div className="relative" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className={`rounded-(--radius-md) px-3 py-1 text-xs font-medium transition-colors ${
            isCustomActive
              ? 'bg-(--color-brand) text-(--color-text-inverse)'
              : 'bg-(--color-bg-subtle) text-(--color-text-secondary) hover:bg-(--color-bg-interactive)'
          }`}
        >
          {customLabel}
        </button>

        {showCustom && (
          <div className="absolute right-0 top-full z-50 mt-2 rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg-elevated) p-4 shadow-lg">
            <p className="mb-3 text-xs font-semibold text-(--color-text-primary)">
              Plage personnalisée
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs text-(--color-text-secondary)">
                Du
                <input
                  type="date"
                  value={customFrom}
                  max={customTo}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="mt-1 block rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-primary) px-2 py-1 text-xs text-(--color-text-primary)"
                />
              </label>
              <label className="text-xs text-(--color-text-secondary)">
                Au
                <input
                  type="date"
                  value={customTo}
                  min={customFrom}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="mt-1 block rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-primary) px-2 py-1 text-xs text-(--color-text-primary)"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={handleApplyCustom}
              disabled={!customFrom || !customTo || customFrom > customTo}
              className="mt-3 w-full rounded-(--radius-md) bg-(--color-brand) px-3 py-1.5 text-xs font-medium text-(--color-text-inverse) transition-colors hover:opacity-90 disabled:opacity-50"
            >
              Appliquer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
