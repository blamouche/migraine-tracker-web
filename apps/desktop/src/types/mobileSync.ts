export interface MobileSyncConfig {
  enabled: boolean
  secretKey: string | null // base64-encoded AES-256-GCM key
  createdAt: string | null // ISO
  lastSyncAt: string | null // ISO
  deviceCount: number
}

export const DEFAULT_MOBILE_SYNC: MobileSyncConfig = {
  enabled: false,
  secretKey: null,
  createdAt: null,
  lastSyncAt: null,
  deviceCount: 0,
}

export interface MobileTransitEntry {
  id: string
  type: 'crisis' | 'daily-pain' | 'charge-mentale'
  encryptedData: string // base64
  iv: string // base64
  createdAt: string // ISO
  deviceId: string
}

export interface MobileCrisisData {
  startTime: string // HH:mm
  intensity: number // 1-10
  treatments: string[]
  source: 'mobile'
}

export interface MobilePainData {
  date: string // YYYY-MM-DD
  niveau: number // 0-10
  source: 'mobile'
}

export interface MobileChargeData {
  date: string // YYYY-MM-DD
  niveau: number // 1-10
  source: 'mobile'
}
