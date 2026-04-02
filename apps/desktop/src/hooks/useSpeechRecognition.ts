import { useState, useCallback, useRef, useEffect } from 'react'

interface SpeechRecognitionOptions {
  lang?: string
  continuous?: boolean
  onResult?: (transcript: string) => void
  onError?: (error: string) => void
}

interface SpeechRecognitionState {
  isListening: boolean
  transcript: string
  error: string | null
  isSupported: boolean
  start: () => void
  stop: () => void
  speak: (text: string) => void
}

// Extend Window for Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message?: string
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}): SpeechRecognitionState {
  const { lang = 'fr-FR', continuous = false, onResult, onError } = options
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  const isSupported = Boolean(SpeechRecognitionAPI)

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const start = useCallback(() => {
    if (!isSupported) {
      setError('La reconnaissance vocale n\'est pas supportée par ce navigateur')
      onError?.('unsupported')
      return
    }

    setError(null)
    setTranscript('')

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = lang
    recognition.continuous = continuous
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex]
      if (result?.isFinal) {
        const text = result[0]?.transcript?.trim() ?? ''
        setTranscript(text)
        onResult?.(text)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const msg = event.error === 'no-speech'
        ? 'Aucune voix détectée'
        : event.error === 'not-allowed'
        ? 'Accès au microphone refusé'
        : `Erreur : ${event.error}`
      setError(msg)
      setIsListening(false)
      onError?.(event.error)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported, lang, continuous, onResult, onError, SpeechRecognitionAPI])

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [])

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }, [lang])

  return {
    isListening,
    transcript,
    error,
    isSupported,
    start,
    stop,
    speak,
  }
}
