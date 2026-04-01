export type Plan = 'free' | 'pro'

export type AuthProvider = 'google' | 'apple' | 'facebook' | 'email' | 'magiclink'

export type EntryType = 'crise' | 'daily_pain' | 'charge_mentale'

export type Theme = 'light' | 'dark' | 'crisis'

export interface UserProfile {
  id: string
  userId: string
  profileLocalId: string
  label: string
  color: string
  createdAt: string
}

export interface PlanConfig {
  plan: Plan
  featureKey: string
  featureValue: string
}

export interface MobileTransitEntry {
  id: string
  userId: string
  encryptedPayload: ArrayBuffer
  iv: ArrayBuffer
  entryType: EntryType
  createdAt: string
  syncedAt: string | null
}
