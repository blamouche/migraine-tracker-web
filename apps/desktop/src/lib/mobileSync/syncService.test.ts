import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSelect, mockUpdate, mockEq, mockIs, mockOrder } = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockUpdate: vi.fn(),
  mockEq: vi.fn(),
  mockIs: vi.fn(),
  mockOrder: vi.fn(),
}))

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  ...globalThis.crypto,
  randomUUID: vi.fn(() => 'test-uuid'),
})

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      update: mockUpdate,
    })),
  },
}))

vi.mock('@/lib/crypto/mobileCrypto', () => ({
  decrypt: vi.fn(),
}))

vi.mock('@/lib/vault/crisis', () => ({
  writeCrisis: vi.fn().mockResolvedValue(true),
}))

vi.mock('@/lib/vault/dailyPain', () => ({
  writeDailyPain: vi.fn().mockResolvedValue(true),
}))

vi.mock('@/lib/vault/chargeMentale', () => ({
  writeChargeMentale: vi.fn().mockResolvedValue(true),
}))

vi.mock('@/stores/mobileSyncStore', () => ({
  useMobileSyncStore: {
    getState: vi.fn(() => ({
      config: { enabled: true, secretKey: 'test-secret-key' },
      pendingCount: 5,
    })),
    setState: vi.fn(),
  },
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      user: { id: 'user-123' },
    })),
  },
}))

import { syncMobileEntries, fetchPendingCount } from './syncService'
import { supabase } from '@/lib/supabase'
import { decrypt } from '@/lib/crypto/mobileCrypto'
import { writeCrisis } from '@/lib/vault/crisis'
import { writeDailyPain } from '@/lib/vault/dailyPain'
import { useMobileSyncStore } from '@/stores/mobileSyncStore'
import { useAuthStore } from '@/stores/authStore'

const crisisYaml = `---
date: 2026-04-01
heure_debut: 08:00
intensite: 7
traitements: [doliprane, triptan]
type: crise
---`

const painYaml = `---
date: 2026-04-01
niveau: 4
type: daily_pain
---`

