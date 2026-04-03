import type { MedicalProfile, Doctor } from '@/types/medicalProfile'
import { EMPTY_PROFILE } from '@/types/medicalProfile'
import { restoreVaultHandle, ensureVaultStructure } from './handle'
import { useAuthStore } from '@/stores/authStore'

const PROFILE_FILE = 'profil-medical.md'

async function getVaultRoot(): Promise<FileSystemDirectoryHandle | null> {
  const { user, anonymousId } = useAuthStore.getState()
  const userId = user?.id ?? anonymousId ?? 'default'
  const parentHandle = await restoreVaultHandle(userId)
  if (!parentHandle) return null
  return ensureVaultStructure(parentHandle)
}

function profileToMarkdown(profile: MedicalProfile): string {
  const lines = [
    '---',
    `type_migraine: ${profile.migraineType}`,
    `type_migraine_autre: ${profile.migraineTypeAutre ?? ''}`,
    `traitements_crise: [${profile.traitementsCrise.join(', ')}]`,
    `traitements_fond: [${profile.traitementsFond.join(', ')}]`,
    `antecedents_cardiovasculaires: [${profile.antecedentsCardiovasculaires.join(', ')}]`,
    `allergies: [${profile.allergies.join(', ')}]`,
    `contre_indications: [${profile.contreIndications.join(', ')}]`,
    `contraception: ${profile.contraception}`,
    `modifie_le: ${profile.updatedAt}`,
    '---',
    '',
    '# Profil médical',
    '',
  ]

  if (profile.medecins.length > 0) {
    lines.push('## Médecins')
    lines.push('')
    for (const doc of profile.medecins) {
      lines.push(`### ${doc.nom}`)
      lines.push(`- Spécialité : ${doc.specialite}`)
      lines.push(`- Coordonnées : ${doc.coordonnees}`)
      lines.push('')
    }
  }

  if (profile.notes) {
    lines.push('## Notes')
    lines.push('')
    lines.push(profile.notes)
    lines.push('')
  }

  return lines.join('\n')
}

function markdownToProfile(content: string): MedicalProfile {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) return { ...EMPTY_PROFILE }

  const fm = fmMatch[1]!
  const get = (key: string): string => {
    const match = fm.match(new RegExp(`^${key}: *(.*)$`, 'm'))
    return match?.[1]?.trim() ?? ''
  }
  const getArray = (key: string): string[] => {
    const raw = get(key)
    const inner = raw.replace(/^\[/, '').replace(/\]$/, '').trim()
    if (!inner) return []
    return inner.split(',').map((s) => s.trim()).filter(Boolean)
  }

  // Parse doctors from markdown sections
  const medecins: Doctor[] = []
  const doctorBlocks = content.match(/### (.+)\n- Spécialité : (.+)\n- Coordonnées : (.+)/g)
  if (doctorBlocks) {
    for (const block of doctorBlocks) {
      const match = block.match(/### (.+)\n- Spécialité : (.+)\n- Coordonnées : (.+)/)
      if (match) {
        medecins.push({
          nom: match[1]!.trim(),
          specialite: match[2]!.trim() as Doctor['specialite'],
          coordonnees: match[3]!.trim(),
        })
      }
    }
  }

  const notesMatch = content.match(/## Notes\n\n([\s\S]*)$/)

  return {
    migraineType: (get('type_migraine') || 'sans-aura') as MedicalProfile['migraineType'],
    migraineTypeAutre: get('type_migraine_autre') || null,
    traitementsCrise: getArray('traitements_crise'),
    traitementsFond: getArray('traitements_fond'),
    antecedentsCardiovasculaires: getArray('antecedents_cardiovasculaires'),
    allergies: getArray('allergies'),
    contreIndications: getArray('contre_indications'),
    contraception: (get('contraception') || 'aucune') as MedicalProfile['contraception'],
    medecins,
    notes: notesMatch?.[1]?.trim() ?? null,
    updatedAt: get('modifie_le') || new Date().toISOString(),
  }
}

export async function writeMedicalProfile(profile: MedicalProfile): Promise<boolean> {
  const root = await getVaultRoot()
  if (!root) return false

  const configDir = await root.getDirectoryHandle('config', { create: true })
  const file = await configDir.getFileHandle(PROFILE_FILE, { create: true })
  const writable = await file.createWritable()
  await writable.write(profileToMarkdown(profile))
  await writable.close()
  return true
}

export async function readMedicalProfile(): Promise<MedicalProfile | null> {
  const root = await getVaultRoot()
  if (!root) return null

  try {
    const configDir = await root.getDirectoryHandle('config')
    const file = await configDir.getFileHandle(PROFILE_FILE)
    const content = await (await file.getFile()).text()
    return markdownToProfile(content)
  } catch {
    return null
  }
}
