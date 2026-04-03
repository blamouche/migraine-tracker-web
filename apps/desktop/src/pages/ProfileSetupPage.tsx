import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'
import { PROFILE_COLORS } from '@/types/profile'
import { supabase } from '@/lib/supabase'

function getDefaultProfileName(user: ReturnType<typeof useAuthStore.getState>['user']): string {
  if (!user) return ''
  const meta = user.user_metadata
  if (meta?.given_name) return meta.given_name as string
  if (meta?.full_name) return (meta.full_name as string).split(' ')[0] ?? ''
  if (meta?.name) return (meta.name as string).split(' ')[0] ?? ''
  return ''
}

export function ProfileSetupPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const markProfileCreated = useOnboardingStore((s) => s.markProfileCreated)
  const createProfile = useProfileStore((s) => s.createProfile)

  const [nom, setNom] = useState(() => getDefaultProfileName(user))
  const [couleur, setCouleur] = useState(PROFILE_COLORS[0]!)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nom.trim()) return

    setSubmitting(true)

    const profile = createProfile({
      nom: nom.trim(),
      couleur,
      vaultPath: null,
      plan: 'free',
    })

    // Sync to Supabase if authenticated
    if (user) {
      try {
        await Promise.all([
          supabase.from('user_profiles').insert({
            user_id: user.id,
            profile_local_id: profile.id,
            label: profile.nom,
            color: profile.couleur,
          }),
          supabase.from('profile_plans').insert({
            user_id: user.id,
            profile_local_id: profile.id,
            plan: 'free',
            plan_activated_at: new Date().toISOString(),
          }),
        ])
      } catch {
        // Non-blocking — will sync later
      }
    }

    markProfileCreated()
    navigate('/onboarding/vault', { replace: true })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base) px-4">
      <div className="w-full max-w-[480px] rounded-(--radius-xl) bg-(--color-bg-elevated) p-8 shadow-lg">
        <h1 className="text-xl font-bold text-(--color-text-primary)">
          Créez votre profil
        </h1>
        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Donnez un nom à votre profil pour commencer votre suivi.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          {/* Profile name */}
          <div>
            <label htmlFor="profile-name" className="text-sm font-medium text-(--color-text-primary)">
              Nom du profil <span className="text-(--color-danger)">*</span>
            </label>
            <input
              id="profile-name"
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex : Moi, Sarah, Mon suivi…"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              className="mt-1.5 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-3 py-2.5 text-sm text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:border-(--color-brand) focus:outline-none focus:ring-1 focus:ring-(--color-brand)"
            />
          </div>

          {/* Color picker */}
          <div>
            <span className="text-sm font-medium text-(--color-text-primary)">
              Couleur d&apos;identification
            </span>
            <div className="mt-2 flex gap-2.5">
              {PROFILE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setCouleur(color)}
                  className={`h-9 w-9 rounded-full border-2 transition-transform ${
                    couleur === color
                      ? 'scale-110 border-white ring-2 ring-(--color-brand)'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Couleur ${color}`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!nom.trim() || submitting}
            className="mt-2 w-full rounded-(--radius-md) bg-(--color-brand) px-4 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover) disabled:opacity-50"
          >
            {submitting ? 'Création…' : 'Continuer'}
          </button>
        </form>
      </div>
    </main>
  )
}
