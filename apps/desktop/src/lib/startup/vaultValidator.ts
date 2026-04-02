/**
 * E22 — Vault integrity validator
 * Scans markdown files for corruption and reports errors
 * without blocking the application.
 */

export interface VaultError {
  file: string
  error: string
  severity: 'warning' | 'error'
  detectedAt: string
}

export async function validateVaultDirectory(
  dirHandle: FileSystemDirectoryHandle,
  path: string = '',
): Promise<VaultError[]> {
  const errors: VaultError[] = []
  const now = new Date().toISOString()

  try {
    for await (const [name, handle] of dirHandle.entries()) {
      const fullPath = path ? `${path}/${name}` : name

      if (handle.kind === 'directory') {
        const subErrors = await validateVaultDirectory(
          handle as FileSystemDirectoryHandle,
          fullPath,
        )
        errors.push(...subErrors)
      } else if (name.endsWith('.md')) {
        try {
          const file = await (handle as FileSystemFileHandle).getFile()

          // Empty files — ignore silently
          if (file.size === 0) continue

          const content = await file.text()

          // Check for valid frontmatter
          if (content.startsWith('---')) {
            const fmEnd = content.indexOf('\n---', 4)
            if (fmEnd === -1) {
              errors.push({
                file: fullPath,
                error: 'Frontmatter YAML non fermé',
                severity: 'error',
                detectedAt: now,
              })
            }
          }

          // Check for required id field in data files (not config files)
          if (content.startsWith('---') && !fullPath.startsWith('config/')) {
            const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
            if (fmMatch) {
              const fm = fmMatch[1]!
              if (!fm.includes('id:')) {
                errors.push({
                  file: fullPath,
                  error: 'Champ "id" manquant dans le frontmatter',
                  severity: 'warning',
                  detectedAt: now,
                })
              }
            }
          }
        } catch {
          errors.push({
            file: fullPath,
            error: 'Impossible de lire le fichier',
            severity: 'error',
            detectedAt: now,
          })
        }
      }
    }
  } catch {
    // Directory inaccessible — handled by caller
  }

  return errors
}

export function formatVaultErrors(errors: VaultError[]): string {
  if (errors.length === 0) return ''
  const lines = [
    '---',
    `date_scan: ${new Date().toISOString()}`,
    `erreurs: ${errors.length}`,
    '---',
    '',
  ]
  for (const e of errors) {
    lines.push(`- [${e.severity}] ${e.file}: ${e.error} (${e.detectedAt})`)
  }
  return lines.join('\n')
}
