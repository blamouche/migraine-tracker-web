import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '@/lib/supabase'
import { removeAnonymousId, getAnonymousId } from '@/lib/anonymous'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { checkVaultAccess } from '@/lib/vault/handle'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      try {
        const { data, error: authError } = await supabase.auth.getSession()

        if (authError) {
          setError('Ce lien de connexion a expiré. Demandez-en un nouveau.')
          return
        }

        if (data.session) {
          const userId = data.session.user.id

          // Merge anonymous ID if exists
          const anonId = await getAnonymousId()
          if (anonId) {
            try {
              await supabase.rpc('merge_anonymous_id', {
                p_anonymous_id: anonId,
                p_user_id: userId,
              })
            } catch {
              // Non-blocking: merge failure doesn't prevent login
            }
            await removeAnonymousId()
          }

          // E39: Check if returning user with complete profile
          try {
            const { data: usage, error: usageError } = await supabase
              .from('user_usage')
              .select('cgu_consent_at, onboarding_profile_done')
              .eq('user_id', userId)
              .single()

            if (!usageError && usage?.cgu_consent_at) {
              const store = useOnboardingStore.getState()

              // CGU already accepted — restore consent state
              store.acceptConsent(true, false)

              // Check vault access
              const vaultOk = await checkVaultAccess(userId)
              if (vaultOk) {
                store.markVaultReady()
              } else {
                // Vault missing — go to vault selection
                navigate('/onboarding/vault', { replace: true })
                return
              }

              // Check medical profile
              if (usage.onboarding_profile_done) {
                store.markMedicalProfileDone()
                // Fully complete — skip onboarding entirely
                navigate('/', { replace: true })
                return
              } else {
                // Only medical profile missing
                navigate('/onboarding/medical-profile', { replace: true })
                return
              }
            }
          } catch {
            // No user_usage record or query failed — proceed to normal onboarding
          }

          navigate('/onboarding/consent', { replace: true })
        } else {
          setError('Ce lien de connexion a expiré. Demandez-en un nouveau.')
        }
      } catch {
        setError('Une erreur est survenue. Veuillez réessayer.')
      }
    }

    handleCallback()
  }, [navigate])

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base) px-4">
        <div className="w-full max-w-[400px] rounded-(--radius-xl) bg-(--color-bg-elevated) p-8 text-center shadow-lg">
          <div className="mb-4 rounded-(--radius-md) bg-(--color-danger-light) px-4 py-3 text-sm text-(--color-danger)">
            {error}
          </div>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover)"
          >
            Retour à la connexion
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base)">
      <p className="text-sm text-(--color-text-secondary)">Connexion en cours...</p>
    </main>
  )
}
