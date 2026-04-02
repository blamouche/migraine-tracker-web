import { useState, useMemo, useCallback, useRef } from 'react'
import { useCrisisStore } from '@/stores/crisisStore'
import { useDailyPainStore } from '@/stores/dailyPainStore'
import { useFoodStore } from '@/stores/foodStore'
import { useTreatmentStore } from '@/stores/treatmentStore'
import { useSportStore } from '@/stores/sportStore'
import { useTransportStore } from '@/stores/transportStore'
import { useCycleStore } from '@/stores/cycleStore'
import { useChargeMentaleStore } from '@/stores/chargeMentaleStore'
import { useConsultationStore } from '@/stores/consultationStore'
import { useEnvironnementStore } from '@/stores/environnementStore'
import { CalendarDayCell } from './CalendarDayCell'
import { CalendarFilterBar } from './CalendarFilterBar'
import { CalendarDayDrawer } from './CalendarDayDrawer'
import { CalendarCompletionBanner } from './CalendarCompletionBanner'
import { CalendarQuickAdd } from './CalendarQuickAdd'
import { CalendarMobileList } from './CalendarMobileList'
import { CalendarLegend } from './CalendarLegend'
import {
  buildConsolidatedData,
  computeCompletionRate,
  MODULE_META,
  type CalendarModule,
  type AllStoreData,
} from './calendarHelpers'

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function pad(n: number) {
  return String(n).padStart(2, '0')
}

// Session storage key for filter persistence (US-28-03)
const FILTERS_KEY = 'calendar-filters'

