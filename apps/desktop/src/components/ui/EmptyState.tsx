import { useNavigate } from 'react-router'

interface EmptyStateProps {
  icon: 'crisis' | 'food' | 'treatment' | 'cycle' | 'consultation' | 'transport' | 'sport' | 'charge' | 'pain' | 'pattern' | 'dashboard' | 'generic'
  title: string
  description: string
  ctaLabel: string
  ctaPath: string
}

export function EmptyState({ icon, title, description, ctaLabel, ctaPath }: EmptyStateProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-(--color-brand-light)">
        <svg
          width="40"
          height="40"
          viewBox="0 0 48 48"
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {ICON_PATHS[icon]}
        </svg>
      </div>
      <h3 className="text-lg font-medium text-(--color-text-primary)">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-(--color-text-secondary)">{description}</p>
      <button
        type="button"
        onClick={() => navigate(ctaPath)}
        className="mt-6 rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover)"
      >
        {ctaLabel}
      </button>
    </div>
  )
}

const ICON_PATHS: Record<string, React.ReactNode> = {
  crisis: <path d="M26 4L6 28h18l-2 16 20-24H24l2-16z" />,
  food: (
    <>
      <path d="M6 4v14c0 2.2 1.8 4 4 4h8a4 4 0 0 0 4-4V4" />
      <path d="M14 4v40" />
      <path d="M42 30V4a10 10 0 0 0-10 10v12a4 4 0 0 0 4 4h6zm0 0v14" />
    </>
  ),
  treatment: (
    <>
      <path d="m21 40 20-20a9.9 9.9 0 1 0-14-14L7 26a9.9 9.9 0 1 0 14 14z" />
      <path d="m17 17 14 14" />
    </>
  ),
  cycle: (
    <>
      <rect width="36" height="36" x="6" y="8" rx="4" ry="4" />
      <line x1="32" x2="32" y1="4" y2="12" />
      <line x1="16" x2="16" y1="4" y2="12" />
      <line x1="6" x2="42" y1="20" y2="20" />
    </>
  ),
  consultation: (
    <>
      <path d="M9.6 4.6a.6.6 0 1 0 .4-.6H8a4 4 0 0 0-4 4v10a12 12 0 0 0 12 12v0a12 12 0 0 0 12-12V8a4 4 0 0 0-4-4h-2a.4.4 0 1 0 .6.6" />
      <path d="M16 30v2a12 12 0 0 0 12 12v0a12 12 0 0 0 12-12v-8" />
      <circle cx="40" cy="20" r="4" />
    </>
  ),
  transport: (
    <>
      <path d="M38 34h4a2 2 0 0 0 2-2v-6c0-1.8-1.4-3.4-3-3.8C37.4 21.2 32 20 32 20H16s-5.4 1.2-9 2.2c-1.6.4-3 2-3 3.8v6a2 2 0 0 0 2 2h4" />
      <circle cx="14" cy="34" r="4" /><circle cx="34" cy="34" r="4" />
      <path d="M10 20V12a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v8" />
    </>
  ),
  sport: <polyline points="44 24 36 24 30 42 18 6 12 24 4 24" />,
  charge: (
    <>
      <path d="M24 4a8 8 0 0 1 8 8 8 8 0 0 1 4 6.9 8 8 0 0 1 0 10.2A8 8 0 0 1 32 36a8 8 0 0 1-8 8 8 8 0 0 1-8-8 8 8 0 0 1-4-6.9 8 8 0 0 1 0-10.2A8 8 0 0 1 16 12a8 8 0 0 1 8-8z" />
      <path d="M24 4v40" />
    </>
  ),
  pain: (
    <path d="M41.7 9.2a11 11 0 0 0-15.6 0L24 11.3l-2.1-2.1a11 11 0 0 0-15.6 15.6l2.1 2.1L24 42.5l15.6-15.6 2.1-2.1a11 11 0 0 0 0-15.6z" />
  ),
  pattern: (
    <>
      <polyline points="44 14 27 31 17 21 4 34" />
      <polyline points="32 14 44 14 44 26" />
    </>
  ),
  dashboard: (
    <>
      <line x1="36" y1="40" x2="36" y2="20" />
      <line x1="24" y1="40" x2="24" y2="8" />
      <line x1="12" y1="40" x2="12" y2="28" />
    </>
  ),
  generic: (
    <>
      <circle cx="24" cy="24" r="18" />
      <line x1="24" x2="24" y1="16" y2="24" />
      <line x1="24" x2="24.01" y1="32" y2="32" />
    </>
  ),
}
