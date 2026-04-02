import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useCrisisStore } from '@/stores/crisisStore'
import { useMedicalProfileStore } from '@/stores/medicalProfileStore'
import { useConsultationStore } from '@/stores/consultationStore'
import { generateMedicalReport } from '@/lib/export/pdf'

type PeriodPreset = '1m' | '3m' | '6m' | 'custom'

const PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: '1m', label: '1 mois' },
  { value: '3m', label: '3 mois' },
  { value: '6m', label: '6 mois' },
  { value: 'custom', label: 'Personnalisé' },
]

function presetToRange(preset: PeriodPreset): { from: string; to: string } {
  const to = new Date()
  const from = new Date()

  switch (preset) {
    case '1m':
      from.setMonth(to.getMonth() - 1)
      break
    case '3m':
      from.setMonth(to.getMonth() - 3)
      break
    case '6m':
      from.setMonth(to.getMonth() - 6)
      break
    case 'custom':
      from.setMonth(to.getMonth() - 1)
      break
  }

  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  }
}

export function ReportPage() {
  const navigate = useNavigate()
  const crises = useCrisisStore((s) => s.crises)
  const { profile, loadProfile } = useMedicalProfileStore()
  const { entries: consultations, loadConsultations } = useConsultationStore()
  const [preset, setPreset] = useState<PeriodPreset>('3m')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadProfile()
    if (consultations.length === 0) loadConsultations()
  }, [loadProfile]) // eslint-disable-line react-hooks/exhaustive-deps

  const range = preset === 'custom' && customFrom && customTo
    ? { from: customFrom, to: customTo }
    : presetToRange(preset)

  const crisesInRange = crises.filter((c) => c.date >= range.from && c.date <= range.to)

  function handleGenerate() {
    setGenerating(true)
    try {
      generateMedicalReport({ from: range.from, to: range.to, crises, medicalProfile: profile, consultations })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-[800px] px-8 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Rapport médical</h1>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
          >
            Accueil
          </button>
        </div>

        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Générez un rapport PDF structuré pour votre prochaine consultation. Le document est
          généré entièrement sur votre appareil — aucune donnée n'est transmise.
        </p>

        {/* Period selector */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-(--color-text-primary)">Période</h2>
          <div className="mt-3 flex gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPreset(p.value)}
                className={`rounded-(--radius-md) px-4 py-2 text-sm font-medium transition-colors ${
                  preset === p.value
                    ? 'bg-(--color-brand) text-(--color-text-inverse)'
                    : 'bg-(--color-bg-subtle) text-(--color-text-secondary) hover:bg-(--color-bg-interactive)'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {preset === 'custom' && (
            <div className="mt-3 flex gap-3">
              <div>
                <label htmlFor="from" className="text-xs text-(--color-text-muted)">Du</label>
                <input
                  id="from"
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="mt-1 block rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="to" className="text-xs text-(--color-text-muted)">Au</label>
                <input
                  id="to"
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="mt-1 block rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}
        </section>

        {/* Preview info */}
        <section className="mt-8 rounded-(--radius-lg) bg-(--color-bg-elevated) p-6">
          <h2 className="text-sm font-semibold">Aperçu du contenu</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-(--color-text-muted)">Période</dt>
              <dd className="mt-1 font-medium">
                {new Date(range.from + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' — '}
                {new Date(range.to + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </dd>
            </div>
            <div>
              <dt className="text-(--color-text-muted)">Crises sur la période</dt>
              <dd className="mt-1 font-medium">{crisesInRange.length}</dd>
            </div>
          </dl>

          <div className="mt-4 text-xs text-(--color-text-muted)">
            Le rapport inclura : résumé de période, fréquence et intensité, durée des crises,
            traitements utilisés, top 5 déclencheurs, score HIT-6, et le détail de chaque crise.
          </div>
        </section>

        {/* Generate button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || crisesInRange.length === 0}
          className="mt-8 w-full rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover) disabled:opacity-50"
        >
          {generating ? 'Génération en cours...' : 'Générer le rapport PDF'}
        </button>

        {crisesInRange.length === 0 && (
          <p className="mt-3 text-center text-xs text-(--color-text-muted)">
            Aucune crise enregistrée sur cette période. Le rapport ne peut pas être généré.
          </p>
        )}
      </div>
    </main>
  )
}
