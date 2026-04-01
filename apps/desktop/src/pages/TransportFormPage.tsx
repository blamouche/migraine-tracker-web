import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useTransportStore } from '@/stores/transportStore'
import type { TransportEntry, TransportMoyen } from '@/types/transport'
import {
  TRANSPORT_MOYEN_LABELS,
  DEFAULT_TRANSPORT_CONDITIONS,
} from '@/types/transport'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function nowTime(): string {
  return new Date().toTimeString().slice(0, 5)
}

const EMPTY_FORM: Omit<TransportEntry, 'id' | 'createdAt' | 'updatedAt'> = {
  date: today(),
  heure: nowTime(),
  moyen: 'voiture',
  dureeMinutes: 30,
  conditions: [],
  distance: null,
  notes: null,
}

export function TransportFormPage() {
  const navigate = useNavigate()
  const { transportId } = useParams<{ transportId: string }>()
  const { entries, loadTransports, createTransport, updateTransport } = useTransportStore()
  const isEdit = Boolean(transportId)

  const [form, setForm] = useState<Omit<TransportEntry, 'id' | 'createdAt' | 'updatedAt'>>({ ...EMPTY_FORM })
  const [existingEntry, setExistingEntry] = useState<TransportEntry | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (entries.length === 0) loadTransports()
  }, [entries.length, loadTransports])

  useEffect(() => {
    if (isEdit && !existingEntry) {
      const found = entries.find((e) => e.id === transportId)
      if (found) {
        setExistingEntry(found)
        setForm({
          date: found.date,
          heure: found.heure,
          moyen: found.moyen,
          dureeMinutes: found.dureeMinutes,
          conditions: [...found.conditions],
          distance: found.distance,
          notes: found.notes,
        })
      }
    }
  }, [entries, transportId, isEdit]) // eslint-disable-line react-hooks/exhaustive-deps

  const doAutoSave = useCallback(async () => {
    if (isEdit && existingEntry) {
      await updateTransport({ ...existingEntry, ...form, updatedAt: existingEntry.updatedAt })
    }
  }, [isEdit, existingEntry, form, updateTransport])

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
        await updateTransport({ ...existingEntry, ...form })
      } else {
        await createTransport(form)
      }
      navigate('/transports/historique')
    } finally {
      setIsSaving(false)
    }
  }

  if (isEdit && !existingEntry && entries.length > 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base)">
        <p className="text-(--color-text-secondary)">Trajet introuvable</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            {isEdit ? 'Modifier le trajet' : 'Nouveau trajet'}
          </h1>
          <button type="button" onClick={() => navigate(-1)} className="text-sm text-(--color-text-muted) hover:text-(--color-text-primary)">
            Retour
          </button>
        </div>

        <form className="mt-6 space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave() }}>
          {/* Date & Heure */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="transport-date" className="text-sm font-medium">Date *</label>
              <input id="transport-date" type="date" value={form.date} onChange={(e) => update({ date: e.target.value })} required className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="transport-heure" className="text-sm font-medium">Heure</label>
              <input id="transport-heure" type="time" value={form.heure} onChange={(e) => update({ heure: e.target.value })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm" />
            </div>
          </div>

          {/* Moyen & Durée */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="transport-moyen" className="text-sm font-medium">Moyen de transport *</label>
              <select id="transport-moyen" value={form.moyen} onChange={(e) => update({ moyen: e.target.value as TransportMoyen })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm">
                {Object.entries(TRANSPORT_MOYEN_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="transport-duree" className="text-sm font-medium">Durée (minutes)</label>
              <input id="transport-duree" type="number" min={1} value={form.dureeMinutes} onChange={(e) => update({ dureeMinutes: parseInt(e.target.value) || 0 })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm" />
            </div>
          </div>

          {/* Distance (optionnel) */}
          <div>
            <label htmlFor="transport-distance" className="text-sm font-medium">Distance (km, optionnel)</label>
            <input id="transport-distance" type="text" value={form.distance ?? ''} onChange={(e) => update({ distance: e.target.value || null })} placeholder="Ex : 45 km" className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm" />
          </div>

          {/* Conditions */}
          <div>
            <p className="text-sm font-medium mb-2">Conditions</p>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_TRANSPORT_CONDITIONS.map((condition) => (
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
            <label htmlFor="transport-notes" className="text-sm font-medium">Notes</label>
            <textarea id="transport-notes" value={form.notes ?? ''} onChange={(e) => update({ notes: e.target.value || null })} rows={3} placeholder="Détails supplémentaires…" className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm resize-none" />
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button type="submit" disabled={isSaving} className="flex-1 rounded-(--radius-md) bg-(--color-brand) py-3 text-sm font-semibold text-(--color-text-inverse) hover:bg-(--color-brand-hover) disabled:opacity-50">
              {isSaving ? 'Sauvegarde…' : isEdit ? 'Sauvegarder' : 'Enregistrer le trajet'}
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
