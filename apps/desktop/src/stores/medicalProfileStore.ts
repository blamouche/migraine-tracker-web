import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { MedicalProfile } from '@/types/medicalProfile'
import { EMPTY_PROFILE } from '@/types/medicalProfile'
import { writeMedicalProfile, readMedicalProfile } from '@/lib/vault/medicalProfile'

interface MedicalProfileState {
  profile: MedicalProfile
  isLoading: boolean
  error: string | null

  loadProfile: () => Promise<void>
  saveProfile: (profile: MedicalProfile) => Promise<void>
  clearError: () => void
}

export const useMedicalProfileStore = create<MedicalProfileState>()(
  persist(
    (set, get) => ({
      profile: { ...EMPTY_PROFILE },
      isLoading: false,
      error: null,

      loadProfile: async () => {
        set({ isLoading: true, error: null })
        try {
          const vaultProfile = await readMedicalProfile()
          if (vaultProfile) {
            set({ profile: vaultProfile, isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ error: 'Impossible de charger le profil médical', isLoading: false })
        }
      },

      saveProfile: async (profile) => {
        const updated: MedicalProfile = {
          ...profile,
          updatedAt: new Date().toISOString(),
        }
        set({ profile: updated })
        writeMedicalProfile(updated).catch(() => {})
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'migraine-ai-medical-profile',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ profile: state.profile }),
    },
  ),
)
