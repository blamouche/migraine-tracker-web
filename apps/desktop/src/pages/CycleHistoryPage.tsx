import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useCycleStore } from '@/stores/cycleStore'
import { CycleCalendar } from '@/components/cycle/CycleCalendar'
import type { CycleEntry } from '@/types/cycle'
import {
  CYCLE_PHASE_LABELS,
  CONTRACEPTION_TYPE_LABELS,
  INTENSITE_SYMPTOMES_LABELS,
} from '@/types/cycle'

type SortOrder = 'date-desc' | 'date-asc'

export function CycleHistoryPage() {
  const navigate = useNavigate()
  const { entries, isLoading, loadCycles, deleteCycle } = useCycleStore()

  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    if (entries.length === 0) loadCycles()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const sorted = useMemo(() => {
    const filtered = selectedDate
      ? entries.filter((e) => {
          const start = e.dateDebut
          const end = new Date(new Date(e.dateDebut + 'T00:00:00').getTime() + (e.dureeJours - 1) * 86400000).toISOString().slice(0, 10)
          return selectedDate >= start && selectedDate <= end
        })
      : entries
    const result = [...filtered]
    result.sort((a, b) =>
      sortOrder === 'date-desc'
        ? b.dateDebut.localeCompare(a.dateDebut)
        : a.dateDebut.localeCompare(b.dateDebut),
    )
    return result
  }, [entries, sortOrder, selectedDate])

  const handleDelete = async (entry: CycleEntry) => {
    await deleteCycle(entry)
    setDeleteConfirm(null)
    setExpandedId(null)
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Historique des cycles</h1>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/cycle/nouveau')} className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm font-medium text-(--color-text-inverse) hover:bg-(--color-brand-hover)">
              + Nouveau
            </button>
            <button type="button" onClick={() => navigate('/')} className="text-sm text-(--color-text-muted) hover:text-(--color-text-primary)">
              Retour
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="mt-4">
          <CycleCalendar
            entries={entries}
            onDayClick={(date) => setSelectedDate(selectedDate === date ? null : date)}
            selectedDate={selectedDate}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-3 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
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

        <p className="mt-4 text-xs text-(--color-text-muted)">
          {sorted.length} cycle{sorted.length !== 1 ? 's' : ''}
        </p>

        {isLoading ? (
          <p className="mt-8 text-center text-(--color-text-muted)">Chargement…</p>
        ) : sorted.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-(--color-text-secondary)">Aucun cycle enregistré</p>
            <button type="button" onClick={() => navigate('/cycle/nouveau')} className="mt-4 rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) hover:bg-(--color-brand-hover)">
              Enregistrer mon premier cycle
            </button>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {sorted.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  className="w-full rounded-(--radius-lg) bg-(--color-bg-elevated) p-4 text-left transition-colors hover:bg-(--color-bg-subtle)"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-brand-light) text-sm font-bold text-(--color-brand)">
                        {entry.dureeJours}j
                      </span>
                      <div>
                        <p className="text-sm font-medium">{formatDateShort(entry.dateDebut)}</p>
                        <p className="text-xs text-(--color-text-muted)">
                          {CYCLE_PHASE_LABELS[entry.phase]} · Intensité {entry.intensiteSymptomes}/5
                          {entry.symptomes.length > 0 && ` · ${entry.symptomes.length} symptôme${entry.symptomes.length > 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-(--color-text-muted)">
                      {expandedId === entry.id ? '▲' : '▼'}
                    </span>
                  </div>
                </button>

                {expandedId === entry.id && (
                  <div className="mt-1 rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg-elevated) p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <DetailRow label="Durée" value={`${entry.dureeJours} jours`} />
                      <DetailRow label="Phase" value={CYCLE_PHASE_LABELS[entry.phase]} />
                      <DetailRow label="Intensité symptômes" value={`${entry.intensiteSymptomes}/5 — ${INTENSITE_SYMPTOMES_LABELS[entry.intensiteSymptomes]}`} />
                      <DetailRow label="Contraception" value={CONTRACEPTION_TYPE_LABELS[entry.contraception]} />
                      {entry.symptomes.length > 0 && (
                        <div className="col-span-2">
                          <DetailRow label="Symptômes" value={entry.symptomes.join(', ')} />
                        </div>
                      )}
                      {entry.notes && (
                        <div className="col-span-2">
                          <DetailRow label="Notes" value={entry.notes} />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2 border-t border-(--color-border) pt-4">
                      <button type="button" onClick={() => navigate(`/cycle/${entry.id}/edit`)} className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm font-medium text-(--color-text-inverse) hover:bg-(--color-brand-hover)">
                        Modifier
                      </button>
                      {deleteConfirm === entry.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-(--color-danger)">Confirmer la suppression ?</span>
                          <button type="button" onClick={() => handleDelete(entry)} className="rounded-(--radius-md) bg-(--color-danger) px-3 py-2 text-sm text-white">Oui, supprimer</button>
                          <button type="button" onClick={() => setDeleteConfirm(null)} className="text-sm text-(--color-text-muted)">Non</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setDeleteConfirm(entry.id)} className="rounded-(--radius-md) border border-(--color-danger) px-4 py-2 text-sm text-(--color-danger) hover:bg-(--color-danger-light)">
                          Supprimer
                        </button>
                      )}
                    </div>
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-(--color-text-muted)">{label}</p>
      <p className="mt-0.5 text-(--color-text-primary)">{value}</p>
    </div>
  )
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
