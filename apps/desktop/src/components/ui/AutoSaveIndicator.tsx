import { useEffect, useState } from 'react'

interface AutoSaveIndicatorProps {
  isDirty: boolean
  lastSavedAt: Date | null
  isSaving?: boolean
}

export function AutoSaveIndicator({ isDirty, lastSavedAt, isSaving }: AutoSaveIndicatorProps) {
  const [relativeTime, setRelativeTime] = useState('')

  useEffect(() => {
    if (!lastSavedAt) return
    const update = () => {
      const seconds = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000)
      if (seconds < 5) setRelativeTime('à l\'instant')
      else if (seconds < 60) setRelativeTime(`il y a ${seconds}s`)
      else setRelativeTime(`il y a ${Math.floor(seconds / 60)}min`)
    }
    update()
    const interval = setInterval(update, 5000)
    return () => clearInterval(interval)
  }, [lastSavedAt])

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-xs text-(--color-text-muted)">
        <span className="h-2 w-2 animate-pulse rounded-full bg-(--color-warning)" />
        Enregistrement…
      </div>
    )
  }

  if (isDirty) {
    return (
      <div className="flex items-center gap-2 text-xs text-(--color-warning)">
        <span className="h-2 w-2 rounded-full bg-(--color-warning)" />
        Modifications non sauvegardées
      </div>
    )
  }

  if (lastSavedAt) {
    return (
      <div className="flex items-center gap-2 text-xs text-(--color-text-muted)">
        <span className="h-2 w-2 rounded-full bg-(--color-success)" />
        Brouillon sauvegardé {relativeTime}
      </div>
    )
  }

  return null
}
