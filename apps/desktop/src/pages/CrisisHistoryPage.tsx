import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useCrisisStore } from '@/stores/crisisStore'
import { CrisisCalendar } from '@/components/crisis/CrisisCalendar'
import type { CrisisEntry } from '@/types/crisis'
import { INTENSITY_LABELS } from '@/types/crisis'

type SortOrder = 'date-desc' | 'date-asc' | 'intensity-desc'
type StatusFilter = 'all' | 'complet' | 'incomplet'

export function CrisisHistoryPage() {
  const navigate = useNavigate()
  const { crises, isLoading, loadCrises, deleteCrisis } = useCrisisStore()

  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [intensityFilter] = useState<[number, number]>([1, 10])
  const [periodFrom, setPeriodFrom] = useState('')
  const [periodTo, setPeriodTo] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (crises.length === 0) {
      loadCrises()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const result = crises.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (c.intensity < intensityFilter[0] || c.intensity > intensityFilter[1]) return false
      if (periodFrom && c.date < periodFrom) return false
      if (periodTo && c.date > periodTo) return false
      return true
    })

    result.sort((a, b) => {
      switch (sortOrder) {
        case 'date-desc': return b.date.localeCompare(a.date)
        case 'date-asc': return a.date.localeCompare(b.date)
        case 'intensity-desc': return b.intensity - a.intensity
        default: return 0
      }
    })

    return result
  }, [crises, sortOrder, statusFilter, intensityFilter, periodFrom, periodTo])

  const handleDelete = async (crisis: CrisisEntry) => {
    await deleteCrisis(crisis)
    setDeleteConfirm(null)
    setExpandedId(null)
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Historique des crises</h1>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-(--color-text-muted) hover:text-(--color-text-primary)"
          >
            Retour
          </button>
        </div>

        {/* Calendar */}
        <div className="mt-4">
          <CrisisCalendar
            crises={crises}
            onDayClick={(date) => {
              // Toggle: if already filtering on this day, clear the filter
              if (periodFrom === date && periodTo === date) {
                setPeriodFrom('')
                setPeriodTo('')
              } else {
                setPeriodFrom(date)
                setPeriodTo(date)
              }
            }}
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
              <option value="intensity-desc">Intensité ↓</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="mt-4 text-xs text-(--color-text-muted)">
          {filtered.length} crise{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* List */}
        {isLoading ? (
          <p className="mt-8 text-center text-(--color-text-muted)">Chargement…</p>
        ) : filtered.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-(--color-text-secondary)">Aucune crise trouvée</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {filtered.map((crisis) => (
              <li key={crisis.id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === crisis.id ? null : crisis.id)}
                  className="w-full rounded-(--radius-lg) bg-(--color-bg-elevated) p-4 text-left transition-colors hover:bg-(--color-bg-subtle)"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IntensityBadge intensity={crisis.intensity} />
                      <div>
                        <p className="text-sm font-medium">
                          {formatDateFr(crisis.date)} — {crisis.startTime}
                        </p>
                        <p className="text-xs text-(--color-text-muted)">
                          {INTENSITY_LABELS[crisis.intensity]}
                          {crisis.endTime && ` · ${crisis.startTime}–${crisis.endTime}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {crisis.status === 'incomplet' && (
                        <span className="rounded-(--radius-full) bg-(--color-warning-light) px-2 py-0.5 text-xs text-(--color-warning)">
                          Incomplet
                        </span>
                      )}
                      <span className="text-(--color-text-muted)">
                        {expandedId === crisis.id ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Expanded detail */}
                {expandedId === crisis.id && (
                  <div className="mt-1 rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg-elevated) p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <DetailRow label="Traitements" value={crisis.treatments.join(', ') || '—'} />
                      <DetailRow label="Symptômes" value={crisis.symptoms.join(', ') || '—'} />
                      <DetailRow label="Déclencheurs" value={crisis.triggers.join(', ') || '—'} />
                      <DetailRow label="Lieu" value={crisis.location ?? '—'} />
                      {crisis.hit6Score !== null && (
                        <DetailRow label="Score HIT-6" value={String(crisis.hit6Score)} />
                      )}
                      {crisis.notes && (
                        <div className="col-span-2">
                          <DetailRow label="Notes" value={crisis.notes} />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2 border-t border-(--color-border) pt-4">
                      <button
                        type="button"
                        onClick={() => navigate(`/crisis/${crisis.id}/edit`)}
                        className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm font-medium text-(--color-text-inverse) hover:bg-(--color-brand-hover)"
                      >
                        Modifier
                      </button>
                      {deleteConfirm === crisis.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-(--color-danger)">Confirmer la suppression ?</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(crisis)}
                            className="rounded-(--radius-md) bg-(--color-danger) px-3 py-2 text-sm text-white"
                          >
                            Oui, supprimer
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(null)}
                            className="text-sm text-(--color-text-muted)"
                          >
                            Non
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(crisis.id)}
                          className="rounded-(--radius-md) border border-(--color-danger) px-4 py-2 text-sm text-(--color-danger) hover:bg-(--color-danger-light)"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>

                    {deleteConfirm === crisis.id && (
                      <p className="mt-2 text-xs text-(--color-text-muted)">
                        Ce fichier sera déplacé dans la corbeille et supprimé définitivement dans 30 jours.
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}

function IntensityBadge({ intensity }: { intensity: number }) {
  const colors: Record<string, string> = {
    low: 'bg-(--color-pain-3) text-white',
    mid: 'bg-(--color-pain-5) text-white',
    high: 'bg-(--color-pain-7) text-white',
    max: 'bg-(--color-pain-9) text-white',
  }
  const tier = intensity <= 3 ? 'low' : intensity <= 5 ? 'mid' : intensity <= 8 ? 'high' : 'max'

  return (
    <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${colors[tier]}`}>
      {intensity}
    </span>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-(--color-text-muted)">{label}</p>
      <p className="mt-0.5 text-(--color-text-primary)">{value}</p>
    </div>
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
