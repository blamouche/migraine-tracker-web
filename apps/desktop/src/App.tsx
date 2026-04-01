import { useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { useAuthStore } from '@/stores/authStore'
import { router } from '@/router'

export function App() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
