import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import type { AuthProvider } from '@migraine-ai/shared/types'
import { supabase } from '@/lib/supabase'

interface AuthState {
  session: Session | null
  user: User | null
  isAnonymous: boolean
  anonymousId: string | null
  isLoading: boolean
  error: string | null

  initialize: () => Promise<void>
  signInWithProvider: (provider: 'google' | 'apple' | 'facebook') => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isAnonymous: false,
  anonymousId: null,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        set({ session, user: session.user, isAnonymous: false, isLoading: false })
      } else {
        set({ isAnonymous: false, isLoading: false })
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ?? null,
          isAnonymous: false,
        })
      })
    } catch {
      set({ isAnonymous: false, isLoading: false })
    }
  },

  signInWithProvider: async (provider) => {
    set({ error: null })
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) set({ error: mapAuthError(error.message) })
  },

  signInWithMagicLink: async (email) => {
    set({ error: null })
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      set({ error: mapAuthError(error.message) })
    }
  },

  signUp: async (email, password) => {
    set({ error: null })
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      set({ error: mapAuthError(error.message) })
    }
  },

  signIn: async (email, password) => {
    set({ error: null })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      set({ error: mapAuthError(error.message) })
    }
  },

  resetPassword: async (email) => {
    set({ error: null })
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      set({ error: mapAuthError(error.message) })
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null, isAnonymous: false })
  },

  clearError: () => set({ error: null }),
}))

function mapAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'Email ou mot de passe incorrect'
  }
  if (message.includes('Email not confirmed')) {
    return 'Veuillez confirmer votre email avant de vous connecter'
  }
  if (message.includes('rate limit')) {
    return 'Trop de tentatives. Réessayez dans quelques minutes.'
  }
  if (message.includes('already registered')) {
    return 'Un compte existe déjà avec cet email'
  }
  return 'Une erreur est survenue. Veuillez réessayer.'
}

export function getAuthProvider(user: User | null): AuthProvider | null {
  if (!user) return null
  const provider = user.app_metadata?.provider
  if (provider === 'google' || provider === 'apple' || provider === 'facebook') return provider
  if (user.app_metadata?.providers?.includes('email')) return 'email'
  return 'email'
}
