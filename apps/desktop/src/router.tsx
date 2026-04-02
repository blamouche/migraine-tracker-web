import { createBrowserRouter } from 'react-router'
import { OnboardingGuard } from '@/components/layout/OnboardingGuard'
import { AppLayout } from '@/components/layout/AppLayout'
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
import { MedicalProfileFullPage } from '@/pages/MedicalProfileFullPage'
import { IAModulePage } from '@/pages/IAModulePage'
import { MobileSyncPage } from '@/pages/MobileSyncPage'
import { ChargeMentaleFormPage } from '@/pages/ChargeMentaleFormPage'
import { ChargeMentaleHistoryPage } from '@/pages/ChargeMentaleHistoryPage'
import { EvenementVieFormPage } from '@/pages/EvenementVieFormPage'
import { DailyPainFormPage } from '@/pages/DailyPainFormPage'
import { DailyPainHistoryPage } from '@/pages/DailyPainHistoryPage'
import { ProfileManagerPage } from '@/pages/ProfileManagerPage'
import { EnvironnementSettingsPage } from '@/pages/EnvironnementSettingsPage'
import { CycleFormPage } from '@/pages/CycleFormPage'
import { CycleHistoryPage } from '@/pages/CycleHistoryPage'
import { ConsultationFormPage } from '@/pages/ConsultationFormPage'
import { ConsultationHistoryPage } from '@/pages/ConsultationHistoryPage'
import { TransportFormPage } from '@/pages/TransportFormPage'
import { TransportHistoryPage } from '@/pages/TransportHistoryPage'
import { SportFormPage } from '@/pages/SportFormPage'
import { SportHistoryPage } from '@/pages/SportHistoryPage'

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
        // E23 — AppLayout wraps all protected routes
        element: <AppLayout />,
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
          {
            path: '/profil-medical',
            element: <MedicalProfileFullPage />,
          },
          // E10 — Cycle menstruel
          {
            path: '/cycle/nouveau',
            element: <CycleFormPage />,
          },
          {
            path: '/cycle/:cycleId/edit',
            element: <CycleFormPage />,
          },
          {
            path: '/cycle/historique',
            element: <CycleHistoryPage />,
          },
          // E11 — Consultations
          {
            path: '/consultations/nouveau',
            element: <ConsultationFormPage />,
          },
          {
            path: '/consultations/:consultationId/edit',
            element: <ConsultationFormPage />,
          },
          {
            path: '/consultations/historique',
            element: <ConsultationHistoryPage />,
          },
          // E12 — Transports
          {
            path: '/transports/nouveau',
            element: <TransportFormPage />,
          },
          {
            path: '/transports/:transportId/edit',
            element: <TransportFormPage />,
          },
          {
            path: '/transports/historique',
            element: <TransportHistoryPage />,
          },
          // E13 — Sport
          {
            path: '/sport/nouveau',
            element: <SportFormPage />,
          },
          {
            path: '/sport/:sportId/edit',
            element: <SportFormPage />,
          },
          {
            path: '/sport/historique',
            element: <SportHistoryPage />,
          },
          // E15 — Charge mentale
          {
            path: '/charge-mentale/nouveau',
            element: <ChargeMentaleFormPage />,
          },
          {
            path: '/charge-mentale/:chargeId/edit',
            element: <ChargeMentaleFormPage />,
          },
          {
            path: '/charge-mentale/historique',
            element: <ChargeMentaleHistoryPage />,
          },
          {
            path: '/evenement/nouveau',
            element: <EvenementVieFormPage />,
          },
          {
            path: '/evenement/:evenementId/edit',
            element: <EvenementVieFormPage />,
          },
          // E16 — Douleur quotidienne
          {
            path: '/douleur/nouveau',
            element: <DailyPainFormPage />,
          },
          {
            path: '/douleur/:painId/edit',
            element: <DailyPainFormPage />,
          },
          {
            path: '/douleur/historique',
            element: <DailyPainHistoryPage />,
          },
          // E17 — Multi-profil
          {
            path: '/profils',
            element: <ProfileManagerPage />,
          },
          // E18 — Environnement
          {
            path: '/environnement',
            element: <EnvironnementSettingsPage />,
          },
          // E19 — Module IA
          {
            path: '/ia',
            element: <IAModulePage />,
          },
          // E20 — Saisie mobile
          {
            path: '/mobile-sync',
            element: <MobileSyncPage />,
          },
        ],
      },
    ],
  },
])
