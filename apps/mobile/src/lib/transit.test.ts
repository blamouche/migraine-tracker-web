import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockInsert, mockEnqueue, mockGetAllPending, mockDequeue } = vi.hoisted(() => ({
  mockInsert: vi.fn(),
  mockEnqueue: vi.fn(),
  mockGetAllPending: vi.fn(),
  mockDequeue: vi.fn(),
}))

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  ...globalThis.crypto,
  randomUUID: vi.fn(() => 'test-uuid'),
})

vi.mock('./crypto', () => ({
  encrypt: vi.fn().mockResolvedValue({ ciphertext: 'encrypted-base64', iv: 'iv-base64' }),
}))

vi.mock('./supabase', () => ({
  getSupabase: vi.fn(() => ({
    from: vi.fn(() => ({ insert: mockInsert })),
  })),
}))

vi.mock('./pairing', () => ({
  getPairing: vi.fn(() => ({
    key: 'base64-secret-key',
    userId: 'user-123',
    deviceId: 'device-456',
    endpoint: 'https://example.supabase.co',
    version: 1,
    pairedAt: '2026-01-01T00:00:00.000Z',
  })),
}))

vi.mock('./offlineQueue', () => ({
  enqueue: mockEnqueue,
  getAllPending: mockGetAllPending,
  dequeue: mockDequeue,
}))

import { submitEntry, flushQueue } from './transit'
import { getPairing } from './pairing'
import { encrypt } from './crypto'

describe('transit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInsert.mockResolvedValue({ error: null })
    mockGetAllPending.mockResolvedValue([])
    mockEnqueue.mockResolvedValue(undefined)
    mockDequeue.mockResolvedValue(undefined)
  })

  describe('submitEntry', () => {
    it('throws when device is not paired', async () => {
      vi.mocked(getPairing).mockReturnValueOnce(null)
      await expect(
        submitEntry('crise', {
          date: '2026-04-01',
          heure_debut: '08:00',
          intensite: 7,
          traitements: ['doliprane'],
          source: 'mobile',
        }),
      ).rejects.toThrow('Device not paired')
    })

    it('sends to Supabase when online', async () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })

      const result = await submitEntry('crise', {
        date: '2026-04-01',
        heure_debut: '08:00',
        intensite: 7,
        traitements: ['doliprane'],
        source: 'mobile',
      })

      expect(result).toBe(true)
      expect(encrypt).toHaveBeenCalledWith(expect.stringContaining('date: 2026-04-01'), 'base64-secret-key')
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-uuid',
          user_id: 'user-123',
          encrypted_payload: 'encrypted-base64',
          iv: 'iv-base64',
          entry_type: 'crise',
          device_id: 'device-456',
        }),
      )
      expect(mockEnqueue).not.toHaveBeenCalled()
    })

    it('queues to IndexedDB when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })

      const result = await submitEntry('daily_pain', {
        date: '2026-04-01',
        niveau: 4,
        source: 'mobile',
      })

      expect(result).toBe(true)
      expect(mockInsert).not.toHaveBeenCalled()
      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-uuid',
          userId: 'user-123',
          entryType: 'daily_pain',
          ciphertext: 'encrypted-base64',
          iv: 'iv-base64',
          deviceId: 'device-456',
        }),
      )
    })

    it('queues to IndexedDB when Supabase insert fails', async () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
      mockInsert.mockResolvedValueOnce({ error: { message: 'network error' } })

      const result = await submitEntry('charge_mentale', {
        date: '2026-04-01',
        niveau: 6,
        source: 'mobile',
      })

      expect(result).toBe(true)
      expect(mockEnqueue).toHaveBeenCalled()
    })
  })

  describe('flushQueue', () => {
    const pendingEntries = [
      {
        id: 'entry-1',
        userId: 'user-123',
        entryType: 'crise' as const,
        ciphertext: 'ct-1',
        iv: 'iv-1',
        deviceId: 'device-456',
        createdAt: '2026-04-01T10:00:00.000Z',
      },
      {
        id: 'entry-2',
        userId: 'user-123',
        entryType: 'daily_pain' as const,
        ciphertext: 'ct-2',
        iv: 'iv-2',
        deviceId: 'device-456',
        createdAt: '2026-04-01T11:00:00.000Z',
      },
    ]

    it('sends queued entries and dequeues them on success', async () => {
      mockGetAllPending.mockResolvedValueOnce(pendingEntries)

      const flushed = await flushQueue()

      expect(flushed).toBe(2)
      expect(mockInsert).toHaveBeenCalledTimes(2)
      expect(mockDequeue).toHaveBeenCalledWith('entry-1')
      expect(mockDequeue).toHaveBeenCalledWith('entry-2')
    })

    it('stops flushing on first failure', async () => {
      mockGetAllPending.mockResolvedValueOnce(pendingEntries)
      mockInsert.mockResolvedValueOnce({ error: { message: 'still offline' } })

      const flushed = await flushQueue()

      expect(flushed).toBe(0)
      expect(mockDequeue).not.toHaveBeenCalled()
    })

    it('returns 0 when queue is empty', async () => {
      mockGetAllPending.mockResolvedValueOnce([])

      const flushed = await flushQueue()

      expect(flushed).toBe(0)
    })
  })
})
