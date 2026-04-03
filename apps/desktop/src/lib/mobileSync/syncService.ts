/**
 * US-20-04 — Desktop sync service
 * Fetches pending entries from mobile_transit, decrypts, writes to vault
 */

import { supabase } from '@/lib/supabase'
import { decrypt } from '@/lib/crypto/mobileCrypto'
import { writeCrisis } from '@/lib/vault/crisis'
import { writeDailyPain } from '@/lib/vault/dailyPain'
import { writeChargeMentale } from '@/lib/vault/chargeMentale'
import { useMobileSyncStore } from '@/stores/mobileSyncStore'
import { useAuthStore } from '@/stores/authStore'
import type { CrisisEntry } from '@/types/crisis'
import type { DailyPainEntry } from '@/types/dailyPain'
import type { ChargeMentaleEntry } from '@/types/chargeMentale'

interface TransitRow {
  id: string
  encrypted_payload: string
  iv: string
  entry_type: 'crise' | 'daily_pain' | 'charge_mentale'
  created_at: string
  device_id: string | null
}

interface SyncResult {
  synced: number
  errors: number
}

function parseYamlFrontmatter(yaml: string): Record<string, string> {
  const lines = yaml.replace(/^---\n/, '').replace(/\n---$/, '').split('\n')
  const result: Record<string, string> = {}
  for (const line of lines) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    const value = line.slice(colonIdx + 1).trim()
    result[key] = value
  }
  return result
}

function parseArray(raw: string): string[] {
  const inner = raw.replace(/^\[/, '').replace(/\]$/, '').trim()
  if (!inner) return []
  return inner.split(',').map((s) => s.trim()).filter(Boolean)
}

function buildCrisisEntry(data: Record<string, string>, createdAt: string): CrisisEntry {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    date: data.date ?? new Date(createdAt).toISOString().slice(0, 10),
    startTime: data.heure_debut ?? '00:00',
    endTime: null,
    intensity: parseInt(data.intensite ?? '5', 10),
    treatments: parseArray(data.traitements ?? '[]'),
    symptoms: [],
    triggers: [],
    location: null,
    notes: 'Saisie mobile',
    hit6Score: null,
    status: 'complet',
    completionForcee: false,
    estimatedDuration: null,
    createdAt: now,
    updatedAt: now,
  }
}

function buildPainEntry(data: Record<string, string>, createdAt: string): DailyPainEntry {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    date: data.date ?? new Date(createdAt).toISOString().slice(0, 10),
    niveau: parseInt(data.niveau ?? '0', 10),
    lieeACrise: false,
    criseId: null,
    notes: 'Saisie mobile',
    createdAt: now,
    updatedAt: now,
  }
}

function buildChargeEntry(data: Record<string, string>, createdAt: string): ChargeMentaleEntry {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    date: data.date ?? new Date(createdAt).toISOString().slice(0, 10),
    niveau: parseInt(data.niveau ?? '5', 10),
    domaine: 'autre',
    humeur: 'neutre',
    contexte: [],
    notes: 'Saisie mobile',
    createdAt: now,
    updatedAt: now,
  }
}

export async function syncMobileEntries(): Promise<SyncResult> {
  const { config } = useMobileSyncStore.getState()
  if (!config.enabled || !config.secretKey) {
    console.log('[mobile-sync] Skipped: sync not enabled or no key')
    return { synced: 0, errors: 0 }
  }

  const { user, anonymousId } = useAuthStore.getState()
  const userId = user?.id ?? anonymousId
  if (!userId) {
    console.log('[mobile-sync] Skipped: no user')
    return { synced: 0, errors: 0 }
  }

  // Fetch pending (unsynced) entries
  const { data: rows, error: fetchError } = await supabase
    .from('mobile_transit')
    .select('id, encrypted_payload, iv, entry_type, created_at, device_id')
    .eq('user_id', userId)
    .is('synced_at', null)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (fetchError) {
    console.error('[mobile-sync] Fetch error:', fetchError.message, fetchError.details)
    return { synced: 0, errors: 0 }
  }

  if (!rows || rows.length === 0) {
    console.log('[mobile-sync] No pending entries')
    return { synced: 0, errors: 0 }
  }

  console.log(`[mobile-sync] Found ${rows.length} pending entries`)

  let synced = 0
  let errors = 0

  for (const row of rows as TransitRow[]) {
    try {
      // Decrypt
      const yaml = await decrypt(row.encrypted_payload, row.iv, config.secretKey)
      console.log(`[mobile-sync] Decrypted ${row.entry_type}:`, yaml.slice(0, 100))
      const data = parseYamlFrontmatter(yaml)

      // Write to vault based on entry type
      let written = false
      switch (row.entry_type) {
        case 'crise': {
          const crisis = buildCrisisEntry(data, row.created_at)
          written = await writeCrisis(crisis)
          break
        }
        case 'daily_pain': {
          const pain = buildPainEntry(data, row.created_at)
          written = await writeDailyPain(pain)
          break
        }
        case 'charge_mentale': {
          const charge = buildChargeEntry(data, row.created_at)
          written = await writeChargeMentale(charge)
          break
        }
      }

      if (written) {
        // Mark as synced in Supabase
        await supabase
          .from('mobile_transit')
          .update({ synced_at: new Date().toISOString() })
          .eq('id', row.id)
        synced++
        console.log(`[mobile-sync] Synced ${row.entry_type} (${row.id})`)
      } else {
        console.error(`[mobile-sync] Vault write returned false for ${row.entry_type} (${row.id}) — vault handle likely not accessible (FSAPI permission not granted). Navigate to any page that writes to the vault first, then retry.`)
        errors++
      }
    } catch (err) {
      console.error(`[mobile-sync] Error processing ${row.id}:`, err)
      errors++
    }
  }

  // Update store + reload vault data into Zustand stores
  if (synced > 0) {
    useMobileSyncStore.setState((state) => ({
      config: { ...state.config, lastSyncAt: new Date().toISOString() },
      pendingCount: Math.max(0, state.pendingCount - synced),
    }))

    // Reload affected stores so the UI reflects the new entries
    const { useCrisisStore } = await import('@/stores/crisisStore')
    const { useDailyPainStore } = await import('@/stores/dailyPainStore')
    const { useChargeMentaleStore } = await import('@/stores/chargeMentaleStore')
    await Promise.all([
      useCrisisStore.getState().loadCrises(),
      useDailyPainStore.getState().loadPains(),
      useChargeMentaleStore.getState().loadCharges(),
    ])
    console.log('[mobile-sync] Stores reloaded')
  }

  return { synced, errors }
}

export async function fetchPendingCount(): Promise<number> {
  const { user, anonymousId } = useAuthStore.getState()
  const userId = user?.id ?? anonymousId
  if (!userId) return 0

  const { count, error } = await supabase
    .from('mobile_transit')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('synced_at', null)
    .is('deleted_at', null)

  if (error) {
    console.error('[mobile-sync] Count error:', error.message)
    return 0
  }
  return count ?? 0
}
