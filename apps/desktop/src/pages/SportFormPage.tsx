import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useSportStore } from '@/stores/sportStore'
import type { SportEntry, SportType, HydratationLevel } from '@/types/sport'
import {
  SPORT_TYPE_LABELS,
  SPORT_INTENSITE_LABELS,
  HYDRATATION_LABELS,
  DEFAULT_SPORT_CONDITIONS,
} from '@/types/sport'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function nowTime(): string {
  return new Date().toTimeString().slice(0, 5)
}

const EMPTY_FORM: Omit<SportEntry, 'id' | 'createdAt' | 'updatedAt'> = {
  date: today(),
  heure: nowTime(),
  type: 'course',
  dureeMinutes: 45,
  intensite: 3,
  conditions: [],
  fcMax: null,
  hydratation: 'normale',
  notes: null,
}

export function SportFormPage() {
  const navigate = useNavigate()
  const { sportId } = useParams<{ sportId: string }>()
  const { entries, loadSports, createSport, updateSport } = useSportStore()
  const isEdit = Boolean(sportId)

  const [form, setForm] = useState<Omit<SportEntry, 'id' | 'createdAt' | 'updatedAt'>>({ ...EMPTY_FORM })
  const [existingEntry, setExistingEntry] = useState<SportEntry | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (entries.length === 0) loadSports()
  }, [entries.length, loadSports])

  useEffect(() => {
    if (isEdit && !existingEntry) {
      const found = entries.find((e) => e.id === sportId)
      if (found) {
        setExistingEntry(found)
        setForm({
          date: found.date,
          heure: found.heure,
          type: found.type,
          dureeMinutes: found.dureeMinutes,
          intensite: found.intensite,
          conditions: [...found.conditions],
          fcMax: found.fcMax,
          hydratation: found.hydratation,
          notes: found.notes,
        })
      }
    }
  }, [entries, sportId, isEdit]) // eslint-disable-line react-hooks/exhaustive-deps

  const doAutoSave = useCallback(async () => {
    if (isEdit && existingEntry) {
      await updateSport({ ...existingEntry, ...form, updatedAt: existingEntry.updatedAt })
    }
  }, [isEdit, existingEntry, form, updateSport])

  useEffect(() => {
    if (isEdit) {
      autoSaveTimer.current = setInterval(doAutoSave, 30_000)
      return () => { if (autoSaveTimer.current) clearInterval(autoSaveTimer.current) }
    }
  }, [doAutoSave, isEdit])

  const update = (partial: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...partial }))
  }

  const toggleCondition = (condition: string) => {
    setForm((prev) => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter((c) => c !== condition)
        : [...prev.conditions, condition],
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (isEdit && existingEntry) {
        await updateSport({ ...existingEntry, ...form })
      } else {
        await createSport(form)
      }
      navigate('/sport/historique')
    } finally {
      setIsSaving(false)
    }
  }

  if (isEdit && !existingEntry && entries.length > 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base)">
        <p className="text-(--color-text-secondary)">Activité introuvable</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            {isEdit ? 'Modifier l\'activité' : 'Nouvelle activité sportive'}
          </h1>
          <button type="button" onClick={() => navigate(-1)} className="text-sm text-(--color-text-muted) hover:text-(--color-text-primary)">
            Retour
          </button>
        </div>

        <form className="mt-6 space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave() }}>
          {/* Date & Heure */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sport-date" className="text-sm font-medium">Date *</label>
              <input id="sport-date" type="date" value={form.date} onChange={(e) => update({ date: e.target.value })} required className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="sport-heure" className="text-sm font-medium">Heure</label>
              <input id="sport-heure" type="time" value={form.heure} onChange={(e) => update({ heure: e.target.value })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm" />
            </div>
          </div>

          {/* Type & Durée */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sport-type" className="text-sm font-medium">Type d'activité *</label>
              <select id="sport-type" value={form.type} onChange={(e) => update({ type: e.target.value as SportType })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm">
                {Object.entries(SPORT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sport-duree" className="text-sm font-medium">Durée (minutes)</label>
              <input id="sport-duree" type="number" min={1} value={form.dureeMinutes} onChange={(e) => update({ dureeMinutes: parseInt(e.target.value) || 0 })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm" />
            </div>
          </div>

          {/* Intensité */}
          <div>
            <label htmlFor="sport-intensite" className="text-sm font-medium">Intensité</label>
            <select id="sport-intensite" value={form.intensite} onChange={(e) => update({ intensite: parseInt(e.target.value) })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm">
              {Object.entries(SPORT_INTENSITE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{value} — {label}</option>
              ))}
            </select>
          </div>

          {/* Hydratation & FC max */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sport-hydratation" className="text-sm font-medium">Hydratation</label>
              <select id="sport-hydratation" value={form.hydratation} onChange={(e) => update({ hydratation: e.target.value as HydratationLevel })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm">
                {Object.entries(HYDRATATION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sport-fc" className="text-sm font-medium">FC max (bpm, optionnel)</label>
              <input id="sport-fc" type="number" min={40} max={250} value={form.fcMax ?? ''} onChange={(e) => update({ fcMax: parseInt(e.target.value) || null })} placeholder="Ex : 165" className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm" />
            </div>
          </div>

          {/* Conditions */}
          <div>
            <p className="text-sm font-medium mb-2">Conditions</p>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_SPORT_CONDITIONS.map((condition) => (
                <button
                  key={condition}
                  type="button"
                  onClick={() => toggleCondition(condition)}
                  className={`rounded-(--radius-full) border px-3 py-1.5 text-sm transition-colors ${
                    form.conditions.includes(condition)
                      ? 'border-(--color-brand) bg-(--color-brand-light) text-(--color-brand)'
                      : 'border-(--color-border) text-(--color-text-muted) hover:border-(--color-brand)'
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="sport-notes" className="text-sm font-medium">Notes</label>
            <textarea id="sport-notes" value={form.notes ?? ''} onChange={(e) => update({ notes: e.target.value || null })} rows={3} placeholder="Sensations, détails…" className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm resize-none" />
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button type="submit" disabled={isSaving} className="flex-1 rounded-(--radius-md) bg-(--color-brand) py-3 text-sm font-semibold text-(--color-text-inverse) hover:bg-(--color-brand-hover) disabled:opacity-50">
              {isSaving ? 'Sauvegarde…' : isEdit ? 'Sauvegarder' : 'Enregistrer l\'activité'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="rounded-(--radius-md) border border-(--color-border) px-6 py-3 text-sm text-(--color-text-secondary) hover:bg-(--color-bg-subtle)">
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