function loadFilters(): CalendarModule[] | null {
  try {
    const raw = sessionStorage.getItem(FILTERS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveFilters(filters: CalendarModule[]) {
  sessionStorage.setItem(FILTERS_KEY, JSON.stringify(filters))
}

export function ConsolidatedCalendar() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [quickAddDate, setQuickAddDate] = useState<string | null>(null)
  const [quickAddRect, setQuickAddRect] = useState<DOMRect | null>(null)
  const [showLegend, setShowLegend] = useState(false)
  const [showYearPicker, setShowYearPicker] = useState(false)

  // All enabled modules (for now all — E29 will gate this)
  const enabledModules = useMemo<Set<CalendarModule>>(
    () => new Set(MODULE_META.map((m) => m.id)),
    [],
  )

  // Active filters (US-28-03) — persisted in sessionStorage
  const [activeFilters, setActiveFilters] = useState<Set<CalendarModule>>(() => {
    const saved = loadFilters()
    return saved ? new Set(saved.filter((m) => enabledModules.has(m as CalendarModule))) : new Set(enabledModules)
  })

  const handleToggleFilter = useCallback((mod: CalendarModule) => {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(mod)) next.delete(mod)
      else next.add(mod)
      saveFilters([...next])
      return next
    })
  }, [])

  // Store data
  const crises = useCrisisStore((s) => s.crises)
  const pains = useDailyPainStore((s) => s.entries)
  const foods = useFoodStore((s) => s.entries)
  const treatments = useTreatmentStore((s) => s.treatments)
  const sports = useSportStore((s) => s.entries)
  const transports = useTransportStore((s) => s.entries)
  const cycles = useCycleStore((s) => s.entries)
  const charges = useChargeMentaleStore((s) => s.entries)
  const consultations = useConsultationStore((s) => s.entries)
  const weather = useEnvironnementStore((s) => s.entries)

  const storeData = useMemo<AllStoreData>(
    () => ({ crises, pains, foods, treatments, sports, transports, cycles, charges, consultations, weather }),
    [crises, pains, foods, treatments, sports, transports, cycles, charges, consultations, weather],
  )

  // Consolidated data for current view month
  const consolidatedData = useMemo(
    () => buildConsolidatedData(storeData, viewYear, viewMonth, activeFilters),
    [storeData, viewYear, viewMonth, activeFilters],
  )

  // Completion rate (US-28-04)
  const completion = useMemo(
    () => computeCompletionRate(consolidatedData, viewYear, viewMonth),
    [consolidatedData, viewYear, viewMonth],
  )

  // Calendar grid cells
  const cells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const startDow = (firstDay.getDay() + 6) % 7 // Monday = 0
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

    const result: { day: number | null; iso: string | null }[] = []
    for (let i = 0; i < startDow; i++) result.push({ day: null, iso: null })
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ day: d, iso: `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}` })
    }
    return result
  }, [viewYear, viewMonth])

  const todayIso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

  // Navigation
  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11) }
    else setViewMonth((m) => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0) }
    else setViewMonth((m) => m + 1)
  }
  function goToToday() {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
  }

  // Day interactions
  const handleDayClick = useCallback((date: string) => {
    setSelectedDate(date)
  }, [])

  const handleQuickAdd = useCallback((date: string) => {
    setQuickAddDate(date)
    // Try to get the button's rect for positioning
    const btn = document.querySelector(`[aria-label="${date}"]`) as HTMLElement | null
    setQuickAddRect(btn?.getBoundingClientRect() ?? null)
  }, [])

  // Keyboard navigation (US-28-06)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Arrow key navigation across day cells is handled natively by tab order
      // Enter opens detail
      if (e.key === 'Enter' && document.activeElement) {
        const ariaLabel = (document.activeElement as HTMLElement).getAttribute('aria-label')
        if (ariaLabel && /^\d{4}-\d{2}-\d{2}/.test(ariaLabel)) {
          const date = ariaLabel.slice(0, 10)
          const dayData = consolidatedData.get(date)
          if (dayData && dayData.indicators.length > 0) {
            setSelectedDate(date)
          }
        }
      }
    },
    [consolidatedData],
  )

  // Year picker values
  const yearOptions = useMemo(() => {
    const years: number[] = []
    for (let y = today.getFullYear() - 5; y <= today.getFullYear() + 1; y++) {
      years.push(y)
    }
    return years
  }, [])

  return (
    <div className="space-y-4">
      {/* Completion banner (US-28-04) */}
      <CalendarCompletionBanner
        filledDays={completion.filledDays}
        totalDays={completion.totalDays}
        rate={completion.rate}
      />

      {/* Filter bar (US-28-03) */}
      <CalendarFilterBar
        enabledModules={enabledModules}
        activeFilters={activeFilters}
        onToggleFilter={handleToggleFilter}
      />

      {/* Month navigation (US-28-02) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-(--radius-md) text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-subtle)"
            aria-label="Mois précédent"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setShowYearPicker(!showYearPicker)}
            className="text-base font-semibold text-(--color-text-primary) hover:text-(--color-brand)"
          >
            {MONTH_NAMES[viewMonth]} {viewYear}
          </button>

          <button
            type="button"
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-(--radius-md) text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-subtle)"
            aria-label="Mois suivant"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToToday}
            className="rounded-(--radius-md) border border-(--color-border) px-3 py-1.5 text-xs font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-subtle)"
          >
            Aujourd'hui
          </button>
          <button
            type="button"
            onClick={() => setShowLegend(!showLegend)}
            className="flex h-8 w-8 items-center justify-center rounded-(--radius-md) text-(--color-text-muted) transition-colors hover:bg-(--color-bg-subtle)"
            aria-label={showLegend ? 'Masquer la légende' : 'Afficher la légende'}
            aria-expanded={showLegend}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
        </div>
      </div>

      {/* Year/month picker dropdown (US-28-02) */}
      {showYearPicker && (
        <div className="flex gap-2 rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) p-3">
          <select
            value={viewMonth}
            onChange={(e) => { setViewMonth(Number(e.target.value)); setShowYearPicker(false) }}
            className="flex-1 rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-2 py-1.5 text-sm text-(--color-text-primary)"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i} value={i}>{name}</option>
            ))}
          </select>
          <select
            value={viewYear}
            onChange={(e) => { setViewYear(Number(e.target.value)); setShowYearPicker(false) }}
            className="w-24 rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-2 py-1.5 text-sm text-(--color-text-primary)"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      )}

      {/* Legend panel */}
      {showLegend && <CalendarLegend enabledModules={enabledModules} />}

      {/* Desktop: Calendar grid (US-28-01) — hidden on mobile */}
      <div className="hidden md:block" onKeyDown={handleKeyDown}>
        {/* Day names header */}
        <div className="grid grid-cols-7 gap-1">
          {DAY_NAMES.map((name) => (
            <div key={name} className="py-2 text-center text-xs font-medium text-(--color-text-muted)">
              {name}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (cell.day === null) return <div key={`empty-${i}`} className="min-h-[72px]" />

            const dayData = consolidatedData.get(cell.iso!)
            const isFuture = cell.iso! > todayIso

            return (
              <CalendarDayCell
                key={cell.iso}
                day={cell.day}
                iso={cell.iso!}
                dayData={dayData}
                isToday={cell.iso === todayIso}
                isSelected={cell.iso === selectedDate}
                isFuture={isFuture}
                onDayClick={handleDayClick}
                onQuickAdd={handleQuickAdd}
                enabledModules={activeFilters}
              />
            )
          })}
        </div>
      </div>

      {/* Mobile: List view (US-28-06) — visible on mobile only */}
      <div className="md:hidden">
        <CalendarMobileList
          year={viewYear}
          month={viewMonth}
          data={consolidatedData}
          onDayClick={handleDayClick}
          onQuickAdd={handleQuickAdd}
        />
      </div>

      {/* Day detail drawer (US-28-02) */}
      {selectedDate && (
        <CalendarDayDrawer
          date={selectedDate}
          dayData={consolidatedData.get(selectedDate)}
          onClose={() => setSelectedDate(null)}
        />
      )}

      {/* Quick add menu (US-28-05) */}
      {quickAddDate && (
        <CalendarQuickAdd
          date={quickAddDate}
          enabledModules={activeFilters}
          onClose={() => setQuickAddDate(null)}
          anchorRect={quickAddRect}
        />
      )}
    </div>
  )
}
