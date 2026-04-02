import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { EnvironnementEntry, LocationPreferences, LocationConfig } from '@/types/environnement'
import { writeEnvironnement, readAllEnvironnements, readEnvironnementByDate } from '@/lib/vault/environnement'
import { fetchWeatherData } from '@/lib/weather/openMeteo'

interface EnvironnementState {
  entries: EnvironnementEntry[]
  locationPrefs: LocationPreferences
  isLoading: boolean
  error: string | null

  loadEnvironnements: () => Promise<void>
  fetchTodayWeather: () => Promise<EnvironnementEntry | null>
  setDefaultLocation: (location: LocationConfig) => void
  addFavorite: (location: LocationConfig) => void
  removeFavorite: (label: string) => void
  requestGeolocation: () => Promise<LocationConfig | null>
  clearError: () => void
}

function generateId(): string {
  return crypto.randomUUID()
}

export const useEnvironnementStore = create<EnvironnementState>()(
  persist(
    (set, get) => ({
      entries: [],
      locationPrefs: { defaultLocation: null, favorites: [] },
      isLoading: false,
      error: null,

      loadEnvironnements: async () => {
        set({ isLoading: true, error: null })
        try {
          const vaultEntries = await readAllEnvironnements()
          if (vaultEntries.length > 0) {
            set({ entries: vaultEntries, isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ error: 'Impossible de charger les données environnementales', isLoading: false })
        }
      },

      fetchTodayWeather: async () => {
        const { locationPrefs } = get()
        const location = locationPrefs.defaultLocation
        if (!location) {
          set({ error: 'Aucune localisation configurée' })
          return null
        }

        const today = new Date().toISOString().slice(0, 10)

        // Check if we already have today's data
        const existing = await readEnvironnementByDate(today)
        if (existing) return existing

        set({ isLoading: true })
        try {
          const weatherData = await fetchWeatherData(location.latitude, location.longitude, today)
          if (!weatherData) {
            set({ isLoading: false, error: 'Impossible de récupérer la météo' })
            return null
          }

          const now = new Date().toISOString()
          const entry: EnvironnementEntry = {
            id: generateId(),
            ...weatherData,
            createdAt: now,
            updatedAt: now,
          }

          writeEnvironnement(entry).catch(() => {})
          set((state) => ({ entries: [entry, ...state.entries], isLoading: false }))
          return entry
        } catch {
          set({ isLoading: false, error: 'Erreur lors de la récupération météo' })
          return null
        }
      },

      setDefaultLocation: (location: LocationConfig) => {
        set((state) => ({
          locationPrefs: { ...state.locationPrefs, defaultLocation: location },
        }))
      },

      addFavorite: (location: LocationConfig) => {
        set((state) => ({
          locationPrefs: {
            ...state.locationPrefs,
            favorites: [...state.locationPrefs.favorites, location],
          },
        }))
      },

      removeFavorite: (label: string) => {
        set((state) => ({
          locationPrefs: {
            ...state.locationPrefs,
            favorites: state.locationPrefs.favorites.filter((f) => f.label !== label),
          },
        }))
      },

      requestGeolocation: async () => {
        return new Promise((resolve) => {
          if (!navigator.geolocation) {
            resolve(null)
            return
          }
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const loc: LocationConfig = {
                type: 'geolocation',
                label: 'Position actuelle',
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }
              resolve(loc)
            },
            () => resolve(null),
            { timeout: 10000 },
          )
        })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'migraine-ai-environnement',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        entries: state.entries,
        locationPrefs: state.locationPrefs,
      }),
    },
  ),
)
