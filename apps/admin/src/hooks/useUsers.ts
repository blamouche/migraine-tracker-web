import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface AdminUser {
  user_id: string
  email_masked: string
  email_full: string
  created_at: string
  last_active_at: string | null
  session_count: number
  is_active: boolean
  auth_provider: string | null
  plan: string
  marketing_consent: boolean
}

interface UseUsersReturn {
  users: AdminUser[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  toggleActive: (userId: string, currentlyActive: boolean) => Promise<void>
  revealEmail: (userId: string) => Promise<string | null>
  revealedEmails: Record<string, string>
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revealedEmails, setRevealedEmails] = useState<Record<string, string>>({})

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const { data, error: rpcError } = await supabase.rpc('get_admin_user_list')
    if (rpcError) {
      setError(rpcError.message)
      setIsLoading(false)
      return
    }
    setUsers((data as AdminUser[]) ?? [])
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const toggleActive = useCallback(async (userId: string, currentlyActive: boolean) => {
    const newActive = !currentlyActive
    const { error: updateError } = await supabase
      .from('user_usage')
      .update({ is_active: newActive })
      .eq('user_id', userId)

    if (updateError) {
      setError(updateError.message)
      return
    }

    // Log the action
    const session = await supabase.auth.getSession()
    const adminId = session.data.session?.user.id
    await supabase.from('admin_log').insert({
      admin_id: adminId,
      action: newActive ? 'enable_account' : 'disable_account',
      target_id: userId,
      old_value: currentlyActive ? 'active' : 'disabled',
      new_value: newActive ? 'active' : 'disabled',
    })

    setUsers((prev) => prev.map((u) => u.user_id === userId ? { ...u, is_active: newActive } : u))
  }, [])

  const revealEmail = useCallback(async (userId: string) => {
    const { data, error: rpcError } = await supabase.rpc('reveal_user_email', { target_user_id: userId })
    if (rpcError) {
      setError(rpcError.message)
      return null
    }
    const email = data as string
    setRevealedEmails((prev) => ({ ...prev, [userId]: email }))
    return email
  }, [])

  return { users, isLoading, error, refresh, toggleActive, revealEmail, revealedEmails }
}
