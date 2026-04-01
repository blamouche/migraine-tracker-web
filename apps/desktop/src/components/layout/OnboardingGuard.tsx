import { Navigate, Outlet } from 'react-router'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useAuthStore } from '@/stores/authStore'

export function OnboardingGuard() {
  const step = useOnboardingStore((s) => s.step)
  const isLoading = useAuthStore((s) => s.isLoading)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--color-bg-base)">
        <p className="text-sm text-(--color-text-secondary)">Chargement...</p>
      </div>
    )
  }

  if (step !== 'complete') {
    const redirectMap: Record<string, string> = {
      login: '/login',
      consent: '/onboarding/consent',
      'vault-selection': '/onboarding/vault',
      'medical-profile': '/onboarding/medical-profile',
    }
    return <Navigate to={redirectMap[step] ?? '/login'} replace />
  }

  return <Outlet />
}
