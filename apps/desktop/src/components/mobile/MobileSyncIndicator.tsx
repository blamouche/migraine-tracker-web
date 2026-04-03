import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useMobileSyncStore } from '@/stores/mobileSyncStore'

export function MobileSyncIndicator({ collapsed }: { collapsed: boolean }) {
  const { config, pendingCount, syncNow, refreshPendingCount } = useMobileSyncStore()
  const navigate = useNavigate()
  const [syncing, setSyncing] = useState(false)
  const [showPopover, setShowPopover] = useState(false)
  const [lastResult, setLastResult] = useState<{ synced: number; errors: number } | null>(null)

  const refresh = useCallback(() => {
    if (config.enabled) refreshPendingCount()
  }, [config.enabled, refreshPendingCount])

  // Refresh on mount + window focus
  useEffect(() => {
    refresh()
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refresh])

  if (!config.enabled || pendingCount === 0) return null

  const handleSync = async () => {
    setSyncing(true)
    setLastResult(null)
    const result = await syncNow()
    setLastResult(result)
    setSyncing(false)
    if (result.synced > 0 && result.errors === 0) {
      setTimeout(() => setShowPopover(false), 1500)
    }
  }

  return (
    <div className="relative px-2 mb-2">
      <button
        type="button"
        onClick={() => setShowPopover(!showPopover)}
        title={collapsed ? `${pendingCount} saisie(s) mobile en attente` : undefined}
        className="flex w-full items-center gap-3 rounded-(--radius-md) bg-indigo-50 px-2 py-2 text-sm text-indigo-700 transition-colors hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
      >
        <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
            <line x1="12" x2="12.01" y1="18" y2="18" />
          </svg>
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-0.5 text-[10px] font-bold text-white">
            {pendingCount}
          </span>
        </span>
        {!collapsed && (
          <span className="truncate text-xs">
            {pendingCount} saisie{pendingCount > 1 ? 's' : ''} en attente
          </span>
        )}
      </button>

      {/* Popover */}
      {showPopover && (
        <div className="absolute bottom-full left-2 right-2 z-50 mb-2 rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg-elevated) p-3 shadow-lg">
          <p className="text-xs font-semibold text-(--color-text-primary)">
            Synchronisation mobile
          </p>
          <p className="mt-1 text-xs text-(--color-text-secondary)">
            {pendingCount} saisie{pendingCount > 1 ? 's' : ''} en attente d'intégration au vault.
          </p>

          {lastResult && (
            <p className="mt-2 text-xs text-(--color-text-muted)">
              {lastResult.synced} synchronisée{lastResult.synced > 1 ? 's' : ''}
              {lastResult.errors > 0 && `, ${lastResult.errors} erreur${lastResult.errors > 1 ? 's' : ''}`}
            </p>
          )}

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="rounded-(--radius-md) bg-(--color-brand) px-3 py-1.5 text-xs font-semibold text-(--color-text-inverse) hover:bg-(--color-brand-hover) disabled:opacity-50"
            >
              {syncing ? 'Sync...' : 'Synchroniser'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPopover(false)
                navigate('/mobile-sync')
              }}
              className="rounded-(--radius-md) border border-(--color-border) px-3 py-1.5 text-xs text-(--color-text-secondary) hover:text-(--color-text-primary)"
            >
              Détails
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
