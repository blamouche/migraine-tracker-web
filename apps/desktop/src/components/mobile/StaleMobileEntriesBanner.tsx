import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useMobileSyncStore } from '@/stores/mobileSyncStore'

export function StaleMobileEntriesBanner() {
  const { config } = useMobileSyncStore()
  const { user, anonymousId } = useAuthStore()
  const [staleCount, setStaleCount] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!config.enabled) return

    const userId = user?.id ?? anonymousId
    if (!userId) return

    supabase.rpc('notify_stale_mobile_entries').then(({ data, error }) => {
      if (error || !data) return
      const match = (data as { user_id: string; entry_count: number }[]).find(
        (r) => r.user_id === userId,
      )
      if (match) setStaleCount(match.entry_count)
    })
  }, [config.enabled, user, anonymousId])

  if (!staleCount || dismissed) return null

  return (
    <div className="rounded-(--radius-lg) border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
      <div className="flex items-start justify-between gap-3">
        <p>
          Vous avez <strong>{staleCount}</strong> saisie{staleCount > 1 ? 's' : ''} mobile
          {staleCount > 1 ? 's' : ''} non synchronisée{staleCount > 1 ? 's' : ''} depuis plus de
          80 jours. Synchronisez-les avant qu'elles soient supprimées automatiquement.{' '}
          <Link
            to="/mobile-sync"
            className="font-semibold underline hover:no-underline"
          >
            Synchroniser maintenant
          </Link>
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
