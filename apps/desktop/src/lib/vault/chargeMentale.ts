import type { ChargeMentaleEntry, ChargeDomaine, HumeurLevel, EvenementVie, EvenementCategorie, EvenementNature } from '@/types/chargeMentale'
import { restoreVaultHandle, ensureVaultStructure } from './handle'
import { useAuthStore } from '@/stores/authStore'

async function getVaultRoot(): Promise<FileSystemDirectoryHandle | null> {
  const { user, anonymousId } = useAuthStore.getState()
  const profileId = user?.id ?? anonymousId ?? 'default'
  const parentHandle = await restoreVaultHandle(profileId)
  if (!parentHandle) return null
  return ensureVaultStructure(parentHandle)
}

// --- Charge Mentale ---

function chargeFileName(date: string): string {
  return `${date}_charge.md`
}

function chargeToMarkdown(c: ChargeMentaleEntry): string {
  const lines = [
    '---',
    `id: ${c.id}`,
    `date: ${c.date}`,
    `niveau: ${c.niveau}`,
    `domaine: ${c.domaine}`,
    `humeur: ${c.humeur}`,
    `contexte: [${c.contexte.join(', ')}]`,
    `cree_le: ${c.createdAt}`,
    `modifie_le: ${c.updatedAt}`,
    '---',
    '',
  ]
  if (c.notes) {
    lines.push('## Notes', '', c.notes, '')
  }
  return lines.join('\n')
}

function markdownToCharge(content: string): ChargeMentaleEntry | null {
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
    niveau: parseInt(get('niveau')) || 5,
    domaine: (get('domaine') || 'autre') as ChargeDomaine,
    humeur: (get('humeur') || 'neutre') as HumeurLevel,
    contexte: getArray('contexte'),
    notes: notesMatch?.[1]?.trim() ?? null,
    createdAt: get('cree_le'),
    updatedAt: get('modifie_le'),
  }
}

export async function writeChargeMentale(entry: ChargeMentaleEntry): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false
  const dir = await root.getDirectoryHandle('charge-mentale', { create: true })
  const file = await dir.getFileHandle(chargeFileName(entry.date), { create: true })
  const writable = await file.createWritable()
  await writable.write(chargeToMarkdown(entry))
  await writable.close()
  return true
}

export async function readAllChargesMentales(): Promise<ChargeMentaleEntry[]> {
  const root = await getVaultRoot()
  if (!root) return []
  try {
    const dir = await root.getDirectoryHandle('charge-mentale')
    const entries: ChargeMentaleEntry[] = []
    for await (const [name, handle] of dir.entries()) {
      if (name.endsWith('_charge.md') && handle.kind === 'file') {
        const content = await (await (handle as FileSystemFileHandle).getFile()).text()
        const entry = markdownToCharge(content)
        if (entry) entries.push(entry)
      }
    }
    return entries.sort((a, b) => b.date.localeCompare(a.date))
  } catch {
    return []
  }
}

export async function deleteChargeMentale(entry: ChargeMentaleEntry): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false
  try {
    const dir = await root.getDirectoryHandle('charge-mentale')
    const corbeilleDir = await root.getDirectoryHandle('corbeille', { create: true })
    const fileName = chargeFileName(entry.date)
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

// --- Evenements de vie ---

function evenementFileName(dateDebut: string, id: string): string {
  return `${dateDebut}_evenement_${id}.md`
}

function evenementToMarkdown(e: EvenementVie): string {
  const lines = [
    '---',
    `id: ${e.id}`,
    `date_debut: ${e.dateDebut}`,
    `date_fin: ${e.dateFin ?? ''}`,
    `categorie: ${e.categorie}`,
    `nature: ${e.nature}`,
    `intensite: ${e.intensite}`,
    `cree_le: ${e.createdAt}`,
    `modifie_le: ${e.updatedAt}`,
    '---',
    '',
    '## Description', '', e.description, '',
  ]
  if (e.notes) {
    lines.push('## Notes', '', e.notes, '')
  }
  return lines.join('\n')
}

function markdownToEvenement(content: string): EvenementVie | null {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) return null
  const fm = fmMatch[1]!
  const get = (key: string): string => {
    const match = fm.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))
    return match?.[1]?.trim() ?? ''
  }
  const descMatch = content.match(/## Description\n\n([\s\S]*?)(?=\n## |$)/)
  const notesMatch = content.match(/## Notes\n\n([\s\S]*)$/)

  return {
    id: get('id'),
    dateDebut: get('date_debut'),
    dateFin: get('date_fin') || null,
    categorie: (get('categorie') || 'autre') as EvenementCategorie,
    nature: (get('nature') || 'neutre') as EvenementNature,
    intensite: parseInt(get('intensite')) || 3,
    description: descMatch?.[1]?.trim() ?? '',
    notes: notesMatch?.[1]?.trim() ?? null,
    createdAt: get('cree_le'),
    updatedAt: get('modifie_le'),
  }
}

export async function writeEvenement(entry: EvenementVie): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false
  const chargeDir = await root.getDirectoryHandle('charge-mentale', { create: true })
  const dir = await chargeDir.getDirectoryHandle('evenements', { create: true })
  const file = await dir.getFileHandle(evenementFileName(entry.dateDebut, entry.id), { create: true })
  const writable = await file.createWritable()
  await writable.write(evenementToMarkdown(entry))
  await writable.close()
  return true
}

export async function readAllEvenements(): Promise<EvenementVie[]> {
  const root = await getVaultRoot()
  if (!root) return []
  try {
    const chargeDir = await root.getDirectoryHandle('charge-mentale')
    const dir = await chargeDir.getDirectoryHandle('evenements')
    const entries: EvenementVie[] = []
    for await (const [name, handle] of dir.entries()) {
      if (name.endsWith('.md') && handle.kind === 'file') {
        const content = await (await (handle as FileSystemFileHandle).getFile()).text()
        const entry = markdownToEvenement(content)
        if (entry) entries.push(entry)
      }
    }
    return entries.sort((a, b) => b.dateDebut.localeCompare(a.dateDebut))
  } catch {
    return []
  }
}

export async function deleteEvenement(entry: EvenementVie): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false
  try {
    const chargeDir = await root.getDirectoryHandle('charge-mentale')
    const dir = await chargeDir.getDirectoryHandle('evenements')
    const corbeilleDir = await root.getDirectoryHandle('corbeille', { create: true })
    const fileName = evenementFileName(entry.dateDebut, entry.id)
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
