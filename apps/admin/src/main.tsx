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
import type { PlanFeatures } from '@/hooks/usePlanConfig'
import { getFeatureMeta } from '@/lib/featureMetadata'
import type { FeatureCategory } from '@/lib/featureMetadata'

type Tab = 'users' | 'plans' | 'log'

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
          {(['users', 'plans', 'log'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-(--radius-md) py-2 text-sm font-medium transition-colors ${tab === t ? 'bg-(--color-brand) text-(--color-text-inverse)' : 'text-(--color-text-secondary) hover:text-(--color-text-primary)'}`}
            >
              {t === 'users' ? 'Utilisateurs' : t === 'plans' ? 'Plans' : 'Journal'}
            </button>
          ))}
        </div>

        {tab === 'users' && <UsersTab />}
        {tab === 'plans' && <PlansTab />}
        {tab === 'log' && <LogTab />}
      </div>
    </main>
  )
}

function UsersTab() {
  const { users, isLoading, error, toggleActive, revealEmail, revealedEmails } = useUsers()
  const [confirmAction, setConfirmAction] = useState<string | null>(null)

  const handleToggleActive = async (userId: string, currentlyActive: boolean) => {
    if (confirmAction !== userId) {
      setConfirmAction(userId)
      return
    }
    await toggleActive(userId, currentlyActive)
    setConfirmAction(null)
  }

  if (isLoading) return <p className="mt-6 text-sm text-(--color-text-muted)">Chargement...</p>
  if (error) return <p className="mt-6 text-sm text-(--color-danger)">{error}</p>

  return (
    <section className="mt-6">
      <p className="text-xs text-(--color-text-muted)">
        {users.length} utilisateur{users.length !== 1 ? 's' : ''}
      </p>
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
              <tr key={u.user_id} className="border-b border-(--color-border)">
                <td className="py-3">
                  {revealedEmails[u.user_id] ?? u.email_masked}
                  {!revealedEmails[u.user_id] && (
                    <button
                      type="button"
                      onClick={() => revealEmail(u.user_id)}
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
                        onClick={() => handleToggleActive(u.user_id, u.is_active)}
                        className="rounded bg-(--color-danger) px-2 py-1 text-xs text-white"
                      >
                        {u.is_active ? 'Désactiver' : 'Réactiver'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmAction(null)}
                        className="text-xs text-(--color-text-muted)"
                      >
                        Non
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleActive(u.user_id, u.is_active)}
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

  /** US-34-02 — update with toast + rollback on error */
  const handleUpdate = useCallback(async (plan: string, key: string, value: string) => {
    try {
      await updateFeature(plan, key, value)
      showToast('Configuration mise à jour', 'success')
    } catch {
      showToast('Erreur lors de la mise à jour', 'error')
    }
  }, [updateFeature, showToast])

  /** US-34-05 — copy all features from one plan to another */
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
        {/* US-34-05 — copy buttons */}
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

      {/* Copy confirmation modal */}
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
  // Organize keys into categories using metadata
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

  const renderSection = (sectionTitle: string, keys: string[], category: FeatureCategory) => {
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
      {renderSection('Paramètres', grouped.params, 'parameter')}
      {renderSection('Modules', grouped.modules, 'module')}
      {renderSection('Autres', grouped.other, 'parameter')}
    </div>
  )
}

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
