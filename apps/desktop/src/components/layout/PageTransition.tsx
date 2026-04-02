import { useRef, useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [transitionStage, setTransitionStage] = useState<'enter' | 'exit'>('enter')
  const prevPath = useRef(location.pathname)

  // Check prefers-reduced-motion
  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Check crisis mode (transition-speed: 0ms)
  const isCrisis = location.pathname === '/crisis/quick'

  const shouldAnimate = !prefersReduced && !isCrisis

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      prevPath.current = location.pathname

      if (!shouldAnimate) {
        setDisplayChildren(children)
        return
      }

      setTransitionStage('exit')
      const timer = setTimeout(() => {
        setDisplayChildren(children)
        setTransitionStage('enter')
      }, 150)
      return () => clearTimeout(timer)
    } else {
      setDisplayChildren(children)
    }
  }, [location.pathname, children, shouldAnimate])

  if (!shouldAnimate) {
    return <>{children}</>
  }

  return (
    <div
      style={{
        opacity: transitionStage === 'exit' ? 0 : 1,
        transform: transitionStage === 'exit' ? 'translateY(8px)' : 'translateY(0)',
        transition: 'opacity 150ms ease-out, transform 150ms ease-out',
      }}
    >
      {displayChildren}
    </div>
  )
}
