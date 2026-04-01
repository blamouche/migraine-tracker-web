import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useCycleStore } from '@/stores/cycleStore'
import type { CycleEntry, CyclePhase, ContraceptionType } from '@/types/cycle'
import {
  CYCLE_PHASE_LABELS,
  CONTRACEPTION_TYPE_LABELS,
  INTENSITE_SYMPTOMES_LABELS,
  DEFAULT_CYCLE_SYMPTOMES,
  calculatePhase,
} from '@/types/cycle'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

const EMPTY_FORM: Omit<CycleEntry, 'id' | 'createdAt' | 'updatedAt'> = {
  dateDebut: today(),
  dureeJours: 5,
  intensiteSymptomes: 3,
  phase: 'menstruelle',
  contraception: 'aucune',
  symptomes: [],
  notes: null,
}

export function CycleFormPage() {
  const navigate = useNavigate()
  const { cycleId } = useParams<{ cycleId: string }>()
  const { entries, loadCycles, createCycle, updateCycle } = useCycleStore()
  const isEdit = Boolean(cycleId)

  const [form, setForm] = useState<Omit<CycleEntry, 'id' | 'createdAt' | 'updatedAt'>>({ ...EMPTY_FORM })
  const [existingEntry, setExistingEntry] = useState<CycleEntry | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (entries.length === 0) loadCycles()
  }, [entries.length, loadCycles])

  useEffect(() => {
    if (isEdit && !existingEntry) {
      const found = entries.find((e) => e.id === cycleId)
      if (found) {
        setExistingEntry(found)
        setForm({
          dateDebut: found.dateDebut,
          dureeJours: found.dureeJours,
          intensiteSymptomes: found.intensiteSymptomes,
          phase: found.phase,
          contraception: found.contraception,
          symptomes: [...found.symptomes],
          notes: found.notes,
        })
      }
    }
  }, [entries, cycleId, isEdit]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-calculate phase when date or duration changes
  useEffect(() => {
    if (form.dateDebut && form.dureeJours) {
      setForm((prev) => ({
        ...prev,
        phase: calculatePhase(prev.dateDebut, prev.dureeJours),
      }))
    }
  }, [form.dateDebut, form.dureeJours])

  const doAutoSave = useCallback(async () => {
    if (isEdit && existingEntry) {
      await updateCycle({ ...existingEntry, ...form, updatedAt: existingEntry.updatedAt })
    }
  }, [isEdit, existingEntry, form, updateCycle])

  useEffect(() => {
    if (isEdit) {
      autoSaveTimer.current = setInterval(doAutoSave, 30_000)
      return () => { if (autoSaveTimer.current) clearInterval(autoSaveTimer.current) }
    }
  }, [doAutoSave, isEdit])

  const update = (partial: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...partial }))
  }

  const toggleSymptome = (symptome: string) => {
    setForm((prev) => ({
      ...prev,
      symptomes: prev.symptomes.includes(symptome)
        ? prev.symptomes.filter((s) => s !== symptome)
        : [...prev.symptomes, symptome],
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (isEdit && existingEntry) {
        await updateCycle({ ...existingEntry, ...form })
      } else {
        await createCycle(form)
      }
      navigate('/cycle/historique')
    } finally {
      setIsSaving(false)
    }
  }

  if (isEdit && !existingEntry && entries.length > 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base)">
        <p className="text-(--color-text-secondary)">Cycle introuvable</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            {isEdit ? 'Modifier le cycle' : 'Nouveau cycle'}
          </h1>
          <button type="button" onClick={() => navigate(-1)} className="text-sm text-(--color-text-muted) hover:text-(--color-text-primary)">
            Retour
          </button>
        </div>

        <form className="mt-6 space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave() }}>
          {/* Date & Durée */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cycle-date" className="text-sm font-medium">Date de début des règles *</label>
              <input
                id="cycle-date"
                type="date"
                value={form.dateDebut}
                onChange={(e) => update({ dateDebut: e.target.value })}
                required
                className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="cycle-duree" className="text-sm font-medium">Durée (jours)</label>
              <input
                id="cycle-duree"
                type="number"
                min={1}
                max={14}
                value={form.dureeJours}
                onChange={(e) => update({ dureeJours: parseInt(e.target.value) || 5 })}
                className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Phase (auto-calculated) */}
          <div>
            <label className="text-sm font-medium">Phase calculée</label>
            <p className="mt-1 rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-subtle) px-3 py-2 text-sm text-(--color-text-secondary)">
              {CYCLE_PHASE_LABELS[form.phase]}
            </p>
          </div>

          {/* Intensité symptômes */}
          <div>
            <label htmlFor="cycle-intensite" className="text-sm font-medium">
              Intensité des symptômes prémenstruels
            </label>
            <select
              id="cycle-intensite"
              value={form.intensiteSymptomes}
              onChange={(e) => update({ intensiteSymptomes: parseInt(e.target.value) })}
              className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
            >
              {Object.entries(INTENSITE_SYMPTOMES_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{value} — {label}</option>
              ))}
            </select>
          </div>

          {/* Contraception */}
          <div>
            <label htmlFor="cycle-contraception" className="text-sm font-medium">Contraception</label>
            <select
              id="cycle-contraception"
              value={form.contraception}
              onChange={(e) => update({ contraception: e.target.value as ContraceptionType })}
              className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
            >
              {Object.entries(CONTRACEPTION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Symptômes */}
          <div>
            <p className="text-sm font-medium mb-2">Symptômes</p>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_CYCLE_SYMPTOMES.map((symptome) => (
                <button
                  key={symptome}
                  type="button"
                  onClick={() => toggleSymptome(symptome)}
                  className={`rounded-(--radius-full) border px-3 py-1.5 text-sm transition-colors ${
                    form.symptomes.includes(symptome)
                      ? 'border-(--color-brand) bg-(--color-brand-light) text-(--color-brand)'
                      : 'border-(--color-border) text-(--color-text-muted) hover:border-(--color-brand)'
                  }`}
                >
                  {symptome}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="cycle-notes" className="text-sm font-medium">Notes</label>
            <textarea
              id="cycle-notes"
              value={form.notes ?? ''}
              onChange={(e) => update({ notes: e.target.value || null })}
              rows={3}
              placeholder="Observations supplémentaires…"
              className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-(--radius-md) bg-(--color-brand) py-3 text-sm font-semibold text-(--color-text-inverse) hover:bg-(--color-brand-hover) disabled:opacity-50"
            >
              {isSaving ? 'Sauvegarde…' : isEdit ? 'Sauvegarder' : 'Enregistrer le cycle'}
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
