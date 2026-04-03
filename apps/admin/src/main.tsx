import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import './styles/globals.css'

import { StrictMode, useState, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useUsers } from '@/hooks/useUsers'
import { usePlanConfig } from '@/hooks/usePlanConfig'
import { useAuditLog } from '@/hooks/useAuditLog'
import type { PlanFeatures } from '@/hooks/usePlanConfig'

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

function PlansTab() {
  const { freePlan, proPlan, isLoading, error, updateFeature } = usePlanConfig()

  if (isLoading) return <p className="mt-6 text-sm text-(--color-text-muted)">Chargement...</p>
  if (error) return <p className="mt-6 text-sm text-(--color-danger)">{error}</p>

  return (
    <section className="mt-6 grid grid-cols-2 gap-6">
      <PlanEditor title="Plan Free" plan="free" features={freePlan} onUpdate={updateFeature} />
      <PlanEditor title="Plan Pro" plan="pro" features={proPlan} onUpdate={updateFeature} />
    </section>
  )
}

function PlanEditor({
  title,
  plan,
  features,
  onUpdate,
}: {
  title: string
  plan: string
  features: PlanFeatures
  onUpdate: (plan: string, key: string, value: string) => Promise<void>
}) {
  const booleanKeys = Object.keys(features).filter(
    (k) => features[k] === 'true' || features[k] === 'false',
  )
  const numberKeys = Object.keys(features).filter(
    (k) => features[k] !== 'true' && features[k] !== 'false',
  )

  return (
    <div className="rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">
        {numberKeys.map((key) => (
          <div key={key}>
            <label htmlFor={`${plan}-${key}`} className="text-xs text-(--color-text-muted)">
              {key}
            </label>
            <input
              id={`${plan}-${key}`}
              type="number"
              min={0}
              value={features[key]}
              onChange={(e) => onUpdate(plan, key, e.target.value)}
              className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-3 py-2 text-sm"
            />
          </div>
        ))}
        {booleanKeys.map((key) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={features[key] === 'true'}
              onChange={(e) => onUpdate(plan, key, e.target.checked ? 'true' : 'false')}
              className="rounded"
            />
            {key}
          </label>
        ))}
      </div>
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
