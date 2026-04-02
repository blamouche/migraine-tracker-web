import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useChargeMentaleStore } from '@/stores/chargeMentaleStore'
import type { ChargeMentaleEntry } from '@/types/chargeMentale'
import { CHARGE_DOMAINE_LABELS, HUMEUR_LABELS } from '@/types/chargeMentale'

export function ChargeMentaleHistoryPage() {
  const navigate = useNavigate()
  const { entries, isLoading, loadCharges, deleteCharge } = useChargeMentaleStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => { if (entries.length === 0) loadCharges() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const sorted = useMemo(() => [...entries].sort((a, b) => b.date.localeCompare(a.date)), [entries])

  const handleDelete = async (entry: ChargeMentaleEntry) => { await deleteCharge(entry); setDeleteConfirm(null); setExpandedId(null) }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Historique charge mentale</h1>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/charge-mentale/nouveau')} className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm font-medium text-(--color-text-inverse) hover:bg-(--color-brand-hover)">+ Nouveau</button>
            <button type="button" onClick={() => navigate('/')} className="text-sm text-(--color-text-muted) hover:text-(--color-text-primary)">Retour</button>
          </div>
        </div>

        <p className="mt-4 text-xs text-(--color-text-muted)">{sorted.length} entrée{sorted.length !== 1 ? 's' : ''}</p>

        {isLoading ? (
          <p className="mt-8 text-center text-(--color-text-muted)">Chargement…</p>
        ) : sorted.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-(--color-text-secondary)">Aucune entrée enregistrée</p>
            <button type="button" onClick={() => navigate('/charge-mentale/nouveau')} className="mt-4 rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) hover:bg-(--color-brand-hover)">Enregistrer ma charge du jour</button>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {sorted.map((entry) => (
              <li key={entry.id}>
                <button type="button" onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)} className="w-full rounded-(--radius-lg) bg-(--color-bg-elevated) p-4 text-left transition-colors hover:bg-(--color-bg-subtle)">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: chargeColor(entry.niveau) }}>{entry.niveau}</span>
                      <div>
                        <p className="text-sm font-medium">{formatDate(entry.date)}</p>
                        <p className="text-xs text-(--color-text-muted)">{CHARGE_DOMAINE_LABELS[entry.domaine]} · {HUMEUR_LABELS[entry.humeur]}</p>
                      </div>
                    </div>
                    <span className="text-(--color-text-muted)">{expandedId === entry.id ? '▲' : '▼'}</span>
                  </div>
                </button>
                {expandedId === entry.id && (
                  <div className="mt-1 rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg-elevated) p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-xs font-medium text-(--color-text-muted)">Niveau</p><p className="mt-0.5">{entry.niveau}/10</p></div>
                      <div><p className="text-xs font-medium text-(--color-text-muted)">Humeur</p><p className="mt-0.5">{HUMEUR_LABELS[entry.humeur]}</p></div>
                      {entry.contexte.length > 0 && <div className="col-span-2"><p className="text-xs font-medium text-(--color-text-muted)">Contexte</p><p className="mt-0.5">{entry.contexte.join(', ')}</p></div>}
                      {entry.notes && <div className="col-span-2"><p className="text-xs font-medium text-(--color-text-muted)">Notes</p><p className="mt-0.5">{entry.notes}</p></div>}
                    </div>
                    <div className="mt-4 flex gap-2 border-t border-(--color-border) pt-4">
                      <button type="button" onClick={() => navigate(`/charge-mentale/${entry.id}/edit`)} className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm font-medium text-(--color-text-inverse) hover:bg-(--color-brand-hover)">Modifier</button>
                      {deleteConfirm === entry.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-(--color-danger)">Confirmer ?</span>
                          <button type="button" onClick={() => handleDelete(entry)} className="rounded-(--radius-md) bg-(--color-danger) px-3 py-2 text-sm text-white">Oui</button>
                          <button type="button" onClick={() => setDeleteConfirm(null)} className="text-sm text-(--color-text-muted)">Non</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setDeleteConfirm(entry.id)} className="rounded-(--radius-md) border border-(--color-danger) px-4 py-2 text-sm text-(--color-danger)">Supprimer</button>
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

function chargeColor(niveau: number): string {
  if (niveau <= 3) return 'var(--color-success)'
  if (niveau <= 6) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
