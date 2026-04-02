import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useTreatmentStore } from '@/stores/treatmentStore'
import { TreatmentCalendar } from '@/components/treatment/TreatmentCalendar'
import type { TreatmentEntry, TherapeuticClass, TreatmentType } from '@/types/treatment'
import {
  THERAPEUTIC_CLASS_LABELS,
  TREATMENT_TYPE_LABELS,
  VERDICT_LABELS,
  VERDICT_COLORS,
  ADMINISTRATION_ROUTE_LABELS,
  FREQUENCY_REDUCTION_LABELS,
  TOLERANCE_LABELS,
} from '@/types/treatment'

type SortOrder = 'date-desc' | 'date-asc' | 'nom-asc'
type TypeFilter = 'all' | TreatmentType
type ClassFilter = 'all' | TherapeuticClass

export function TreatmentHistoryPage() {
  const navigate = useNavigate()
  const { treatments, isLoading, loadTreatments, deleteTreatment } = useTreatmentStore()

  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [classFilter, setClassFilter] = useState<ClassFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    if (treatments.length === 0) loadTreatments()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const result = treatments.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      if (classFilter !== 'all' && t.classe !== classFilter) return false
      if (selectedDate) {
        const end = t.dateFin ?? new Date().toISOString().slice(0, 10)
        if (selectedDate < t.dateDebut || selectedDate > end) return false
      }
      return true
    })

    result.sort((a, b) => {
      switch (sortOrder) {
        case 'date-desc': return b.dateDebut.localeCompare(a.dateDebut)
        case 'date-asc': return a.dateDebut.localeCompare(b.dateDebut)
        case 'nom-asc': return a.nom.localeCompare(b.nom)
        default: return 0
      }
    })

    return result
  }, [treatments, sortOrder, typeFilter, classFilter, selectedDate])

  const handleDelete = async (treatment: TreatmentEntry) => {
    await deleteTreatment(treatment)
    setDeleteConfirm(null)
    setExpandedId(null)
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Historique des traitements</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/traitements/nouveau')}
              className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm font-medium text-(--color-text-inverse) hover:bg-(--color-brand-hover)"
            >
              + Nouveau
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
          <TreatmentCalendar
            treatments={treatments}
            onDayClick={(date) => setSelectedDate(selectedDate === date ? null : date)}
            selectedDate={selectedDate}
          />
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-3 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
          <div>
            <label htmlFor="filter-type" className="text-xs text-(--color-text-muted)">Type</label>
            <select
              id="filter-type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="mt-1 block rounded-(--radius-sm) border border-(--color-border) bg-(--color-bg-base) px-2 py-1 text-sm"
            >
              <option value="all">Tous</option>
              {Object.entries(TREATMENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-classe" className="text-xs text-(--color-text-muted)">Classe</label>
            <select
              id="filter-classe"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value as ClassFilter)}
              className="mt-1 block rounded-(--radius-sm) border border-(--color-border) bg-(--color-bg-base) px-2 py-1 text-sm"
            >
              <option value="all">Toutes</option>
              {Object.entries(THERAPEUTIC_CLASS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
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
              <option value="nom-asc">Nom A→Z</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="mt-4 text-xs text-(--color-text-muted)">
          {filtered.length} traitement{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* List */}
        {isLoading ? (
          <p className="mt-8 text-center text-(--color-text-muted)">Chargement…</p>
        ) : filtered.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-(--color-text-secondary)">Aucun traitement enregistré</p>
            <button
              type="button"
              onClick={() => navigate('/traitements/nouveau')}
              className="mt-4 rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) hover:bg-(--color-brand-hover)"
            >
              Enregistrer mon premier traitement
            </button>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {filtered.map((treatment) => (
              <li key={treatment.id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === treatment.id ? null : treatment.id)}
                  className="w-full rounded-(--radius-lg) bg-(--color-bg-elevated) p-4 text-left transition-colors hover:bg-(--color-bg-subtle)"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <VerdictBadge verdict={treatment.efficacite.verdict} />
                      <div>
                        <p className="text-sm font-medium">
                          {treatment.nom}
                          {treatment.molecule && (
                            <span className="ml-1 text-(--color-text-muted) font-normal">
                              ({treatment.molecule})
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-(--color-text-muted)">
                          {THERAPEUTIC_CLASS_LABELS[treatment.classe]} · {TREATMENT_TYPE_LABELS[treatment.type]}
                          {' · '}
                          {formatDateShort(treatment.dateDebut)}
                          {treatment.dateFin ? ` → ${formatDateShort(treatment.dateFin)}` : ' → en cours'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!treatment.dateFin && (
                        <span className="rounded-(--radius-full) bg-(--color-brand-light) px-2 py-0.5 text-xs text-(--color-brand)">
                          Actif
                        </span>
                      )}
                      <span className="text-(--color-text-muted)">
                        {expandedId === treatment.id ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Expanded detail */}
                {expandedId === treatment.id && (
                  <div className="mt-1 rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg-elevated) p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <DetailRow label="Posologie" value={treatment.posologie || '—'} />
                      <DetailRow label="Voie" value={ADMINISTRATION_ROUTE_LABELS[treatment.voie]} />
                      <DetailRow label="Prescripteur" value={treatment.prescripteur ?? '—'} />
                      <DetailRow label="Verdict" value={VERDICT_LABELS[treatment.efficacite.verdict]} />
                      <DetailRow label="Réduction fréquence" value={FREQUENCY_REDUCTION_LABELS[treatment.efficacite.reductionFrequence]} />
                      <DetailRow label="Tolérance" value={TOLERANCE_LABELS[treatment.efficacite.tolerance]} />
                      {treatment.motifArret && (
                        <DetailRow label="Motif d'arrêt" value={treatment.motifArret} />
                      )}
                      {treatment.efficacite.commentaire && (
                        <div className="col-span-2">
                          <DetailRow label="Commentaire efficacité" value={treatment.efficacite.commentaire} />
                        </div>
                      )}
                      {treatment.notes && (
                        <div className="col-span-2">
                          <DetailRow label="Notes" value={treatment.notes} />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2 border-t border-(--color-border) pt-4">
                      <button
                        type="button"
                        onClick={() => navigate(`/traitements/${treatment.id}/edit`)}
                        className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm font-medium text-(--color-text-inverse) hover:bg-(--color-brand-hover)"
                      >
                        Modifier
                      </button>
                      {deleteConfirm === treatment.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-(--color-danger)">Confirmer la suppression ?</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(treatment)}
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
                          onClick={() => setDeleteConfirm(treatment.id)}
                          className="rounded-(--radius-md) border border-(--color-danger) px-4 py-2 text-sm text-(--color-danger) hover:bg-(--color-danger-light)"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>

                    {deleteConfirm === treatment.id && (
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

function VerdictBadge({ verdict }: { verdict: string }) {
  const color = VERDICT_COLORS[verdict as keyof typeof VERDICT_COLORS] ?? 'var(--color-text-muted)'
  const initials: Record<string, string> = {
    efficace: 'E',
    partiel: 'P',
    inefficace: 'I',
    'non-evalue': '?',
  }

  return (
    <span
      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ backgroundColor: color }}
      title={VERDICT_LABELS[verdict as keyof typeof VERDICT_LABELS]}
    >
      {initials[verdict] ?? '?'}
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

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
