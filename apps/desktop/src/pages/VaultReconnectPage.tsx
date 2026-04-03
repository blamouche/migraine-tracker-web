import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/stores/authStore'
import { pickVaultFolder, ensureVaultStructure, saveVaultHandle } from '@/lib/vault/handle'
import { supabase } from '@/lib/supabase'

export function VaultReconnectPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
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
      // E38: Persist vault folder name to Supabase
      if (user) {
        try {
          await supabase.from('user_usage').upsert(
            { user_id: user.id, vault_folder_name: handle.name },
            { onConflict: 'user_id' },
          )
        } catch {
          // Non-blocking
        }
      }
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
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
          Vault inaccessible
        </h1>
        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Votre dossier vault n&apos;est plus accessible depuis ce navigateur.
          Veuillez re-sélectionner le dossier contenant vos données Migraine AI
          pour retrouver vos enregistrements.
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
            {loading ? 'Chargement...' : 'Re-sélectionner le dossier vault'}
          </button>

          {error && <p className="mt-3 text-sm text-(--color-danger)">{error}</p>}

          <div className="mt-4 rounded-(--radius-md) bg-(--color-bg-subtle) px-4 py-3">
            <p className="text-xs text-(--color-text-muted)">
              Sélectionnez le même dossier que celui utilisé lors de la configuration initiale.
              L&apos;application reconnaîtra automatiquement votre vault existant.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
