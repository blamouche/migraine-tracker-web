import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CycleEntry, CycleFormData } from '@/types/cycle'
import { writeCycle, readAllCycles, deleteCycle as vaultDeleteCycle } from '@/lib/vault/cycle'

interface CycleState {
  entries: CycleEntry[]
  isLoading: boolean
  error: string | null

  loadCycles: () => Promise<void>
  createCycle: (data: CycleFormData) => Promise<CycleEntry>
  updateCycle: (entry: CycleEntry) => Promise<void>
  deleteCycle: (entry: CycleEntry) => Promise<void>
  clearError: () => void
}

function generateId(): string {
  return crypto.randomUUID()
}

export const useCycleStore = create<CycleState>()(
  persist(
    (set, get) => ({
      entries: [],
      isLoading: false,
      error: null,

      loadCycles: async () => {
        set({ isLoading: true, error: null })
        try {
          const vaultEntries = await readAllCycles()
          if (vaultEntries.length > 0) {
            const vaultIds = new Set(vaultEntries.map((e) => e.id))
            const localOnly = get().entries.filter((e) => !vaultIds.has(e.id))
            set({ entries: [...vaultEntries, ...localOnly], isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ error: 'Impossible de charger les cycles', isLoading: false })
        }
      },

      createCycle: async (data: CycleFormData) => {
        const now = new Date().toISOString()
        const entry: CycleEntry = {
          id: generateId(),
          ...data,
          createdAt: now,
          updatedAt: now,
        }

        writeCycle(entry).catch(() => {})
        set((state) => ({ entries: [entry, ...state.entries] }))
        return entry
      },

      updateCycle: async (entry: CycleEntry) => {
        const updated: CycleEntry = {
          ...entry,
          updatedAt: new Date().toISOString(),
        }

        writeCycle(updated).catch(() => {})
        set((state) => ({
          entries: state.entries.map((e) => (e.id === updated.id ? updated : e)),
        }))
      },

      deleteCycle: async (entry: CycleEntry) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== entry.id),
        }))
        vaultDeleteCycle(entry).catch(() => {})
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'migraine-ai-cycles',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ entries: state.entries }),
    },
  ),
)
