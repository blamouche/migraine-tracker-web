import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface UseUserActionsReturn {
  changePlan: (userId: string, newPlan: string) => Promise<void>
  deleteUser: (userId: string) => Promise<void>
}

export function useUserActions(onSuccess: () => Promise<void>): UseUserActionsReturn {
  const changePlan = useCallback(async (userId: string, newPlan: string) => {
    const { error } = await supabase.rpc('change_user_plan', {
      target_user_id: userId,
      new_plan: newPlan,
    })
    if (error) throw new Error(error.message)
    await onSuccess()
  }, [onSuccess])

  const deleteUser = useCallback(async (userId: string) => {
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    if (!token) throw new Error('Session expirée')

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
    const res = await fetch(`${supabaseUrl}/functions/v1/delete-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ target_user_id: userId }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Erreur inconnue' }))
      throw new Error(body.error ?? 'Échec de la suppression')
    }

    await onSuccess()
  }, [onSuccess])

  return { changePlan, deleteUser }
}
