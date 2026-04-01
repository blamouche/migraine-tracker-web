import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useTransportStore } from '@/stores/transportStore'
import type { TransportEntry, TransportMoyen } from '@/types/transport'
import { TRANSPORT_MOYEN_LABELS } from '@/types/transport'

type SortOrder = 'date-desc' | 'date-asc'
type MoyenFilter = 'all' | TransportMoyen

export function TransportHistoryPage() {
  const navigate = useNavigate()
  const { entries, isLoading, loadTransports, deleteTransport } = useTransportStore()

  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc')
  const [moyenFilter, setMoyenFilter] = useState<MoyenFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (entries.length === 0) loadTransports()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const result = entries.filter((e) => {
      if (moyenFilter !== 'all' && e.moyen !== moyenFilter) return false
      return true
    })

    result.sort((a, b) =>
      sortOrder === 'date-desc'
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date),
    )

    return result
  }, [entries, sortOrder, moyenFilter])

  const handleDelete = async (entry: TransportEntry) => {
    await deleteTransport(entry)
    setDeleteConfirm(null)
    setExpandedId(null)
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Historique des transports</h1>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/transports/nouveau')} className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm font-medium text-(--color-text-inverse) hover:bg-(--color-brand-hover)">
              + Nouveau
            </button>
            <button type="button" onClick={() => navigate('/')} className="text-sm text-(--color-text-muted) hover:text-(--color-text-primary)">
              Retour
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
          <div>
            <label htmlFor="filter-moyen" className="text-xs text-(--color-text-muted)">Moyen</label>
            <select id="filter-moyen" value={moyenFilter} onChange={(e) => setMoyenFilter(e.target.value as MoyenFilter)} className="mt-1 block rounded-(--radius-sm) border border-(--color-border) bg-(--color-bg-base) px-2 py-1 text-sm">
              <option value="all">Tous</option>
              {Object.entries(TRANSPORT_MOYEN_LABELS).map(([value, label]) => (
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
          {filtered.length} trajet{filtered.length !== 1 ? 's' : ''}
        </p>

        {isLoading ? (
          <p className="mt-8 text-center text-(--color-text-muted)">Chargement…</p>
        ) : filtered.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-(--color-text-secondary)">Aucun trajet enregistré</p>
            <button type="button" onClick={() => navigate('/transports/nouveau')} className="mt-4 rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) hover:bg-(--color-brand-hover)">
              Enregistrer mon premier trajet
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
                        {transportIcon(entry.moyen)}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{TRANSPORT_MOYEN_LABELS[entry.moyen]}</p>
                        <p className="text-xs text-(--color-text-muted)">
                          {formatDateShort(entry.date)} · {entry.heure} · {formatDuration(entry.dureeMinutes)}
                          {entry.distance && ` · ${entry.distance}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-(--color-text-muted)">{expandedId === entry.id ? '▲' : '▼'}</span>
                  </div>
                </button>

                {expandedId === entry.id && (
                  <div className="mt-1 rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg-elevated) p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <DetailRow label="Durée" value={formatDuration(entry.dureeMinutes)} />
                      <DetailRow label="Moyen" value={TRANSPORT_MOYEN_LABELS[entry.moyen]} />
                      {entry.distance && <DetailRow label="Distance" value={entry.distance} />}
                      {entry.conditions.length > 0 && (
                        <div className="col-span-2">
                          <DetailRow label="Conditions" value={entry.conditions.join(', ')} />
                        </div>
                      )}
                      {entry.notes && (
                        <div className="col-span-2">
                          <DetailRow label="Notes" value={entry.notes} />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2 border-t border-(--color-border) pt-4">
                      <button type="button" onClick={() => navigate(`/transports/${entry.id}/edit`)} className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm font-medium text-(--color-text-inverse) hover:bg-(--color-brand-hover)">
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

function transportIcon(moyen: TransportMoyen): string {
  const icons: Record<TransportMoyen, string> = {
    voiture: '\ud83d\ude97',
    train: '\ud83d\ude84',
    metro: '\ud83d\ude87',
    bus: '\ud83d\ude8c',
    avion: '\u2708\ufe0f',
    velo: '\ud83d\udeb2',
    marche: '\ud83d\udeb6',
    moto: '\ud83c\udfcd\ufe0f',
    autre: '\ud83d\ude8d',
  }
  return icons[moyen]
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

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}
