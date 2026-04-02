export interface UserProfile {
  id: string
  nom: string
  couleur: string // hex color
  vaultPath: string | null
  plan: PlanType
  createdAt: string // ISO
  updatedAt: string // ISO
}

export type UserProfileFormData = Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>

export type PlanType = 'free' | 'pro'

export const PLAN_LABELS: Record<PlanType, string> = {
  free: 'Gratuit',
  pro: 'Pro',
}

export const PROFILE_COLORS = [
  '#6366f1', // indigo
  '#f43f5e', // rose
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#14b8a6', // teal
]

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
