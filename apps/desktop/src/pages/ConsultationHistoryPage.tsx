import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useConsultationStore } from '@/stores/consultationStore'
import type { ConsultationEntry, ConsultationType } from '@/types/consultation'
import { CONSULTATION_TYPE_LABELS } from '@/types/consultation'

type SortOrder = 'date-desc' | 'date-asc'
type TypeFilter = 'all' | ConsultationType

export function ConsultationHistoryPage() {
  const navigate = useNavigate()
  const { entries, isLoading, loadConsultations, deleteConsultation } = useConsultationStore()

  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (entries.length === 0) loadConsultations()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const result = entries.filter((e) => {
      if (typeFilter !== 'all' && e.type !== typeFilter) return false
      return true
    })

    result.sort((a, b) =>
      sortOrder === 'date-desc'
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date),
    )

    return result
  }, [entries, sortOrder, typeFilter])

  const handleDelete = async (entry: ConsultationEntry) => {
    await deleteConsultation(entry)
    setDeleteConfirm(null)
    setExpandedId(null)
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Historique des consultations</h1>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/consultations/nouveau')} className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm font-medium text-(--color-text-inverse) hover:bg-(--color-brand-hover)">
              + Nouvelle
            </button>
            <button type="button" onClick={() => navigate('/')} className="text-sm text-(--color-text-muted) hover:text-(--color-text-primary)">
              Retour
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
          <div>
            <label htmlFor="filter-type" className="text-xs text-(--color-text-muted)">Type</label>
            <select id="filter-type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)} className="mt-1 block rounded-(--radius-sm) border border-(--color-border) bg-(--color-bg-base) px-2 py-1 text-sm">
              <option value="all">Tous</option>
              {Object.entries(CONSULTATION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sort-order" className="text-xs text-(--color-text-muted)">Tri</label>
            <select id="sort-order" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)} className="mt-1 block rounded-(--radius-sm) border border-(--color-border) bg-(--color-bg-base) px-2 py-1 text-sm">
              <option value="date-desc">Plus récent</option>
              <option value="date-asc">Plus ancien</option>
            </select>
          </div>
        </div>

        <p className="mt-4 text-xs text-(--color-text-muted)">
          {filtered.length} consultation{filtered.length !== 1 ? 's' : ''}
        </p>

        {isLoading ? (
          <p className="mt-8 text-center text-(--color-text-muted)">Chargement…</p>
        ) : filtered.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-(--color-text-secondary)">Aucune consultation enregistrée</p>
            <button type="button" onClick={() => navigate('/consultations/nouveau')} className="mt-4 rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) hover:bg-(--color-brand-hover)">
              Enregistrer ma première consultation
            </button>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {filtered.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  className="w-full rounded-(--radius-lg) bg-(--color-bg-elevated) p-4 text-left transition-colors hover:bg-(--color-bg-subtle)"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-bg-subtle) text-lg">
                        {consultationIcon(entry.type)}
                      </span>
                      <div>
                        <p className="text-sm font-medium">
                          {entry.medecin}
                          {entry.specialite && (
                            <span className="ml-1 text-(--color-text-muted) font-normal">({entry.specialite})</span>
                          )}
                        </p>
                        <p className="text-xs text-(--color-text-muted)">
                          {formatDateShort(entry.date)} · {entry.heure} · {CONSULTATION_TYPE_LABELS[entry.type]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.prochainRdv && (
                        <span className="rounded-(--radius-full) bg-(--color-brand-light) px-2 py-0.5 text-xs text-(--color-brand)">
                          RDV {formatDateShort(entry.prochainRdv)}
                        </span>
                      )}
                      <span className="text-(--color-text-muted)">{expandedId === entry.id ? '▲' : '▼'}</span>
                    </div>
                  </div>
                </button>

                {expandedId === entry.id && (
                  <div className="mt-1 rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg-elevated) p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <DetailRow label="Motif" value={entry.motif || '—'} />
                      <DetailRow label="Type" value={CONSULTATION_TYPE_LABELS[entry.type]} />
                      {entry.resume && (
                        <div className="col-span-2">
                          <DetailRow label="Résumé" value={entry.resume} />
                        </div>
                      )}
                      {entry.decisions.length > 0 && (
                        <div className="col-span-2">
                          <DetailRow label="Décisions" value={entry.decisions.join(' · ')} />
                        </div>
                      )}
                      {entry.ordonnances.length > 0 && (
                        <div className="col-span-2">
                          <DetailRow label="Ordonnances" value={entry.ordonnances.join(' · ')} />
                        </div>
                      )}
                      {entry.prochainRdv && (
                        <DetailRow label="Prochain RDV" value={formatDateShort(entry.prochainRdv)} />
                      )}
                      {entry.notes && (
                        <div className="col-span-2">
                          <DetailRow label="Notes" value={entry.notes} />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2 border-t border-(--color-border) pt-4">
                      <button type="button" onClick={() => navigate(`/consultations/${entry.id}/edit`)} className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm font-medium text-(--color-text-inverse) hover:bg-(--color-brand-hover)">
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

function consultationIcon(type: ConsultationType): string {
  const icons: Record<ConsultationType, string> = {
    cabinet: '\ud83c\udfe5',
    teleconsultation: '\ud83d\udcf1',
    urgences: '\ud83d\ude91',
    hospitalisation: '\ud83c\udfe8',
  }
  return icons[type]
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
