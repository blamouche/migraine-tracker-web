import { useState } from 'react'

interface FieldTooltipProps {
  label: string
  content: string
  example?: string
}

export function FieldTooltip({ label, content, example }: FieldTooltipProps) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs text-(--color-text-muted) hover:bg-(--color-bg-interactive) hover:text-(--color-brand)"
        aria-label={`Aide pour ${label}`}
      >
        ⓘ
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-(--radius-md) bg-(--color-bg-elevated) p-3 text-xs shadow-lg ring-1 ring-(--color-border)"
        >
          <span className="block font-medium text-(--color-text-primary)">{label}</span>
          <span className="mt-1 block text-(--color-text-secondary)">{content}</span>
          {example && (
            <span className="mt-1 block italic text-(--color-text-muted)">Ex : {example}</span>
          )}
        </span>
      )}
    </span>
  )
}
