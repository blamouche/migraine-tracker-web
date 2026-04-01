import { createBrowserRouter } from 'react-router'
import { OnboardingGuard } from '@/components/layout/OnboardingGuard'
import { LoginPage } from '@/pages/LoginPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { ConsentPage } from '@/pages/ConsentPage'
import { VaultSelectionPage } from '@/pages/VaultSelectionPage'
import { MedicalProfilePage } from '@/pages/MedicalProfilePage'
import { HomePage } from '@/pages/HomePage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },
  {
    path: '/onboarding/consent',
    element: <ConsentPage />,
  },
  {
    path: '/onboarding/vault',
    element: <VaultSelectionPage />,
  },
  {
    path: '/onboarding/medical-profile',
    element: <MedicalProfilePage />,
  },
  {
    element: <OnboardingGuard />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
    ],
  },
])
