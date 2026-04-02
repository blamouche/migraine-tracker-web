import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useFoodStore } from '@/stores/foodStore'
import { FoodCalendar } from '@/components/alimentaire/FoodCalendar'
import { MEAL_TYPE_LABELS, STRESS_LABELS, SLEEP_LABELS } from '@/types/alimentaire'
import type { FoodEntry } from '@/types/alimentaire'

type SortOrder = 'date-desc' | 'date-asc'
type StatusFilter = 'all' | 'complet' | 'incomplet'

export function FoodHistoryPage() {
  const navigate = useNavigate()
  const { entries, dailyFactors, isLoading, loadEntries, loadDailyFactors, deleteEntry } = useFoodStore()

  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [periodFrom, setPeriodFrom] = useState('')
  const [periodTo, setPeriodTo] = useState('')
  const [expandedDate, setExpandedDate] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    if (entries.length === 0) loadEntries()
    if (dailyFactors.length === 0) loadDailyFactors()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Group entries by date
  const grouped = useMemo(() => {
    const filtered = entries.filter((e) => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return false
      if (periodFrom && e.date < periodFrom) return false
      if (periodTo && e.date > periodTo) return false
      return true
    })

    const byDate = new Map<string, FoodEntry[]>()
    for (const entry of filtered) {
      const list = byDate.get(entry.date) ?? []
      list.push(entry)
      byDate.set(entry.date, list)
    }

    // Sort meals within each day by time
    for (const meals of byDate.values()) {
      meals.sort((a, b) => a.time.localeCompare(b.time))
    }

    const dates = Array.from(byDate.keys())
    dates.sort((a, b) =>
      sortOrder === 'date-desc' ? b.localeCompare(a) : a.localeCompare(b),
    )

    return dates.map((date) => ({
      date,
      meals: byDate.get(date)!,
      factors: dailyFactors.find((f) => f.date === date),
    }))
  }, [entries, dailyFactors, sortOrder, statusFilter, periodFrom, periodTo])

  const totalEntries = grouped.reduce((sum, g) => sum + g.meals.length, 0)

  const handleDelete = async (entry: FoodEntry) => {
    await deleteEntry(entry)
    setDeleteConfirm(null)
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Journal alimentaire</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/alimentaire/nouveau')}
              className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm font-medium text-(--color-text-inverse) hover:bg-(--color-brand-hover)"
            >
              + Nouveau repas
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-(--color-text-muted) hover:text-(--color-text-primary)"
            >
              Retour
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="mt-4">
          <FoodCalendar
            entries={entries}
            dailyFactors={dailyFactors}
            onDayClick={(date) => {
              if (selectedDate === date) {
                setSelectedDate(null)
                setPeriodFrom('')
                setPeriodTo('')
              } else {
                setSelectedDate(date)
                setPeriodFrom(date)
                setPeriodTo(date)
              }
            }}
            selectedDate={selectedDate}
          />
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-3 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
          <div>
            <label htmlFor="filter-status" className="text-xs text-(--color-text-muted)">Statut</label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="mt-1 block rounded-(--radius-sm) border border-(--color-border) bg-(--color-bg-base) px-2 py-1 text-sm"
            >
              <option value="all">Tous</option>
              <option value="complet">Complets</option>
              <option value="incomplet">Incomplets</option>
            </select>
          </div>

          <div>
            <label htmlFor="filter-from" className="text-xs text-(--color-text-muted)">Du</label>
            <input
              id="filter-from"
              type="date"
              value={periodFrom}
              onChange={(e) => setPeriodFrom(e.target.value)}
              className="mt-1 block rounded-(--radius-sm) border border-(--color-border) bg-(--color-bg-base) px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label htmlFor="filter-to" className="text-xs text-(--color-text-muted)">Au</label>
            <input
              id="filter-to"
              type="date"
              value={periodTo}
              onChange={(e) => setPeriodTo(e.target.value)}
              className="mt-1 block rounded-(--radius-sm) border border-(--color-border) bg-(--color-bg-base) px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label htmlFor="sort-order" className="text-xs text-(--color-text-muted)">Tri</label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="mt-1 block rounded-(--radius-sm) border border-(--color-border) bg-(--color-bg-base) px-2 py-1 text-sm"
            >
              <option value="date-desc">Plus récent</option>
              <option value="date-asc">Plus ancien</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="mt-4 text-xs text-(--color-text-muted)">
          {totalEntries} repas sur {grouped.length} jour{grouped.length !== 1 ? 's' : ''}
        </p>

        {/* List grouped by date */}
        {isLoading ? (
          <p className="mt-8 text-center text-(--color-text-muted)">Chargement…</p>
        ) : grouped.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-(--color-text-secondary)">Aucune saisie trouvée</p>
            <button
              type="button"
              onClick={() => navigate('/alimentaire/nouveau')}
              className="mt-4 rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) hover:bg-(--color-brand-hover)"
            >
              Enregistrer mon premier repas
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {grouped.map(({ date, meals, factors }) => (
              <div key={date} className="rounded-(--radius-xl) bg-(--color-bg-elevated) overflow-hidden">
                {/* Day header */}
                <button
                  type="button"
                  onClick={() => setExpandedDate(expandedDate === date ? null : date)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-(--color-bg-subtle)"
                >
                  <div>
                    <p className="text-sm font-semibold">{formatDateFr(date)}</p>
                    <p className="text-xs text-(--color-text-muted)">
                      {meals.length} repas
                      {factors && ` · Stress ${factors.stress}/5 · Sommeil ${factors.sleepQuality}/5`}
                    </p>
                  </div>
                  <span className="text-(--color-text-muted)">
                    {expandedDate === date ? '▲' : '▼'}
                  </span>
                </button>

                {/* Day details */}
                {expandedDate === date && (
                  <div className="border-t border-(--color-border) px-4 py-3 space-y-3">
                    {/* Daily factors summary */}
                    {factors && (
                      <div className="flex flex-wrap gap-3 rounded-(--radius-md) bg-(--color-bg-subtle) px-3 py-2 text-xs">
                        <span>Stress : <strong>{STRESS_LABELS[factors.stress]}</strong> ({factors.stress}/5)</span>
                        <span>Sommeil : <strong>{SLEEP_LABELS[factors.sleepQuality]}</strong> ({factors.sleepQuality}/5)</span>
                        <span>Hydratation : <strong>{factors.hydration === 'bonne' ? 'Bonne' : 'Insuffisante'}</strong></span>
                      </div>
                    )}

                    {/* Meals list */}
                    <ul className="space-y-2">
                      {meals.map((meal) => (
                        <li
                          key={meal.id}
                          className="rounded-(--radius-md) border border-(--color-border) p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <MealTypeIcon type={meal.mealType} />
                              <div>
                                <p className="text-sm font-medium">
                                  {MEAL_TYPE_LABELS[meal.mealType]} — {meal.time}
                                </p>
                                <p className="text-xs text-(--color-text-muted)">
                                  {meal.foods.length > 0
                                    ? meal.foods.slice(0, 3).join(', ') + (meal.foods.length > 3 ? ` +${meal.foods.length - 3}` : '')
                                    : 'Aucun aliment saisi'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {meal.status === 'incomplet' && (
                                <span className="rounded-(--radius-full) bg-(--color-warning-light) px-2 py-0.5 text-xs text-(--color-warning)">
                                  Incomplet
                                </span>
                              )}
                            </div>
                          </div>

                          {meal.notes && (
                            <p className="mt-2 text-xs text-(--color-text-secondary)">
                              {meal.notes}
                            </p>
                          )}

                          <div className="mt-3 flex gap-2 border-t border-(--color-border) pt-3">
                            <button
                              type="button"
                              onClick={() => navigate(`/alimentaire/${meal.id}/edit`)}
                              className="rounded-(--radius-md) bg-(--color-brand) px-3 py-1.5 text-xs font-medium text-(--color-text-inverse) hover:bg-(--color-brand-hover)"
                            >
                              {meal.status === 'incomplet' ? 'Compléter' : 'Modifier'}
                            </button>
                            {deleteConfirm === meal.id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-(--color-danger)">Supprimer ?</span>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(meal)}
                                  className="rounded-(--radius-md) bg-(--color-danger) px-2 py-1.5 text-xs text-white"
                                >
                                  Oui
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirm(null)}
                                  className="text-xs text-(--color-text-muted)"
                                >
                                  Non
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirm(meal.id)}
                                className="rounded-(--radius-md) border border-(--color-danger) px-3 py-1.5 text-xs text-(--color-danger) hover:bg-(--color-danger-light)"
                              >
                                Supprimer
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function MealTypeIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    'petit-dejeuner': '\u2600\ufe0f',
    'dejeuner': '\ud83c\udf7d\ufe0f',
    'diner': '\ud83c\udf19',
    'collation': '\ud83c\udf4e',
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-bg-subtle) text-base">
      {icons[type] ?? '\ud83c\udf74'}
    </span>
  )
}

function formatDateFr(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
