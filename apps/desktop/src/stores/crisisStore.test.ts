import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/lib/vault/crisis', () => ({
  readAllCrises: vi.fn().mockResolvedValue([]),
  writeCrisis: vi.fn().mockResolvedValue(true),
  deleteCrisis: vi.fn().mockResolvedValue(true),
  purgeTrash: vi.fn().mockResolvedValue(0),
}))

import { useCrisisStore } from './crisisStore'
import { readAllCrises, writeCrisis, deleteCrisis as vaultDeleteCrisis } from '@/lib/vault/crisis'
import type { CrisisEntry } from '@/types/crisis'

const mockCrisis: CrisisEntry = {
  id: 'test-id',
  date: '2026-03-15',
  startTime: '14:30',
  endTime: null,
  intensity: 7,
  treatments: ['Paracétamol'],
  symptoms: [],
  triggers: [],
  location: null,
  notes: null,
  hit6Score: null,
  status: 'incomplet',
  completionForcee: false,
  estimatedDuration: 480,
  createdAt: '2026-03-15T14:30:00.000Z',
  updatedAt: '2026-03-15T14:30:00.000Z',
}

describe('crisisStore', () => {
  beforeEach(() => {
    useCrisisStore.setState({ crises: [], isLoading: false, error: null })
    vi.clearAllMocks()
  })

  it('should load crises from vault', async () => {
    vi.mocked(readAllCrises).mockResolvedValueOnce([mockCrisis])

    await useCrisisStore.getState().loadCrises()

    expect(useCrisisStore.getState().crises).toHaveLength(1)
    expect(useCrisisStore.getState().crises[0]?.id).toBe('test-id')
    expect(useCrisisStore.getState().isLoading).toBe(false)
  })

  it('should create a quick crisis', async () => {
    const crisis = await useCrisisStore.getState().createQuickCrisis({
      startTime: '14:30',
      intensity: 7,
      treatments: ['Paracétamol'],
    })

    expect(crisis.status).toBe('incomplet')
    expect(crisis.intensity).toBe(7)
    expect(crisis.treatments).toEqual(['Paracétamol'])
    expect(writeCrisis).toHaveBeenCalledOnce()
    expect(useCrisisStore.getState().crises).toHaveLength(1)
  })

  it('should update a crisis and auto-detect completion', async () => {
    useCrisisStore.setState({ crises: [mockCrisis] })

    const completed = {
      ...mockCrisis,
      symptoms: ['Nausée'],
    }

    await useCrisisStore.getState().updateCrisis(completed)

    const updated = useCrisisStore.getState().crises[0]
    expect(updated?.status).toBe('complet')
    expect(writeCrisis).toHaveBeenCalledOnce()
  })

  it('should delete a crisis', async () => {
    useCrisisStore.setState({ crises: [mockCrisis] })

    await useCrisisStore.getState().deleteCrisis(mockCrisis)

    expect(vaultDeleteCrisis).toHaveBeenCalledWith(mockCrisis)
    expect(useCrisisStore.getState().crises).toHaveLength(0)
  })

  it('should set error on load failure', async () => {
    vi.mocked(readAllCrises).mockRejectedValueOnce(new Error('fail'))

    await useCrisisStore.getState().loadCrises()

    expect(useCrisisStore.getState().error).toBe('Impossible de charger les crises')
  })

  it('should clear error', () => {
    useCrisisStore.setState({ error: 'some error' })
    useCrisisStore.getState().clearError()
    expect(useCrisisStore.getState().error).toBeNull()
  })
})
