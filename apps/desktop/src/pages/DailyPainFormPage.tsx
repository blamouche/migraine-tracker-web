import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useDailyPainStore } from '@/stores/dailyPainStore'
import { useCrisisStore } from '@/stores/crisisStore'
import type { DailyPainEntry } from '@/types/dailyPain'
import { PAIN_NIVEAU_LABELS } from '@/types/dailyPain'

function today(): string { return new Date().toISOString().slice(0, 10) }

const EMPTY_FORM: Omit<DailyPainEntry, 'id' | 'createdAt' | 'updatedAt'> = {
  date: today(), niveau: 0, lieeACrise: false, criseId: null, notes: null,
}

export function DailyPainFormPage() {
  const navigate = useNavigate()
  const { painId } = useParams<{ painId: string }>()
  const { entries, loadPains, createPain, updatePain, getYesterdayLevel } = useDailyPainStore()
  const { crises } = useCrisisStore()
  const isEdit = Boolean(painId)

  const [form, setForm] = useState<Omit<DailyPainEntry, 'id' | 'createdAt' | 'updatedAt'>>({ ...EMPTY_FORM })
  const [existingEntry, setExistingEntry] = useState<DailyPainEntry | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const yesterdayLevel = getYesterdayLevel()
  const todayCrisis = crises.find((c) => c.date === form.date)

  useEffect(() => { if (entries.length === 0) loadPains() }, [entries.length, loadPains])

  useEffect(() => {
    if (isEdit && !existingEntry) {
      const found = entries.find((e) => e.id === painId)
      if (found) { setExistingEntry(found); setForm({ date: found.date, niveau: found.niveau, lieeACrise: found.lieeACrise, criseId: found.criseId, notes: found.notes }) }
    }
  }, [entries, painId, isEdit]) // eslint-disable-line react-hooks/exhaustive-deps

  const update = (partial: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...partial }))

  const handleSameAsYesterday = () => {
    if (yesterdayLevel !== null) update({ niveau: yesterdayLevel })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (isEdit && existingEntry) { await updatePain({ ...existingEntry, ...form }) }
      else { await createPain(form) }
      navigate('/douleur/historique')
    } finally { setIsSaving(false) }
  }

  if (isEdit && !existingEntry && entries.length > 0) {
    return <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base)"><p className="text-(--color-text-secondary)">Entrée introuvable</p></main>
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{isEdit ? 'Modifier' : 'Douleur du jour'}</h1>
          <button type="button" onClick={() => navigate(-1)} className="text-sm text-(--color-text-muted) hover:text-(--color-text-primary)">Retour</button>
        </div>

        <form className="mt-6 space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave() }}>
          <div>
            <label htmlFor="pain-date" className="text-sm font-medium">Date</label>
            <input id="pain-date" type="date" value={form.date} onChange={(e) => update({ date: e.target.value })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm" />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="pain-niveau" className="text-sm font-medium">Niveau de douleur (0-10)</label>
              {yesterdayLevel !== null && (
                <button type="button" onClick={handleSameAsYesterday} className="text-xs text-(--color-brand) hover:underline">
                  Même qu'hier ({yesterdayLevel})
                </button>
              )}
            </div>
            <input id="pain-niveau" type="range" min={0} max={10} value={form.niveau} onChange={(e) => update({ niveau: parseInt(e.target.value) })} className="mt-3 w-full" />
            <p className="mt-1 text-center text-sm font-medium">{form.niveau}/10 — {PAIN_NIVEAU_LABELS[form.niveau]}</p>
          </div>

          {/* Crisis link suggestion */}
          {form.niveau >= 7 && !todayCrisis && !form.lieeACrise && (
            <div className="rounded-(--radius-md) bg-(--color-warning-light) px-4 py-3 text-sm text-(--color-warning)">
              Niveau de douleur élevé — souhaitez-vous{' '}
              <button type="button" onClick={() => navigate('/crisis/quick')} className="underline font-medium">créer une crise</button> ?
            </div>
          )}

          <div className="flex items-center gap-3">
            <input id="pain-crise" type="checkbox" checked={form.lieeACrise} onChange={(e) => update({ lieeACrise: e.target.checked, criseId: e.target.checked && todayCrisis ? todayCrisis.id : null })} className="rounded border-(--color-border)" />
            <label htmlFor="pain-crise" className="text-sm">Liée à une crise</label>
            {form.lieeACrise && todayCrisis && <span className="text-xs text-(--color-text-muted)">(crise du {form.date})</span>}
          </div>

          <div>
            <label htmlFor="pain-notes" className="text-sm font-medium">Notes</label>
            <textarea id="pain-notes" value={form.notes ?? ''} onChange={(e) => update({ notes: e.target.value || null })} rows={2} placeholder="Observations…" className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm resize-none" />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={isSaving} className="flex-1 rounded-(--radius-md) bg-(--color-brand) py-3 text-sm font-semibold text-(--color-text-inverse) hover:bg-(--color-brand-hover) disabled:opacity-50">{isSaving ? 'Sauvegarde…' : isEdit ? 'Sauvegarder' : 'Enregistrer'}</button>
            <button type="button" onClick={() => navigate(-1)} className="rounded-(--radius-md) border border-(--color-border) px-6 py-3 text-sm text-(--color-text-secondary) hover:bg-(--color-bg-subtle)">Annuler</button>
          </div>
        </form>
      </div>
    </main>
  )
}
