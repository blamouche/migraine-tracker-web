import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface PlanConfigRow {
  plan: string
  feature_key: string
  feature_value: string
}

export type PlanFeatures = Record<string, string>

interface UsePlanConfigReturn {
  freePlan: PlanFeatures
  proPlan: PlanFeatures
  isLoading: boolean
  error: string | null
  updateFeature: (plan: string, featureKey: string, featureValue: string) => Promise<void>
  refresh: () => Promise<void>
}

export function usePlanConfig(): UsePlanConfigReturn {
  const [freePlan, setFreePlan] = useState<PlanFeatures>({})
  const [proPlan, setProPlan] = useState<PlanFeatures>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('plan_config')
      .select('*')
      .order('feature_key')

    if (fetchError) {
      setError(fetchError.message)
      setIsLoading(false)
      return
    }

    const rows = (data as PlanConfigRow[]) ?? []
    const free: PlanFeatures = {}
    const pro: PlanFeatures = {}
    for (const row of rows) {
      if (row.plan === 'free') free[row.feature_key] = row.feature_value
      else if (row.plan === 'pro') pro[row.feature_key] = row.feature_value
    }
    setFreePlan(free)
    setProPlan(pro)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const updateFeature = useCallback(async (plan: string, featureKey: string, featureValue: string) => {
    const session = await supabase.auth.getSession()
    const adminId = session.data.session?.user.id

    const oldValue = plan === 'free' ? freePlan[featureKey] : proPlan[featureKey]

    const { error: upsertError } = await supabase
      .from('plan_config')
      .upsert(
        {
          plan,
          feature_key: featureKey,
          feature_value: featureValue,
          updated_at: new Date().toISOString(),
          updated_by: adminId,
        },
        { onConflict: 'plan,feature_key' },
      )

    if (upsertError) {
      setError(upsertError.message)
      throw new Error(upsertError.message)
    }

    // Log the change
    await supabase.from('admin_log').insert({
      admin_id: adminId,
      action: 'update_plan_config',
      target_id: null,
      old_value: `${plan}.${featureKey}: ${oldValue}`,
      new_value: `${plan}.${featureKey}: ${featureValue}`,
    })

    // Update local state
    if (plan === 'free') {
      setFreePlan((prev) => ({ ...prev, [featureKey]: featureValue }))
    } else {
      setProPlan((prev) => ({ ...prev, [featureKey]: featureValue }))
    }
  }, [freePlan, proPlan])

  return { freePlan, proPlan, isLoading, error, updateFeature, refresh }
}
