import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { FoodEntry, FoodFormData, DailyFactors } from '@/types/alimentaire'
import {
  writeFoodEntry,
  readAllFoodEntries,
  deleteFoodEntry as vaultDeleteFood,
  writeDailyFactors,
  readAllDailyFactors,
} from '@/lib/vault/alimentaire'

interface FoodState {
  entries: FoodEntry[]
  dailyFactors: DailyFactors[]
  isLoading: boolean
  error: string | null

  loadEntries: () => Promise<void>
  createEntry: (data: FoodFormData) => Promise<FoodEntry>
  updateEntry: (entry: FoodEntry) => Promise<void>
  deleteEntry: (entry: FoodEntry) => Promise<void>

  loadDailyFactors: () => Promise<void>
  saveDailyFactors: (factors: DailyFactors) => Promise<void>
  getFactorsForDate: (date: string) => DailyFactors | undefined

  clearError: () => void
}

function generateId(): string {
  return crypto.randomUUID()
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function isComplete(entry: FoodEntry): boolean {
  return entry.foods.length > 0
}

export const useFoodStore = create<FoodState>()(
  persist(
    (set, get) => ({
      entries: [],
      dailyFactors: [],
      isLoading: false,
      error: null,

      loadEntries: async () => {
        set({ isLoading: true, error: null })
        try {
          const vaultEntries = await readAllFoodEntries()
          if (vaultEntries.length > 0) {
            const vaultIds = new Set(vaultEntries.map((e) => e.id))
            const localOnly = get().entries.filter((e) => !vaultIds.has(e.id))
            set({ entries: [...vaultEntries, ...localOnly], isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ error: 'Impossible de charger le journal alimentaire', isLoading: false })
        }
      },

      createEntry: async (data: FoodFormData) => {
        const now = new Date().toISOString()
        const entry: FoodEntry = {
          id: generateId(),
          date: data.date || today(),
          time: data.time,
          mealType: data.mealType,
          foods: data.foods,
          notes: data.notes,
          status: isComplete(data as FoodEntry) ? 'complet' : 'incomplet',
          completionForcee: false,
          createdAt: now,
          updatedAt: now,
        }

        writeFoodEntry(entry).catch(() => {})
        set((state) => ({ entries: [entry, ...state.entries] }))
        return entry
      },

      updateEntry: async (entry: FoodEntry) => {
        const updated: FoodEntry = {
          ...entry,
          status: isComplete(entry) ? 'complet' : entry.status,
          updatedAt: new Date().toISOString(),
        }

        writeFoodEntry(updated).catch(() => {})
        set((state) => ({
          entries: state.entries.map((e) => (e.id === updated.id ? updated : e)),
        }))
      },

      deleteEntry: async (entry: FoodEntry) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== entry.id),
        }))
        vaultDeleteFood(entry).catch(() => {})
      },

      loadDailyFactors: async () => {
        try {
          const vaultFactors = await readAllDailyFactors()
          if (vaultFactors.length > 0) {
            const vaultDates = new Set(vaultFactors.map((f) => f.date))
            const localOnly = get().dailyFactors.filter((f) => !vaultDates.has(f.date))
            set({ dailyFactors: [...vaultFactors, ...localOnly] })
          }
        } catch {
          // silent — factors are secondary
        }
      },

      saveDailyFactors: async (factors: DailyFactors) => {
        const updated: DailyFactors = {
          ...factors,
          updatedAt: new Date().toISOString(),
        }

        writeDailyFactors(updated).catch(() => {})
        set((state) => {
          const existing = state.dailyFactors.findIndex((f) => f.date === updated.date)
          if (existing >= 0) {
            const copy = [...state.dailyFactors]
            copy[existing] = updated
            return { dailyFactors: copy }
          }
          return { dailyFactors: [updated, ...state.dailyFactors] }
        })
      },

      getFactorsForDate: (date: string) => {
        return get().dailyFactors.find((f) => f.date === date)
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'migraine-ai-aliments',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        entries: state.entries,
        dailyFactors: state.dailyFactors,
      }),
    },
  ),
)
