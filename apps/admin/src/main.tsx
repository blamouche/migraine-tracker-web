import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import './styles/globals.css'

import { StrictMode, useState, useMemo, useCallback, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useUsers } from '@/hooks/useUsers'
import { usePlanConfig } from '@/hooks/usePlanConfig'
import { useAuditLog } from '@/hooks/useAuditLog'
import { useUserActions } from '@/hooks/useUserActions'
import { useStats } from '@/hooks/useStats'
import { useExport } from '@/hooks/useExport'
import type { PlanFeatures } from '@/hooks/usePlanConfig'
import { getFeatureMeta } from '@/lib/featureMetadata'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts'

type Tab = 'users' | 'plans' | 'stats' | 'log'

const TAB_LABELS: Record<Tab, string> = {
  users: 'Utilisateurs',
  plans: 'Plans',
  stats: 'Stats',
  log: 'Journal',
}

function App() {
  const { user, isLoading: authLoading, isAdmin, error: authError, signIn, signOut } = useAdminAuth()
  const [tab, setTab] = useState<Tab>('users')

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base)">
        <p className="text-sm text-(--color-text-secondary)">Chargement...</p>
      </main>
    )
  }

  if (!user || !isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base) p-8">
        <div className="text-center text-(--color-text-primary)">
          <h1 className="text-2xl font-semibold">Migraine AI — Admin</h1>
          <p className="mt-2 text-sm text-(--color-text-secondary)">
            Connexion requise (Supabase Auth + rôle admin)
          </p>
          {authError && (
            <p className="mt-3 text-sm text-(--color-danger)">{authError}</p>
          )}
          <button
            type="button"
            onClick={signIn}
            className="mt-6 rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-semibold text-(--color-text-inverse)"
          >
            Se connecter avec Google
          </button>
          <p className="mt-3 text-xs text-(--color-text-muted)">
            Session timeout : 15 min d&apos;inactivité
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-[1200px] px-8 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Migraine AI — Administration</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs text-(--color-text-muted)">{user.email}</span>
            <button
              type="button"
              onClick={signOut}
              className="text-sm text-(--color-text-muted) underline"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 rounded-(--radius-lg) bg-(--color-bg-elevated) p-1">
          {(['users', 'plans', 'stats', 'log'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-(--radius-md) py-2 text-sm font-medium transition-colors ${tab === t ? 'bg-(--color-brand) text-(--color-text-inverse)' : 'text-(--color-text-secondary) hover:text-(--color-text-primary)'}`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {tab === 'users' && <UsersTab />}
        {tab === 'plans' && <PlansTab />}
        {tab === 'stats' && <StatsTab />}
        {tab === 'log' && <LogTab />}
      </div>
    </main>
  )
}

/* ── E31 — User Detail Drawer ──────────────────────────────── */

interface AdminUser {
  user_id: string
  email_masked: string
  email_full: string
  created_at: string
  last_active_at: string | null
  session_count: number
  is_active: boolean
  auth_provider: string | null
  plan: string
  marketing_consent: boolean
}

function UserDrawer({
  user,
  revealedEmail,
  onRevealEmail,
  onClose,
  onChangePlan,
  onToggleActive,
  onDelete,
}: {
  user: AdminUser
  revealedEmail: string | null
  onRevealEmail: () => void
  onClose: () => void
  onChangePlan: (newPlan: string) => Promise<void>
  onToggleActive: () => Promise<void>
  onDelete: () => Promise<void>
}) {
  const [confirmPlan, setConfirmPlan] = useState(false)
  const [confirmToggle, setConfirmToggle] = useState(false)
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0)
  const [deleteEmailInput, setDeleteEmailInput] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const newPlan = user.plan === 'pro' ? 'free' : 'pro'
  const displayEmail = revealedEmail ?? user.email_masked

  const handleAction = async (fn: () => Promise<void>) => {
    setActionLoading(true)
    setActionError(null)
    try {
      await fn()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="fixed right-0 top-0 z-[91] flex h-full w-[440px] max-w-[90vw] flex-col bg-(--color-bg-elevated) shadow-2xl">
        <div className="flex items-center justify-between border-b border-(--color-border) px-6 py-4">
          <h2 className="text-lg font-semibold">Détails utilisateur</h2>
          <button type="button" onClick={onClose} className="text-(--color-text-muted) text-xl leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-(--color-text-muted)">Email</span>
              <span className="flex items-center gap-2">
                {displayEmail}
                {!revealedEmail && (
                  <button type="button" onClick={onRevealEmail} className="text-xs text-(--color-brand) underline">
                    Révéler
                  </button>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-(--color-text-muted)">Inscription</span>
              <span>{new Date(user.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-(--color-text-muted)">Plan</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${user.plan === 'pro' ? 'bg-(--color-brand-light) text-(--color-brand)' : 'bg-(--color-bg-subtle) text-(--color-text-muted)'}`}>
                {user.plan}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-(--color-text-muted)">Dernière connexion</span>
              <span>{user.last_active_at ? new Date(user.last_active_at).toLocaleDateString('fr-FR') : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-(--color-text-muted)">Sessions 30j</span>
              <span>{user.session_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-(--color-text-muted)">Provider</span>
              <span>{user.auth_provider ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-(--color-text-muted)">Statut</span>
              <span className={user.is_active ? 'text-(--color-success)' : 'text-(--color-danger)'}>
                {user.is_active ? 'Actif' : 'Désactivé'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-(--color-text-muted)">Consentement marketing</span>
              <span>{user.marketing_consent ? 'Oui' : 'Non'}</span>
            </div>
          </div>

          {actionError && <p className="text-sm text-(--color-danger)">{actionError}</p>}

          {/* US-31-03 — Change plan */}
          <div className="rounded-(--radius-md) border border-(--color-border) p-4">
            <h3 className="text-sm font-medium">Changer de plan</h3>
            {!confirmPlan ? (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setConfirmPlan(true)}
                className="mt-2 rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm text-white"
              >
                Passer à {newPlan}
              </button>
            ) : (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-(--color-text-secondary)">
                  Passer de <strong>{user.plan}</strong> à <strong>{newPlan}</strong> ?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleAction(async () => { await onChangePlan(newPlan); setConfirmPlan(false) })}
                    className="rounded-(--radius-md) bg-(--color-brand) px-3 py-1.5 text-xs text-white"
                  >
                    Confirmer
                  </button>
                  <button type="button" onClick={() => setConfirmPlan(false)} className="text-xs text-(--color-text-muted)">
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* US-31-04 — Toggle active */}
          <div className="rounded-(--radius-md) border border-(--color-border) p-4">
            <h3 className="text-sm font-medium">{user.is_active ? 'Désactiver' : 'Réactiver'} le compte</h3>
            {!confirmToggle ? (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setConfirmToggle(true)}
                className={`mt-2 rounded-(--radius-md) px-4 py-2 text-sm text-white ${user.is_active ? 'bg-(--color-warning)' : 'bg-(--color-success)'}`}
              >
                {user.is_active ? 'Désactiver' : 'Réactiver'}
              </button>
            ) : (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-(--color-text-secondary)">
                  {user.is_active ? 'Désactiver ce compte ?' : 'Réactiver ce compte ?'}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleAction(async () => { await onToggleActive(); setConfirmToggle(false) })}
                    className="rounded-(--radius-md) bg-(--color-danger) px-3 py-1.5 text-xs text-white"
                  >
                    Confirmer
                  </button>
                  <button type="button" onClick={() => setConfirmToggle(false)} className="text-xs text-(--color-text-muted)">
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* US-31-05 — Delete */}
          <div className="rounded-(--radius-md) border border-(--color-danger)/30 bg-(--color-danger)/5 p-4">
            <h3 className="text-sm font-medium text-(--color-danger)">Zone danger</h3>
            {deleteStep === 0 && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setDeleteStep(1)}
                className="mt-2 rounded-(--radius-md) border border-(--color-danger) px-4 py-2 text-sm text-(--color-danger)"
              >
                Supprimer le compte
              </button>
            )}
            {deleteStep === 1 && (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-(--color-text-secondary)">
                  Êtes-vous sûr ? Cette action est <strong>irréversible</strong>.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteStep(2)}
                    className="rounded-(--radius-md) bg-(--color-danger) px-3 py-1.5 text-xs text-white"
                  >
                    Oui, continuer
                  </button>
                  <button type="button" onClick={() => setDeleteStep(0)} className="text-xs text-(--color-text-muted)">
                    Annuler
                  </button>
                </div>
              </div>
            )}
            {deleteStep === 2 && (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-(--color-text-secondary)">
                  Saisissez l&apos;email de l&apos;utilisateur pour confirmer :
                </p>
                <input
                  type="text"
                  value={deleteEmailInput}
                  onChange={(e) => setDeleteEmailInput(e.target.value)}
                  placeholder={user.email_masked}
                  className="w-full rounded-(--radius-md) border border-(--color-border) px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={actionLoading || deleteEmailInput !== (revealedEmail ?? user.email_full)}
                    onClick={() => handleAction(onDelete)}
                    className="rounded-(--radius-md) bg-(--color-danger) px-3 py-1.5 text-xs text-white disabled:opacity-50"
                  >
                    Supprimer définitivement
                  </button>
                  <button type="button" onClick={() => { setDeleteStep(0); setDeleteEmailInput('') }} className="text-xs text-(--color-text-muted)">
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Users Tab (E31 + E33 export) ──────────────────────────── */

function UsersTab() {
  const { users, isLoading, error, refresh, toggleActive, revealEmail, revealedEmails } = useUsers()
  const { changePlan, deleteUser } = useUserActions(refresh)
  const { exportUsersCsv, exportEmails, isExporting } = useExport()
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [confirmAction, setConfirmAction] = useState<string | null>(null)

  // E33 export state
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportPlanFilter, setExportPlanFilter] = useState<string>('all')
  const [exportActivityFilter, setExportActivityFilter] = useState<string>('all')
  const [exportConfirmCount, setExportConfirmCount] = useState<number | null>(null)

  const handleToggleActive = async (userId: string, currentlyActive: boolean) => {
    if (confirmAction !== userId) {
      setConfirmAction(userId)
      return
    }
    await toggleActive(userId, currentlyActive)
    setConfirmAction(null)
  }

  const handleExportEmails = async () => {
    const pf = exportPlanFilter === 'all' ? null : exportPlanFilter
    const af = exportActivityFilter === 'all' ? null : exportActivityFilter
    await exportEmails(pf, af)
    setShowExportModal(false)
    setExportConfirmCount(null)
  }

  // Estimate count for confirmation
  const estimatedExportCount = useMemo(() => {
    return users.filter(u => {
      if (exportPlanFilter !== 'all' && u.plan !== exportPlanFilter) return false
      if (exportActivityFilter === 'active' && (!u.last_active_at || Date.now() - new Date(u.last_active_at).getTime() > 30 * 86400000)) return false
      if (exportActivityFilter === 'inactive') {
        if (!u.last_active_at) return false
        const diff = Date.now() - new Date(u.last_active_at).getTime()
        if (diff < 30 * 86400000 || diff > 90 * 86400000) return false
      }
      if (exportActivityFilter === 'dormant' && (!u.last_active_at || Date.now() - new Date(u.last_active_at).getTime() < 90 * 86400000)) return false
      if (exportActivityFilter === 'never' && u.last_active_at) return false
      return true
    }).length
  }, [users, exportPlanFilter, exportActivityFilter])

  if (isLoading) return <p className="mt-6 text-sm text-(--color-text-muted)">Chargement...</p>
  if (error) return <p className="mt-6 text-sm text-(--color-danger)">{error}</p>

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-(--color-text-muted)">
          {users.length} utilisateur{users.length !== 1 ? 's' : ''}
        </p>
        {/* E33 — Export buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => exportUsersCsv(users)}
            className="rounded-(--radius-md) border border-(--color-border) px-3 py-1.5 text-xs text-(--color-text-secondary) hover:bg-(--color-bg-subtle)"
          >
            Exporter CSV
          </button>
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="rounded-(--radius-md) border border-(--color-border) px-3 py-1.5 text-xs text-(--color-text-secondary) hover:bg-(--color-bg-subtle)"
          >
            Exporter emails
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-(--color-border) text-left text-xs text-(--color-text-muted)">
              <th className="pb-2">Email</th>
              <th className="pb-2">Inscription</th>
              <th className="pb-2">Plan</th>
              <th className="pb-2">Dernière activité</th>
              <th className="pb-2">Sessions 30j</th>
              <th className="pb-2">Statut</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.user_id}
                className="border-b border-(--color-border) cursor-pointer hover:bg-(--color-bg-subtle)"
                onClick={() => setSelectedUser(u)}
              >
                <td className="py-3">
                  {revealedEmails[u.user_id] ?? u.email_masked}
                  {!revealedEmails[u.user_id] && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); revealEmail(u.user_id) }}
                      className="ml-2 text-xs text-(--color-brand) underline"
                    >
                      Révéler
                    </button>
                  )}
                </td>
                <td className="py-3">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${u.plan === 'pro' ? 'bg-(--color-brand-light) text-(--color-brand)' : 'bg-(--color-bg-subtle) text-(--color-text-muted)'}`}
                  >
                    {u.plan}
                  </span>
                </td>
                <td className="py-3">
                  {u.last_active_at ? new Date(u.last_active_at).toLocaleDateString('fr-FR') : '—'}
                </td>
                <td className="py-3">{u.session_count}</td>
                <td className="py-3">
                  <span className={`text-xs ${u.is_active ? 'text-(--color-success)' : 'text-(--color-danger)'}`}>
                    {u.is_active ? 'Actif' : 'Désactivé'}
                  </span>
                </td>
                <td className="py-3">
                  {confirmAction === u.user_id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleToggleActive(u.user_id, u.is_active) }}
                        className="rounded bg-(--color-danger) px-2 py-1 text-xs text-white"
                      >
                        {u.is_active ? 'Désactiver' : 'Réactiver'}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setConfirmAction(null) }}
                        className="text-xs text-(--color-text-muted)"
                      >
                        Non
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleToggleActive(u.user_id, u.is_active) }}
                      className="text-xs text-(--color-brand) underline"
                    >
                      {u.is_active ? 'Désactiver' : 'Réactiver'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* E31 — User detail drawer */}
      {selectedUser && (
        <UserDrawer
          user={selectedUser}
          revealedEmail={revealedEmails[selectedUser.user_id] ?? null}
          onRevealEmail={() => revealEmail(selectedUser.user_id)}
          onClose={() => setSelectedUser(null)}
          onChangePlan={async (newPlan) => {
            await changePlan(selectedUser.user_id, newPlan)
            setSelectedUser((prev) => prev ? { ...prev, plan: newPlan } : null)
          }}
          onToggleActive={async () => {
            await toggleActive(selectedUser.user_id, selectedUser.is_active)
            setSelectedUser((prev) => prev ? { ...prev, is_active: !prev.is_active } : null)
          }}
          onDelete={async () => {
            await deleteUser(selectedUser.user_id)
            setSelectedUser(null)
          }}
        />
      )}

      {/* E33 — Email export modal */}
      {showExportModal && (
        <>
          <div className="fixed inset-0 z-[90] bg-black/50" onClick={() => setShowExportModal(false)} aria-hidden="true" />
          <div className="fixed left-1/2 top-1/2 z-[91] w-[480px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-(--radius-xl) bg-(--color-bg-elevated) p-6 shadow-2xl">
            <h2 className="text-lg font-semibold">Exporter des emails</h2>

            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="export-plan-filter" className="text-xs font-medium text-(--color-text-muted)">Filtrer par plan</label>
                <select
                  id="export-plan-filter"
                  value={exportPlanFilter}
                  onChange={(e) => setExportPlanFilter(e.target.value)}
                  className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
                >
                  <option value="all">Tous les plans</option>
                  <option value="free">Free uniquement</option>
                  <option value="pro">Pro uniquement</option>
                </select>
              </div>

              <div>
                <label htmlFor="export-activity-filter" className="text-xs font-medium text-(--color-text-muted)">Filtrer par activité</label>
                <select
                  id="export-activity-filter"
                  value={exportActivityFilter}
                  onChange={(e) => setExportActivityFilter(e.target.value)}
                  className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
                >
                  <option value="all">Toutes les activités</option>
                  <option value="active">Actifs (&lt; 30 jours)</option>
                  <option value="inactive">Inactifs (30-90 jours)</option>
                  <option value="dormant">Dormants (&gt; 90 jours)</option>
                  <option value="never">Jamais connectés</option>
                </select>
              </div>
            </div>

            {exportConfirmCount === null ? (
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowExportModal(false)} className="rounded-(--radius-md) px-4 py-2 text-sm text-(--color-text-secondary)">
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => setExportConfirmCount(estimatedExportCount)}
                  className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm font-medium text-white"
                >
                  Continuer
                </button>
              </div>
            ) : (
              <div className="mt-4 rounded-(--radius-md) border border-(--color-warning)/30 bg-(--color-warning)/5 p-3">
                <p className="text-sm text-(--color-text-secondary)">
                  Vous allez exporter environ <strong>{exportConfirmCount}</strong> emails. Cette action sera journalisée.
                </p>
                <div className="mt-3 flex justify-end gap-3">
                  <button type="button" onClick={() => setExportConfirmCount(null)} className="rounded-(--radius-md) px-4 py-2 text-sm text-(--color-text-secondary)">
                    Retour
                  </button>
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={handleExportEmails}
                    className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {isExporting ? 'Export...' : 'Exporter'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}

/* ── Toast notification ────────────────────────────────────── */

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 rounded-(--radius-lg) px-4 py-3 text-sm font-medium shadow-lg ${
        type === 'success'
          ? 'bg-(--color-success) text-white'
          : 'bg-(--color-danger) text-white'
      }`}
    >
      {message}
    </div>
  )
}

/* ── Plans Tab (US-34-01 / 02 / 05) ──────────────────────── */

function PlansTab() {
  const { freePlan, proPlan, isLoading, error, updateFeature } = usePlanConfig()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [copyConfirm, setCopyConfirm] = useState<{ from: string; to: string } | null>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }, [])

  const handleUpdate = useCallback(async (plan: string, key: string, value: string) => {
    try {
      await updateFeature(plan, key, value)
      showToast('Configuration mise à jour', 'success')
    } catch {
      showToast('Erreur lors de la mise à jour', 'error')
    }
  }, [updateFeature, showToast])

  const handleCopyConfig = useCallback(async (from: string, to: string) => {
    const source = from === 'free' ? freePlan : proPlan
    for (const [key, value] of Object.entries(source)) {
      await updateFeature(to, key, value)
    }
    showToast(`Configuration copiée de ${from} vers ${to}`, 'success')
    setCopyConfirm(null)
  }, [freePlan, proPlan, updateFeature, showToast])

  if (isLoading) return <p className="mt-6 text-sm text-(--color-text-muted)">Chargement...</p>
  if (error) return <p className="mt-6 text-sm text-(--color-danger)">{error}</p>

  return (
    <>
      <section className="mt-6">
        <div className="mb-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setCopyConfirm({ from: 'pro', to: 'free' })}
            className="rounded-(--radius-md) border border-(--color-border) px-3 py-1.5 text-xs text-(--color-text-secondary) hover:bg-(--color-bg-subtle)"
          >
            Copier Pro → Free
          </button>
          <button
            type="button"
            onClick={() => setCopyConfirm({ from: 'free', to: 'pro' })}
            className="rounded-(--radius-md) border border-(--color-border) px-3 py-1.5 text-xs text-(--color-text-secondary) hover:bg-(--color-bg-subtle)"
          >
            Copier Free → Pro
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <PlanEditor title="Plan Free" plan="free" features={freePlan} otherFeatures={proPlan} onUpdate={handleUpdate} />
          <PlanEditor title="Plan Pro" plan="pro" features={proPlan} otherFeatures={freePlan} onUpdate={handleUpdate} />
        </div>
      </section>

      {copyConfirm && (
        <>
          <div className="fixed inset-0 z-[90] bg-black/50" onClick={() => setCopyConfirm(null)} aria-hidden="true" />
          <div className="fixed left-1/2 top-1/2 z-[91] w-[420px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-(--radius-xl) bg-(--color-bg-elevated) p-6 shadow-2xl">
            <h2 className="text-lg font-semibold">Confirmer la copie</h2>
            <p className="mt-2 text-sm text-(--color-text-secondary)">
              Copier toute la configuration du plan <strong>{copyConfirm.from}</strong> vers le plan <strong>{copyConfirm.to}</strong> ?
              Les valeurs existantes seront écrasées.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setCopyConfirm(null)} className="rounded-(--radius-md) px-4 py-2 text-sm text-(--color-text-secondary) hover:bg-(--color-bg-subtle)">
                Annuler
              </button>
              <button type="button" onClick={() => handleCopyConfig(copyConfirm.from, copyConfirm.to)} className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm font-medium text-white hover:opacity-90">
                Copier
              </button>
            </div>
          </div>
        </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}

/* ── Plan Editor (US-34-01 / 05) ─────────────────────────── */

function PlanEditor({
  title,
  plan,
  features,
  otherFeatures,
  onUpdate,
}: {
  title: string
  plan: string
  features: PlanFeatures
  otherFeatures: PlanFeatures
  onUpdate: (plan: string, key: string, value: string) => Promise<void>
}) {
  const allKeys = Object.keys(features)
  const grouped = useMemo(() => {
    const params: string[] = []
    const modules: string[] = []
    const other: string[] = []

    for (const key of allKeys) {
      const meta = getFeatureMeta(key)
      if (meta.category === 'parameter') params.push(key)
      else if (meta.category === 'module') modules.push(key)
      else other.push(key)
    }
    return { params, modules, other }
  }, [allKeys])

  const isDiff = (key: string) => features[key] !== otherFeatures[key]

  const renderSection = (sectionTitle: string, keys: string[]) => {
    if (keys.length === 0) return null
    return (
      <div className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">
          {sectionTitle}
        </h3>
        <div className="mt-2 space-y-3">
          {keys.map((key) => {
            const meta = getFeatureMeta(key)
            const diff = isDiff(key)
            const isBoolean = features[key] === 'true' || features[key] === 'false'

            return (
              <div
                key={key}
                className={`rounded-(--radius-md) p-3 ${diff ? 'bg-(--color-warning)/10 ring-1 ring-(--color-warning)/30' : 'bg-(--color-bg-base)'}`}
              >
                {isBoolean ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{meta.label}</p>
                        {diff && (
                          <span className="rounded-full bg-(--color-warning)/20 px-1.5 py-0.5 text-[10px] font-semibold text-(--color-warning)">
                            Différent
                          </span>
                        )}
                      </div>
                      {meta.description && (
                        <p className="mt-0.5 text-xs text-(--color-text-muted)">{meta.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdate(plan, key, features[key] === 'true' ? 'false' : 'true')}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                        features[key] === 'true' ? 'bg-(--color-brand)' : 'bg-(--color-border-strong)'
                      } cursor-pointer`}
                      role="switch"
                      aria-checked={features[key] === 'true'}
                      aria-label={`${features[key] === 'true' ? 'Désactiver' : 'Activer'} ${meta.label}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          features[key] === 'true' ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <label htmlFor={`${plan}-${key}`} className="text-sm font-medium">
                        {meta.label}
                      </label>
                      {diff && (
                        <span className="rounded-full bg-(--color-warning)/20 px-1.5 py-0.5 text-[10px] font-semibold text-(--color-warning)">
                          Différent
                        </span>
                      )}
                    </div>
                    {meta.description && (
                      <p className="mt-0.5 text-xs text-(--color-text-muted)">{meta.description}</p>
                    )}
                    <input
                      id={`${plan}-${key}`}
                      type="number"
                      min={0}
                      value={features[key]}
                      onChange={(e) => onUpdate(plan, key, e.target.value)}
                      className="mt-2 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
      <h2 className="text-sm font-semibold">{title}</h2>
      {renderSection('Paramètres', grouped.params)}
      {renderSection('Modules', grouped.modules)}
      {renderSection('Autres', grouped.other)}
    </div>
  )
}

/* ── E32 — Stats Tab ───────────────────────────────────────── */

const CHART_COLORS = {
  free: '#94a3b8',   // slate-400
  pro: '#6366f1',    // brand/indigo
  total: '#6366f1',
}
const PIE_COLORS = ['#6366f1', '#94a3b8', '#f59e0b', '#10b981', '#ef4444']

function formatMonthLabel(month: string): string {
  const [y, m] = month.split('-')
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  return `${months[parseInt(m ?? '1', 10) - 1]} ${y}`
}

function formatPeriodLabel(period: string, granularity: string): string {
  const d = new Date(period)
  if (granularity === 'day') return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  if (granularity === 'week') return `S${getWeekNumber(d)}`
  return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
}

function getWeekNumber(d: Date): number {
  const onejan = new Date(d.getFullYear(), 0, 1)
  return Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7)
}

function StatsTab() {
  const { stats, signups, activeUsers, distribution, granularity, setGranularity, isLoading, error } = useStats()

  if (isLoading) return <p className="mt-6 text-sm text-(--color-text-muted)">Chargement...</p>
  if (error) return <p className="mt-6 text-sm text-(--color-danger)">{error}</p>
  if (!stats) return null

  const signupData = signups.map(s => ({
    ...s,
    label: formatMonthLabel(s.month),
  }))

  const activeData = activeUsers.map(a => ({
    ...a,
    label: formatPeriodLabel(a.period, granularity),
  }))

  const pieData = distribution?.distribution?.map(d => ({
    name: d.plan,
    value: d.count,
  })) ?? []

  const totalUsers = pieData.reduce((sum, d) => sum + d.value, 0)

  return (
    <section className="mt-6 space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Total utilisateurs" value={stats.total_users} />
        <KpiCard label="Actifs (30j)" value={stats.active_30d} />
        <KpiCard label="Nouveaux ce mois" value={stats.new_this_month} />
        <KpiCard label="Ratio Free / Pro" value={`${stats.free_count} / ${stats.pro_count}`} />
      </div>

      {/* US-32-02 + US-32-04 — Signups chart (stacked bars) */}
      <div className="rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
        <h3 className="text-sm font-semibold">Nouvelles inscriptions par mois</h3>
        <div className="mt-4 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={signupData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="free_count" name="Free" stackId="a" fill={CHART_COLORS.free} />
              <Bar dataKey="pro_count" name="Pro" stackId="a" fill={CHART_COLORS.pro} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* US-32-03 + US-32-04 — Active users chart (lines) */}
      <div className="rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Utilisateurs actifs</h3>
          <div className="flex gap-1 rounded-(--radius-md) bg-(--color-bg-base) p-0.5">
            {(['day', 'week', 'month'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGranularity(g)}
                className={`rounded-(--radius-sm) px-3 py-1 text-xs font-medium transition-colors ${granularity === g ? 'bg-(--color-brand) text-white' : 'text-(--color-text-muted)'}`}
              >
                {g === 'day' ? 'Jour' : g === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="free_count" name="Free" stroke={CHART_COLORS.free} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="pro_count" name="Pro" stroke={CHART_COLORS.pro} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* US-32-05 — Subscription distribution (pie) */}
      <div className="rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
        <h3 className="text-sm font-semibold">Répartition des abonnements</h3>
        <div className="mt-4 flex items-center gap-8">
          <div className="h-[250px] w-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length] as string} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} utilisateur${Number(value) > 1 ? 's' : ''}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {pieData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-sm font-medium">{entry.name}</span>
                <span className="text-sm text-(--color-text-muted)">
                  {entry.value} ({totalUsers > 0 ? ((entry.value / totalUsers) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            ))}
            <div className="mt-4 space-y-1 border-t border-(--color-border) pt-3">
              <p className="text-xs text-(--color-text-muted)">
                Taux de conversion : <strong className="text-(--color-text-primary)">{distribution?.conversion_rate ?? 0}%</strong>
              </p>
              <p className="text-xs text-(--color-text-muted)">
                Conversions (30j) : <strong className="text-(--color-text-primary)">{distribution?.pro_change_30d ?? 0}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-(--radius-xl) bg-(--color-bg-elevated) p-5">
      <p className="text-xs text-(--color-text-muted)">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  )
}

/* ── Log Tab ───────────────────────────────────────────────── */

function LogTab() {
  const { entries, isLoading, error } = useAuditLog()
  const [filter, setFilter] = useState('')

  const filtered = useMemo(() => {
    if (!filter) return entries
    return entries.filter(
      (e) => e.action.includes(filter) || (e.target_id ?? '').includes(filter),
    )
  }, [entries, filter])

  if (isLoading) return <p className="mt-6 text-sm text-(--color-text-muted)">Chargement...</p>
  if (error) return <p className="mt-6 text-sm text-(--color-danger)">{error}</p>

  return (
    <section className="mt-6">
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filtrer par action ou cible..."
        className="w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm"
      />
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-(--color-border) text-left text-xs text-(--color-text-muted)">
            <th className="pb-2">Date</th>
            <th className="pb-2">Admin</th>
            <th className="pb-2">Action</th>
            <th className="pb-2">Cible</th>
            <th className="pb-2">Détails</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((e) => (
            <tr key={e.id} className="border-b border-(--color-border)">
              <td className="py-2 text-xs">
                {new Date(e.created_at).toLocaleString('fr-FR')}
              </td>
              <td className="py-2 text-xs">{e.admin_id.slice(0, 8)}...</td>
              <td className="py-2 text-xs font-medium">{e.action}</td>
              <td className="py-2 text-xs">{e.target_id?.slice(0, 8) ?? '—'}</td>
              <td className="py-2 text-xs text-(--color-text-muted)">
                {e.old_value && `${e.old_value} → `}{e.new_value}
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={5} className="py-4 text-center text-xs text-(--color-text-muted)">
                Aucune entrée dans le journal
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  )
}

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
