import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useEnvironnementStore } from '@/stores/environnementStore'
import type { LocationConfig } from '@/types/environnement'
import { LUNAR_PHASE_LABELS } from '@/types/environnement'

export function EnvironnementSettingsPage() {
  const navigate = useNavigate()
  const { locationPrefs, entries, setDefaultLocation, addFavorite, removeFavorite, requestGeolocation, fetchTodayWeather, isLoading, error } = useEnvironnementStore()

  const [addressInput, setAddressInput] = useState('')
  const [latInput, setLatInput] = useState('')
  const [lonInput, setLonInput] = useState('')
  const [favoriteLabel, setFavoriteLabel] = useState('')
  const [fetchStatus, setFetchStatus] = useState<string | null>(null)

  const handleSetManual = () => {
    const lat = parseFloat(latInput)
    const lon = parseFloat(lonInput)
    if (isNaN(lat) || isNaN(lon)) return
    const loc: LocationConfig = { type: 'address', label: addressInput || 'Localisation manuelle', latitude: lat, longitude: lon }
    setDefaultLocation(loc)
  }

  const handleGeolocation = async () => {
    const loc = await requestGeolocation()
    if (loc) {
      setDefaultLocation(loc)
      setLatInput(loc.latitude.toFixed(4))
      setLonInput(loc.longitude.toFixed(4))
    }
  }

  const handleAddFavorite = () => {
    if (!favoriteLabel.trim() || !locationPrefs.defaultLocation) return
    addFavorite({ ...locationPrefs.defaultLocation, label: favoriteLabel.trim(), type: 'favorite' })
    setFavoriteLabel('')
  }

  const handleFetchToday = async () => {
    setFetchStatus('Récupération en cours…')
    const result = await fetchTodayWeather()
    setFetchStatus(result ? 'Données récupérées avec succès' : 'Échec de la récupération')
  }

  const todayEntry = entries[0]

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Données environnementales</h1>
          <button type="button" onClick={() => navigate('/')} className="text-sm text-(--color-text-muted) hover:text-(--color-text-primary)">Retour</button>
        </div>

        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Configurez votre localisation pour récupérer automatiquement les données météo et lunaires via Open-Meteo (gratuit, sans clé API).
        </p>

        {/* Current location */}
        <section className="mt-6 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
          <h2 className="text-sm font-semibold">Localisation par défaut</h2>
          {locationPrefs.defaultLocation ? (
            <p className="mt-2 text-sm text-(--color-text-secondary)">
              {locationPrefs.defaultLocation.label} ({locationPrefs.defaultLocation.latitude.toFixed(4)}, {locationPrefs.defaultLocation.longitude.toFixed(4)})
            </p>
          ) : (
            <p className="mt-2 text-sm text-(--color-warning)">Aucune localisation configurée</p>
          )}

          <div className="mt-4 space-y-3">
            <button type="button" onClick={handleGeolocation} className="w-full rounded-(--radius-md) border border-(--color-brand) py-2 text-sm text-(--color-brand) hover:bg-(--color-brand-light)">
              Utiliser ma position actuelle
            </button>

            <div className="grid grid-cols-3 gap-2">
              <input type="text" value={addressInput} onChange={(e) => setAddressInput(e.target.value)} placeholder="Libellé" className="rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-3 py-2 text-sm" />
              <input type="text" value={latInput} onChange={(e) => setLatInput(e.target.value)} placeholder="Latitude" className="rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-3 py-2 text-sm" />
              <input type="text" value={lonInput} onChange={(e) => setLonInput(e.target.value)} placeholder="Longitude" className="rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-3 py-2 text-sm" />
            </div>
            <button type="button" onClick={handleSetManual} className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm text-(--color-text-inverse)">Définir comme localisation par défaut</button>
          </div>
        </section>

        {/* Favorites */}
        <section className="mt-6 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
          <h2 className="text-sm font-semibold">Lieux favoris</h2>
          {locationPrefs.favorites.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {locationPrefs.favorites.map((fav) => (
                <li key={fav.label} className="flex items-center justify-between rounded-(--radius-sm) bg-(--color-bg-subtle) px-3 py-2 text-sm">
                  <span>{fav.label} ({fav.latitude.toFixed(2)}, {fav.longitude.toFixed(2)})</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setDefaultLocation(fav)} className="text-xs text-(--color-brand)">Utiliser</button>
                    <button type="button" onClick={() => removeFavorite(fav.label)} className="text-xs text-(--color-danger)">x</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-(--color-text-muted)">Aucun lieu favori</p>
          )}
          {locationPrefs.defaultLocation && (
            <div className="mt-2 flex gap-2">
              <input type="text" value={favoriteLabel} onChange={(e) => setFavoriteLabel(e.target.value)} placeholder="Nom du lieu (ex: Domicile)" className="flex-1 rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-3 py-2 text-sm" />
              <button type="button" onClick={handleAddFavorite} className="rounded-(--radius-md) bg-(--color-brand) px-3 py-2 text-sm text-(--color-text-inverse)">+</button>
            </div>
          )}
        </section>

        {/* Fetch weather */}
        <section className="mt-6 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
          <h2 className="text-sm font-semibold">Météo du jour</h2>
          <button type="button" onClick={handleFetchToday} disabled={isLoading || !locationPrefs.defaultLocation} className="mt-3 w-full rounded-(--radius-md) bg-(--color-brand) py-2 text-sm text-(--color-text-inverse) disabled:opacity-50">
            {isLoading ? 'Récupération…' : 'Récupérer la météo du jour'}
          </button>
          {fetchStatus && <p className="mt-2 text-xs text-(--color-text-muted)">{fetchStatus}</p>}
          {error && <p className="mt-2 text-xs text-(--color-danger)">{error}</p>}

          {todayEntry && (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {todayEntry.temperatureMax != null && <div><p className="text-xs text-(--color-text-muted)">Temp. max</p><p>{todayEntry.temperatureMax}°C</p></div>}
              {todayEntry.temperatureMin != null && <div><p className="text-xs text-(--color-text-muted)">Temp. min</p><p>{todayEntry.temperatureMin}°C</p></div>}
              {todayEntry.vitesseVent != null && <div><p className="text-xs text-(--color-text-muted)">Vent max</p><p>{todayEntry.vitesseVent} km/h</p></div>}
              {todayEntry.precipitations != null && <div><p className="text-xs text-(--color-text-muted)">Précipitations</p><p>{todayEntry.precipitations} mm</p></div>}
              {todayEntry.uvIndex != null && <div><p className="text-xs text-(--color-text-muted)">UV</p><p>{todayEntry.uvIndex}</p></div>}
              <div>
                <p className="text-xs text-(--color-text-muted)">Phase lunaire</p>
                <p>{LUNAR_PHASE_LABELS[todayEntry.phaseLunaire]} ({todayEntry.illuminationLunaire}%)</p>
              </div>
            </div>
          )}
          <p className="mt-3 text-xs text-(--color-text-muted)">
            Phase lunaire : donnée exploratoire, non validée scientifiquement.
          </p>
        </section>
      </div>
    </main>
  )
}
