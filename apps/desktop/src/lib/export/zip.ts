import JSZip from 'jszip'
import { downloadBlobRaw } from './csv'

export async function exportVaultZip(): Promise<void> {
  // Use File System Access API to read vault directory
  const handle = localStorage.getItem('migraine-ai-vault-handle')
  if (!handle) {
    throw new Error("Aucun vault sélectionné. Veuillez d'abord sélectionner un vault dans les préférences.")
  }

  // Try to get the directory handle from the stored reference
  let dirHandle: FileSystemDirectoryHandle

  if ('showDirectoryPicker' in window) {
    // Re-request access to vault directory
    dirHandle = await window.showDirectoryPicker({ mode: 'read' })
  } else {
    throw new Error("Votre navigateur ne supporte pas l'accès au système de fichiers.")
  }

  const zip = new JSZip()
  await addDirectoryToZip(zip, dirHandle, '')

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
