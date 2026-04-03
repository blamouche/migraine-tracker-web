import type { FoodEntry, DailyFactors, MealTemplate } from '@/types/alimentaire'
import { restoreVaultHandle, ensureVaultStructure } from './handle'
import { useAuthStore } from '@/stores/authStore'

async function getVaultRoot(): Promise<FileSystemDirectoryHandle | null> {
  const { user, anonymousId } = useAuthStore.getState()
  const userId = user?.id ?? anonymousId ?? 'default'
  const parentHandle = await restoreVaultHandle(userId)
  if (!parentHandle) return null
  return ensureVaultStructure(parentHandle)
}

function foodFileName(id: string, date: string): string {
  return `${date}_repas_${id.slice(0, 8)}.md`
}

function factorsFileName(date: string): string {
  return `${date}_facteurs.md`
}

// --- Food Entry serialization ---

function foodToMarkdown(entry: FoodEntry): string {
  const lines = [
    '---',
    `id: ${entry.id}`,
    `date: ${entry.date}`,
    `heure: ${entry.time}`,
    `type_repas: ${entry.mealType}`,
    `aliments: [${entry.foods.join(', ')}]`,
    `statut: ${entry.status}`,
    `completion_forcee: ${entry.completionForcee}`,
    `cree_le: ${entry.createdAt}`,
    `modifie_le: ${entry.updatedAt}`,
    '---',
    '',
  ]

  if (entry.notes) {
    lines.push('## Notes', '', entry.notes, '')
  }

  return lines.join('\n')
}

function markdownToFood(content: string): FoodEntry | null {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) return null

  const fm = fmMatch[1]!
  const get = (key: string): string => {
    const match = fm.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))
    return match?.[1]?.trim() ?? ''
  }
  const getArray = (key: string): string[] => {
    const raw = get(key)
    const inner = raw.replace(/^\[/, '').replace(/\]$/, '').trim()
    if (!inner) return []
    return inner.split(',').map((s) => s.trim()).filter(Boolean)
  }

  const notesMatch = content.match(/## Notes\n\n([\s\S]*)$/)

  return {
    id: get('id'),
    date: get('date'),
    time: get('heure'),
    mealType: get('type_repas') as FoodEntry['mealType'],
    foods: getArray('aliments'),
    notes: notesMatch?.[1]?.trim() ?? null,
    status: get('statut') === 'complet' ? 'complet' : 'incomplet',
    completionForcee: get('completion_forcee') === 'true',
    createdAt: get('cree_le'),
    updatedAt: get('modifie_le'),
  }
}

// --- Daily Factors serialization ---

function factorsToMarkdown(factors: DailyFactors): string {
  return [
    '---',
    `date: ${factors.date}`,
    `stress: ${factors.stress}`,
    `qualite_sommeil: ${factors.sleepQuality}`,
    `hydratation: ${factors.hydration}`,
    `cree_le: ${factors.createdAt}`,
    `modifie_le: ${factors.updatedAt}`,
    '---',
    '',
  ].join('\n')
}

function markdownToFactors(content: string): DailyFactors | null {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) return null

  const fm = fmMatch[1]!
  const get = (key: string): string => {
    const match = fm.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))
    return match?.[1]?.trim() ?? ''
  }

  return {
    date: get('date'),
    stress: parseInt(get('stress'), 10) || 0,
    sleepQuality: parseInt(get('qualite_sommeil'), 10) || 0,
    hydration: get('hydratation') === 'bonne' ? 'bonne' : 'insuffisante',
    createdAt: get('cree_le'),
    updatedAt: get('modifie_le'),
  }
}

// --- CRUD: Food Entries ---

async function getAlimentaireDir(root: FileSystemDirectoryHandle): Promise<FileSystemDirectoryHandle> {
  return root.getDirectoryHandle('journal-alimentaire', { create: true })
}

export async function writeFoodEntry(entry: FoodEntry): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false

  const dir = await getAlimentaireDir(root)
  const file = await dir.getFileHandle(foodFileName(entry.id, entry.date), { create: true })
  const writable = await file.createWritable()
  await writable.write(foodToMarkdown(entry))
  await writable.close()
  return true
}

export async function readAllFoodEntries(): Promise<FoodEntry[]> {
  const root = await getVaultRoot()
  if (!root) return []

  try {
    const dir = await root.getDirectoryHandle('journal-alimentaire')
    const entries: FoodEntry[] = []

    for await (const [name, handle] of dir.entries()) {
      if (name.includes('_repas_') && name.endsWith('.md') && handle.kind === 'file') {
        const content = await (await (handle as FileSystemFileHandle).getFile()).text()
        const entry = markdownToFood(content)
        if (entry) entries.push(entry)
      }
    }

    return entries.sort((a, b) => {
      const dateComp = b.date.localeCompare(a.date)
      if (dateComp !== 0) return dateComp
      return b.time.localeCompare(a.time)
    })
  } catch {
    return []
  }
}

