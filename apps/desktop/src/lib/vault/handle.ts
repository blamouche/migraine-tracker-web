import { idbGet, idbSet } from '../idb'

const VAULT_HANDLE_KEY = 'vault-handle'

function handleKey(userId: string) {
  return `${VAULT_HANDLE_KEY}:${userId}`
}

export async function saveVaultHandle(
  userId: string,
  handle: FileSystemDirectoryHandle,
): Promise<void> {
  await idbSet(handleKey(userId), handle)
}

export async function restoreVaultHandle(
  userId: string,
): Promise<FileSystemDirectoryHandle | null> {
  const handle = await idbGet<FileSystemDirectoryHandle>(handleKey(userId))
  if (!handle) return null

  // queryPermission doesn't require user activation (works in background)
  const handleWithQuery = handle as FileSystemDirectoryHandle & {
    queryPermission: (desc: { mode: string }) => Promise<PermissionState>
  }
  const current = await handleWithQuery.queryPermission({ mode: 'readwrite' })
  if (current === 'granted') return handle

  // Only request (which needs user gesture) if not already granted
  try {
    const permission = await handle.requestPermission({ mode: 'readwrite' })
    if (permission !== 'granted') return null
  } catch {
    // requestPermission throws without user activation — permission not yet granted
    return null
  }

  return handle
}

export async function checkVaultAccess(userId: string): Promise<boolean> {
  try {
    const handle = await idbGet<FileSystemDirectoryHandle>(handleKey(userId))
    if (!handle) return false
    const permission = await (handle as FileSystemDirectoryHandle & { queryPermission: (desc: { mode: string }) => Promise<string> }).queryPermission({ mode: 'readwrite' })
    return permission === 'granted'
  } catch {
    return false
  }
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
