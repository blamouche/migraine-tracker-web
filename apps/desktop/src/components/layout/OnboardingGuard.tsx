import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useAuthStore } from '@/stores/authStore'
import { checkVaultAccess } from '@/lib/vault/handle'

export function OnboardingGuard() {
  const step = useOnboardingStore((s) => s.step)
  const isLoading = useAuthStore((s) => s.isLoading)
  const user = useAuthStore((s) => s.user)
  const anonymousId = useAuthStore((s) => s.anonymousId)
  const [vaultStatus, setVaultStatus] = useState<'checking' | 'ok' | 'missing'>('checking')

  const userId = user?.id ?? anonymousId ?? 'default'

  useEffect(() => {
    if (step !== 'complete' || !user) {
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
  }, [step, user, userId])

  if (isLoading || vaultStatus === 'checking') {
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
