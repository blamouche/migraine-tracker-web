import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface AdminStats {
  total_users: number
  active_30d: number
  new_this_month: number
  free_count: number
  pro_count: number
}

export interface SignupMonth {
  month: string
  total: number
  free_count: number
  pro_count: number
}

export interface ActivePeriod {
  period: string
  total: number
  free_count: number
  pro_count: number
}

export interface SubscriptionDistribution {
  distribution: { plan: string; count: number }[]
  conversion_rate: number
  pro_change_30d: number
}

type Granularity = 'day' | 'week' | 'month'

interface UseStatsReturn {
  stats: AdminStats | null
  signups: SignupMonth[]
  activeUsers: ActivePeriod[]
  distribution: SubscriptionDistribution | null
  granularity: Granularity
  setGranularity: (g: Granularity) => void
  isLoading: boolean
  error: string | null
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [signups, setSignups] = useState<SignupMonth[]>([])
  const [activeUsers, setActiveUsers] = useState<ActivePeriod[]>([])
  const [distribution, setDistribution] = useState<SubscriptionDistribution | null>(null)
  const [granularity, setGranularity] = useState<Granularity>('month')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async (g: Granularity) => {
    setIsLoading(true)
    setError(null)

    const [statsRes, signupsRes, activeRes, distRes] = await Promise.all([
      supabase.rpc('get_admin_stats'),
      supabase.rpc('get_signups_by_month'),
      supabase.rpc('get_active_users_by_period', { granularity: g }),
      supabase.rpc('get_subscription_distribution'),
    ])

    const firstError = statsRes.error ?? signupsRes.error ?? activeRes.error ?? distRes.error
    if (firstError) {
      setError(firstError.message)
      setIsLoading(false)
      return
    }

    setStats(statsRes.data as AdminStats)
    setSignups((signupsRes.data as SignupMonth[]) ?? [])
    setActiveUsers((activeRes.data as ActivePeriod[]) ?? [])
    setDistribution(distRes.data as SubscriptionDistribution)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchAll(granularity)
  }, [fetchAll, granularity])

  return { stats, signups, activeUsers, distribution, granularity, setGranularity, isLoading, error }
}
