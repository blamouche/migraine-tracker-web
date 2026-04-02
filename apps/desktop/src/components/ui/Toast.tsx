import { useEffect, useState, useCallback } from 'react'
import { create } from 'zustand'

// ─── Toast types ───

type ToastType = 'success' | 'warning' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  undoAction?: () => void
  duration?: number // ms, 0 = manual dismiss
}

interface ToastState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = crypto.randomUUID()
    set((state) => ({
      toasts: [...state.toasts.slice(-2), { ...toast, id }], // max 3
    }))
    return id
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))

// ─── Convenience helpers ───

export function toast(type: ToastType, message: string, options?: { undoAction?: () => void; duration?: number }) {
  return useToastStore.getState().addToast({
    type,
    message,
    ...options,
  })
}

// ─── ToastContainer (mount once in AppLayout) ───

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div
      className="fixed bottom-20 right-4 z-[100] flex flex-col-reverse gap-2 md:bottom-6 md:right-6"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}

// ─── ToastItem ───

const TYPE_CONFIG: Record<ToastType, { icon: string; bg: string; dismissAuto: boolean }> = {
  success: { icon: '\u2713', bg: 'bg-(--color-success-light)', dismissAuto: true },
  warning: { icon: '\u26a0', bg: 'bg-(--color-warning-light)', dismissAuto: true },
  error: { icon: '\u2715', bg: 'bg-(--color-danger-light)', dismissAuto: false },
  info: { icon: 'i', bg: 'bg-(--color-brand-light)', dismissAuto: true },
}

function ToastItem({ toast: t }: { toast: Toast }) {
  const removeToast = useToastStore((s) => s.removeToast)
  const config = TYPE_CONFIG[t.type]
  const duration = t.duration ?? (t.undoAction ? 5000 : config.dismissAuto ? 4000 : 0)
  const [progress, setProgress] = useState(100)
  const [startX, setStartX] = useState<number | null>(null)
  const [offsetX, setOffsetX] = useState(0)

  const dismiss = useCallback(() => {
    removeToast(t.id)
  }, [removeToast, t.id])

  useEffect(() => {
    if (duration === 0) return
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (remaining <= 0) {
        clearInterval(interval)
        dismiss()
      }
    }, 50)
    return () => clearInterval(interval)
  }, [duration, dismiss])

  const handleUndo = () => {
    t.undoAction?.()
    dismiss()
  }

  return (
    <div
      className={`flex min-w-[280px] max-w-[400px] items-start gap-3 rounded-(--radius-lg) ${config.bg} px-4 py-3 shadow-lg cursor-pointer`}
      role="button"
      tabIndex={0}
      aria-label="Fermer la notification"
      style={{
        transform: `translateX(${offsetX}px)`,
        opacity: Math.max(0, 1 - Math.abs(offsetX) / 150),
        transition: startX !== null ? 'none' : 'transform 200ms ease, opacity 200ms ease',
      }}
      onClick={dismiss}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') dismiss() }}
      onTouchStart={(e) => setStartX(e.touches[0]!.clientX)}
      onTouchMove={(e) => {
        if (startX !== null) setOffsetX(e.touches[0]!.clientX - startX)
      }}
      onTouchEnd={() => {
        if (Math.abs(offsetX) > 80) dismiss()
        else setOffsetX(0)
        setStartX(null)
      }}
    >
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold">
        {config.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-(--color-text-primary)">{t.message}</p>
        {t.undoAction && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleUndo() }}
            className="mt-1 text-xs font-semibold text-(--color-brand) hover:underline"
          >
            Annuler
          </button>
        )}
      </div>
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-(--radius-lg)">
          <div
            className="h-full bg-(--color-text-muted)"
            style={{ width: `${progress}%`, transition: 'width 50ms linear', opacity: 0.3 }}
          />
        </div>
      )}
    </div>
  )
}
