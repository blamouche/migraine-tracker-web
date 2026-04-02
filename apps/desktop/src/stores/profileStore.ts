import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { UserProfile, UserProfileFormData, FeatureFlags } from '@/types/profile'
import { FREE_FLAGS, PRO_FLAGS } from '@/types/profile'

interface ProfileState {
  profiles: UserProfile[]
  activeProfileId: string | null
  featureFlags: FeatureFlags

  createProfile: (data: UserProfileFormData) => UserProfile
  updateProfile: (profile: UserProfile) => void
  deleteProfile: (profileId: string) => void
  switchProfile: (profileId: string) => void
  getActiveProfile: () => UserProfile | null
  refreshFlags: () => void
}

function generateId(): string {
  return crypto.randomUUID()
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,
      featureFlags: { ...FREE_FLAGS },

      createProfile: (data: UserProfileFormData) => {
        const now = new Date().toISOString()
        const profile: UserProfile = { id: generateId(), ...data, createdAt: now, updatedAt: now }
        set((state) => ({
          profiles: [...state.profiles, profile],
          activeProfileId: state.activeProfileId ?? profile.id,
        }))
        return profile
      },

      updateProfile: (profile: UserProfile) => {
        const updated = { ...profile, updatedAt: new Date().toISOString() }
        set((state) => ({
          profiles: state.profiles.map((p) => (p.id === updated.id ? updated : p)),
        }))
      },

      deleteProfile: (profileId: string) => {
        set((state) => {
          const newProfiles = state.profiles.filter((p) => p.id !== profileId)
          const newActiveId = state.activeProfileId === profileId
            ? (newProfiles[0]?.id ?? null)
            : state.activeProfileId
          return { profiles: newProfiles, activeProfileId: newActiveId }
        })
      },

      switchProfile: (profileId: string) => {
        const profile = get().profiles.find((p) => p.id === profileId)
        if (profile) {
          set({
            activeProfileId: profileId,
            featureFlags: profile.plan === 'pro' ? { ...PRO_FLAGS } : { ...FREE_FLAGS },
          })
        }
      },

      getActiveProfile: () => {
        const { profiles, activeProfileId } = get()
        return profiles.find((p) => p.id === activeProfileId) ?? null
      },

      refreshFlags: () => {
        const profile = get().getActiveProfile()
        if (profile) {
          set({ featureFlags: profile.plan === 'pro' ? { ...PRO_FLAGS } : { ...FREE_FLAGS } })
        }
      },
    }),
    {
      name: 'migraine-ai-profiles',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        featureFlags: state.featureFlags,
      }),
    },
  ),
)
