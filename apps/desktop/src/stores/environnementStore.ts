import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { EnvironnementEntry, LocationPreferences, LocationConfig } from '@/types/environnement'
import { writeEnvironnement, readAllEnvironnements, readEnvironnementByDate } from '@/lib/vault/environnement'
import { fetchWeatherData, fetchHistoricalWeather } from '@/lib/weather/openMeteo'
import { useCrisisStore } from '@/stores/crisisStore'
import { useDailyPainStore } from '@/stores/dailyPainStore'

interface EnvironnementState {
  entries: EnvironnementEntry[]
  locationPrefs: LocationPreferences
  isLoading: boolean
  error: string | null

  loadEnvironnements: () => Promise<void>
  fetchTodayWeather: () => Promise<EnvironnementEntry | null>
  backfillWeather: () => Promise<void>
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

      backfillWeather: async () => {
        const state = get()
        let location = state.locationPrefs.defaultLocation

        // If no location configured, try geolocation
        if (!location) {
          const geo = await get().requestGeolocation()
          if (geo) {
            get().setDefaultLocation(geo)
            location = geo
          } else {
            return
          }
        }

        const { entries } = get()

        // Collect all event dates from other stores
        const crisisDates = useCrisisStore.getState().crises.map((c) => c.date)
        const painDates = useDailyPainStore.getState().entries.map((p) => p.date)
        const allDates = [...crisisDates, ...painDates].filter(Boolean)
        if (allDates.length === 0) return

        // Find earliest event date
        allDates.sort()
        const earliestDate = allDates[0]!

        // Today in local ISO
        const now = new Date()
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

        // Dates we already have
        const existingDates = new Set(entries.map((e) => e.date))

        // Check if there are missing dates
        const missingDates: string[] = []
        const cursor = new Date(earliestDate + 'T00:00:00')
        const end = new Date(todayStr + 'T00:00:00')
        while (cursor <= end) {
          const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
          if (!existingDates.has(iso)) missingDates.push(iso)
          cursor.setDate(cursor.getDate() + 1)
        }

        if (missingDates.length === 0) return

        // Fetch historical weather for the full range
        // Open-Meteo archive API doesn't cover the last ~5 days, so split into
        // archive (up to 5 days ago) and forecast (last 5 days)
        const fiveDaysAgo = new Date(now)
        fiveDaysAgo.setDate(now.getDate() - 5)
        const archiveEnd = `${fiveDaysAgo.getFullYear()}-${String(fiveDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(fiveDaysAgo.getDate()).padStart(2, '0')}`

        const newEntries: EnvironnementEntry[] = []
        const nowIso = now.toISOString()

        // Archive fetch (bulk)
        if (earliestDate <= archiveEnd) {
          const historicalData = await fetchHistoricalWeather(
            location.latitude,
            location.longitude,
            earliestDate,
            archiveEnd,
          )
          for (const raw of historicalData) {
            if (existingDates.has(raw.date)) continue
            const entry: EnvironnementEntry = {
              id: crypto.randomUUID(),
              ...raw,
              createdAt: nowIso,
              updatedAt: nowIso,
            }
            newEntries.push(entry)
            existingDates.add(raw.date)
          }
        }

        // Recent days via forecast API (one by one for the last 5 days)
        for (const date of missingDates) {
          if (existingDates.has(date)) continue
          if (date <= archiveEnd) continue
          const raw = await fetchWeatherData(location.latitude, location.longitude, date)
          if (!raw) continue
          const entry: EnvironnementEntry = {
            id: crypto.randomUUID(),
            ...raw,
            createdAt: nowIso,
            updatedAt: nowIso,
          }
          newEntries.push(entry)
          existingDates.add(date)
        }

        if (newEntries.length === 0) return

        // Persist to vault in background
        for (const entry of newEntries) {
          writeEnvironnement(entry).catch(() => {})
        }

        // Update store
        set((state) => ({
          entries: [...newEntries, ...state.entries].sort((a, b) => b.date.localeCompare(a.date)),
        }))
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
