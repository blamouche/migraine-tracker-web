export type PlanType = 'free' | 'pro'

export const PLAN_LABELS: Record<PlanType, string> = {
  free: 'Gratuit',
  pro: 'Pro',
}

export interface FeatureFlags {
  analyticsRangeMonths: number // 3 for free, unlimited for pro
  iaModule: boolean
  exportPdf: boolean
  voiceInput: boolean
  patternDetection: boolean
}

export const FREE_FLAGS: FeatureFlags = {
  analyticsRangeMonths: 3,
  iaModule: false,
  exportPdf: true,
  voiceInput: true,
  patternDetection: true,
}

export const PRO_FLAGS: FeatureFlags = {
  analyticsRangeMonths: Infinity,
  iaModule: true,
  exportPdf: true,
  voiceInput: true,
  patternDetection: true,
}
