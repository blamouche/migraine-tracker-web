import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { useOnboardingStore } from '@/stores/onboardingStore'

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

export function MedicalProfilePage() {
  const navigate = useNavigate()
  const { markMedicalProfileDone, completeOnboarding } = useOnboardingStore()

  const { register, handleSubmit } = useForm<MedicalProfileForm>({
    defaultValues: {
      migraineType: '',
      crisisTreatment: '',
      preventiveTreatment: '',
    },
  })

  const onSubmit = () => {
    // TODO: write to vault config/preferences.md when vault writer is implemented
    markMedicalProfileDone()
    navigate('/', { replace: true })
  }

  const handleSkip = () => {
    completeOnboarding()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--color-bg-base) px-4">
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
    </div>
  )
}
