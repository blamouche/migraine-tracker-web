import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useTreatmentStore } from '@/stores/treatmentStore'
import type { TreatmentEntry, TherapeuticClass, TreatmentType, AdministrationRoute, EfficacyVerdict, FrequencyReduction, ToleranceLevel } from '@/types/treatment'
import {
  THERAPEUTIC_CLASS_LABELS,
  TREATMENT_TYPE_LABELS,
  ADMINISTRATION_ROUTE_LABELS,
  VERDICT_LABELS,
  FREQUENCY_REDUCTION_LABELS,
  TOLERANCE_LABELS,
  DEFAULT_EFFICACY,
} from '@/types/treatment'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

const EMPTY_FORM: Omit<TreatmentEntry, 'id' | 'createdAt' | 'updatedAt'> = {
  nom: '',
  molecule: '',
  classe: 'autre',
  type: 'crise',
  posologie: '',
  voie: 'oral',
  dateDebut: today(),
  dateFin: null,
  motifArret: null,
  prescripteur: null,
  notes: null,
  efficacite: { ...DEFAULT_EFFICACY },
}

export function TreatmentFormPage() {
  const navigate = useNavigate()
  const { treatmentId } = useParams<{ treatmentId: string }>()
  const { treatments, loadTreatments, createTreatment, updateTreatment } = useTreatmentStore()
  const isEdit = Boolean(treatmentId)

  const [form, setForm] = useState<Omit<TreatmentEntry, 'id' | 'createdAt' | 'updatedAt'>>({ ...EMPTY_FORM })
  const [existingEntry, setExistingEntry] = useState<TreatmentEntry | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [enCours, setEnCours] = useState(true)
  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (treatments.length === 0) loadTreatments()
  }, [treatments.length, loadTreatments])

  useEffect(() => {
    if (isEdit && !existingEntry) {
      const found = treatments.find((t) => t.id === treatmentId)
      if (found) {
        setExistingEntry(found)
        setForm({
          nom: found.nom,
          molecule: found.molecule,
          classe: found.classe,
          type: found.type,
          posologie: found.posologie,
          voie: found.voie,
          dateDebut: found.dateDebut,
          dateFin: found.dateFin,
          motifArret: found.motifArret,
          prescripteur: found.prescripteur,
          notes: found.notes,
          efficacite: { ...found.efficacite },
        })
        setEnCours(!found.dateFin)
      }
    }
  }, [treatments, treatmentId, isEdit]) // eslint-disable-line react-hooks/exhaustive-deps

  const doAutoSave = useCallback(async () => {
    if (isEdit && existingEntry && form.nom) {
      await updateTreatment({ ...existingEntry, ...form, updatedAt: existingEntry.updatedAt })
    }
  }, [isEdit, existingEntry, form, updateTreatment])

  useEffect(() => {
    if (isEdit) {
      autoSaveTimer.current = setInterval(doAutoSave, 30_000)
      return () => { if (autoSaveTimer.current) clearInterval(autoSaveTimer.current) }
    }
  }, [doAutoSave, isEdit])

  const update = (partial: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...partial }))
  }

  const updateEfficacite = (partial: Partial<typeof form.efficacite>) => {
    setForm((prev) => ({ ...prev, efficacite: { ...prev.efficacite, ...partial } }))
  }

  const handleSave = async () => {
    if (!form.nom.trim()) return
    setIsSaving(true)
    try {
      const data = {
        ...form,
        dateFin: enCours ? null : form.dateFin,
        motifArret: enCours ? null : form.motifArret,
      }
      if (isEdit && existingEntry) {
        await updateTreatment({ ...existingEntry, ...data })
      } else {
        await createTreatment(data)
      }
      navigate('/traitements/historique')
    } finally {
      setIsSaving(false)
    }
  }

  if (isEdit && !existingEntry && treatments.length > 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base)">
        <p className="text-(--color-text-secondary)">Traitement introuvable</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            {isEdit ? 'Modifier le traitement' : 'Nouveau traitement'}
          </h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-(--color-text-muted) hover:text-(--color-text-primary)"
          >
            Retour
          </button>
        </div>

        <form className="mt-6 space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave() }}>
          {/* Nom & Molécule */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="treatment-nom" className="text-sm font-medium">Nom commercial *</label>
              <input
                id="treatment-nom"
                type="text"
                value={form.nom}
                onChange={(e) => update({ nom: e.target.value })}
                placeholder="Ex : Imigrane, Aimovig…"
                required
                className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="treatment-molecule" className="text-sm font-medium">Molécule active</label>
              <input
                id="treatment-molecule"
                type="text"
                value={form.molecule}
                onChange={(e) => update({ molecule: e.target.value })}
                placeholder="Ex : sumatriptan, érenumab…"
                className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Classe & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="treatment-classe" className="text-sm font-medium">Classe thérapeutique</label>
              <select
                id="treatment-classe"
                value={form.classe}
                onChange={(e) => update({ classe: e.target.value as TherapeuticClass })}
                className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
              >
                {Object.entries(THERAPEUTIC_CLASS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="treatment-type" className="text-sm font-medium">Type</label>
              <select
                id="treatment-type"
                value={form.type}
                onChange={(e) => update({ type: e.target.value as TreatmentType })}
                className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
              >
                {Object.entries(TREATMENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Posologie & Voie */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="treatment-posologie" className="text-sm font-medium">Posologie</label>
              <input
                id="treatment-posologie"
                type="text"
                value={form.posologie}
                onChange={(e) => update({ posologie: e.target.value })}
                placeholder="Ex : 50 mg, 1 comprimé…"
                className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="treatment-voie" className="text-sm font-medium">Voie d'administration</label>
              <select
                id="treatment-voie"
                value={form.voie}
                onChange={(e) => update({ voie: e.target.value as AdministrationRoute })}
                className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
              >
                {Object.entries(ADMINISTRATION_ROUTE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="treatment-date-debut" className="text-sm font-medium">Date de début</label>
              <input
                id="treatment-date-debut"
                type="date"
                value={form.dateDebut}
                onChange={(e) => update({ dateDebut: e.target.value })}
                className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="treatment-date-fin" className="text-sm font-medium">Date de fin</label>
                <label className="flex items-center gap-1.5 text-xs text-(--color-text-muted)">
                  <input
                    type="checkbox"
                    checked={enCours}
                    onChange={(e) => setEnCours(e.target.checked)}
                    className="rounded border-(--color-border)"
                  />
                  En cours
                </label>
              </div>
              <input
                id="treatment-date-fin"
                type="date"
                value={form.dateFin ?? ''}
                onChange={(e) => update({ dateFin: e.target.value || null })}
                disabled={enCours}
                className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm disabled:opacity-50"
              />
            </div>
          </div>

          {/* Motif d'arrêt (si traitement terminé) */}
          {!enCours && (
            <div>
              <label htmlFor="treatment-motif" className="text-sm font-medium">Motif d'arrêt</label>
              <input
                id="treatment-motif"
                type="text"
                value={form.motifArret ?? ''}
                onChange={(e) => update({ motifArret: e.target.value || null })}
                placeholder="Ex : inefficacité, effets secondaires…"
                className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
              />
            </div>
          )}

          {/* Prescripteur */}
          <div>
            <label htmlFor="treatment-prescripteur" className="text-sm font-medium">Prescripteur</label>
            <input
              id="treatment-prescripteur"
              type="text"
              value={form.prescripteur ?? ''}
              onChange={(e) => update({ prescripteur: e.target.value || null })}
              placeholder="Dr …"
              className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
            />
          </div>

          {/* Évaluation efficacité */}
          <fieldset className="rounded-(--radius-lg) border border-(--color-border) p-4">
            <legend className="px-2 text-sm font-semibold">Évaluation de l'efficacité</legend>

            <div className="mt-2 grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="treatment-verdict" className="text-xs font-medium text-(--color-text-muted)">Verdict</label>
                <select
                  id="treatment-verdict"
                  value={form.efficacite.verdict}
                  onChange={(e) => updateEfficacite({ verdict: e.target.value as EfficacyVerdict })}
                  className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
                >
                  {Object.entries(VERDICT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="treatment-reduction" className="text-xs font-medium text-(--color-text-muted)">Réduction fréquence</label>
                <select
                  id="treatment-reduction"
                  value={form.efficacite.reductionFrequence}
                  onChange={(e) => updateEfficacite({ reductionFrequence: e.target.value as FrequencyReduction })}
                  className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
                >
                  {Object.entries(FREQUENCY_REDUCTION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="treatment-tolerance" className="text-xs font-medium text-(--color-text-muted)">Tolérance</label>
                <select
                  id="treatment-tolerance"
                  value={form.efficacite.tolerance}
                  onChange={(e) => updateEfficacite({ tolerance: e.target.value as ToleranceLevel })}
                  className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
                >
                  {Object.entries(TOLERANCE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="treatment-commentaire" className="text-xs font-medium text-(--color-text-muted)">Commentaire</label>
              <textarea
                id="treatment-commentaire"
                value={form.efficacite.commentaire ?? ''}
                onChange={(e) => updateEfficacite({ commentaire: e.target.value || null })}
                rows={2}
                placeholder="Effets secondaires, observations…"
                className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm resize-none"
              />
            </div>
          </fieldset>

          {/* Notes */}
          <div>
            <label htmlFor="treatment-notes" className="text-sm font-medium">Notes</label>
            <textarea
              id="treatment-notes"
              value={form.notes ?? ''}
              onChange={(e) => update({ notes: e.target.value || null })}
              rows={3}
              placeholder="Détails supplémentaires…"
              className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSaving || !form.nom.trim()}
              className="flex-1 rounded-(--radius-md) bg-(--color-brand) py-3 text-sm font-semibold text-(--color-text-inverse) hover:bg-(--color-brand-hover) disabled:opacity-50"
            >
              {isSaving ? 'Sauvegarde…' : isEdit ? 'Sauvegarder' : 'Créer le traitement'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-(--radius-md) border border-(--color-border) px-6 py-3 text-sm text-(--color-text-secondary) hover:bg-(--color-bg-subtle)"
            >
              Annuler
            </button>
          </div>

          {isEdit && (
            <p className="text-center text-xs text-(--color-text-muted)">
              Sauvegarde automatique toutes les 30 secondes
            </p>
          )}
        </form>
      </div>
    </main>
  )
}
