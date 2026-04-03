import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'
import {
  pickVaultFolder,
  ensureVaultStructure,
  saveVaultHandle,
  checkVaultAccess,
} from '@/lib/vault/handle'
import { supabase } from '@/lib/supabase'
import { idbGet } from '@/lib/idb'
import { useCrisisStore } from '@/stores/crisisStore'
import { useFoodStore } from '@/stores/foodStore'
import { useTreatmentStore } from '@/stores/treatmentStore'
import { useCycleStore } from '@/stores/cycleStore'
import { useConsultationStore } from '@/stores/consultationStore'
import { useTransportStore } from '@/stores/transportStore'
import { useSportStore } from '@/stores/sportStore'
import { useChargeMentaleStore } from '@/stores/chargeMentaleStore'
import { useDailyPainStore } from '@/stores/dailyPainStore'
import { useEnvironnementStore } from '@/stores/environnementStore'
import { useModuleStore } from '@/stores/moduleStore'

type VaultDialogState = 'idle' | 'confirming-empty' | 'confirming-existing' | 'confirming-unknown'

export function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id ?? 'default'

  const [vaultName, setVaultName] = useState<string | null>(null)
  const [vaultAccessible, setVaultAccessible] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dialogState, setDialogState] = useState<VaultDialogState>('idle')
  const [pendingHandle, setPendingHandle] = useState<FileSystemDirectoryHandle | null>(null)
  const [reloading, setReloading] = useState(false)

  const reloadAllStores = useCallback(async () => {
    setReloading(true)
    try {
      // Clear all store data first so the load functions don't merge with stale data
      useCrisisStore.setState({ crises: [] })
      useFoodStore.setState({ entries: [] })
      useTreatmentStore.setState({ treatments: [] })
      useCycleStore.setState({ entries: [] })
      useConsultationStore.setState({ entries: [] })
      useTransportStore.setState({ entries: [] })
      useSportStore.setState({ entries: [] })
      useChargeMentaleStore.setState({ entries: [], evenements: [] })
      useDailyPainStore.setState({ entries: [] })

      // Reload from the new vault
      await Promise.all([
        useCrisisStore.getState().loadCrises(),
        useFoodStore.getState().loadEntries(),
        useTreatmentStore.getState().loadTreatments(),
        useCycleStore.getState().loadCycles(),
        useConsultationStore.getState().loadConsultations(),
        useTransportStore.getState().loadTransports(),
        useSportStore.getState().loadSports(),
        useChargeMentaleStore.getState().loadCharges(),
        useDailyPainStore.getState().loadPains(),
        useEnvironnementStore.getState().loadEnvironnements(),
        useModuleStore.getState().loadConfig(),
      ])
    } catch {
      // Individual stores handle their own errors
    } finally {
      setReloading(false)
    }
  }, [])

  // Load vault info on mount
  useEffect(() => {
    async function loadVaultInfo() {
      // Get folder name from IDB handle
      const handle = await idbGet<FileSystemDirectoryHandle>(`vault-handle:${userId}`)
      if (handle) {
        setVaultName(handle.name)
      }

      // Also fetch from Supabase for the stored name
      if (user) {
        try {
          const { data } = await supabase
            .from('user_usage')
            .select('vault_folder_name')
            .eq('user_id', user.id)
            .single()
          if (data?.vault_folder_name) {
            setVaultName(data.vault_folder_name)
          }
        } catch {
          // Use IDB name as fallback
        }
      }

      const accessible = await checkVaultAccess(userId)
      setVaultAccessible(accessible)
    }

    loadVaultInfo()
  }, [userId, user])

  const handlePickFolder = async () => {
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const handle = await pickVaultFolder()

      // Detect vault content
      const contentType = await detectVaultContent(handle)

      if (contentType === 'empty') {
        setPendingHandle(handle)
        setDialogState('confirming-empty')
        setLoading(false)
        return
      }

      if (contentType === 'valid-vault') {
        setPendingHandle(handle)
        setDialogState('confirming-existing')
        setLoading(false)
        return
      }

      // Unknown content
      setPendingHandle(handle)
      setDialogState('confirming-unknown')
      setLoading(false)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setLoading(false)
        return
      }
      setError("Impossible d'accéder au dossier sélectionné. Veuillez réessayer.")
      setLoading(false)
    }
  }

  const confirmVaultChange = async () => {
    if (!pendingHandle) return

    setDialogState('idle')
    setLoading(true)
    setError(null)

    try {
      await ensureVaultStructure(pendingHandle)
      await saveVaultHandle(userId, pendingHandle)

      const folderName = pendingHandle.name
      setVaultName(folderName)
      setVaultAccessible(true)

      // Save folder name to Supabase
      if (user) {
        try {
          await supabase.from('user_usage').upsert(
            { user_id: user.id, vault_folder_name: folderName },
            { onConflict: 'user_id' },
          )
        } catch {
          // Non-blocking
        }
      }

      // Reload all data from the new vault
      await reloadAllStores()

      setSuccess('Vault mis à jour avec succès')
      setPendingHandle(null)
      setTimeout(() => setSuccess(null), 4000)
    } catch {
      setError("Impossible de configurer le vault. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const cancelDialog = () => {
    setDialogState('idle')
    setPendingHandle(null)
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-bold text-(--color-text-primary)">Paramètres</h1>

      {/* Vault / Storage section */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-(--color-text-primary)">Stockage / Vault</h2>
        <p className="mt-1 text-sm text-(--color-text-secondary)">
          Vos données de santé sont stockées localement dans le dossier vault que vous avez choisi.
        </p>

        <div className="mt-4 rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg-elevated) p-5">
          {/* Current vault info */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-(--color-text-primary)">Dossier actuel</p>
              <div className="mt-1 flex items-center gap-2">
                <FolderIcon />
                <span className="truncate text-sm text-(--color-text-secondary) font-mono">
                  {vaultName ?? 'Non configuré'}
                </span>
              </div>
              {vaultAccessible !== null && (
                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      vaultAccessible ? 'bg-emerald-500' : 'bg-(--color-danger)'
                    }`}
                  />
                  <span className="text-xs text-(--color-text-muted)">
                    {vaultAccessible ? 'Accessible' : 'Inaccessible — veuillez re-sélectionner'}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handlePickFolder}
              disabled={loading}
              className="shrink-0 rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-4 py-2 text-sm font-medium text-(--color-text-primary) transition-colors hover:bg-(--color-bg-subtle) disabled:opacity-50"
            >
              {loading ? 'Chargement...' : 'Modifier'}
            </button>
          </div>

          {/* Success message */}
          {success && (
            <div className="mt-4 rounded-(--radius-md) bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
              {success}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 rounded-(--radius-md) bg-(--color-danger-light) px-4 py-3 text-sm text-(--color-danger)">
              {error}
            </div>
          )}

          {/* Info */}
          <div className="mt-4 rounded-(--radius-md) bg-(--color-bg-subtle) px-4 py-3">
            <p className="text-xs text-(--color-text-muted)">
              L&apos;ancien dossier vault n&apos;est ni supprimé ni modifié lorsque vous changez de
              dossier. Vous pouvez y revenir à tout moment.
            </p>
          </div>
        </div>
      </section>

      {/* Confirmation dialogs */}
      {dialogState !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-[420px] rounded-(--radius-xl) bg-(--color-bg-elevated) p-6 shadow-xl">
            {dialogState === 'confirming-empty' && (
              <>
                <h3 className="text-base font-semibold text-(--color-text-primary)">
                  Dossier vide
                </h3>
                <p className="mt-2 text-sm text-(--color-text-secondary)">
                  Ce dossier est vide. L&apos;application créera la structure de données.
                  Continuer ?
                </p>
              </>
            )}
            {dialogState === 'confirming-existing' && (
              <>
                <h3 className="text-base font-semibold text-(--color-text-primary)">
                  Données existantes détectées
                </h3>
                <p className="mt-2 text-sm text-(--color-text-secondary)">
                  Ce dossier contient un vault Migraine AI existant. L&apos;application utilisera
                  ces données.
                </p>
              </>
            )}
            {dialogState === 'confirming-unknown' && (
              <>
                <h3 className="text-base font-semibold text-(--color-text-primary)">
                  Fichiers non reconnus
                </h3>
                <p className="mt-2 text-sm text-(--color-text-secondary)">
                  Ce dossier contient des fichiers non reconnus. Voulez-vous tout de même
                  l&apos;utiliser comme vault ?
                </p>
              </>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelDialog}
                className="rounded-(--radius-md) border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-subtle)"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmVaultChange}
                className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover)"
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Helpers ───

async function detectVaultContent(
  handle: FileSystemDirectoryHandle,
): Promise<'empty' | 'valid-vault' | 'unknown'> {
  const entries: string[] = []
  // Cast needed: TS DOM lib doesn't include async iterator for FileSystemDirectoryHandle
  const iterable = handle as unknown as AsyncIterable<FileSystemHandle>
  for await (const entry of iterable) {
    entries.push(entry.name)
    if (entries.length > 20) break // enough to decide
  }

  if (entries.length === 0) return 'empty'
  if (entries.includes('Migraine AI')) return 'valid-vault'
  return 'unknown'
}

// ─── Icons ───

function FolderIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="shrink-0 text-(--color-text-muted)"
    >
      <path d="M3 5a2 2 0 012-2h3.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H15a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
    </svg>
  )
}
