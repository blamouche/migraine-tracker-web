import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DailyPainEntry, DailyPainFormData } from '@/types/dailyPain'
import { writeDailyPain, readAllDailyPains, deleteDailyPain as vaultDeletePain } from '@/lib/vault/dailyPain'

interface DailyPainState {
  entries: DailyPainEntry[]
  isLoading: boolean
  error: string | null

  loadPains: () => Promise<void>
  createPain: (data: DailyPainFormData) => Promise<DailyPainEntry>
  updatePain: (entry: DailyPainEntry) => Promise<void>
  deletePain: (entry: DailyPainEntry) => Promise<void>
  getYesterdayLevel: () => number | null
  clearError: () => void
}

function generateId(): string {
  return crypto.randomUUID()
}

export const useDailyPainStore = create<DailyPainState>()(
  persist(
    (set, get) => ({
      entries: [],
      isLoading: false,
      error: null,

      loadPains: async () => {
        set({ isLoading: true, error: null })
        try {
          const vaultEntries = await readAllDailyPains()
          if (vaultEntries.length > 0) {
            const vaultIds = new Set(vaultEntries.map((e) => e.id))
            const localOnly = get().entries.filter((e) => !vaultIds.has(e.id))
            set({ entries: [...vaultEntries, ...localOnly], isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ error: 'Impossible de charger le journal de douleur', isLoading: false })
        }
      },

      createPain: async (data: DailyPainFormData) => {
        const now = new Date().toISOString()
        const entry: DailyPainEntry = { id: generateId(), ...data, createdAt: now, updatedAt: now }
        writeDailyPain(entry).catch(() => {})
        set((state) => ({ entries: [entry, ...state.entries] }))
        return entry
      },

      updatePain: async (entry: DailyPainEntry) => {
        const updated = { ...entry, updatedAt: new Date().toISOString() }
        writeDailyPain(updated).catch(() => {})
        set((state) => ({ entries: state.entries.map((e) => (e.id === updated.id ? updated : e)) }))
      },

      deletePain: async (entry: DailyPainEntry) => {
        set((state) => ({ entries: state.entries.filter((e) => e.id !== entry.id) }))
        vaultDeletePain(entry).catch(() => {})
      },

      getYesterdayLevel: () => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const dateStr = yesterday.toISOString().slice(0, 10)
        const entry = get().entries.find((e) => e.date === dateStr)
        return entry?.niveau ?? null
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'migraine-ai-daily-pain',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ entries: state.entries }),
    },
  ),
)
