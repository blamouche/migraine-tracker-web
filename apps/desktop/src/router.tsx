import { createBrowserRouter } from 'react-router'
import { OnboardingGuard } from '@/components/layout/OnboardingGuard'
import { LoginPage } from '@/pages/LoginPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { ConsentPage } from '@/pages/ConsentPage'
import { VaultSelectionPage } from '@/pages/VaultSelectionPage'
import { MedicalProfilePage } from '@/pages/MedicalProfilePage'
import { HomePage } from '@/pages/HomePage'
import { CrisisModePage } from '@/pages/CrisisModePage'
import { CrisisFormPage } from '@/pages/CrisisFormPage'
import { CrisisHistoryPage } from '@/pages/CrisisHistoryPage'
import { FoodFormPage } from '@/pages/FoodFormPage'
import { FoodHistoryPage } from '@/pages/FoodHistoryPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ReportPage } from '@/pages/ReportPage'
import { ExportPage } from '@/pages/ExportPage'
import { AlertPreferencesPage } from '@/pages/AlertPreferencesPage'
import { TreatmentFormPage } from '@/pages/TreatmentFormPage'
import { TreatmentHistoryPage } from '@/pages/TreatmentHistoryPage'
import { PatternsPage } from '@/pages/PatternsPage'

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
      {
        path: '/crisis/quick',
        element: <CrisisModePage />,
      },
      {
        path: '/crisis/:crisisId/edit',
        element: <CrisisFormPage />,
      },
      {
        path: '/crisis/history',
        element: <CrisisHistoryPage />,
      },
      {
        path: '/alimentaire/nouveau',
        element: <FoodFormPage />,
      },
      {
        path: '/alimentaire/:foodId/edit',
        element: <FoodFormPage />,
      },
      {
        path: '/alimentaire/historique',
        element: <FoodHistoryPage />,
      },
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/rapport',
        element: <ReportPage />,
      },
      {
        path: '/export',
        element: <ExportPage />,
      },
      {
        path: '/alertes',
        element: <AlertPreferencesPage />,
      },
      {
        path: '/traitements/nouveau',
        element: <TreatmentFormPage />,
      },
      {
        path: '/traitements/:treatmentId/edit',
        element: <TreatmentFormPage />,
      },
      {
        path: '/traitements/historique',
        element: <TreatmentHistoryPage />,
      },
      {
        path: '/patterns',
        element: <PatternsPage />,
      },
    ],
  },
])
