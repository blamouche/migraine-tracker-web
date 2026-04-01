import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { TreatmentEntry, TreatmentFormData } from '@/types/treatment'
import { DEFAULT_EFFICACY } from '@/types/treatment'
import { writeTreatment, readAllTreatments, deleteTreatment as vaultDeleteTreatment } from '@/lib/vault/treatment'

interface TreatmentState {
  treatments: TreatmentEntry[]
  isLoading: boolean
  error: string | null

  loadTreatments: () => Promise<void>
  createTreatment: (data: TreatmentFormData) => Promise<TreatmentEntry>
  updateTreatment: (treatment: TreatmentEntry) => Promise<void>
  deleteTreatment: (treatment: TreatmentEntry) => Promise<void>
  clearError: () => void
}

function generateId(): string {
  return crypto.randomUUID()
}

export const useTreatmentStore = create<TreatmentState>()(
  persist(
    (set, get) => ({
      treatments: [],
      isLoading: false,
      error: null,

      loadTreatments: async () => {
        set({ isLoading: true, error: null })
        try {
          const vaultTreatments = await readAllTreatments()
          if (vaultTreatments.length > 0) {
            const vaultIds = new Set(vaultTreatments.map((t) => t.id))
            const localOnly = get().treatments.filter((t) => !vaultIds.has(t.id))
            set({ treatments: [...vaultTreatments, ...localOnly], isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ error: 'Impossible de charger les traitements', isLoading: false })
        }
      },

      createTreatment: async (data: TreatmentFormData) => {
        const now = new Date().toISOString()
        const treatment: TreatmentEntry = {
          id: generateId(),
          ...data,
          efficacite: data.efficacite ?? { ...DEFAULT_EFFICACY },
          createdAt: now,
          updatedAt: now,
        }

        writeTreatment(treatment).catch(() => {})
        set((state) => ({ treatments: [treatment, ...state.treatments] }))
        return treatment
      },

      updateTreatment: async (treatment: TreatmentEntry) => {
        const updated: TreatmentEntry = {
          ...treatment,
          updatedAt: new Date().toISOString(),
        }

        writeTreatment(updated).catch(() => {})
        set((state) => ({
          treatments: state.treatments.map((t) => (t.id === updated.id ? updated : t)),
        }))
      },

      deleteTreatment: async (treatment: TreatmentEntry) => {
        set((state) => ({
          treatments: state.treatments.filter((t) => t.id !== treatment.id),
        }))
        vaultDeleteTreatment(treatment).catch(() => {})
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'migraine-ai-traitements',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ treatments: state.treatments }),
    },
  ),
)
