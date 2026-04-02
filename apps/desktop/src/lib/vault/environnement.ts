import type { EnvironnementEntry, LunarPhase } from '@/types/environnement'
import { restoreVaultHandle, ensureVaultStructure } from './handle'
import { useAuthStore } from '@/stores/authStore'

async function getVaultRoot(): Promise<FileSystemDirectoryHandle | null> {
  const { user, anonymousId } = useAuthStore.getState()
  const profileId = user?.id ?? anonymousId ?? 'default'
  const parentHandle = await restoreVaultHandle(profileId)
  if (!parentHandle) return null
  return ensureVaultStructure(parentHandle)
}

function envFileName(date: string): string {
  return `${date}_env.md`
}

function envToMarkdown(e: EnvironnementEntry): string {
  const lines = [
    '---',
    `id: ${e.id}`,
    `date: ${e.date}`,
    `latitude: ${e.latitude}`,
    `longitude: ${e.longitude}`,
    `temperature_max: ${e.temperatureMax ?? ''}`,
    `temperature_min: ${e.temperatureMin ?? ''}`,
    `pression_moyenne: ${e.pressionMoyenne ?? ''}`,
    `variation_pression_24h: ${e.variationPression24h ?? ''}`,
    `humidite: ${e.humidite ?? ''}`,
    `vitesse_vent: ${e.vitesseVent ?? ''}`,
    `uv_index: ${e.uvIndex ?? ''}`,
    `precipitations: ${e.precipitations ?? ''}`,
    `phase_lunaire: ${e.phaseLunaire}`,
    `illumination_lunaire: ${e.illuminationLunaire ?? ''}`,
    `prochaine_pleine_lune: ${e.prochainePleineLune ?? ''}`,
    `prochaine_nouvelle_lune: ${e.prochaineNouvelleLune ?? ''}`,
    `source: ${e.source}`,
    `cree_le: ${e.createdAt}`,
    `modifie_le: ${e.updatedAt}`,
    '---',
    '',
  ]
  return lines.join('\n')
}

function markdownToEnv(content: string): EnvironnementEntry | null {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) return null
  const fm = fmMatch[1]!
  const get = (key: string): string => {
    const match = fm.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))
    return match?.[1]?.trim() ?? ''
  }
  const getNum = (key: string): number | null => {
    const v = get(key)
    if (!v) return null
    const n = parseFloat(v)
    return isNaN(n) ? null : n
  }

  return {
    id: get('id'),
    date: get('date'),
    latitude: parseFloat(get('latitude')) || 0,
    longitude: parseFloat(get('longitude')) || 0,
    temperatureMax: getNum('temperature_max'),
    temperatureMin: getNum('temperature_min'),
    pressionMoyenne: getNum('pression_moyenne'),
    variationPression24h: getNum('variation_pression_24h'),
    humidite: getNum('humidite'),
    vitesseVent: getNum('vitesse_vent'),
    uvIndex: getNum('uv_index'),
    precipitations: getNum('precipitations'),
    phaseLunaire: (get('phase_lunaire') || 'nouvelle-lune') as LunarPhase,
    illuminationLunaire: getNum('illumination_lunaire'),
    prochainePleineLune: get('prochaine_pleine_lune') || null,
    prochaineNouvelleLune: get('prochaine_nouvelle_lune') || null,
    source: (get('source') || 'open-meteo') as EnvironnementEntry['source'],
    createdAt: get('cree_le'),
    updatedAt: get('modifie_le'),
  }
}

export async function writeEnvironnement(entry: EnvironnementEntry): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false
  const dir = await root.getDirectoryHandle('environnement', { create: true })
  const file = await dir.getFileHandle(envFileName(entry.date), { create: true })
  const writable = await file.createWritable()
  await writable.write(envToMarkdown(entry))
  await writable.close()
  return true
}

export async function readAllEnvironnements(): Promise<EnvironnementEntry[]> {
  const root = await getVaultRoot()
  if (!root) return []
  try {
    const dir = await root.getDirectoryHandle('environnement')
    const entries: EnvironnementEntry[] = []
    for await (const [name, handle] of dir.entries()) {
      if (name.endsWith('_env.md') && handle.kind === 'file') {
        const content = await (await (handle as FileSystemFileHandle).getFile()).text()
        const entry = markdownToEnv(content)
        if (entry) entries.push(entry)
      }
    }
    return entries.sort((a, b) => b.date.localeCompare(a.date))
  } catch {
    return []
  }
}

export async function readEnvironnementByDate(date: string): Promise<EnvironnementEntry | null> {
  const root = await getVaultRoot()
  if (!root) return null
  try {
    const dir = await root.getDirectoryHandle('environnement')
    const file = await dir.getFileHandle(envFileName(date))
    const content = await (await file.getFile()).text()
    return markdownToEnv(content)
  } catch {
    return null
  }
}
