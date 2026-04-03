/**
 * Serialize, encrypt, and submit mobile entries to Supabase mobile_transit
 * Falls back to offline queue when network unavailable
 */

import { encrypt } from './crypto'
import { getSupabase } from './supabase'
import { getPairing } from './pairing'
import { enqueue, getAllPending, dequeue, type PendingEntry } from './offlineQueue'

type EntryType = 'crise' | 'daily_pain' | 'charge_mentale'

interface CrisisPayload {
  date: string
  heure_debut: string
  intensite: number
  traitements: string[]
  source: 'mobile'
}

interface PainPayload {
  date: string
  niveau: number
  source: 'mobile'
}

interface ChargePayload {
  date: string
  niveau: number
  source: 'mobile'
}

type EntryPayload = CrisisPayload | PainPayload | ChargePayload

function serializeToYaml(type: EntryType, data: EntryPayload): string {
  const lines = ['---']
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.join(', ')}]`)
    } else {
      lines.push(`${key}: ${value}`)
    }
  }
  lines.push(`type: ${type}`)
  lines.push('---')
  return lines.join('\n')
}

async function sendToSupabase(entry: PendingEntry): Promise<boolean> {
  try {
    const supabase = getSupabase()
    const { error } = await supabase.from('mobile_transit').insert({
      id: entry.id,
      user_id: entry.userId,
      encrypted_payload: entry.ciphertext,
      iv: entry.iv,
      entry_type: entry.entryType,
      device_id: entry.deviceId,
      created_at: entry.createdAt,
    })
    if (error) {
      console.error('[mobile-transit] Supabase insert failed:', error.message, error.details)
      return false
    }
    return true
  } catch (err) {
    console.error('[mobile-transit] Network error:', err)
    return false
  }
}

export async function submitEntry(type: EntryType, data: EntryPayload): Promise<boolean> {
  const pairing = getPairing()
  if (!pairing) throw new Error('Device not paired')

  const yaml = serializeToYaml(type, data)
  const { ciphertext, iv } = await encrypt(yaml, pairing.key)

  const entry: PendingEntry = {
    id: crypto.randomUUID(),
    userId: pairing.userId,
    entryType: type,
    ciphertext,
    iv,
    deviceId: pairing.deviceId,
    createdAt: new Date().toISOString(),
  }

  if (navigator.onLine) {
    const sent = await sendToSupabase(entry)
    if (sent) return true
  }

  // Offline or send failed — queue for later
  await enqueue(entry)
  return true
}

export async function flushQueue(): Promise<number> {
  const pending = await getAllPending()
  let flushed = 0

  for (const entry of pending) {
    const sent = await sendToSupabase(entry)
    if (sent) {
      await dequeue(entry.id)
      flushed++
    } else {
      // Stop on first failure (likely still offline)
      break
    }
  }

  return flushed
}
