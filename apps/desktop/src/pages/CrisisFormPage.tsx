import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router'
import { IntensitySlider } from '@/components/crisis/IntensitySlider'
import { DurationEstimate } from '@/components/crisis/DurationEstimate'
import { ChipSelector, initDefaultSet } from '@/components/crisis/ChipSelector'
import { FieldTooltip } from '@/components/crisis/FieldTooltip'
import { Hit6Form } from '@/components/crisis/Hit6Form'
import {
  DEFAULT_TREATMENTS,
  DEFAULT_SYMPTOMS,
  DEFAULT_TRIGGERS,
} from '@/types/crisis'
import type { CrisisEntry } from '@/types/crisis'
import { useCrisisStore } from '@/stores/crisisStore'

initDefaultSet([...DEFAULT_TREATMENTS, ...DEFAULT_SYMPTOMS, ...DEFAULT_TRIGGERS])

const FIELD_HELP = {
  intensity: {
    label: 'Intensité',
    content: 'Évaluez la douleur de 1 (imperceptible) à 10 (insupportable).',
    example: '7 = douleur qui empêche la concentration',
  },
  symptoms: {
    label: 'Symptômes',
    content: 'Les symptômes associés à votre crise.',
    example: 'Nausée, photophobie',
  },
  triggers: {
    label: 'Déclencheurs',
    content: 'Les facteurs qui ont pu déclencher cette crise.',
    example: 'Stress, mauvais sommeil',
  },
  location: {
    label: 'Lieu',
    content: 'Où étiez-vous quand la crise a commencé ?',
    example: 'Bureau, maison, transport',
  },
}

