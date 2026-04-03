import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface AuditLogEntry {
  id: string
  admin_id: string
  action: string
  target_id: string | null
  old_value: string | null
  new_value: string | null
  created_at: string
}

interface UseAuditLogReturn {
  entries: AuditLogEntry[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useAuditLog(): UseAuditLogReturn {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('admin_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (fetchError) {
      setError(fetchError.message)
      setIsLoading(false)
      return
    }

    setEntries((data as AuditLogEntry[]) ?? [])
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { entries, isLoading, error, refresh }
}