export async function deleteFoodEntry(entry: FoodEntry): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false

  try {
    const dir = await root.getDirectoryHandle('journal-alimentaire')
    const corbeilleDir = await root.getDirectoryHandle('corbeille', { create: true })

    const fileName = foodFileName(entry.id, entry.date)
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

// --- CRUD: Daily Factors ---

export async function writeDailyFactors(factors: DailyFactors): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false

  const dir = await getAlimentaireDir(root)
  const file = await dir.getFileHandle(factorsFileName(factors.date), { create: true })
  const writable = await file.createWritable()
  await writable.write(factorsToMarkdown(factors))
  await writable.close()
  return true
}

export async function readDailyFactors(date: string): Promise<DailyFactors | null> {
  const root = await getVaultRoot()
  if (!root) return null

  try {
    const dir = await root.getDirectoryHandle('journal-alimentaire')
    const file = await dir.getFileHandle(factorsFileName(date))
    const content = await (await file.getFile()).text()
    return markdownToFactors(content)
  } catch {
    return null
  }
}

export async function readAllDailyFactors(): Promise<DailyFactors[]> {
  const root = await getVaultRoot()
  if (!root) return []

  try {
    const dir = await root.getDirectoryHandle('journal-alimentaire')
    const factors: DailyFactors[] = []

    for await (const [name, handle] of dir.entries()) {
      if (name.endsWith('_facteurs.md') && handle.kind === 'file') {
        const content = await (await (handle as FileSystemFileHandle).getFile()).text()
        const f = markdownToFactors(content)
        if (f) factors.push(f)
      }
    }

    return factors.sort((a, b) => b.date.localeCompare(a.date))
  } catch {
    return []
  }
}

// --- CRUD: Meal Templates (US-03-01 / US-03-04) ---

async function getTemplatesDir(root: FileSystemDirectoryHandle): Promise<FileSystemDirectoryHandle> {
  const templates = await root.getDirectoryHandle('templates', { create: true })
  return templates.getDirectoryHandle('repas-types', { create: true })
}

function templateFileName(id: string): string {
  return `${id.slice(0, 8)}_template.md`
}

function templateToMarkdown(t: MealTemplate): string {
  return [
    '---',
    `template_id: ${t.templateId}`,
    `nom: ${t.templateName}`,
    `type_repas: ${t.mealType}`,
    `aliments: [${t.foods.join(', ')}]`,
    `utilisation: ${t.usageCount}`,
    `cree_le: ${t.createdAt}`,
    `modifie_le: ${t.updatedAt}`,
    '---',
    '',
    ...(t.notes ? ['## Notes', '', t.notes, ''] : []),
  ].join('\n')
}

function markdownToTemplate(content: string): MealTemplate | null {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) return null

  const fm = fmMatch[1]!
  const get = (key: string): string => {
    const match = fm.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))
    return match?.[1]?.trim() ?? ''
  }
  const getArray = (key: string): string[] => {
    const raw = get(key)
    const inner = raw.replace(/^\[/, '').replace(/\]$/, '').trim()
    if (!inner) return []
    return inner.split(',').map((s) => s.trim()).filter(Boolean)
  }

  const notesMatch = content.match(/## Notes\n\n([\s\S]*)$/)

  return {
    templateId: get('template_id'),
    templateName: get('nom'),
    mealType: get('type_repas') as MealTemplate['mealType'],
    foods: getArray('aliments'),
    notes: notesMatch?.[1]?.trim() ?? null,
    usageCount: parseInt(get('utilisation'), 10) || 0,
    createdAt: get('cree_le'),
    updatedAt: get('modifie_le'),
  }
}

export async function writeMealTemplate(template: MealTemplate): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false

  const dir = await getTemplatesDir(root)
  const file = await dir.getFileHandle(templateFileName(template.templateId), { create: true })
  const writable = await file.createWritable()
  await writable.write(templateToMarkdown(template))
  await writable.close()
  return true
}

export async function readAllMealTemplates(): Promise<MealTemplate[]> {
  const root = await getVaultRoot()
  if (!root) return []

  try {
    const dir = await getTemplatesDir(root)
    const templates: MealTemplate[] = []

    for await (const [name, handle] of dir.entries()) {
      if (name.endsWith('_template.md') && handle.kind === 'file') {
        const content = await (await (handle as FileSystemFileHandle).getFile()).text()
        const t = markdownToTemplate(content)
        if (t) templates.push(t)
      }
    }

    return templates.sort((a, b) => b.usageCount - a.usageCount)
  } catch {
    return []
  }
}

export async function deleteMealTemplate(templateId: string): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false

  try {
    const dir = await getTemplatesDir(root)
    await dir.removeEntry(templateFileName(templateId))
    return true
  } catch {
    return false
  }
}
