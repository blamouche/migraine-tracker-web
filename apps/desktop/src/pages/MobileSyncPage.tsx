import { useNavigate } from 'react-router'
import { useMobileSyncStore } from '@/stores/mobileSyncStore'

export function MobileSyncPage() {
  const navigate = useNavigate()
  const { config, qrPayload, error, enableMobileSync, disableMobileSync, regenerateKey, clearError } = useMobileSyncStore()

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Saisie mobile</h1>
          <button type="button" onClick={() => navigate('/')} className="text-sm text-(--color-text-muted) hover:text-(--color-text-primary)">Retour</button>
        </div>

        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Enregistrez une crise depuis votre téléphone en moins de 15 secondes. Les données sont chiffrées de bout en bout (AES-256-GCM).
        </p>

        {error && <div className="mt-4 rounded-(--radius-md) bg-(--color-danger-light) px-4 py-3 text-sm text-(--color-danger)">{error} <button type="button" onClick={clearError} className="ml-2 underline">Fermer</button></div>}

        {!config.enabled ? (
          <section className="mt-6 rounded-(--radius-xl) bg-(--color-bg-elevated) p-6 text-center">
            <p className="text-sm text-(--color-text-secondary)">
              Activez la saisie mobile pour lier votre téléphone à votre vault de façon sécurisée.
            </p>
            <button type="button" onClick={enableMobileSync} className="mt-4 rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-semibold text-(--color-text-inverse) hover:bg-(--color-brand-hover)">
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
              {qrPayload && (
                <div className="mt-4 flex justify-center">
                  <div className="rounded-(--radius-lg) border-2 border-dashed border-(--color-border) p-8 text-center">
                    <p className="text-xs text-(--color-text-muted) mb-2">QR Code</p>
                    <div className="h-48 w-48 bg-(--color-bg-subtle) rounded-(--radius-md) flex items-center justify-center">
                      <p className="text-xs text-(--color-text-muted) px-4 text-center">
                        Intégration QR code en attente de la bibliothèque qrcode.react
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-(--color-text-muted)">
                      Accédez à m.migraine-ai.app puis scannez
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Status */}
            <section className="mt-6 rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
              <h2 className="text-sm font-semibold">Statut</h2>
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-(--color-text-muted)">Clé créée le</p>
                  <p>{config.createdAt ? new Date(config.createdAt).toLocaleDateString('fr-FR') : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-(--color-text-muted)">Dernière synchronisation</p>
                  <p>{config.lastSyncAt ? new Date(config.lastSyncAt).toLocaleDateString('fr-FR') : 'Jamais'}</p>
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
                <button type="button" onClick={regenerateKey} className="rounded-(--radius-md) border border-(--color-warning) px-4 py-2 text-sm text-(--color-warning)">
                  Régénérer la clé
                </button>
                <button type="button" onClick={disableMobileSync} className="rounded-(--radius-md) border border-(--color-danger) px-4 py-2 text-sm text-(--color-danger)">
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
