/**
 * E29 — Redirects to home if the current route belongs to a disabled module.
 * Wrap this around the Outlet in AppLayout to gate access.
 */
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useModuleStore } from '@/stores/moduleStore'

export function useModuleGuard() {
  const location = useLocation()
  const navigate = useNavigate()
  const isRouteEnabled = useModuleStore((s) => s.isRouteEnabled)

  useEffect(() => {
    if (!isRouteEnabled(location.pathname)) {
      navigate('/', { replace: true })
    }
  }, [location.pathname, isRouteEnabled, navigate])
}
