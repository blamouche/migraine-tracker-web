import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { SportEntry, SportFormData } from '@/types/sport'
import { writeSport, readAllSports, deleteSport as vaultDeleteSport } from '@/lib/vault/sport'

interface SportState {
  entries: SportEntry[]
  isLoading: boolean
  error: string | null

  loadSports: () => Promise<void>
  createSport: (data: SportFormData) => Promise<SportEntry>
  updateSport: (entry: SportEntry) => Promise<void>
  deleteSport: (entry: SportEntry) => Promise<void>
  clearError: () => void
}

function generateId(): string {
  return crypto.randomUUID()
}

export const useSportStore = create<SportState>()(
  persist(
    (set, get) => ({
      entries: [],
      isLoading: false,
      error: null,

      loadSports: async () => {
        set({ isLoading: true, error: null })
        try {
          const vaultEntries = await readAllSports()
          if (vaultEntries.length > 0) {
            const vaultIds = new Set(vaultEntries.map((e) => e.id))
            const localOnly = get().entries.filter((e) => !vaultIds.has(e.id))
            set({ entries: [...vaultEntries, ...localOnly], isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ error: 'Impossible de charger les activités sportives', isLoading: false })
        }
      },

      createSport: async (data: SportFormData) => {
        const now = new Date().toISOString()
        const entry: SportEntry = {
          id: generateId(),
          ...data,
          createdAt: now,
          updatedAt: now,
        }

        writeSport(entry).catch(() => {})
        set((state) => ({ entries: [entry, ...state.entries] }))
        return entry
      },

      updateSport: async (entry: SportEntry) => {
        const updated: SportEntry = {
          ...entry,
          updatedAt: new Date().toISOString(),
        }

        writeSport(updated).catch(() => {})
        set((state) => ({
          entries: state.entries.map((e) => (e.id === updated.id ? updated : e)),
        }))
      },

      deleteSport: async (entry: SportEntry) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== entry.id),
        }))
        vaultDeleteSport(entry).catch(() => {})
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'migraine-ai-sport',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ entries: state.entries }),
    },
  ),
)
