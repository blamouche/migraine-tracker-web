import { idbGet, idbSet } from '../idb'

const VAULT_HANDLE_KEY = 'vault-handle'

function handleKey(profileId: string) {
  return `${VAULT_HANDLE_KEY}:${profileId}`
}

export async function saveVaultHandle(
  profileId: string,
  handle: FileSystemDirectoryHandle,
): Promise<void> {
  await idbSet(handleKey(profileId), handle)
}

export async function restoreVaultHandle(
  profileId: string,
): Promise<FileSystemDirectoryHandle | null> {
  const handle = await idbGet<FileSystemDirectoryHandle>(handleKey(profileId))
  if (!handle) return null

  const permission = await handle.requestPermission({ mode: 'readwrite' })
  if (permission !== 'granted') return null

  return handle
}

export async function pickVaultFolder(): Promise<FileSystemDirectoryHandle> {
  const handle = await window.showDirectoryPicker({ mode: 'readwrite' })
  return handle
}

const VAULT_ROOT = 'Migraine AI'
const VAULT_DIRS = ['crises', 'daily-pain', 'charge-mentale', 'journal-alimentaire', 'config', 'corbeille', 'cycle', 'consultations', 'transports', 'sport', 'environnement', 'ia', 'templates']

export async function ensureVaultStructure(
  handle: FileSystemDirectoryHandle,
): Promise<FileSystemDirectoryHandle> {
  let root: FileSystemDirectoryHandle
  try {
    root = await handle.getDirectoryHandle(VAULT_ROOT)
  } catch {
    root = await handle.getDirectoryHandle(VAULT_ROOT, { create: true })
  }

  for (const dir of VAULT_DIRS) {
    try {
      await root.getDirectoryHandle(dir)
    } catch {
      await root.getDirectoryHandle(dir, { create: true })
    }
  }

  return root
}
