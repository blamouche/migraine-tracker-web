import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { PlanType, FeatureFlags } from '@/types/profile'
import { FREE_FLAGS, PRO_FLAGS } from '@/types/profile'

interface PlanState {
  plan: PlanType
  featureFlags: FeatureFlags

  setPlan: (plan: PlanType) => void
  refreshFlags: () => void
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plan: 'free',
      featureFlags: { ...FREE_FLAGS },

      setPlan: (plan: PlanType) => {
        set({
          plan,
          featureFlags: plan === 'pro' ? { ...PRO_FLAGS } : { ...FREE_FLAGS },
        })
      },

      refreshFlags: () => {
        const { plan } = get()
        set({ featureFlags: plan === 'pro' ? { ...PRO_FLAGS } : { ...FREE_FLAGS } })
      },
    }),
    {
      name: 'migraine-ai-plan',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
