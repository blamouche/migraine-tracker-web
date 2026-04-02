import { useState, useCallback, useRef } from 'react'
import { toast } from '@/components/ui/Toast'

interface UseUndoDeleteOptions<T> {
  onDelete: (item: T) => void
  label?: (item: T) => string
  timeout?: number
}

export function useUndoDelete<T extends { id: string }>({ onDelete, label, timeout = 5000 }: UseUndoDeleteOptions<T>) {
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const requestDelete = useCallback(
    (item: T) => {
      setPendingIds((prev) => new Set(prev).add(item.id))

      const displayLabel = label ? label(item) : 'Entrée'

      toast('warning', `${displayLabel} supprimé(e)`, {
        undoAction: () => {
          // Undo: remove from pending
          setPendingIds((prev) => {
            const next = new Set(prev)
            next.delete(item.id)
            return next
          })
          const timer = timers.current.get(item.id)
          if (timer) {
            clearTimeout(timer)
            timers.current.delete(item.id)
          }
        },
        duration: timeout,
      })

      const timer = setTimeout(() => {
        onDelete(item)
        setPendingIds((prev) => {
          const next = new Set(prev)
          next.delete(item.id)
          return next
        })
        timers.current.delete(item.id)
      }, timeout)

      timers.current.set(item.id, timer)
    },
    [onDelete, label, timeout],
  )

  const isPending = useCallback(
    (id: string) => pendingIds.has(id),
    [pendingIds],
  )

  return { requestDelete, isPending }
}
