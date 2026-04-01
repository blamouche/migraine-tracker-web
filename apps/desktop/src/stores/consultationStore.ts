import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ConsultationEntry, ConsultationFormData } from '@/types/consultation'
import { writeConsultation, readAllConsultations, deleteConsultation as vaultDeleteConsultation } from '@/lib/vault/consultation'

interface ConsultationState {
  entries: ConsultationEntry[]
  isLoading: boolean
  error: string | null

  loadConsultations: () => Promise<void>
  createConsultation: (data: ConsultationFormData) => Promise<ConsultationEntry>
  updateConsultation: (entry: ConsultationEntry) => Promise<void>
  deleteConsultation: (entry: ConsultationEntry) => Promise<void>
  clearError: () => void
}

function generateId(): string {
  return crypto.randomUUID()
}

export const useConsultationStore = create<ConsultationState>()(
  persist(
    (set, get) => ({
      entries: [],
      isLoading: false,
      error: null,

      loadConsultations: async () => {
        set({ isLoading: true, error: null })
        try {
          const vaultEntries = await readAllConsultations()
          if (vaultEntries.length > 0) {
            const vaultIds = new Set(vaultEntries.map((e) => e.id))
            const localOnly = get().entries.filter((e) => !vaultIds.has(e.id))
            set({ entries: [...vaultEntries, ...localOnly], isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ error: 'Impossible de charger les consultations', isLoading: false })
        }
      },

      createConsultation: async (data: ConsultationFormData) => {
        const now = new Date().toISOString()
        const entry: ConsultationEntry = {
          id: generateId(),
          ...data,
          createdAt: now,
          updatedAt: now,
        }

        writeConsultation(entry).catch(() => {})
        set((state) => ({ entries: [entry, ...state.entries] }))
        return entry
      },

      updateConsultation: async (entry: ConsultationEntry) => {
        const updated: ConsultationEntry = {
          ...entry,
          updatedAt: new Date().toISOString(),
        }

        writeConsultation(updated).catch(() => {})
        set((state) => ({
          entries: state.entries.map((e) => (e.id === updated.id ? updated : e)),
        }))
      },

      deleteConsultation: async (entry: ConsultationEntry) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== entry.id),
        }))
        vaultDeleteConsultation(entry).catch(() => {})
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'migraine-ai-consultations',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ entries: state.entries }),
    },
  ),
)
