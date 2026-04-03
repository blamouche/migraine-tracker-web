/**
 * QR-based device pairing
 * Stores encryption key, userId, and Supabase endpoint from QR payload
 */

const STORAGE_KEY = 'migraine-ai-mobile-pairing'

export interface PairingData {
  version: number
  key: string // base64 AES-256-GCM key
  userId: string
  endpoint: string // Supabase URL
  anonKey?: string // Supabase anon key (v2+)
  pairedAt: string // ISO
  deviceId: string
}

function generateDeviceId(): string {
  return crypto.randomUUID()
}

export function parsePairingPayload(json: string): Omit<PairingData, 'pairedAt' | 'deviceId'> {
  const data = JSON.parse(json)
  if (!data.version || !data.key || !data.userId) {
    throw new Error('Invalid pairing payload')
  }
  return data
}

export function savePairing(payload: Omit<PairingData, 'pairedAt' | 'deviceId'>): PairingData {
  const pairing: PairingData = {
    ...payload,
    pairedAt: new Date().toISOString(),
    deviceId: generateDeviceId(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pairing))
  return pairing
}

export function getPairing(): PairingData | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearPairing(): void {
  localStorage.removeItem(STORAGE_KEY)
}
