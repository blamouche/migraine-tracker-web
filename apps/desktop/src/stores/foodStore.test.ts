import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/lib/vault/alimentaire', () => ({
  readAllFoodEntries: vi.fn().mockResolvedValue([]),
  writeFoodEntry: vi.fn().mockResolvedValue(true),
  deleteFoodEntry: vi.fn().mockResolvedValue(true),
  readAllDailyFactors: vi.fn().mockResolvedValue([]),
  writeDailyFactors: vi.fn().mockResolvedValue(true),
}))

import { useFoodStore } from './foodStore'
import { readAllFoodEntries, writeFoodEntry, deleteFoodEntry as vaultDeleteFood } from '@/lib/vault/alimentaire'
import type { FoodEntry, DailyFactors } from '@/types/alimentaire'

const mockEntry: FoodEntry = {
  id: 'test-food-id',
  date: '2026-03-29',
  time: '12:30',
  mealType: 'dejeuner',
  foods: ['Fromage affiné'],
  notes: null,
  status: 'incomplet',
  completionForcee: false,
  createdAt: '2026-03-29T12:30:00.000Z',
  updatedAt: '2026-03-29T12:30:00.000Z',
}

describe('foodStore', () => {
  beforeEach(() => {
    useFoodStore.setState({ entries: [], dailyFactors: [], isLoading: false, error: null })
    vi.clearAllMocks()
  })

  it('should load entries from vault', async () => {
    vi.mocked(readAllFoodEntries).mockResolvedValueOnce([mockEntry])

    await useFoodStore.getState().loadEntries()

    expect(useFoodStore.getState().entries).toHaveLength(1)
    expect(useFoodStore.getState().entries[0]?.id).toBe('test-food-id')
    expect(useFoodStore.getState().isLoading).toBe(false)
  })

  it('should create a food entry', async () => {
    const entry = await useFoodStore.getState().createEntry({
      date: '2026-03-29',
      time: '12:30',
      mealType: 'dejeuner',
      foods: ['Chocolat'],
      notes: null,
    })

    expect(entry).toHaveProperty('id')
    expect(entry.mealType).toBe('dejeuner')
    expect(entry.foods).toEqual(['Chocolat'])
    expect(entry.status).toBe('complet') // has foods -> complete
    expect(writeFoodEntry).toHaveBeenCalledOnce()
    expect(useFoodStore.getState().entries).toHaveLength(1)
  })

  it('should mark entry as incomplete when no foods', async () => {
    const entry = await useFoodStore.getState().createEntry({
      date: '2026-03-29',
      time: '12:30',
      mealType: 'dejeuner',
      foods: [],
      notes: null,
    })

    expect(entry.status).toBe('incomplet')
  })

  it('should update a food entry and auto-detect completion', async () => {
    useFoodStore.setState({ entries: [mockEntry] })

    const updated = { ...mockEntry, foods: ['Fromage affiné', 'Vin rouge'] }
    await useFoodStore.getState().updateEntry(updated)

    const result = useFoodStore.getState().entries[0]
    expect(result?.status).toBe('complet')
    expect(result?.foods).toEqual(['Fromage affiné', 'Vin rouge'])
    expect(writeFoodEntry).toHaveBeenCalledOnce()
  })

  it('should delete a food entry', async () => {
    useFoodStore.setState({ entries: [mockEntry] })

    await useFoodStore.getState().deleteEntry(mockEntry)

    expect(vaultDeleteFood).toHaveBeenCalledWith(mockEntry)
    expect(useFoodStore.getState().entries).toHaveLength(0)
  })

  it('should save daily factors', async () => {
    const factors: DailyFactors = {
      date: '2026-03-29',
      stress: 4,
      sleepQuality: 3,
      hydration: 'bonne',
      createdAt: '2026-03-29T08:00:00.000Z',
      updatedAt: '2026-03-29T08:00:00.000Z',
    }

    await useFoodStore.getState().saveDailyFactors(factors)

    expect(useFoodStore.getState().dailyFactors).toHaveLength(1)
    expect(useFoodStore.getState().dailyFactors[0]?.stress).toBe(4)
  })

  it('should update existing daily factors for same date', async () => {
    const factors: DailyFactors = {
      date: '2026-03-29',
      stress: 3,
      sleepQuality: 3,
      hydration: 'bonne',
      createdAt: '2026-03-29T08:00:00.000Z',
      updatedAt: '2026-03-29T08:00:00.000Z',
    }
    useFoodStore.setState({ dailyFactors: [factors] })

    await useFoodStore.getState().saveDailyFactors({ ...factors, stress: 5 })

    expect(useFoodStore.getState().dailyFactors).toHaveLength(1)
    expect(useFoodStore.getState().dailyFactors[0]?.stress).toBe(5)
  })

  it('should get factors for a specific date', () => {
    const factors: DailyFactors = {
      date: '2026-03-29',
      stress: 4,
      sleepQuality: 3,
      hydration: 'insuffisante',
      createdAt: '2026-03-29T08:00:00.000Z',
      updatedAt: '2026-03-29T08:00:00.000Z',
    }
    useFoodStore.setState({ dailyFactors: [factors] })

    expect(useFoodStore.getState().getFactorsForDate('2026-03-29')).toBeDefined()
    expect(useFoodStore.getState().getFactorsForDate('2026-03-30')).toBeUndefined()
  })

  it('should set error on load failure', async () => {
    vi.mocked(readAllFoodEntries).mockRejectedValueOnce(new Error('fail'))

    await useFoodStore.getState().loadEntries()

    expect(useFoodStore.getState().error).toBe('Impossible de charger le journal alimentaire')
  })

  it('should clear error', () => {
    useFoodStore.setState({ error: 'some error' })
    useFoodStore.getState().clearError()
    expect(useFoodStore.getState().error).toBeNull()
  })
})
