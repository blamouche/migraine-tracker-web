import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase before importing authStore
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
      signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}))

vi.mock('@/lib/anonymous', () => ({
  getOrCreateAnonymousId: vi.fn().mockResolvedValue('test-anon-id'),
  removeAnonymousId: vi.fn().mockResolvedValue(undefined),
}))

import { useAuthStore } from './authStore'

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      session: null,
      user: null,
      isAnonymous: false,
      anonymousId: null,
      isLoading: true,
      error: null,
    })
  })

  it('starts with loading state', () => {
    const state = useAuthStore.getState()
    expect(state.isLoading).toBe(true)
    expect(state.session).toBeNull()
    expect(state.user).toBeNull()
  })

  it('initializes as anonymous when no session', async () => {
    await useAuthStore.getState().initialize()
    const state = useAuthStore.getState()
    expect(state.isLoading).toBe(false)
    expect(state.isAnonymous).toBe(true)
    expect(state.anonymousId).toBe('test-anon-id')
  })

  it('clears error', () => {
    useAuthStore.setState({ error: 'some error' })
    useAuthStore.getState().clearError()
    expect(useAuthStore.getState().error).toBeNull()
  })

  it('calls signInWithOAuth for social providers', async () => {
    const { supabase } = await import('@/lib/supabase')
    await useAuthStore.getState().signInWithProvider('google')
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: expect.stringContaining('/auth/callback') },
    })
  })

  it('calls signInWithOtp for magic link', async () => {
    const { supabase } = await import('@/lib/supabase')
    await useAuthStore.getState().signInWithMagicLink('test@example.com')
    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({ email: 'test@example.com' })
  })

  it('calls signUp for email registration', async () => {
    const { supabase } = await import('@/lib/supabase')
    await useAuthStore.getState().signUp('test@example.com', 'password123')
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })

  it('calls signInWithPassword for email login', async () => {
    const { supabase } = await import('@/lib/supabase')
    await useAuthStore.getState().signIn('test@example.com', 'password123')
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })

  it('sets error on auth failure', async () => {
    const { supabase } = await import('@/lib/supabase')
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials', name: 'AuthApiError', status: 400 },
    } as never)

    await useAuthStore.getState().signIn('test@example.com', 'wrong')
    expect(useAuthStore.getState().error).toBe('Email ou mot de passe incorrect')
  })

  it('signs out and resets to anonymous', async () => {
    useAuthStore.setState({ session: {} as never, user: {} as never, isAnonymous: false })
    await useAuthStore.getState().signOut()
    const state = useAuthStore.getState()
    expect(state.session).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAnonymous).toBe(true)
  })
})
