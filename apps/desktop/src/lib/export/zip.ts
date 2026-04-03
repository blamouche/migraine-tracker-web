import JSZip from 'jszip'
import { downloadBlobRaw } from './csv'
import { restoreVaultHandle, ensureVaultStructure } from '@/lib/vault/handle'
import { useAuthStore } from '@/stores/authStore'

export async function exportVaultZip(): Promise<void> {
  const { user, anonymousId } = useAuthStore.getState()
  const userId = user?.id ?? anonymousId ?? 'default'

  const parentHandle = await restoreVaultHandle(userId)
  if (!parentHandle) {
    throw new Error("Aucun vault sélectionné. Veuillez d'abord sélectionner un vault dans les préférences.")
  }

  const vaultRoot = await ensureVaultStructure(parentHandle)

  const zip = new JSZip()
  await addDirectoryToZip(zip, vaultRoot, '')

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
  const date = new Date().toISOString().slice(0, 10)
  downloadBlobRaw(blob, `vault-migraine-ai-${date}.zip`)
}

async function addDirectoryToZip(
  zip: JSZip,
  dirHandle: FileSystemDirectoryHandle,
  path: string,
): Promise<void> {
  for await (const [name, handle] of dirHandle.entries()) {
    const entryPath = path ? `${path}/${name}` : name

    if (handle.kind === 'file') {
      const fileHandle = handle as FileSystemFileHandle
      const file = await fileHandle.getFile()
      zip.file(entryPath, file)
    } else if (handle.kind === 'directory') {
      await addDirectoryToZip(zip, handle as FileSystemDirectoryHandle, entryPath)
    }
  }
}
