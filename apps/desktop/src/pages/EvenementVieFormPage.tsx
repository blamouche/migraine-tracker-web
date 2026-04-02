import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useChargeMentaleStore } from '@/stores/chargeMentaleStore'
import type { EvenementVie, EvenementCategorie, EvenementNature } from '@/types/chargeMentale'
import { EVENEMENT_CATEGORIE_LABELS, EVENEMENT_NATURE_LABELS } from '@/types/chargeMentale'

function today(): string { return new Date().toISOString().slice(0, 10) }

const EMPTY_FORM: Omit<EvenementVie, 'id' | 'createdAt' | 'updatedAt'> = {
  dateDebut: today(), dateFin: null, categorie: 'professionnel', nature: 'neutre', intensite: 3, description: '', notes: null,
}

export function EvenementVieFormPage() {
  const navigate = useNavigate()
  const { evenementId } = useParams<{ evenementId: string }>()
  const { evenements, loadEvenements, createEvenement, updateEvenement } = useChargeMentaleStore()
  const isEdit = Boolean(evenementId)

  const [form, setForm] = useState<Omit<EvenementVie, 'id' | 'createdAt' | 'updatedAt'>>({ ...EMPTY_FORM })
  const [existingEntry, setExistingEntry] = useState<EvenementVie | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => { if (evenements.length === 0) loadEvenements() }, [evenements.length, loadEvenements])

  useEffect(() => {
    if (isEdit && !existingEntry) {
      const found = evenements.find((e) => e.id === evenementId)
      if (found) { setExistingEntry(found); setForm({ dateDebut: found.dateDebut, dateFin: found.dateFin, categorie: found.categorie, nature: found.nature, intensite: found.intensite, description: found.description, notes: found.notes }) }
    }
  }, [evenements, evenementId, isEdit]) // eslint-disable-line react-hooks/exhaustive-deps

  const update = (partial: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...partial }))

  const handleSave = async () => {
    if (!form.description.trim()) return
    setIsSaving(true)
    try {
      if (isEdit && existingEntry) { await updateEvenement({ ...existingEntry, ...form }) }
      else { await createEvenement(form) }
      navigate('/charge-mentale/historique')
    } finally { setIsSaving(false) }
  }

  if (isEdit && !existingEntry && evenements.length > 0) {
    return <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base)"><p className="text-(--color-text-secondary)">Événement introuvable</p></main>
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{isEdit ? 'Modifier l\'événement' : 'Nouvel événement de vie'}</h1>
          <button type="button" onClick={() => navigate(-1)} className="text-sm text-(--color-text-muted) hover:text-(--color-text-primary)">Retour</button>
        </div>

        <form className="mt-6 space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave() }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="evt-debut" className="text-sm font-medium">Date de début *</label>
              <input id="evt-debut" type="date" value={form.dateDebut} onChange={(e) => update({ dateDebut: e.target.value })} required className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="evt-fin" className="text-sm font-medium">Date de fin</label>
              <input id="evt-fin" type="date" value={form.dateFin ?? ''} onChange={(e) => update({ dateFin: e.target.value || null })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="evt-categorie" className="text-sm font-medium">Catégorie</label>
              <select id="evt-categorie" value={form.categorie} onChange={(e) => update({ categorie: e.target.value as EvenementCategorie })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm">
                {Object.entries(EVENEMENT_CATEGORIE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="evt-nature" className="text-sm font-medium">Nature</label>
              <select id="evt-nature" value={form.nature} onChange={(e) => update({ nature: e.target.value as EvenementNature })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm">
                {Object.entries(EVENEMENT_NATURE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="evt-intensite" className="text-sm font-medium">Intensité (1-5)</label>
              <input id="evt-intensite" type="number" min={1} max={5} value={form.intensite} onChange={(e) => update({ intensite: parseInt(e.target.value) || 3 })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label htmlFor="evt-description" className="text-sm font-medium">Description *</label>
            <textarea id="evt-description" value={form.description} onChange={(e) => update({ description: e.target.value })} rows={4} required placeholder="Décrivez l'événement…" className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm resize-none" />
          </div>

          <div>
            <label htmlFor="evt-notes" className="text-sm font-medium">Notes</label>
            <textarea id="evt-notes" value={form.notes ?? ''} onChange={(e) => update({ notes: e.target.value || null })} rows={2} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm resize-none" />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={isSaving || !form.description.trim()} className="flex-1 rounded-(--radius-md) bg-(--color-brand) py-3 text-sm font-semibold text-(--color-text-inverse) hover:bg-(--color-brand-hover) disabled:opacity-50">{isSaving ? 'Sauvegarde…' : isEdit ? 'Sauvegarder' : 'Enregistrer'}</button>
            <button type="button" onClick={() => navigate(-1)} className="rounded-(--radius-md) border border-(--color-border) px-6 py-3 text-sm text-(--color-text-secondary) hover:bg-(--color-bg-subtle)">Annuler</button>
          </div>
        </form>
      </div>
    </main>
  )
}
