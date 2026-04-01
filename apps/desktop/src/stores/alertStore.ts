import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Alert, AlertPreferences } from '@/types/alerts'
import { DEFAULT_ALERT_PREFERENCES } from '@/types/alerts'

interface AlertState {
  alerts: Alert[]
  preferences: AlertPreferences
  dismissedKeys: Record<string, string> // key -> ISO date of dismissal

  setAlerts: (alerts: Alert[]) => void
  dismissAlert: (alertId: string) => void
  isDismissedThisMonth: (key: string) => boolean
  updatePreferences: (prefs: Partial<AlertPreferences>) => void
  clearDismissals: () => void
}

function currentMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set, get) => ({
      alerts: [],
      preferences: DEFAULT_ALERT_PREFERENCES,
      dismissedKeys: {},

      setAlerts: (alerts) => set({ alerts }),

      dismissAlert: (alertId) => {
        const alert = get().alerts.find((a) => a.id === alertId)
        if (!alert) return

        const key = `${alert.type}:${currentMonthKey()}`
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === alertId ? { ...a, dismissedAt: new Date().toISOString() } : a,
          ),
          dismissedKeys: { ...state.dismissedKeys, [key]: new Date().toISOString() },
        }))
      },

      isDismissedThisMonth: (key) => {
        const dismissal = get().dismissedKeys[`${key}:${currentMonthKey()}`]
        return !!dismissal
      },

      updatePreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      clearDismissals: () => set({ dismissedKeys: {} }),
    }),
    {
      name: 'migraine-ai-alerts',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        dismissedKeys: state.dismissedKeys,
      }),
    },
  ),
)
