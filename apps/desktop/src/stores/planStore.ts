import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { PlanType, FeatureFlags } from '@/types/profile'
import { FREE_FLAGS, PRO_FLAGS } from '@/types/profile'
import { usePlanConfigStore } from './planConfigStore'
import type { PlanFlags } from './planConfigStore'

/** Convert dynamic PlanFlags from planConfigStore to the legacy FeatureFlags shape */
function planFlagsToFeatureFlags(pf: PlanFlags): FeatureFlags {
  return {
    analyticsRangeMonths: pf.analyticsRangeMonths === 0 ? Infinity : pf.analyticsRangeMonths,
    iaModule: pf.iaEnabled,
    exportPdf: pf.pdfReportEnabled,
    voiceInput: pf.vocalInputEnabled,
    patternDetection: true, // always enabled — no plan_config key for this
  }
}

function getFlagsForPlan(plan: PlanType): FeatureFlags {
  const planConfig = usePlanConfigStore.getState()
  if (planConfig.loaded) {
    return planFlagsToFeatureFlags(planConfig.getFlags(plan))
  }
  return plan === 'pro' ? { ...PRO_FLAGS } : { ...FREE_FLAGS }
}

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
        set({ plan, featureFlags: getFlagsForPlan(plan) })
      },

      refreshFlags: () => {
        const { plan } = get()
        set({ featureFlags: getFlagsForPlan(plan) })
      },
    }),
    {
      name: 'migraine-ai-plan',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
