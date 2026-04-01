import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type OnboardingStep =
  | 'login'
  | 'consent'
  | 'vault-selection'
  | 'medical-profile'
  | 'complete'

interface OnboardingState {
  step: OnboardingStep
  consentCGU: boolean
  consentMarketing: boolean
  consentMarketingAt: string | null
  vaultReady: boolean
  medicalProfileDone: boolean

  setStep: (step: OnboardingStep) => void
  acceptConsent: (cgu: boolean, marketing: boolean) => void
  markVaultReady: () => void
  markMedicalProfileDone: () => void
  completeOnboarding: () => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 'login',
      consentCGU: false,
      consentMarketing: false,
      consentMarketingAt: null,
      vaultReady: false,
      medicalProfileDone: false,

      setStep: (step) => set({ step }),

      acceptConsent: (cgu, marketing) =>
        set({
          consentCGU: cgu,
          consentMarketing: marketing,
          consentMarketingAt: marketing ? new Date().toISOString() : null,
          step: 'vault-selection',
        }),

      markVaultReady: () => set({ vaultReady: true, step: 'medical-profile' }),

      markMedicalProfileDone: () => set({ medicalProfileDone: true, step: 'complete' }),

      completeOnboarding: () => set({ step: 'complete' }),

      reset: () =>
        set({
          step: 'login',
          consentCGU: false,
          consentMarketing: false,
          consentMarketingAt: null,
          vaultReady: false,
          medicalProfileDone: false,
        }),
    }),
    {
      name: 'migraine-ai-onboarding',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
