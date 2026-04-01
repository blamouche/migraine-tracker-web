import type { TransportEntry, TransportMoyen } from '@/types/transport'
import { restoreVaultHandle, ensureVaultStructure } from './handle'
import { useAuthStore } from '@/stores/authStore'

async function getVaultRoot(): Promise<FileSystemDirectoryHandle | null> {
  const { user, anonymousId } = useAuthStore.getState()
  const profileId = user?.id ?? anonymousId ?? 'default'
  const parentHandle = await restoreVaultHandle(profileId)
  if (!parentHandle) return null
  return ensureVaultStructure(parentHandle)
}

function transportFileName(date: string, id: string): string {
  return `${date}_transport_${id}.md`
}

function transportToMarkdown(t: TransportEntry): string {
  const lines = [
    '---',
    `id: ${t.id}`,
    `date: ${t.date}`,
    `heure: ${t.heure}`,
    `moyen: ${t.moyen}`,
    `duree_minutes: ${t.dureeMinutes}`,
    `conditions: [${t.conditions.join(', ')}]`,
    `distance: ${t.distance ?? ''}`,
    `cree_le: ${t.createdAt}`,
    `modifie_le: ${t.updatedAt}`,
    '---',
    '',
  ]

  if (t.notes) {
    lines.push('## Notes', '', t.notes, '')
  }

  return lines.join('\n')
}

function markdownToTransport(content: string): TransportEntry | null {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) return null

  const fm = fmMatch[1]!
  const get = (key: string): string => {
    const match = fm.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))
    return match?.[1]?.trim() ?? ''
  }

  const getArray = (key: string): string[] => {
    const raw = get(key)
    const inner = raw.match(/^\[(.*)\]$/)?.[1]
    if (!inner) return raw ? [raw] : []
    return inner.split(',').map((s) => s.trim()).filter(Boolean)
  }

  const notesMatch = content.match(/## Notes\n\n([\s\S]*)$/)

  return {
    id: get('id'),
    date: get('date'),
    heure: get('heure'),
    moyen: (get('moyen') || 'autre') as TransportMoyen,
    dureeMinutes: parseInt(get('duree_minutes')) || 0,
    conditions: getArray('conditions'),
    distance: get('distance') || null,
    notes: notesMatch?.[1]?.trim() ?? null,
    createdAt: get('cree_le'),
    updatedAt: get('modifie_le'),
  }
}

export async function writeTransport(entry: TransportEntry): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false

  const dir = await root.getDirectoryHandle('transports', { create: true })
  const file = await dir.getFileHandle(transportFileName(entry.date, entry.id), { create: true })
  const writable = await file.createWritable()
  await writable.write(transportToMarkdown(entry))
  await writable.close()
  return true
}

export async function readAllTransports(): Promise<TransportEntry[]> {
  const root = await getVaultRoot()
  if (!root) return []

  try {
    const dir = await root.getDirectoryHandle('transports')
    const entries: TransportEntry[] = []

    for await (const [name, handle] of dir.entries()) {
      if (name.endsWith('.md') && handle.kind === 'file') {
        const content = await (await (handle as FileSystemFileHandle).getFile()).text()
        const entry = markdownToTransport(content)
        if (entry) entries.push(entry)
      }
    }

    return entries.sort((a, b) => b.date.localeCompare(a.date))
  } catch {
    return []
  }
}

export async function deleteTransport(entry: TransportEntry): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false

  try {
    const dir = await root.getDirectoryHandle('transports')
    const corbeilleDir = await root.getDirectoryHandle('corbeille', { create: true })

    const fileName = transportFileName(entry.date, entry.id)
    const file = await dir.getFileHandle(fileName)
    const content = await (await file.getFile()).text()

    const trashContent = content.replace('---\n', `---\nsupprime_le: ${new Date().toISOString()}\n`)
    const trashFile = await corbeilleDir.getFileHandle(fileName, { create: true })
    const writable = await trashFile.createWritable()
    await writable.write(trashContent)
    await writable.close()

    await dir.removeEntry(fileName)
    return true
  } catch {
    return false
  }
}
