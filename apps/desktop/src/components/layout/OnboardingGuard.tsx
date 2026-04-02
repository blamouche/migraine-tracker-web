import { Navigate, Outlet } from 'react-router'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useAuthStore } from '@/stores/authStore'

export function OnboardingGuard() {
  const step = useOnboardingStore((s) => s.step)
  const isLoading = useAuthStore((s) => s.isLoading)
  const user = useAuthStore((s) => s.user)

  if (isLoading) {
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
      'profile-setup': '/onboarding/profile',
      'vault-selection': '/onboarding/vault',
      'medical-profile': '/onboarding/medical-profile',
    }
    return <Navigate to={redirectMap[step] ?? '/onboarding/consent'} replace />
  }

  return <Outlet />
}
