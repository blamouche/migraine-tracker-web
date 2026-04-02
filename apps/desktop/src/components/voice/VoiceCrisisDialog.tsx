import { useState, useEffect, useCallback } from 'react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useCrisisStore } from '@/stores/crisisStore'
import { DEFAULT_TREATMENTS } from '@/types/crisis'

interface VoiceCrisisDialogProps {
  onClose: () => void
  onComplete: () => void
  silentMode?: boolean
}

type Step = 'intensity' | 'treatments' | 'confirm'

const QUESTIONS: Record<Step, string> = {
  intensity: 'Quel est votre niveau de douleur, de 1 à 10 ?',
  treatments: 'Avez-vous pris un traitement ? Si oui, lequel ?',
  confirm: 'Voici le résumé de votre crise. Confirmez-vous l\'enregistrement ?',
}

export function VoiceCrisisDialog({ onClose, onComplete, silentMode = false }: VoiceCrisisDialogProps) {
  const { createQuickCrisis } = useCrisisStore()
  const [step, setStep] = useState<Step>('intensity')
  const [intensity, setIntensity] = useState(5)
  const [treatments, setTreatments] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleResult = useCallback((transcript: string) => {
    const lower = transcript.toLowerCase()

    if (step === 'intensity') {
      const num = parseInt(transcript.replace(/\D/g, ''))
      if (num >= 1 && num <= 10) {
        setIntensity(num)
        setStep('treatments')
      }
    } else if (step === 'treatments') {
      if (lower.includes('non') || lower.includes('aucun') || lower.includes('pas')) {
        setStep('confirm')
      } else {
        const found = DEFAULT_TREATMENTS.filter((t) =>
          lower.includes(t.toLowerCase()),
        )
        if (found.length > 0) {
          setTreatments(found)
        }
        setStep('confirm')
      }
    } else if (step === 'confirm') {
      if (lower.includes('oui') || lower.includes('confirme') || lower.includes('ok')) {
        handleSubmit()
      } else if (lower.includes('non') || lower.includes('annule')) {
        onClose()
      }
    }
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  const { isListening, transcript, error, isSupported, start, stop, speak } = useSpeechRecognition({
    onResult: handleResult,
  })

  useEffect(() => {
    if (!silentMode) {
      speak(QUESTIONS[step])
    }
  }, [step, silentMode, speak])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const now = new Date()
      const startTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      await createQuickCrisis({ startTime, intensity, treatments })
      if (!silentMode) speak('Crise enregistrée avec succès.')
      onComplete()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isSupported) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="mx-4 max-w-md rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
          <p className="text-sm text-(--color-text-secondary)">
            La reconnaissance vocale n'est pas supportée par ce navigateur. Utilisez Chrome pour cette fonctionnalité.
          </p>
          <button type="button" onClick={onClose} className="mt-4 w-full rounded-(--radius-md) bg-(--color-brand) py-2 text-sm text-(--color-text-inverse)">
            Fermer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Saisie vocale</h2>
          <button type="button" onClick={onClose} className="text-(--color-text-muted) hover:text-(--color-text-primary)">✕</button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-(--color-text-secondary)">{QUESTIONS[step]}</p>

          {step === 'confirm' && (
            <div className="mt-4 rounded-(--radius-lg) bg-(--color-bg-subtle) p-4 text-left">
              <p className="text-sm"><span className="font-medium">Intensité :</span> {intensity}/10</p>
              <p className="text-sm"><span className="font-medium">Traitements :</span> {treatments.length > 0 ? treatments.join(', ') : 'Aucun'}</p>
            </div>
          )}

          {transcript && (
            <p className="mt-3 text-sm text-(--color-brand)">« {transcript} »</p>
          )}

          {error && (
            <p className="mt-3 text-sm text-(--color-danger)">{error}</p>
          )}

          {/* Voice button */}
          <button
            type="button"
            onClick={isListening ? stop : start}
            className={`mt-6 flex mx-auto h-16 w-16 items-center justify-center rounded-full text-white transition-all ${
              isListening
                ? 'bg-(--color-danger) animate-pulse'
                : 'bg-(--color-brand) hover:bg-(--color-brand-hover)'
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>
          <p className="mt-2 text-xs text-(--color-text-muted)">
            {isListening ? 'Écoute en cours…' : 'Appuyez pour parler'}
          </p>
        </div>

        {/* Manual buttons for confirm step */}
        {step === 'confirm' && (
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 rounded-(--radius-md) bg-(--color-brand) py-3 text-sm font-semibold text-(--color-text-inverse) disabled:opacity-50"
            >
              {isSubmitting ? 'Enregistrement…' : 'Confirmer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-(--radius-md) border border-(--color-border) px-6 py-3 text-sm text-(--color-text-secondary)"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
