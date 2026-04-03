import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000 // 15 minutes

interface AdminAuthState {
  user: User | null
  isLoading: boolean
  isAdmin: boolean
  error: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

export function useAdminAuth(): AdminAuthState {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const checkAdmin = useCallback((session: Session | null) => {
    if (!session?.user) {
      setUser(null)
      setIsAdmin(false)
      return
    }
    const role = session.user.app_metadata?.role
    console.log('JWT app_metadata:', session.user.app_metadata)
    console.log('JWT role:', role)
    setUser(session.user)
    if (role === 'admin') {
      setIsAdmin(true)
      setError(null)
    } else {
      setIsAdmin(false)
      setError('Accès refusé : rôle admin requis')
    }
  }, [])

  // Inactivity timeout
  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (!user) return
    timeoutRef.current = setTimeout(async () => {
      await supabase.auth.signOut()
      setUser(null)
      setIsAdmin(false)
      setError('Session expirée — inactivité de 15 minutes')
    }, INACTIVITY_TIMEOUT_MS)
  }, [user])

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const
    events.forEach((e) => window.addEventListener(e, resetTimeout))
    resetTimeout()
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimeout))
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [resetTimeout])

  // Auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAdmin(session)
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAdmin(session)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [checkAdmin])

  const signIn = useCallback(async () => {
    setError(null)
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (authError) setError(authError.message)
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
  }, [])

  return { user, isLoading, isAdmin, error, signIn, signOut }
}
