import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ChargeMentaleEntry, ChargeMentaleFormData, EvenementVie, EvenementVieFormData } from '@/types/chargeMentale'
import { writeChargeMentale, readAllChargesMentales, deleteChargeMentale as vaultDeleteCharge, writeEvenement, readAllEvenements, deleteEvenement as vaultDeleteEvenement } from '@/lib/vault/chargeMentale'

interface ChargeMentaleState {
  entries: ChargeMentaleEntry[]
  evenements: EvenementVie[]
  isLoading: boolean
  error: string | null

  loadCharges: () => Promise<void>
  createCharge: (data: ChargeMentaleFormData) => Promise<ChargeMentaleEntry>
  updateCharge: (entry: ChargeMentaleEntry) => Promise<void>
  deleteCharge: (entry: ChargeMentaleEntry) => Promise<void>

  loadEvenements: () => Promise<void>
  createEvenement: (data: EvenementVieFormData) => Promise<EvenementVie>
  updateEvenement: (entry: EvenementVie) => Promise<void>
  deleteEvenement: (entry: EvenementVie) => Promise<void>

  clearError: () => void
}

function generateId(): string {
  return crypto.randomUUID()
}

export const useChargeMentaleStore = create<ChargeMentaleState>()(
  persist(
    (set, get) => ({
      entries: [],
      evenements: [],
      isLoading: false,
      error: null,

      loadCharges: async () => {
        set({ isLoading: true, error: null })
        try {
          const vaultEntries = await readAllChargesMentales()
          if (vaultEntries.length > 0) {
            const vaultIds = new Set(vaultEntries.map((e) => e.id))
            const localOnly = get().entries.filter((e) => !vaultIds.has(e.id))
            set({ entries: [...vaultEntries, ...localOnly], isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ error: 'Impossible de charger la charge mentale', isLoading: false })
        }
      },

      createCharge: async (data: ChargeMentaleFormData) => {
        const now = new Date().toISOString()
        const entry: ChargeMentaleEntry = { id: generateId(), ...data, createdAt: now, updatedAt: now }
        writeChargeMentale(entry).catch(() => {})
        set((state) => ({ entries: [entry, ...state.entries] }))
        return entry
      },

      updateCharge: async (entry: ChargeMentaleEntry) => {
        const updated = { ...entry, updatedAt: new Date().toISOString() }
        writeChargeMentale(updated).catch(() => {})
        set((state) => ({ entries: state.entries.map((e) => (e.id === updated.id ? updated : e)) }))
      },

      deleteCharge: async (entry: ChargeMentaleEntry) => {
        set((state) => ({ entries: state.entries.filter((e) => e.id !== entry.id) }))
        vaultDeleteCharge(entry).catch(() => {})
      },

      loadEvenements: async () => {
        try {
          const vaultEntries = await readAllEvenements()
          if (vaultEntries.length > 0) {
            const vaultIds = new Set(vaultEntries.map((e) => e.id))
            const localOnly = get().evenements.filter((e) => !vaultIds.has(e.id))
            set({ evenements: [...vaultEntries, ...localOnly] })
          }
        } catch { /* silent */ }
      },

      createEvenement: async (data: EvenementVieFormData) => {
        const now = new Date().toISOString()
        const entry: EvenementVie = { id: generateId(), ...data, createdAt: now, updatedAt: now }
        writeEvenement(entry).catch(() => {})
        set((state) => ({ evenements: [entry, ...state.evenements] }))
        return entry
      },

      updateEvenement: async (entry: EvenementVie) => {
        const updated = { ...entry, updatedAt: new Date().toISOString() }
        writeEvenement(updated).catch(() => {})
        set((state) => ({ evenements: state.evenements.map((e) => (e.id === updated.id ? updated : e)) }))
      },

      deleteEvenement: async (entry: EvenementVie) => {
        set((state) => ({ evenements: state.evenements.filter((e) => e.id !== entry.id) }))
        vaultDeleteEvenement(entry).catch(() => {})
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'migraine-ai-charge-mentale',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ entries: state.entries, evenements: state.evenements }),
    },
  ),
)