export function CrisisFormPage() {
  const navigate = useNavigate()
  const { crisisId } = useParams<{ crisisId: string }>()
  const { crises, updateCrisis, loadCrises } = useCrisisStore()

  const [crisis, setCrisis] = useState<CrisisEntry | null>(null)
  const [showHit6, setShowHit6] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load crisis data
  useEffect(() => {
    if (crises.length === 0) {
      loadCrises()
    }
  }, [crises.length, loadCrises])

  useEffect(() => {
    // Only init local state once — don't overwrite user edits
    if (!crisis) {
      const found = crises.find((c) => c.id === crisisId)
      if (found) setCrisis({ ...found })
    }
  }, [crises, crisisId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save every 30 seconds
  const doAutoSave = useCallback(async () => {
    if (crisis) {
      await updateCrisis(crisis)
    }
  }, [crisis, updateCrisis])

  useEffect(() => {
    autoSaveTimer.current = setInterval(doAutoSave, 30_000)
    return () => {
      if (autoSaveTimer.current) clearInterval(autoSaveTimer.current)
    }
  }, [doAutoSave])

  if (!crisis) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base)">
        <p className="text-(--color-text-secondary)">Chargement…</p>
      </main>
    )
  }

  const update = (partial: Partial<CrisisEntry>) => {
    setCrisis((prev) => (prev ? { ...prev, ...partial } : prev))
  }

  const missingFields = getMissingFields(crisis)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateCrisis(crisis)
      navigate('/')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            {crisis.status === 'incomplet' ? 'Compléter la crise' : 'Modifier la crise'}
          </h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-(--color-text-muted) hover:text-(--color-text-primary)"
          >
            Retour
          </button>
        </div>

        {/* Missing fields alert */}
        {missingFields.length > 0 && (
          <div className="mt-4 rounded-(--radius-md) border border-(--color-warning) bg-(--color-warning-light) px-4 py-3 text-sm text-(--color-warning)">
            À compléter : {missingFields.join(', ')}
          </div>
        )}

        <form className="mt-6 space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave() }}>
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="crisis-date" className="text-sm font-medium">Date</label>
              <input
                id="crisis-date"
                type="date"
                value={crisis.date}
                onChange={(e) => update({ date: e.target.value })}
                className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="crisis-start" className="text-sm font-medium">Heure de début</label>
              <input
                id="crisis-start"
                type="time"
                value={crisis.startTime}
                onChange={(e) => update({ startTime: e.target.value })}
                className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Intensity */}
          <div className={fieldWrapperClass(missingFields.includes('Intensité'))}>
            <IntensitySlider
              value={crisis.intensity}
              onChange={(v) => update({ intensity: v })}
            />
            <FieldTooltip {...FIELD_HELP.intensity} />
          </div>

          {/* Duration */}
          <DurationEstimate
            intensity={crisis.intensity}
            confirmedEndTime={crisis.endTime}
            onConfirmEndTime={(t) => update({ endTime: t })}
          />

          {/* Treatments */}
          <div className={fieldWrapperClass(missingFields.includes('Traitements'))}>
            <ChipSelector
              label="Traitements"
              options={DEFAULT_TREATMENTS}
              selected={crisis.treatments}
              onChange={(v) => update({ treatments: v })}
              onAddCustom={() => {}}
              helpText="Les médicaments ou remèdes utilisés pendant la crise."
            />
          </div>

          {/* Symptoms */}
          <div className={fieldWrapperClass(missingFields.includes('Symptômes'))}>
            <ChipSelector
              label="Symptômes"
              options={DEFAULT_SYMPTOMS}
              selected={crisis.symptoms}
              onChange={(v) => update({ symptoms: v })}
              onAddCustom={() => {}}
              helpText="Les symptômes ressentis pendant la crise."
            />
          </div>

          {/* Triggers */}
          <ChipSelector
            label="Déclencheurs probables"
            options={DEFAULT_TRIGGERS}
            selected={crisis.triggers}
            onChange={(v) => update({ triggers: v })}
            onAddCustom={() => {}}
            helpText="Les facteurs qui ont pu déclencher cette crise."
          />

          {/* Location */}
          <div>
            <label htmlFor="crisis-location" className="flex items-center text-sm font-medium">
              Lieu
              <FieldTooltip {...FIELD_HELP.location} />
            </label>
            <input
              id="crisis-location"
              type="text"
              value={crisis.location ?? ''}
              onChange={(e) => update({ location: e.target.value || null })}
              placeholder="Ex : Bureau, maison…"
              className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="crisis-notes" className="text-sm font-medium">Notes</label>
            <textarea
              id="crisis-notes"
              value={crisis.notes ?? ''}
              onChange={(e) => update({ notes: e.target.value || null })}
              rows={3}
              placeholder="Détails supplémentaires…"
              className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm resize-none"
            />
          </div>

          {/* HIT-6 */}
          {!showHit6 && crisis.hit6Score === null && (
            <button
              type="button"
              onClick={() => setShowHit6(true)}
              className="w-full rounded-(--radius-md) border border-(--color-border) py-3 text-sm text-(--color-text-secondary) hover:border-(--color-brand) hover:text-(--color-brand)"
            >
              + Ajouter le score HIT-6
            </button>
          )}
          {showHit6 && crisis.hit6Score === null && (
            <Hit6Form
              onComplete={(score) => {
                update({ hit6Score: score })
                setShowHit6(false)
              }}
              onSkip={() => setShowHit6(false)}
            />
          )}
          {crisis.hit6Score !== null && (
            <div className="rounded-(--radius-md) bg-(--color-bg-subtle) px-4 py-3 text-sm">
              <span className="font-medium">Score HIT-6 :</span>{' '}
              <span className="text-(--color-brand) font-semibold">{crisis.hit6Score}</span>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-(--radius-md) bg-(--color-brand) py-3 text-sm font-semibold text-(--color-text-inverse) hover:bg-(--color-brand-hover) disabled:opacity-50"
            >
              {isSaving ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-(--radius-md) border border-(--color-border) px-6 py-3 text-sm text-(--color-text-secondary) hover:bg-(--color-bg-subtle)"
            >
              Annuler
            </button>
          </div>

          <p className="text-center text-xs text-(--color-text-muted)">
            Sauvegarde automatique toutes les 30 secondes
          </p>
        </form>
      </div>
    </main>
  )
}

function getMissingFields(crisis: CrisisEntry): string[] {
  const missing: string[] = []
  if (crisis.symptoms.length === 0) missing.push('Symptômes')
  if (crisis.endTime === null) missing.push('Heure de fin')
  return missing
}

function fieldWrapperClass(highlight: boolean): string {
  return highlight
    ? 'rounded-(--radius-md) border-2 border-(--color-warning) p-3'
    : ''
}
