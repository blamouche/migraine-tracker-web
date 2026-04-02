import { create } from 'zustand'

interface NavigationState {
  sidebarCollapsed: boolean
  sidebarOpen: boolean // mobile overlay
  toggleCollapsed: () => void
  setSidebarOpen: (open: boolean) => void
}

const stored = typeof window !== 'undefined' ? localStorage.getItem('sidebar-collapsed') : null

export const useNavigationStore = create<NavigationState>((set) => ({
  sidebarCollapsed: stored === 'true',
  sidebarOpen: false,
  toggleCollapsed: () =>
    set((state) => {
      const next = !state.sidebarCollapsed
      localStorage.setItem('sidebar-collapsed', String(next))
      return { sidebarCollapsed: next }
    }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
