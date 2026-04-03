import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { QRCodeSVG } from 'qrcode.react'
import { useMobileSyncStore } from '@/stores/mobileSyncStore'

const MOBILE_URL = import.meta.env.DEV ? 'http://localhost:5174' : 'https://migraine-ai-mobile.netlify.app'

export function MobileSyncPage() {
  const navigate = useNavigate()
  const {
    config,
    qrPayload,
    pendingCount,
    error,
    enableMobileSync,
    disableMobileSync,
    regenerateKey,
    syncNow,
    refreshPendingCount,
    clearError,
  } = useMobileSyncStore()

  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ synced: number; errors: number } | null>(null)

  useEffect(() => {
    if (config.enabled) {
      refreshPendingCount()
    }
  }, [config.enabled, refreshPendingCount])

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    const result = await syncNow()
    setSyncResult(result)
    setSyncing(false)
  }

  // Build the full QR URL: <mobile-url>/#payload=<base64>
  const qrUrl = qrPayload ? `${MOBILE_URL}/#payload=${qrPayload}` : null

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Saisie mobile</h1>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-(--color-text-muted) hover:text-(--color-text-primary)"
          >
            Retour
          </button>
        </div>

        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Enregistrez une crise depuis votre téléphone en moins de 15 secondes. Les données sont
          chiffrées de bout en bout (AES-256-GCM).
        </p>

        {error && (
          <div className="mt-4 rounded-(--radius-md) bg-(--color-danger-light) px-4 py-3 text-sm text-(--color-danger)">
            {error}{' '}
            <button type="button" onClick={clearError} className="ml-2 underline">
              Fermer
            </button>
          </div>
        )}

        {!config.enabled ? (
          <section className="mt-6 rounded-(--radius-xl) bg-(--color-bg-elevated) p-6 text-center">
            <p className="text-sm text-(--color-text-secondary)">
              Activez la saisie mobile pour lier votre téléphone à votre vault de façon sécurisée.
            </p>
            <button
              type="button"
              onClick={enableMobileSync}
              className="mt-4 rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-semibold text-(--color-text-inverse) hover:bg-(--color-brand-hover)"
            >
              Activer la saisie mobile
            </button>
          </section>
        ) : (
          <>
            {/* QR Code */}
            <section className="mt-6 rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
              <h2 className="text-sm font-semibold">Associer un appareil</h2>
              <p className="mt-2 text-sm text-(--color-text-secondary)">
                Scannez ce QR code depuis votre téléphone pour associer l'appareil.
              </p>
              {qrUrl && (
                <div className="mt-4 flex justify-center">
                  <div className="rounded-(--radius-lg) bg-white p-4">
                    <QRCodeSVG value={qrUrl} size={200} level="M" />
                  </div>
                </div>
              )}
              <p className="mt-3 text-center text-xs text-(--color-text-muted)">
                Ou accédez à{' '}
                <span className="font-mono text-(--color-brand)">migraine-ai-mobile.netlify.app</span>{' '}
                puis scannez
              </p>
              {import.meta.env.DEV && qrUrl && (
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(qrUrl)}
                    className="rounded-(--radius-md) border border-(--color-border) px-3 py-1.5 text-xs text-(--color-text-muted) hover:text-(--color-text-primary)"
                  >
                    Copier le lien (dev)
                  </button>
                  <p className="mt-1 text-xs text-(--color-text-muted) font-mono break-all max-w-xs mx-auto">
                    {qrUrl}
                  </p>
                </div>
              )}
            </section>

            {/* Pending entries & sync */}
            <section className="mt-6 rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
              <h2 className="text-sm font-semibold">Synchronisation</h2>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm">
                    {pendingCount > 0 ? (
                      <>
                        <span className="font-semibold text-(--color-warning)">
                          {pendingCount}
                        </span>{' '}
                        saisie{pendingCount > 1 ? 's' : ''} en attente
                      </>
                    ) : (
                      <span className="text-(--color-text-secondary)">
                        Aucune saisie en attente
                      </span>
                    )}
                  </p>
                  {syncResult && (
                    <p className="mt-1 text-xs text-(--color-text-muted)">
                      {syncResult.synced} synchronisée{syncResult.synced > 1 ? 's' : ''}
                      {syncResult.errors > 0 && `, ${syncResult.errors} erreur${syncResult.errors > 1 ? 's' : ''}`}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSync}
                  disabled={syncing || pendingCount === 0}
                  className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm font-semibold text-(--color-text-inverse) hover:bg-(--color-brand-hover) disabled:opacity-50"
                >
                  {syncing ? 'Synchronisation...' : 'Synchroniser maintenant'}
                </button>
              </div>
            </section>

            {/* Status */}
            <section className="mt-6 rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
              <h2 className="text-sm font-semibold">Statut</h2>
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-(--color-text-muted)">Clé créée le</p>
                  <p>
                    {config.createdAt
                      ? new Date(config.createdAt).toLocaleDateString('fr-FR')
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-(--color-text-muted)">Dernière synchronisation</p>
                  <p>
                    {config.lastSyncAt
                      ? new Date(config.lastSyncAt).toLocaleDateString('fr-FR')
                      : 'Jamais'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-(--color-text-muted)">Appareils liés</p>
                  <p>{config.deviceCount}</p>
                </div>
              </div>
            </section>

            {/* Security */}
            <section className="mt-6 rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
              <h2 className="text-sm font-semibold">Sécurité</h2>
              <p className="mt-2 text-sm text-(--color-text-secondary)">
                Si vous perdez votre téléphone, régénérez la clé pour révoquer l'accès mobile.
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={regenerateKey}
                  className="rounded-(--radius-md) border border-(--color-warning) px-4 py-2 text-sm text-(--color-warning)"
                >
                  Régénérer la clé
                </button>
                <button
                  type="button"
                  onClick={disableMobileSync}
                  className="rounded-(--radius-md) border border-(--color-danger) px-4 py-2 text-sm text-(--color-danger)"
                >
                  Désactiver la saisie mobile
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
