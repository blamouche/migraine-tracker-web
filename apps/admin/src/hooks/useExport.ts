import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface ExportedUser {
  email: string
  plan: string
  created_at: string
  last_active_at: string | null
}

interface UseExportReturn {
  exportUsersCsv: (users: Array<{
    email_masked: string
    created_at: string
    plan: string
    last_active_at: string | null
    session_count: number
    is_active: boolean
    marketing_consent: boolean
  }>) => void
  exportEmails: (planFilter: string | null, activityFilter: string | null) => Promise<void>
  isExporting: boolean
  error: string | null
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR')
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportUsersCsv = useCallback((users: Array<{
    email_masked: string
    created_at: string
    plan: string
    last_active_at: string | null
    session_count: number
    is_active: boolean
    marketing_consent: boolean
  }>) => {
    const header = 'Email,Inscription,Plan,Dernière connexion,Sessions 30j,Statut,Consentement marketing'
    const rows = users.map(u =>
      [
        u.email_masked,
        formatDate(u.created_at),
        u.plan,
        formatDate(u.last_active_at),
        u.session_count,
        u.is_active ? 'Actif' : 'Désactivé',
        u.marketing_consent ? 'Oui' : 'Non',
      ].join(',')
    )
    downloadCsv([header, ...rows].join('\n'), `migraine-ai-utilisateurs_${today()}.csv`)

    // Log action
    supabase.auth.getSession().then(({ data }) => {
      const adminId = data.session?.user.id
      if (adminId) {
        supabase.from('admin_log').insert({
          admin_id: adminId,
          action: 'export_users_csv',
          new_value: `${users.length} utilisateurs exportés`,
        })
      }
    })
  }, [])

  const exportEmails = useCallback(async (planFilter: string | null, activityFilter: string | null) => {
    setIsExporting(true)
    setError(null)

    const { data, error: rpcError } = await supabase.rpc('export_admin_emails', {
      plan_filter: planFilter,
      activity_filter: activityFilter,
    })

    if (rpcError) {
      setError(rpcError.message)
      setIsExporting(false)
      return
    }

    const emails = (data as ExportedUser[]) ?? []
    const header = 'Email,Plan,Inscription,Dernière connexion'
    const rows = emails.map(e =>
      [e.email, e.plan, formatDate(e.created_at), formatDate(e.last_active_at)].join(',')
    )

    const planLabel = planFilter ?? 'all'
    const actLabel = activityFilter ?? 'all'
    downloadCsv(
      [header, ...rows].join('\n'),
      `migraine-ai-emails-${planLabel}-${actLabel}_${today()}.csv`,
    )

    setIsExporting(false)
  }, [])

  return { exportUsersCsv, exportEmails, isExporting, error }
}
