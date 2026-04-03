import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useAuthStore } from '@/stores/authStore'
import { pickVaultFolder, ensureVaultStructure, saveVaultHandle } from '@/lib/vault/handle'

export function VaultSelectionPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const markVaultReady = useOnboardingStore((s) => s.markVaultReady)
  const user = useAuthStore((s) => s.user)
  const anonymousId = useAuthStore((s) => s.anonymousId)

  const userId = user?.id ?? anonymousId ?? 'default'

  const handlePickFolder = async () => {
    setError(null)
    setLoading(true)
    try {
      const handle = await pickVaultFolder()
      await ensureVaultStructure(handle)
      await saveVaultHandle(userId, handle)
      markVaultReady()
      navigate('/onboarding/medical-profile', { replace: true })
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // User cancelled picker
        setLoading(false)
        return
      }
      setError("Impossible d'accéder au dossier sélectionné. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base) px-4">
      <div className="w-full max-w-[480px] rounded-(--radius-xl) bg-(--color-bg-elevated) p-8 shadow-lg">
        <h1 className="text-xl font-bold text-(--color-text-primary)">
          Choisissez votre dossier vault
        </h1>
        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Vos données de santé sont stockées localement sur votre ordinateur dans un dossier que
          vous choisissez. Aucune donnée médicale ne transite par nos serveurs.
        </p>

        <div className="mt-6">
          <button
            type="button"
            onClick={handlePickFolder}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-(--radius-md) bg-(--color-brand) px-4 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover) disabled:opacity-50"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M3 5a2 2 0 012-2h3.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H15a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
            </svg>
            {loading ? 'Chargement...' : 'Choisir un dossier'}
          </button>

          {error && <p className="mt-3 text-sm text-(--color-danger)">{error}</p>}

          <div className="mt-4 rounded-(--radius-md) bg-(--color-bg-subtle) px-4 py-3">
            <p className="text-xs text-(--color-text-muted)">
              L&apos;application créera automatiquement la structure{' '}
              <code className="font-mono">Migraine AI/</code> dans le dossier choisi si celui-ci est
              vide, ou reconnaîtra un vault existant.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
