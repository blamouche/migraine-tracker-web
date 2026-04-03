import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import './styles/globals.css'

import { StrictMode, useState, useEffect, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { getPairing, parsePairingPayload, savePairing, clearPairing } from './lib/pairing'
import { configureSupabase } from './lib/supabase'
import { submitEntry, flushQueue } from './lib/transit'
import { pendingCount } from './lib/offlineQueue'

// Mobile crisis entry app — m.migraine-ai.app
// Minimal interface: crisis, daily pain, mental load in < 15 seconds

type Screen = 'home' | 'crisis' | 'pain' | 'charge'
type ToastType = 'success' | 'error' | 'pending'

function nowTime(): string {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

const TREATMENTS = ['Paracétamol', 'Ibuprofène', 'Triptan', 'Aspirine', 'Repos', 'Glaçage']

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [paired, setPaired] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null)
  const [sending, setSending] = useState(false)
  const [offline, setOffline] = useState(!navigator.onLine)
  const [queueCount, setQueueCount] = useState(0)

  // Crisis state
  const [startTime, setStartTime] = useState(nowTime)
  const [intensity, setIntensity] = useState(5)
  const [treatments, setTreatments] = useState<string[]>([])

  // Pain state
  const [painLevel, setPainLevel] = useState(3)

  // Charge state
  const [chargeLevel, setChargeLevel] = useState(5)

  // Check pairing on mount + handle URL-based pairing
  useEffect(() => {
    const existing = getPairing()
    if (existing) {
      configureSupabase(existing.endpoint, existing.anonKey ?? '')
      setPaired(true)
      return
    }

    // Check URL hash for QR payload (e.g. m.migraine-ai.app/#payload=...)
    const hash = window.location.hash
    if (hash.includes('payload=')) {
      try {
        const encoded = hash.split('payload=')[1]!
        const json = decodeURIComponent(atob(encoded))
        const data = parsePairingPayload(json)
        const pairing = savePairing(data)
        if (pairing.endpoint) {
          configureSupabase(pairing.endpoint, data.anonKey ?? '')
        }
        setPaired(true)
        window.location.hash = ''
      } catch {
        // Invalid payload — show pairing screen
      }
    }
  }, [])

  // Online/offline listeners + queue flush
  useEffect(() => {
    const goOnline = () => {
      setOffline(false)
      flushQueue().then((flushed) => {
        if (flushed > 0) {
          pendingCount().then(setQueueCount)
        }
      })
    }
    const goOffline = () => setOffline(true)

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // Refresh pending count
  useEffect(() => {
    pendingCount().then(setQueueCount)
  }, [screen])

  const showToast = useCallback((msg: string, type: ToastType = 'success') => {
    setToast({ msg, type })
    setTimeout(() => {
      setToast(null)
      if (type === 'success') setScreen('home')
    }, 2000)
  }, [])

  const handleCrisisSubmit = async () => {
    setSending(true)
    try {
      await submitEntry('crise', {
        date: today(),
        heure_debut: startTime,
        intensite: intensity,
        traitements: treatments,
        source: 'mobile',
      })
      const isOffline = !navigator.onLine
      showToast(
        isOffline
          ? 'Crise sauvegardée. Envoi dès le retour de connexion.'
          : 'Crise enregistrée. Elle sera intégrée à votre vault à la prochaine ouverture.',
        isOffline ? 'pending' : 'success',
      )
    } catch {
      showToast('Erreur lors de l\'enregistrement.', 'error')
    } finally {
      setSending(false)
    }
  }

  const handlePainSubmit = async () => {
    setSending(true)
    try {
      await submitEntry('daily_pain', {
        date: today(),
        niveau: painLevel,
        source: 'mobile',
      })
      const isOffline = !navigator.onLine
      showToast(
        isOffline ? 'Douleur sauvegardée. Envoi dès le retour de connexion.' : 'Douleur enregistrée.',
        isOffline ? 'pending' : 'success',
      )
    } catch {
      showToast('Erreur lors de l\'enregistrement.', 'error')
    } finally {
      setSending(false)
    }
  }

  const handleChargeSubmit = async () => {
    setSending(true)
    try {
      await submitEntry('charge_mentale', {
        date: today(),
        niveau: chargeLevel,
        source: 'mobile',
      })
      const isOffline = !navigator.onLine
      showToast(
        isOffline ? 'Charge mentale sauvegardée. Envoi dès le retour de connexion.' : 'Charge mentale enregistrée.',
        isOffline ? 'pending' : 'success',
      )
    } catch {
      showToast('Erreur lors de l\'enregistrement.', 'error')
    } finally {
      setSending(false)
    }
  }

  const toggleTreatment = (t: string) => {
    setTreatments((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  const handleUnpair = () => {
    clearPairing()
    setPaired(false)
  }

  // Toast bar
  const toastBg =
    toast?.type === 'error'
      ? 'bg-red-600'
      : toast?.type === 'pending'
        ? 'bg-amber-600'
        : 'bg-green-600'

  const toastEl = toast && (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 rounded-xl ${toastBg} px-6 py-3 text-sm font-medium shadow-lg z-50`}>
      {toast.msg}
    </div>
  )

  // ─── Pairing screen ──────────────────────────────
  if (!paired) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
        <div className="text-center max-w-xs">
          <h1 className="text-xl font-bold">Migraine AI Mobile</h1>
          <p className="mt-4 text-sm text-gray-400">
            Scannez le QR code depuis votre application desktop pour associer cet appareil.
          </p>
          <p className="mt-6 text-xs text-gray-500">
            En attente du QR code...
          </p>
        </div>
      </main>
    )
  }

  // ─── Crisis screen ────────────────────────────────
  if (screen === 'crisis') {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">Mode Crise</h1>
            <button type="button" onClick={() => setScreen('home')} className="text-sm text-gray-400">
              ✕
            </button>
          </div>
          <div className="mt-6">
            <label htmlFor="m-time" className="text-xs text-gray-400">
              Heure de début
            </label>
            <input
              id="m-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 text-lg"
            />
          </div>
          <div className="mt-4">
            <label htmlFor="m-intensity" className="text-xs text-gray-400">
              Intensité
            </label>
            <input
              id="m-intensity"
              type="range"
              min={1}
              max={10}
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="mt-2 w-full"
            />
            <p className="text-center text-2xl font-bold mt-1">{intensity}/10</p>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-2">Traitement pris</p>
            <div className="flex flex-wrap gap-2">
              {TREATMENTS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTreatment(t)}
                  className={`rounded-full px-3 py-2 text-sm min-h-[48px] ${treatments.includes(t) ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCrisisSubmit}
          disabled={sending}
          className="w-full rounded-xl bg-red-600 py-4 text-base font-semibold min-h-[48px] disabled:opacity-50"
        >
          {sending ? 'Envoi...' : 'Enregistrer la crise'}
        </button>
        {toastEl}
      </main>
    )
  }

  // ─── Pain screen ──────────────────────────────────
  if (screen === 'pain') {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">Douleur du jour</h1>
            <button type="button" onClick={() => setScreen('home')} className="text-sm text-gray-400">
              ✕
            </button>
          </div>
          <div className="mt-8">
            <input
              type="range"
              min={0}
              max={10}
              value={painLevel}
              onChange={(e) => setPainLevel(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-center text-4xl font-bold mt-4">{painLevel}/10</p>
            <p className="text-center text-sm text-gray-400 mt-1">{today()}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handlePainSubmit}
          disabled={sending}
          className="w-full rounded-xl bg-indigo-600 py-4 text-base font-semibold min-h-[48px] disabled:opacity-50"
        >
          {sending ? 'Envoi...' : 'Enregistrer'}
        </button>
        {toastEl}
      </main>
    )
  }

  // ─── Charge mentale screen ────────────────────────
  if (screen === 'charge') {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">Charge mentale</h1>
            <button type="button" onClick={() => setScreen('home')} className="text-sm text-gray-400">
              ✕
            </button>
          </div>
          <div className="mt-8">
            <input
              type="range"
              min={1}
              max={10}
              value={chargeLevel}
              onChange={(e) => setChargeLevel(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-center text-4xl font-bold mt-4">{chargeLevel}/10</p>
            <p className="text-center text-sm text-gray-400 mt-1">{today()}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleChargeSubmit}
          disabled={sending}
          className="w-full rounded-xl bg-indigo-600 py-4 text-base font-semibold min-h-[48px] disabled:opacity-50"
        >
          {sending ? 'Envoi...' : 'Enregistrer'}
        </button>
        {toastEl}
      </main>
    )
  }

  // ─── Home screen ──────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-950 text-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Migraine AI</h1>
          <p className="mt-1 text-sm text-gray-400">Saisie rapide depuis votre téléphone</p>
        </div>
        {offline && (
          <span className="rounded-full bg-amber-600/20 px-3 py-1 text-xs text-amber-400">
            Hors-ligne
          </span>
        )}
      </div>

      {queueCount > 0 && (
        <div className="mt-3 rounded-xl bg-amber-900/30 px-4 py-2 text-xs text-amber-300">
          {queueCount} saisie{queueCount > 1 ? 's' : ''} en attente de synchronisation
        </div>
      )}

      <div className="mt-6 space-y-4">
        <button
          type="button"
          onClick={() => {
            setStartTime(nowTime())
            setIntensity(5)
            setTreatments([])
            setScreen('crisis')
          }}
          className="w-full rounded-xl bg-red-600 py-4 text-base font-semibold min-h-[48px]"
        >
          Mode Crise
        </button>
        <button
          type="button"
          onClick={() => {
            setPainLevel(3)
            setScreen('pain')
          }}
          className="w-full rounded-xl bg-gray-800 py-4 text-base font-semibold min-h-[48px]"
        >
          Douleur du jour
        </button>
        <button
          type="button"
          onClick={() => {
            setChargeLevel(5)
            setScreen('charge')
          }}
          className="w-full rounded-xl bg-gray-800 py-4 text-base font-semibold min-h-[48px]"
        >
          Charge mentale
        </button>
      </div>

      <button
        type="button"
        onClick={handleUnpair}
        className="mt-8 text-xs text-gray-600 underline"
      >
        Dissocier cet appareil
      </button>

      {toastEl}
    </main>
  )
}

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
