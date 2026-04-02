import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useChargeMentaleStore } from '@/stores/chargeMentaleStore'
import type { ChargeMentaleEntry, ChargeDomaine, HumeurLevel } from '@/types/chargeMentale'
import { CHARGE_DOMAINE_LABELS, HUMEUR_LABELS, CHARGE_NIVEAU_LABELS, DEFAULT_CONTEXTES } from '@/types/chargeMentale'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

const EMPTY_FORM: Omit<ChargeMentaleEntry, 'id' | 'createdAt' | 'updatedAt'> = {
  date: today(),
  niveau: 5,
  domaine: 'professionnel',
  humeur: 'neutre',
  contexte: [],
  notes: null,
}

export function ChargeMentaleFormPage() {
  const navigate = useNavigate()
  const { chargeId } = useParams<{ chargeId: string }>()
  const { entries, loadCharges, createCharge, updateCharge } = useChargeMentaleStore()
  const isEdit = Boolean(chargeId)

  const [form, setForm] = useState<Omit<ChargeMentaleEntry, 'id' | 'createdAt' | 'updatedAt'>>({ ...EMPTY_FORM })
  const [existingEntry, setExistingEntry] = useState<ChargeMentaleEntry | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { if (entries.length === 0) loadCharges() }, [entries.length, loadCharges])

  useEffect(() => {
    if (isEdit && !existingEntry) {
      const found = entries.find((e) => e.id === chargeId)
      if (found) {
        setExistingEntry(found)
        setForm({ date: found.date, niveau: found.niveau, domaine: found.domaine, humeur: found.humeur, contexte: [...found.contexte], notes: found.notes })
      }
    }
  }, [entries, chargeId, isEdit]) // eslint-disable-line react-hooks/exhaustive-deps

  const doAutoSave = useCallback(async () => {
    if (isEdit && existingEntry) {
      await updateCharge({ ...existingEntry, ...form, updatedAt: existingEntry.updatedAt })
    }
  }, [isEdit, existingEntry, form, updateCharge])

  useEffect(() => {
    if (isEdit) {
      autoSaveTimer.current = setInterval(doAutoSave, 30_000)
      return () => { if (autoSaveTimer.current) clearInterval(autoSaveTimer.current) }
    }
  }, [doAutoSave, isEdit])

  const update = (partial: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...partial }))

  const toggleContexte = (ctx: string) => {
    setForm((prev) => ({
      ...prev,
      contexte: prev.contexte.includes(ctx) ? prev.contexte.filter((c) => c !== ctx) : [...prev.contexte, ctx],
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (isEdit && existingEntry) { await updateCharge({ ...existingEntry, ...form }) }
      else { await createCharge(form) }
      navigate('/charge-mentale/historique')
    } finally { setIsSaving(false) }
  }

  if (isEdit && !existingEntry && entries.length > 0) {
    return <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base)"><p className="text-(--color-text-secondary)">Entrée introuvable</p></main>
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{isEdit ? 'Modifier' : 'Charge mentale du jour'}</h1>
          <button type="button" onClick={() => navigate(-1)} className="text-sm text-(--color-text-muted) hover:text-(--color-text-primary)">Retour</button>
        </div>

        <form className="mt-6 space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave() }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="charge-date" className="text-sm font-medium">Date</label>
              <input id="charge-date" type="date" value={form.date} onChange={(e) => update({ date: e.target.value })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="charge-niveau" className="text-sm font-medium">Niveau (1-10) *</label>
              <input id="charge-niveau" type="range" min={1} max={10} value={form.niveau} onChange={(e) => update({ niveau: parseInt(e.target.value) })} className="mt-3 w-full" />
              <p className="mt-1 text-xs text-(--color-text-muted)">{form.niveau}/10 — {CHARGE_NIVEAU_LABELS[form.niveau]?.split(' — ')[0]}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="charge-domaine" className="text-sm font-medium">Domaine dominant</label>
              <select id="charge-domaine" value={form.domaine} onChange={(e) => update({ domaine: e.target.value as ChargeDomaine })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm">
                {Object.entries(CHARGE_DOMAINE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="charge-humeur" className="text-sm font-medium">Humeur</label>
              <select id="charge-humeur" value={form.humeur} onChange={(e) => update({ humeur: e.target.value as HumeurLevel })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm">
                {Object.entries(HUMEUR_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Contexte du jour</p>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_CONTEXTES.map((ctx) => (
                <button key={ctx} type="button" onClick={() => toggleContexte(ctx)} className={`rounded-(--radius-full) border px-3 py-1.5 text-sm transition-colors ${form.contexte.includes(ctx) ? 'border-(--color-brand) bg-(--color-brand-light) text-(--color-brand)' : 'border-(--color-border) text-(--color-text-muted) hover:border-(--color-brand)'}`}>
                  {ctx}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="charge-notes" className="text-sm font-medium">Notes</label>
            <textarea id="charge-notes" value={form.notes ?? ''} onChange={(e) => update({ notes: e.target.value || null })} rows={3} placeholder="Observations…" className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm resize-none" />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={isSaving} className="flex-1 rounded-(--radius-md) bg-(--color-brand) py-3 text-sm font-semibold text-(--color-text-inverse) hover:bg-(--color-brand-hover) disabled:opacity-50">
              {isSaving ? 'Sauvegarde…' : isEdit ? 'Sauvegarder' : 'Enregistrer'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="rounded-(--radius-md) border border-(--color-border) px-6 py-3 text-sm text-(--color-text-secondary) hover:bg-(--color-bg-subtle)">Annuler</button>
          </div>
        </form>
      </div>
    </main>
  )
}
