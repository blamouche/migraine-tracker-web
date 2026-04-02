import { type ReactNode } from 'react'
import { useLocation } from 'react-router'

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()

  // Check prefers-reduced-motion
  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Check crisis mode (transition-speed: 0ms)
  const isCrisis = location.pathname === '/crisis/quick'

  if (prefersReduced || isCrisis) {
    return <>{children}</>
  }

  return (
    <div
      key={location.pathname}
      style={{
        animation: 'fadeSlideIn 150ms ease-out',
      }}
    >
      {children}
    </div>
  )
}
