import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)

if (!hasSupabaseConfig) {
  console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Auth features will not work.')
}

// Create a no-op client when env vars are missing (local dev without Supabase)
export const supabase: SupabaseClient = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (new Proxy({} as SupabaseClient, {
      get: (_target, prop) => {
        if (prop === 'auth') {
          return new Proxy(
            {},
            {
              get: (_t, method) => {
                if (method === 'onAuthStateChange') {
                  return () => ({ data: { subscription: { unsubscribe: () => {} } } })
                }
                if (method === 'getSession') {
                  return () => Promise.resolve({ data: { session: null }, error: null })
                }
                return () => Promise.resolve({ data: null, error: null })
              },
            },
          )
        }
        if (prop === 'from' || prop === 'rpc') {
          return () =>
            new Proxy(
              {},
              {
                get: () => () => Promise.resolve({ data: null, error: null }),
              },
            )
        }
        return () => {}
      },
    }) as SupabaseClient)
