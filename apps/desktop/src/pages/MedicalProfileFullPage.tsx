import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useMedicalProfileStore } from '@/stores/medicalProfileStore'
import { useTreatmentStore } from '@/stores/treatmentStore'
import type { MedicalProfile, Doctor, MigraineType, ContraceptionType } from '@/types/medicalProfile'
import {
  MIGRAINE_TYPE_LABELS,
  CONTRACEPTION_LABELS,
  DOCTOR_SPECIALITY_LABELS,
  DEFAULT_ANTECEDENTS,
  DEFAULT_ALLERGIES,
} from '@/types/medicalProfile'

export function MedicalProfileFullPage() {
  const navigate = useNavigate()
  const { profile, loadProfile, saveProfile } = useMedicalProfileStore()
  const { treatments, loadTreatments } = useTreatmentStore()
  const [saved, setSaved] = useState(false)

  // Local form state
  const [migraineType, setMigraineType] = useState<MigraineType>(profile.migraineType)
  const [migraineTypeAutre, setMigraineTypeAutre] = useState(profile.migraineTypeAutre ?? '')
  const [traitementsCrise, setTraitementsCrise] = useState<string[]>(profile.traitementsCrise)
  const [traitementsFond, setTraitementsFond] = useState<string[]>(profile.traitementsFond)
  const [antecedents, setAntecedents] = useState<string[]>(profile.antecedentsCardiovasculaires)
  const [allergies, setAllergies] = useState<string[]>(profile.allergies)
  const [contreIndications, setContreIndications] = useState<string[]>(profile.contreIndications)
  const [contraception, setContraception] = useState<ContraceptionType>(profile.contraception)
  const [medecins, setMedecins] = useState<Doctor[]>(profile.medecins)
  const [notes, setNotes] = useState(profile.notes ?? '')

  // Custom input states
  const [customAntecedent, setCustomAntecedent] = useState('')
  const [customAllergie, setCustomAllergie] = useState('')
  const [customContreIndication, setCustomContreIndication] = useState('')

  useEffect(() => {
    loadProfile()
    if (treatments.length === 0) loadTreatments()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync form when profile loads from vault
  useEffect(() => {
    setMigraineType(profile.migraineType)
    setMigraineTypeAutre(profile.migraineTypeAutre ?? '')
    setTraitementsCrise(profile.traitementsCrise)
    setTraitementsFond(profile.traitementsFond)
    setAntecedents(profile.antecedentsCardiovasculaires)
    setAllergies(profile.allergies)
    setContreIndications(profile.contreIndications)
    setContraception(profile.contraception)
    setMedecins(profile.medecins)
    setNotes(profile.notes ?? '')
  }, [profile])

  // Active treatments from treatment store for quick-add suggestions
  const activeCriseTreatments = treatments
    .filter((t) => !t.dateFin && t.type === 'crise')
    .map((t) => t.nom)
  const activeFondTreatments = treatments
    .filter((t) => !t.dateFin && t.type === 'fond')
    .map((t) => t.nom)

  function handleSave() {
    const updated: MedicalProfile = {
      migraineType,
      migraineTypeAutre: migraineType === 'autre' ? migraineTypeAutre : null,
      traitementsCrise,
      traitementsFond,
      antecedentsCardiovasculaires: antecedents,
      allergies,
      contreIndications,
      contraception,
      medecins,
      notes: notes.trim() || null,
      updatedAt: new Date().toISOString(),
    }
    saveProfile(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function addDoctor() {
    setMedecins([...medecins, { nom: '', specialite: 'generaliste', coordonnees: '' }])
  }

  function updateDoctor(index: number, field: keyof Doctor, value: string) {
    const copy = [...medecins]
    copy[index] = { ...copy[index]!, [field]: value }
    setMedecins(copy)
  }

  function removeDoctor(index: number) {
    setMedecins(medecins.filter((_, i) => i !== index))
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-[800px] px-8 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Profil médical</h1>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
          >
            Retour
          </button>
        </div>

        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Ces informations personnalisent l'app et sont incluses dans vos rapports médicaux.
          Toutes les données restent stockées localement.
        </p>

        <div className="mt-8 space-y-8">
          {/* Migraine type */}
          <Section title="Type de migraine">
            <select
              value={migraineType}
              onChange={(e) => setMigraineType(e.target.value as MigraineType)}
              className="w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-4 py-3 text-sm text-(--color-text-primary) outline-none focus:border-(--color-brand)"
            >
              {(Object.entries(MIGRAINE_TYPE_LABELS) as [MigraineType, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            {migraineType === 'autre' && (
              <input
                type="text"
                value={migraineTypeAutre}
                onChange={(e) => setMigraineTypeAutre(e.target.value)}
                placeholder="Précisez..."
                className="mt-2 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-4 py-3 text-sm outline-none focus:border-(--color-brand) placeholder:text-(--color-text-muted)"
              />
            )}
          </Section>

          {/* Treatments */}
          <Section title="Traitements de crise en cours">
            <ChipEditor
              values={traitementsCrise}
              onChange={setTraitementsCrise}
              suggestions={activeCriseTreatments}
              placeholder="Ajouter un traitement de crise..."
            />
          </Section>

          <Section title="Traitements de fond en cours">
            <ChipEditor
              values={traitementsFond}
              onChange={setTraitementsFond}
              suggestions={activeFondTreatments}
              placeholder="Ajouter un traitement de fond..."
            />
          </Section>

          {/* Antecedents */}
          <Section title="Antécédents cardiovasculaires">
            <ChipSelector
              selected={antecedents}
              onChange={setAntecedents}
              options={DEFAULT_ANTECEDENTS}
            />
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={customAntecedent}
                onChange={(e) => setCustomAntecedent(e.target.value)}
                placeholder="Autre antécédent..."
                className="flex-1 rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-3 py-2 text-sm outline-none focus:border-(--color-brand) placeholder:text-(--color-text-muted)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customAntecedent.trim()) {
                    e.preventDefault()
                    if (!antecedents.includes(customAntecedent.trim())) {
                      setAntecedents([...antecedents, customAntecedent.trim()])
                    }
                    setCustomAntecedent('')
                  }
                }}
              />
            </div>
          </Section>

          {/* Allergies */}
          <Section title="Allergies">
            <ChipSelector
              selected={allergies}
              onChange={setAllergies}
              options={DEFAULT_ALLERGIES}
            />
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={customAllergie}
                onChange={(e) => setCustomAllergie(e.target.value)}
                placeholder="Autre allergie..."
                className="flex-1 rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-3 py-2 text-sm outline-none focus:border-(--color-brand) placeholder:text-(--color-text-muted)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customAllergie.trim()) {
                    e.preventDefault()
                    if (!allergies.includes(customAllergie.trim())) {
                      setAllergies([...allergies, customAllergie.trim()])
                    }
                    setCustomAllergie('')
                  }
                }}
              />
            </div>
          </Section>

          {/* Contre-indications */}
          <Section title="Contre-indications">
            <div className="flex flex-wrap gap-2">
              {contreIndications.map((ci) => (
                <span key={ci} className="flex items-center gap-1 rounded-(--radius-full) bg-(--color-danger-light) px-3 py-1 text-sm text-(--color-danger)">
                  {ci}
                  <button
                    type="button"
                    onClick={() => setContreIndications(contreIndications.filter((c) => c !== ci))}
                    className="ml-1 text-xs hover:opacity-70"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2">
              <input
                type="text"
                value={customContreIndication}
                onChange={(e) => setCustomContreIndication(e.target.value)}
                placeholder="Ajouter une contre-indication..."
                className="w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-3 py-2 text-sm outline-none focus:border-(--color-brand) placeholder:text-(--color-text-muted)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customContreIndication.trim()) {
                    e.preventDefault()
                    if (!contreIndications.includes(customContreIndication.trim())) {
                      setContreIndications([...contreIndications, customContreIndication.trim()])
                    }
                    setCustomContreIndication('')
                  }
                }}
              />
            </div>
          </Section>

          {/* Contraception */}
          <Section title="Contraception en cours">
            <select
              value={contraception}
              onChange={(e) => setContraception(e.target.value as ContraceptionType)}
              className="w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-4 py-3 text-sm text-(--color-text-primary) outline-none focus:border-(--color-brand)"
            >
              {(Object.entries(CONTRACEPTION_LABELS) as [ContraceptionType, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </Section>

          {/* Doctors */}
          <Section title="Médecins">
            {medecins.length === 0 && (
              <p className="text-sm text-(--color-text-muted)">Aucun médecin renseigné.</p>
            )}
            <div className="space-y-4">
              {medecins.map((doc, i) => (
                <div key={i} className="rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={doc.nom}
                        onChange={(e) => updateDoctor(i, 'nom', e.target.value)}
                        placeholder="Nom du médecin"
                        className="w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-3 py-2 text-sm outline-none focus:border-(--color-brand) placeholder:text-(--color-text-muted)"
                      />
                      <select
                        value={doc.specialite}
                        onChange={(e) => updateDoctor(i, 'specialite', e.target.value)}
                        className="w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-3 py-2 text-sm outline-none focus:border-(--color-brand)"
                      >
                        {(Object.entries(DOCTOR_SPECIALITY_LABELS) as [string, string][]).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={doc.coordonnees}
                        onChange={(e) => updateDoctor(i, 'coordonnees', e.target.value)}
                        placeholder="Téléphone, email ou adresse"
                        className="w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-3 py-2 text-sm outline-none focus:border-(--color-brand) placeholder:text-(--color-text-muted)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDoctor(i)}
                      className="ml-3 text-xs text-(--color-danger) hover:underline"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addDoctor}
              className="mt-3 w-full rounded-(--radius-md) border border-dashed border-(--color-border) py-2 text-sm text-(--color-text-muted) hover:border-(--color-brand) hover:text-(--color-brand)"
            >
              + Ajouter un médecin
            </button>
          </Section>

          {/* Notes */}
          <Section title="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Informations complémentaires..."
              className="w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-4 py-3 text-sm outline-none focus:border-(--color-brand) placeholder:text-(--color-text-muted) resize-none"
            />
          </Section>

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover)"
          >
            {saved ? 'Enregistré !' : 'Enregistrer le profil'}
          </button>
        </div>
      </div>
    </main>
  )
}

// ─── Sub-components ───

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-(--color-text-primary)">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function ChipSelector({
  selected,
  onChange,
  options,
}: {
  selected: string[]
  onChange: (v: string[]) => void
  options: string[]
}) {
  function toggle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`rounded-(--radius-full) border px-3 py-1.5 text-sm transition-colors ${
              isSelected
                ? 'border-(--color-brand) bg-(--color-brand-light) text-(--color-brand)'
                : 'border-(--color-border) text-(--color-text-secondary) hover:border-(--color-brand)'
            }`}
          >
            {opt}
          </button>
        )
      })}
      {/* Show custom values not in default options */}
      {selected
        .filter((s) => !options.includes(s))
        .map((custom) => (
          <span key={custom} className="flex items-center gap-1 rounded-(--radius-full) border border-(--color-brand) bg-(--color-brand-light) px-3 py-1.5 text-sm text-(--color-brand)">
            {custom}
            <button
              type="button"
              onClick={() => onChange(selected.filter((s) => s !== custom))}
              className="ml-1 text-xs hover:opacity-70"
            >
              x
            </button>
          </span>
        ))}
    </div>
  )
}

function ChipEditor({
  values,
  onChange,
  suggestions,
  placeholder,
}: {
  values: string[]
  onChange: (v: string[]) => void
  suggestions: string[]
  placeholder: string
}) {
  const [input, setInput] = useState('')

  function addValue(val: string) {
    const trimmed = val.trim()
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed])
    }
    setInput('')
  }

  // Suggestions not already added
  const availableSuggestions = suggestions.filter((s) => !values.includes(s))

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <span key={v} className="flex items-center gap-1 rounded-(--radius-full) border border-(--color-brand) bg-(--color-brand-light) px-3 py-1.5 text-sm text-(--color-brand)">
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((val) => val !== v))}
              className="ml-1 text-xs hover:opacity-70"
            >
              x
            </button>
          </span>
        ))}
      </div>
      {availableSuggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {availableSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addValue(s)}
              className="rounded-(--radius-full) border border-dashed border-(--color-border) px-2 py-1 text-xs text-(--color-text-muted) hover:border-(--color-brand) hover:text-(--color-brand)"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-3 py-2 text-sm outline-none focus:border-(--color-brand) placeholder:text-(--color-text-muted)"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addValue(input)
          }
        }}
      />
    </div>
  )
}
