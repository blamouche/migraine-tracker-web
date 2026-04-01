import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { IntensitySlider } from '@/components/crisis/IntensitySlider'
import { ChipSelector, initDefaultSet } from '@/components/crisis/ChipSelector'
import { DEFAULT_TREATMENTS } from '@/types/crisis'
import { useCrisisStore } from '@/stores/crisisStore'
import { useThemeStore } from '@/stores/themeStore'

initDefaultSet(DEFAULT_TREATMENTS)

function currentTime(): string {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

export function CrisisModePage() {
  const navigate = useNavigate()
  const { createQuickCrisis } = useCrisisStore()
  const { theme, setTheme } = useThemeStore()
  const [previousTheme, setPreviousTheme] = useState(theme)

  const [startTime, setStartTime] = useState(currentTime)
  const [intensity, setIntensity] = useState(5)
  const [treatments, setTreatments] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showToast, setShowToast] = useState(false)

  // Switch to crisis theme on mount, restore on unmount
  useEffect(() => {
    setPreviousTheme(theme)
    setTheme('crisis')
    return () => {
      // Will be called on unmount — restore theme
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await createQuickCrisis({ startTime, intensity, treatments })
      setShowToast(true)
      setTimeout(() => {
        setTheme(previousTheme === 'crisis' ? 'dark' : previousTheme)
        navigate('/')
      }, 2000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setTheme(previousTheme === 'crisis' ? 'dark' : previousTheme)
    navigate('/')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base) px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-bold text-(--color-text-primary)">
            Mode Crise
          </h1>
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
            aria-label="Annuler"
          >
            ✕
          </button>
        </div>

        {/* Start time — pre-filled */}
        <div className="space-y-1">
          <label htmlFor="start-time" className="text-sm font-medium text-(--color-text-primary)">
            Heure de début
          </label>
          <input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-4 py-3 text-lg text-(--color-text-primary) focus:border-(--color-brand) focus:outline-none"
          />
        </div>

        {/* Intensity slider */}
        <IntensitySlider value={intensity} onChange={setIntensity} />

        {/* Treatment chips */}
        <ChipSelector
          label="Traitement pris"
          options={DEFAULT_TREATMENTS}
          selected={treatments}
          onChange={setTreatments}
        />

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full rounded-(--radius-md) bg-(--color-brand) py-4 text-base font-semibold text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover) disabled:opacity-50"
        >
          {isSubmitting ? 'Enregistrement…' : 'Enregistrer la crise'}
        </button>

        <p className="text-center text-xs text-(--color-text-muted)">
          Vous pourrez compléter les détails plus tard
        </p>
      </div>

      {/* Toast */}
      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-(--radius-lg) bg-(--color-success) px-6 py-3 text-sm font-medium text-white shadow-lg"
        >
          Crise enregistrée
        </div>
      )}
    </main>
  )
}
