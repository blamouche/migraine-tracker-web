/**
 * Lightweight Supabase client for mobile transit
 * Mobile doesn't use auth — it sends encrypted blobs with the userId from QR pairing
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseUrl = ''
let supabaseAnonKey = ''
let client: SupabaseClient | null = null

// Env vars may be set at build time or injected from QR payload
const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (envUrl && envKey) {
  supabaseUrl = envUrl
  supabaseAnonKey = envKey
}

export function configureSupabase(url: string, anonKey: string) {
  supabaseUrl = url
  supabaseAnonKey = anonKey
  client = null // reset so next getSupabase() creates a fresh client
}

export function getSupabase(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase not configured. Pair device first.')
  }
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey)
  }
  return client
}
