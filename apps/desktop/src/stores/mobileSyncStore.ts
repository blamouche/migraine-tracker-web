import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { MobileSyncConfig } from '@/types/mobileSync'
import { DEFAULT_MOBILE_SYNC } from '@/types/mobileSync'
import { generateSyncKey, generateQRPayload } from '@/lib/crypto/mobileCrypto'
import { useAuthStore } from '@/stores/authStore'

interface MobileSyncState {
  config: MobileSyncConfig
  qrPayload: string | null
  pendingCount: number
  error: string | null

  enableMobileSync: () => Promise<void>
  disableMobileSync: () => void
  regenerateKey: () => Promise<void>
  syncNow: () => Promise<{ synced: number; errors: number }>
  refreshPendingCount: () => Promise<void>
  getQRPayload: () => string | null
  clearError: () => void
}

export const useMobileSyncStore = create<MobileSyncState>()(
  persist(
    (set, get) => ({
      config: { ...DEFAULT_MOBILE_SYNC },
      qrPayload: null,
      pendingCount: 0,
      error: null,

      enableMobileSync: async () => {
        try {
          const key = await generateSyncKey()
          const { user, anonymousId } = useAuthStore.getState()
          const userId = user?.id ?? anonymousId ?? 'default'
          const payload = generateQRPayload(key, userId)
          const now = new Date().toISOString()

          set({
            config: {
              enabled: true,
              secretKey: key,
              createdAt: now,
              lastSyncAt: null,
              deviceCount: 0,
            },
            qrPayload: payload,
            error: null,
          })
        } catch {
          set({ error: 'Erreur lors de la génération de la clé de chiffrement' })
        }
      },

      disableMobileSync: () => {
        set({
          config: { ...DEFAULT_MOBILE_SYNC },
          qrPayload: null,
          pendingCount: 0,
        })
      },

      regenerateKey: async () => {
        try {
          const key = await generateSyncKey()
          const { user, anonymousId } = useAuthStore.getState()
          const userId = user?.id ?? anonymousId ?? 'default'
          const payload = generateQRPayload(key, userId)
          const now = new Date().toISOString()

          set((state) => ({
            config: {
              ...state.config,
              secretKey: key,
              createdAt: now,
              deviceCount: 0,
            },
            qrPayload: payload,
            error: null,
          }))
        } catch {
          set({ error: 'Erreur lors de la régénération de la clé' })
        }
      },

      syncNow: async () => {
        try {
          const { syncMobileEntries } = await import('@/lib/mobileSync/syncService')
          const result = await syncMobileEntries()
          if (result.synced > 0) {
            set((state) => ({
              config: { ...state.config, lastSyncAt: new Date().toISOString() },
            }))
          }
          // Refresh pending count after sync
          await get().refreshPendingCount()
          return result
        } catch {
          set({ error: 'Erreur lors de la synchronisation' })
          return { synced: 0, errors: 0 }
        }
      },

      refreshPendingCount: async () => {
        try {
          const { fetchPendingCount } = await import('@/lib/mobileSync/syncService')
          const count = await fetchPendingCount()
          set({ pendingCount: count })
        } catch {
          // Silently fail
        }
      },

      getQRPayload: () => get().qrPayload,

      clearError: () => set({ error: null }),
    }),
    {
      name: 'migraine-ai-mobile-sync',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        config: state.config,
        qrPayload: state.qrPayload,
      }),
    },
  ),
)