describe('syncService', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset chain mocks for select queries
    mockOrder.mockResolvedValue({ data: [], error: null })
    mockIs.mockReturnValue({ is: mockIs, order: mockOrder })
    mockEq.mockReturnValue({ is: mockIs, eq: mockEq, order: mockOrder })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockUpdate.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
  })

  describe('syncMobileEntries', () => {
    it('returns zeros when mobile sync is disabled', async () => {
      vi.mocked(useMobileSyncStore.getState).mockReturnValueOnce({
        config: { enabled: false, secretKey: null },
        pendingCount: 0,
      } as never)

      const result = await syncMobileEntries()
      expect(result).toEqual({ synced: 0, errors: 0 })
    })

    it('returns zeros when no user is logged in', async () => {
      vi.mocked(useAuthStore.getState).mockReturnValueOnce({
        user: null,
      } as never)

      const result = await syncMobileEntries()
      expect(result).toEqual({ synced: 0, errors: 0 })
    })

    it('decrypts and writes crisis entries to vault', async () => {
      const rows = [
        {
          id: 'row-1',
          encrypted_payload: 'enc-payload-1',
          iv: 'iv-1',
          entry_type: 'crise',
          created_at: '2026-04-01T08:00:00.000Z',
          device_id: 'device-1',
        },
      ]

      mockOrder.mockResolvedValueOnce({ data: rows, error: null })
      vi.mocked(decrypt).mockResolvedValueOnce(crisisYaml)

      const result = await syncMobileEntries()

      expect(decrypt).toHaveBeenCalledWith('enc-payload-1', 'iv-1', 'test-secret-key')
      expect(writeCrisis).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-uuid',
          date: '2026-04-01',
          startTime: '08:00',
          intensity: 7,
          treatments: ['doliprane', 'triptan'],
          notes: 'Saisie mobile',
        }),
      )
      expect(result).toEqual({ synced: 1, errors: 0 })
    })

    it('decrypts and writes daily pain entries to vault', async () => {
      const rows = [
        {
          id: 'row-2',
          encrypted_payload: 'enc-payload-2',
          iv: 'iv-2',
          entry_type: 'daily_pain',
          created_at: '2026-04-01T10:00:00.000Z',
          device_id: 'device-1',
        },
      ]

      mockOrder.mockResolvedValueOnce({ data: rows, error: null })
      vi.mocked(decrypt).mockResolvedValueOnce(painYaml)

      const result = await syncMobileEntries()

      expect(writeDailyPain).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-uuid',
          date: '2026-04-01',
          niveau: 4,
          notes: 'Saisie mobile',
        }),
      )
      expect(result).toEqual({ synced: 1, errors: 0 })
    })

    it('marks entries as synced in Supabase after writing', async () => {
      const rows = [
        {
          id: 'row-1',
          encrypted_payload: 'enc-payload-1',
          iv: 'iv-1',
          entry_type: 'crise',
          created_at: '2026-04-01T08:00:00.000Z',
          device_id: 'device-1',
        },
      ]

      mockOrder.mockResolvedValueOnce({ data: rows, error: null })
      vi.mocked(decrypt).mockResolvedValueOnce(crisisYaml)

      const updateEq = vi.fn().mockResolvedValue({ error: null })
      mockUpdate.mockReturnValue({ eq: updateEq })

      await syncMobileEntries()

      expect(supabase.from).toHaveBeenCalledWith('mobile_transit')
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ synced_at: expect.any(String) }),
      )
      expect(updateEq).toHaveBeenCalledWith('id', 'row-1')
    })

    it('handles decrypt failures gracefully', async () => {
      const rows = [
        {
          id: 'row-fail',
          encrypted_payload: 'bad-data',
          iv: 'bad-iv',
          entry_type: 'crise',
          created_at: '2026-04-01T08:00:00.000Z',
          device_id: 'device-1',
        },
      ]

      mockOrder.mockResolvedValueOnce({ data: rows, error: null })
      vi.mocked(decrypt).mockRejectedValueOnce(new Error('Decryption failed'))

      const result = await syncMobileEntries()

      expect(result).toEqual({ synced: 0, errors: 1 })
      expect(writeCrisis).not.toHaveBeenCalled()
    })

    it('updates mobileSyncStore after successful sync', async () => {
      const rows = [
        {
          id: 'row-1',
          encrypted_payload: 'enc-1',
          iv: 'iv-1',
          entry_type: 'crise',
          created_at: '2026-04-01T08:00:00.000Z',
          device_id: 'device-1',
        },
      ]

      mockOrder.mockResolvedValueOnce({ data: rows, error: null })
      vi.mocked(decrypt).mockResolvedValueOnce(crisisYaml)

      await syncMobileEntries()

      expect(useMobileSyncStore.setState).toHaveBeenCalledWith(expect.any(Function))
    })
  })

  describe('fetchPendingCount', () => {
    it('returns the count from Supabase', async () => {
      // Chain: select -> eq -> is -> is (resolves)
      const finalIs = vi.fn().mockResolvedValue({ count: 3, error: null })
      const firstIs = vi.fn().mockReturnValue({ is: finalIs })
      mockEq.mockReturnValueOnce({ is: firstIs })
      mockSelect.mockReturnValueOnce({ eq: mockEq })

      const count = await fetchPendingCount()

      expect(count).toBe(3)
      expect(supabase.from).toHaveBeenCalledWith('mobile_transit')
      expect(mockSelect).toHaveBeenCalledWith('id', { count: 'exact', head: true })
    })

    it('returns 0 when user is not logged in', async () => {
      vi.mocked(useAuthStore.getState).mockReturnValueOnce({
        user: null,
      } as never)

      const count = await fetchPendingCount()
      expect(count).toBe(0)
    })

    it('returns 0 on Supabase error', async () => {
      const finalIs = vi.fn().mockResolvedValue({ count: null, error: { message: 'db error' } })
      const firstIs = vi.fn().mockReturnValue({ is: finalIs })
      mockEq.mockReturnValueOnce({ is: firstIs })
      mockSelect.mockReturnValueOnce({ eq: mockEq })

      const count = await fetchPendingCount()
      expect(count).toBe(0)
    })
  })
})
