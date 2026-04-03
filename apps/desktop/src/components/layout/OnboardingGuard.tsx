import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useAuthStore } from '@/stores/authStore'
import { checkVaultAccess } from '@/lib/vault/handle'
import { supabase } from '@/lib/supabase'

export function OnboardingGuard() {
  const step = useOnboardingStore((s) => s.step)
  const isLoading = useAuthStore((s) => s.isLoading)
  const user = useAuthStore((s) => s.user)
  const anonymousId = useAuthStore((s) => s.anonymousId)
  const [vaultStatus, setVaultStatus] = useState<'checking' | 'ok' | 'missing'>('checking')
  const [syncing, setSyncing] = useState(true)

  const userId = user?.id ?? anonymousId ?? 'default'

  // E39: Sync onboarding state from Supabase when local store is incomplete
  useEffect(() => {
    if (!user || step === 'complete') {
      setSyncing(false)
      return
    }

    let cancelled = false

    async function syncFromServer() {
      try {
        const { data: usage, error: usageError } = await supabase
          .from('user_usage')
          .select('cgu_consent_at, onboarding_profile_done')
          .eq('user_id', user!.id)
          .single()

        if (cancelled) return

        if (!usageError && usage?.cgu_consent_at) {
          const store = useOnboardingStore.getState()

          // Restore consent
          store.acceptConsent(true, false)

          // Check vault
          const vaultOk = await checkVaultAccess(user!.id)
          if (cancelled) return

          if (vaultOk) {
            store.markVaultReady()

            if (usage.onboarding_profile_done) {
              store.markMedicalProfileDone()
            }
          }
        }
      } catch {
        // Query failed — proceed with current local state
      }

      if (!cancelled) setSyncing(false)
    }

    syncFromServer()
    return () => { cancelled = true }
  }, [user, step])

  useEffect(() => {
    if (syncing || step !== 'complete' || !user) {
      setVaultStatus('ok')
      return
    }

    let cancelled = false
    checkVaultAccess(userId).then((accessible) => {
      if (!cancelled) {
        setVaultStatus(accessible ? 'ok' : 'missing')
      }
    })
    return () => { cancelled = true }
  }, [syncing, step, user, userId])

  if (isLoading || syncing || vaultStatus === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--color-bg-base)">
        <p className="text-sm text-(--color-text-secondary)">Chargement...</p>
      </div>
    )
  }

  // Not authenticated → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Authenticated but onboarding incomplete → redirect to correct step
  if (step !== 'complete') {
    const redirectMap: Record<string, string> = {
      login: '/onboarding/consent',
      consent: '/onboarding/consent',
      'vault-selection': '/onboarding/vault',
      'medical-profile': '/onboarding/medical-profile',
    }
    return <Navigate to={redirectMap[step] ?? '/onboarding/consent'} replace />
  }

  // Onboarding complete but vault inaccessible → reconnect
  if (vaultStatus === 'missing') {
    return <Navigate to="/vault/reconnect" replace />
  }

  return <Outlet />
}
