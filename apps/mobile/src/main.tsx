import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import './styles/globals.css'

import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'

// Mobile crisis entry app — m.migraine-ai.app
// Minimal interface: crisis, daily pain, mental load in < 15 seconds

type Screen = 'home' | 'crisis' | 'pain' | 'charge'

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
  const [isPaired, setIsPaired] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Crisis state
  const [startTime, setStartTime] = useState(nowTime)
  const [intensity, setIntensity] = useState(5)
  const [treatments, setTreatments] = useState<string[]>([])

  // Pain state
  const [painLevel, setPainLevel] = useState(3)

  // Charge state
  const [chargeLevel, setChargeLevel] = useState(5)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => { setToast(null); setScreen('home') }, 2000)
  }

  const handlePair = () => {
    // Placeholder: in production, this would scan QR and store the encryption key
    setIsPaired(true)
  }

  const handleCrisisSubmit = async () => {
    // Placeholder: encrypt with AES-256-GCM and send to Supabase mobile_transit
    showToast('Crise enregistrée. Elle sera intégrée à votre vault à la prochaine ouverture.')
  }

  const handlePainSubmit = async () => {
    showToast('Douleur enregistrée.')
  }

  const handleChargeSubmit = async () => {
    showToast('Charge mentale enregistrée.')
  }

  const toggleTreatment = (t: string) => {
    setTreatments((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])
  }

  if (!isPaired) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold">Migraine AI Mobile</h1>
          <p className="mt-4 text-sm text-gray-400">
            Scannez le QR code depuis votre application desktop pour associer cet appareil.
          </p>
          <button type="button" onClick={handlePair} className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold">
            Simuler l'appairage
          </button>
        </div>
      </main>
    )
  }

  if (screen === 'crisis') {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">Mode Crise</h1>
            <button type="button" onClick={() => setScreen('home')} className="text-sm text-gray-400">✕</button>
          </div>
          <div className="mt-6">
            <label htmlFor="m-time" className="text-xs text-gray-400">Heure de début</label>
            <input id="m-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1 w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 text-lg" />
          </div>
          <div className="mt-4">
            <label htmlFor="m-intensity" className="text-xs text-gray-400">Intensité</label>
            <input id="m-intensity" type="range" min={1} max={10} value={intensity} onChange={(e) => setIntensity(parseInt(e.target.value))} className="mt-2 w-full" />
            <p className="text-center text-2xl font-bold mt-1">{intensity}/10</p>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-2">Traitement pris</p>
            <div className="flex flex-wrap gap-2">
              {TREATMENTS.map((t) => (
                <button key={t} type="button" onClick={() => toggleTreatment(t)} className={`rounded-full px-3 py-2 text-sm min-h-[48px] ${treatments.includes(t) ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300'}`}>{t}</button>
              ))}
            </div>
          </div>
        </div>
        <button type="button" onClick={handleCrisisSubmit} className="w-full rounded-xl bg-red-600 py-4 text-base font-semibold min-h-[48px]">Enregistrer la crise</button>
      </main>
    )
  }

  if (screen === 'pain') {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">Douleur du jour</h1>
            <button type="button" onClick={() => setScreen('home')} className="text-sm text-gray-400">✕</button>
          </div>
          <div className="mt-8">
            <input type="range" min={0} max={10} value={painLevel} onChange={(e) => setPainLevel(parseInt(e.target.value))} className="w-full" />
            <p className="text-center text-4xl font-bold mt-4">{painLevel}/10</p>
            <p className="text-center text-sm text-gray-400 mt-1">{today()}</p>
          </div>
        </div>
        <button type="button" onClick={handlePainSubmit} className="w-full rounded-xl bg-indigo-600 py-4 text-base font-semibold min-h-[48px]">Enregistrer</button>
      </main>
    )
  }

  if (screen === 'charge') {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">Charge mentale</h1>
            <button type="button" onClick={() => setScreen('home')} className="text-sm text-gray-400">✕</button>
          </div>
          <div className="mt-8">
            <input type="range" min={1} max={10} value={chargeLevel} onChange={(e) => setChargeLevel(parseInt(e.target.value))} className="w-full" />
            <p className="text-center text-4xl font-bold mt-4">{chargeLevel}/10</p>
            <p className="text-center text-sm text-gray-400 mt-1">{today()}</p>
          </div>
        </div>
        <button type="button" onClick={handleChargeSubmit} className="w-full rounded-xl bg-indigo-600 py-4 text-base font-semibold min-h-[48px]">Enregistrer</button>
      </main>
    )
  }

  // Home
  return (
    <main className="min-h-screen bg-gray-950 text-white p-4">
      <h1 className="text-xl font-bold">Migraine AI</h1>
      <p className="mt-1 text-sm text-gray-400">Saisie rapide depuis votre téléphone</p>
      <div className="mt-8 space-y-4">
        <button type="button" onClick={() => { setStartTime(nowTime()); setIntensity(5); setTreatments([]); setScreen('crisis') }} className="w-full rounded-xl bg-red-600 py-4 text-base font-semibold min-h-[48px]">
          Mode Crise
        </button>
        <button type="button" onClick={() => { setPainLevel(3); setScreen('pain') }} className="w-full rounded-xl bg-gray-800 py-4 text-base font-semibold min-h-[48px]">
          Douleur du jour
        </button>
        <button type="button" onClick={() => { setChargeLevel(5); setScreen('charge') }} className="w-full rounded-xl bg-gray-800 py-4 text-base font-semibold min-h-[48px]">
          Charge mentale
        </button>
      </div>
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-xl bg-green-600 px-6 py-3 text-sm font-medium shadow-lg">{toast}</div>
      )}
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
