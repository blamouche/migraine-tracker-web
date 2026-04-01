import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useMedicalProfileStore } from '@/stores/medicalProfileStore'
import type { MigraineType } from '@/types/medicalProfile'

interface MedicalProfileForm {
  migraineType: string
  crisisTreatment: string
  preventiveTreatment: string
}

const MIGRAINE_TYPES = [
  'Migraine sans aura',
  'Migraine avec aura',
  'Migraine chronique',
  'Migraine menstruelle',
  'Migraine vestibulaire',
  'Autre',
]

const TYPE_MAP: Record<string, MigraineType> = {
  'Migraine sans aura': 'sans-aura',
  'Migraine avec aura': 'avec-aura',
  'Migraine chronique': 'chronique',
  'Migraine menstruelle': 'menstruelle',
  'Migraine vestibulaire': 'vestibulaire',
  'Autre': 'autre',
}

export function MedicalProfilePage() {
  const navigate = useNavigate()
  const { markMedicalProfileDone, completeOnboarding } = useOnboardingStore()
  const { profile, saveProfile } = useMedicalProfileStore()

  const { register, handleSubmit } = useForm<MedicalProfileForm>({
    defaultValues: {
      migraineType: '',
      crisisTreatment: '',
      preventiveTreatment: '',
    },
  })

  const onSubmit = (data: MedicalProfileForm) => {
    // Save to medical profile store & vault
    const traitementsCrise = data.crisisTreatment
      ? data.crisisTreatment.split(',').map((s) => s.trim()).filter(Boolean)
      : []
    const traitementsFond = data.preventiveTreatment
      ? data.preventiveTreatment.split(',').map((s) => s.trim()).filter(Boolean)
      : []
    saveProfile({
      ...profile,
      migraineType: TYPE_MAP[data.migraineType] ?? 'sans-aura',
      traitementsCrise,
      traitementsFond,
      updatedAt: new Date().toISOString(),
    })
    markMedicalProfileDone()
    navigate('/', { replace: true })
  }

  const handleSkip = () => {
    completeOnboarding()
    navigate('/', { replace: true })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base) px-4">
      <div className="w-full max-w-[480px] rounded-(--radius-xl) bg-(--color-bg-elevated) p-8 shadow-lg">
        <h1 className="text-xl font-bold text-(--color-text-primary)">Profil médical rapide</h1>
        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Ces informations permettent de personnaliser votre expérience. Tous les champs sont
          optionnels.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-5">
          {/* Migraine type */}
          <div>
            <label
              htmlFor="mp-type"
              className="mb-1 block text-sm font-medium text-(--color-text-primary)"
            >
              Type de migraine
            </label>
            <select
              id="mp-type"
              {...register('migraineType')}
              className="w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-4 py-3 text-sm text-(--color-text-primary) outline-none transition-colors focus:border-(--color-brand)"
            >
              <option value="">Sélectionner (optionnel)</option>
              {MIGRAINE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Crisis treatment */}
          <div>
            <label
              htmlFor="mp-crisis"
              className="mb-1 block text-sm font-medium text-(--color-text-primary)"
            >
              Traitement de crise habituel
            </label>
            <input
              id="mp-crisis"
              type="text"
              placeholder="ex: Ibuprofène, Triptan..."
              {...register('crisisTreatment')}
              className="w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-4 py-3 text-sm text-(--color-text-primary) outline-none transition-colors focus:border-(--color-brand) placeholder:text-(--color-text-muted)"
            />
          </div>

          {/* Preventive treatment */}
          <div>
            <label
              htmlFor="mp-preventive"
              className="mb-1 block text-sm font-medium text-(--color-text-primary)"
            >
              Traitement de fond
            </label>
            <input
              id="mp-preventive"
              type="text"
              placeholder="ex: Topiramate, Propranolol..."
              {...register('preventiveTreatment')}
              className="w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-4 py-3 text-sm text-(--color-text-primary) outline-none transition-colors focus:border-(--color-brand) placeholder:text-(--color-text-muted)"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-(--radius-md) bg-(--color-brand) px-4 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover)"
          >
            Enregistrer et continuer
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="text-sm text-(--color-text-muted) underline hover:text-(--color-text-secondary)"
          >
            Passer pour l&apos;instant
          </button>

          <p className="text-center text-xs text-(--color-text-muted)">
            Vous pourrez compléter votre profil médical dans les préférences.
          </p>
        </form>
      </div>
    </main>
  )
}
