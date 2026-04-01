import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CrisisEntry, QuickCrisisData } from '@/types/crisis'
import { DEFAULT_DURATION_MAP } from '@/types/crisis'
import { writeCrisis, readAllCrises, deleteCrisis as vaultDeleteCrisis, purgeTrash } from '@/lib/vault/crisis'

interface CrisisState {
  crises: CrisisEntry[]
  isLoading: boolean
  error: string | null

  loadCrises: () => Promise<void>
  createQuickCrisis: (data: QuickCrisisData) => Promise<CrisisEntry>
  updateCrisis: (crisis: CrisisEntry) => Promise<void>
  deleteCrisis: (crisis: CrisisEntry) => Promise<void>
  purgeOldTrash: () => Promise<number>
  clearError: () => void
}

function generateId(): string {
  return crypto.randomUUID()
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function isComplete(crisis: CrisisEntry): boolean {
  return (
    crisis.intensity > 0 &&
    crisis.treatments.length > 0 &&
    crisis.symptoms.length > 0 &&
    crisis.endTime !== null
  )
}

export const useCrisisStore = create<CrisisState>()(
  persist(
    (set, get) => ({
      crises: [],
      isLoading: false,
      error: null,

      loadCrises: async () => {
        set({ isLoading: true, error: null })
        try {
          const vaultCrises = await readAllCrises()
          if (vaultCrises.length > 0) {
            // Merge: vault is source of truth, but keep local-only crises
            const vaultIds = new Set(vaultCrises.map((c) => c.id))
            const localOnly = get().crises.filter((c) => !vaultIds.has(c.id))
            set({ crises: [...vaultCrises, ...localOnly], isLoading: false })
          } else {
            // Vault empty or unavailable — keep existing local crises
            set({ isLoading: false })
          }
        } catch {
          set({ error: 'Impossible de charger les crises', isLoading: false })
        }
      },

      createQuickCrisis: async (data: QuickCrisisData) => {
        const now = new Date().toISOString()
        const crisis: CrisisEntry = {
          id: generateId(),
          date: today(),
          startTime: data.startTime,
          endTime: null,
          intensity: data.intensity,
          treatments: data.treatments,
          symptoms: [],
          triggers: [],
          location: null,
          notes: null,
          hit6Score: null,
          status: 'incomplet',
          completionForcee: false,
          estimatedDuration: DEFAULT_DURATION_MAP[data.intensity] ?? 240,
          createdAt: now,
          updatedAt: now,
        }

        // Try vault write (non-blocking — localStorage always persists)
        writeCrisis(crisis).catch(() => {})
        set((state) => ({ crises: [crisis, ...state.crises] }))

        return crisis
      },

      updateCrisis: async (crisis: CrisisEntry) => {
        const updated: CrisisEntry = {
          ...crisis,
          status: isComplete(crisis) ? 'complet' : crisis.status,
          updatedAt: new Date().toISOString(),
        }

        writeCrisis(updated).catch(() => {})
        set((state) => ({
          crises: state.crises.map((c) => (c.id === updated.id ? updated : c)),
        }))
      },

      deleteCrisis: async (crisis: CrisisEntry) => {
        // Remove from local state immediately (optimistic)
        set((state) => ({
          crises: state.crises.filter((c) => c.id !== crisis.id),
        }))
        // Try vault delete in background
        vaultDeleteCrisis(crisis).catch(() => {})
      },

      purgeOldTrash: async () => {
        return purgeTrash()
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'migraine-ai-crises',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ crises: state.crises }),
    },
  ),
)
