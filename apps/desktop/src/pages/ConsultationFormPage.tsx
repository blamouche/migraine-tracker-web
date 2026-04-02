import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useConsultationStore } from '@/stores/consultationStore'
import type { ConsultationEntry, ConsultationType } from '@/types/consultation'
import {
  CONSULTATION_TYPE_LABELS,
  DEFAULT_SPECIALITES,
} from '@/types/consultation'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function nowTime(): string {
  return new Date().toTimeString().slice(0, 5)
}

const EMPTY_FORM: Omit<ConsultationEntry, 'id' | 'createdAt' | 'updatedAt'> = {
  date: today(),
  heure: nowTime(),
  medecin: '',
  specialite: '',
  type: 'cabinet',
  motif: '',
  resume: '',
  decisions: [],
  ordonnances: [],
  prochainRdv: null,
  notes: null,
}

export function ConsultationFormPage() {
  const navigate = useNavigate()
  const { consultationId } = useParams<{ consultationId: string }>()
  const { entries, loadConsultations, createConsultation, updateConsultation } = useConsultationStore()
  const isEdit = Boolean(consultationId)

  const [form, setForm] = useState<Omit<ConsultationEntry, 'id' | 'createdAt' | 'updatedAt'>>({ ...EMPTY_FORM })
  const [existingEntry, setExistingEntry] = useState<ConsultationEntry | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [newDecision, setNewDecision] = useState('')
  const [newOrdonnance, setNewOrdonnance] = useState('')
  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (entries.length === 0) loadConsultations()
  }, [entries.length, loadConsultations])

  useEffect(() => {
    if (isEdit && !existingEntry) {
      const found = entries.find((e) => e.id === consultationId)
      if (found) {
        setExistingEntry(found)
        setForm({
          date: found.date,
          heure: found.heure,
          medecin: found.medecin,
          specialite: found.specialite,
          type: found.type,
          motif: found.motif,
          resume: found.resume,
          decisions: [...found.decisions],
          ordonnances: [...found.ordonnances],
          prochainRdv: found.prochainRdv,
          notes: found.notes,
        })
      }
    }
  }, [entries, consultationId, isEdit]) // eslint-disable-line react-hooks/exhaustive-deps

  const doAutoSave = useCallback(async () => {
    if (isEdit && existingEntry && form.medecin) {
      await updateConsultation({ ...existingEntry, ...form, updatedAt: existingEntry.updatedAt })
    }
  }, [isEdit, existingEntry, form, updateConsultation])

  useEffect(() => {
    if (isEdit) {
      autoSaveTimer.current = setInterval(doAutoSave, 30_000)
      return () => { if (autoSaveTimer.current) clearInterval(autoSaveTimer.current) }
    }
  }, [doAutoSave, isEdit])

  const update = (partial: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...partial }))
  }

  const addDecision = () => {
    if (!newDecision.trim()) return
    setForm((prev) => ({ ...prev, decisions: [...prev.decisions, newDecision.trim()] }))
    setNewDecision('')
  }

  const removeDecision = (index: number) => {
    setForm((prev) => ({ ...prev, decisions: prev.decisions.filter((_, i) => i !== index) }))
  }

  const addOrdonnance = () => {
    if (!newOrdonnance.trim()) return
    setForm((prev) => ({ ...prev, ordonnances: [...prev.ordonnances, newOrdonnance.trim()] }))
    setNewOrdonnance('')
  }

  const removeOrdonnance = (index: number) => {
    setForm((prev) => ({ ...prev, ordonnances: prev.ordonnances.filter((_, i) => i !== index) }))
  }

  const handleSave = async () => {
    if (!form.medecin.trim()) return
    setIsSaving(true)
    try {
      if (isEdit && existingEntry) {
        await updateConsultation({ ...existingEntry, ...form })
      } else {
        await createConsultation(form)
      }
      navigate('/consultations/historique')
    } finally {
      setIsSaving(false)
    }
  }

  if (isEdit && !existingEntry && entries.length > 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base)">
        <p className="text-(--color-text-secondary)">Consultation introuvable</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            {isEdit ? 'Modifier la consultation' : 'Nouvelle consultation'}
          </h1>
          <button type="button" onClick={() => navigate(-1)} className="text-sm text-(--color-text-muted) hover:text-(--color-text-primary)">
            Retour
          </button>
        </div>

        <form className="mt-6 space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave() }}>
          {/* Date & Heure */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="consult-date" className="text-sm font-medium">Date *</label>
              <input id="consult-date" type="date" value={form.date} onChange={(e) => update({ date: e.target.value })} required className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="consult-heure" className="text-sm font-medium">Heure</label>
              <input id="consult-heure" type="time" value={form.heure} onChange={(e) => update({ heure: e.target.value })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm" />
            </div>
          </div>

          {/* Médecin & Spécialité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="consult-medecin" className="text-sm font-medium">Médecin *</label>
              <input id="consult-medecin" type="text" value={form.medecin} onChange={(e) => update({ medecin: e.target.value })} placeholder="Dr …" required className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="consult-specialite" className="text-sm font-medium">Spécialité</label>
              <select id="consult-specialite" value={form.specialite} onChange={(e) => update({ specialite: e.target.value })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm">
                <option value="">Sélectionner…</option>
                {DEFAULT_SPECIALITES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Type & Motif */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="consult-type" className="text-sm font-medium">Type</label>
              <select id="consult-type" value={form.type} onChange={(e) => update({ type: e.target.value as ConsultationType })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm">
                {Object.entries(CONSULTATION_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="consult-motif" className="text-sm font-medium">Motif</label>
              <input id="consult-motif" type="text" value={form.motif} onChange={(e) => update({ motif: e.target.value })} placeholder="Suivi, renouvellement…" className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm" />
            </div>
          </div>

          {/* Résumé */}
          <div>
            <label htmlFor="consult-resume" className="text-sm font-medium">Résumé</label>
            <textarea id="consult-resume" value={form.resume} onChange={(e) => update({ resume: e.target.value })} rows={4} placeholder="Points abordés, conclusions…" className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm resize-none" />
          </div>

          {/* Décisions */}
          <fieldset className="rounded-(--radius-lg) border border-(--color-border) p-4">
            <legend className="px-2 text-sm font-semibold">Décisions prises</legend>
            {form.decisions.length > 0 && (
              <ul className="mt-2 space-y-1">
                {form.decisions.map((d, i) => (
                  <li key={i} className="flex items-center justify-between rounded-(--radius-sm) bg-(--color-bg-subtle) px-3 py-1.5 text-sm">
                    {d}
                    <button type="button" onClick={() => removeDecision(i)} className="text-xs text-(--color-danger)">x</button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-2 flex gap-2">
              <input type="text" value={newDecision} onChange={(e) => setNewDecision(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDecision() } }} placeholder="Ajouter une décision…" className="flex-1 rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm" />
              <button type="button" onClick={addDecision} className="rounded-(--radius-md) bg-(--color-brand) px-3 py-2 text-sm text-(--color-text-inverse)">+</button>
            </div>
          </fieldset>

          {/* Ordonnances */}
          <fieldset className="rounded-(--radius-lg) border border-(--color-border) p-4">
            <legend className="px-2 text-sm font-semibold">Ordonnances</legend>
            {form.ordonnances.length > 0 && (
              <ul className="mt-2 space-y-1">
                {form.ordonnances.map((o, i) => (
                  <li key={i} className="flex items-center justify-between rounded-(--radius-sm) bg-(--color-bg-subtle) px-3 py-1.5 text-sm">
                    {o}
                    <button type="button" onClick={() => removeOrdonnance(i)} className="text-xs text-(--color-danger)">x</button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-2 flex gap-2">
              <input type="text" value={newOrdonnance} onChange={(e) => setNewOrdonnance(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOrdonnance() } }} placeholder="Ajouter une ordonnance…" className="flex-1 rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm" />
              <button type="button" onClick={addOrdonnance} className="rounded-(--radius-md) bg-(--color-brand) px-3 py-2 text-sm text-(--color-text-inverse)">+</button>
            </div>
          </fieldset>

          {/* Prochain RDV */}
          <div>
            <label htmlFor="consult-prochain" className="text-sm font-medium">Prochain rendez-vous</label>
            <input id="consult-prochain" type="date" value={form.prochainRdv ?? ''} onChange={(e) => update({ prochainRdv: e.target.value || null })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm" />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="consult-notes" className="text-sm font-medium">Notes</label>
            <textarea id="consult-notes" value={form.notes ?? ''} onChange={(e) => update({ notes: e.target.value || null })} rows={3} placeholder="Détails supplémentaires…" className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm resize-none" />
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button type="submit" disabled={isSaving || !form.medecin.trim()} className="flex-1 rounded-(--radius-md) bg-(--color-brand) py-3 text-sm font-semibold text-(--color-text-inverse) hover:bg-(--color-brand-hover) disabled:opacity-50">
              {isSaving ? 'Sauvegarde…' : isEdit ? 'Sauvegarder' : 'Enregistrer la consultation'}
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
