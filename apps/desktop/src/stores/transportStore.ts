import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { TransportEntry, TransportFormData } from '@/types/transport'
import { writeTransport, readAllTransports, deleteTransport as vaultDeleteTransport } from '@/lib/vault/transport'

interface TransportState {
  entries: TransportEntry[]
  isLoading: boolean
  error: string | null

  loadTransports: () => Promise<void>
  createTransport: (data: TransportFormData) => Promise<TransportEntry>
  updateTransport: (entry: TransportEntry) => Promise<void>
  deleteTransport: (entry: TransportEntry) => Promise<void>
  clearError: () => void
}

function generateId(): string {
  return crypto.randomUUID()
}

export const useTransportStore = create<TransportState>()(
  persist(
    (set, get) => ({
      entries: [],
      isLoading: false,
      error: null,

      loadTransports: async () => {
        set({ isLoading: true, error: null })
        try {
          const vaultEntries = await readAllTransports()
          if (vaultEntries.length > 0) {
            const vaultIds = new Set(vaultEntries.map((e) => e.id))
            const localOnly = get().entries.filter((e) => !vaultIds.has(e.id))
            set({ entries: [...vaultEntries, ...localOnly], isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ error: 'Impossible de charger les transports', isLoading: false })
        }
      },

      createTransport: async (data: TransportFormData) => {
        const now = new Date().toISOString()
        const entry: TransportEntry = {
          id: generateId(),
          ...data,
          createdAt: now,
          updatedAt: now,
        }

        writeTransport(entry).catch(() => {})
        set((state) => ({ entries: [entry, ...state.entries] }))
        return entry
      },

      updateTransport: async (entry: TransportEntry) => {
        const updated: TransportEntry = {
          ...entry,
          updatedAt: new Date().toISOString(),
        }

        writeTransport(updated).catch(() => {})
        set((state) => ({
          entries: state.entries.map((e) => (e.id === updated.id ? updated : e)),
        }))
      },

      deleteTransport: async (entry: TransportEntry) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== entry.id),
        }))
        vaultDeleteTransport(entry).catch(() => {})
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'migraine-ai-transports',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ entries: state.entries }),
    },
  ),
)
