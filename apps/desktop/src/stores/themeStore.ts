import { create } from 'zustand'
import type { Theme } from '@migraine-ai/shared/types'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getSystemTheme(),
  setTheme: (theme) => set({ theme }),
}))
