import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import './styles/globals.css'

import { StrictMode, useState, useMemo } from 'react'
import { createRoot } from 'react-dom/client'

// Admin panel — admin.migraine-ai.app
// E21: User management, feature flags, audit log

type Tab = 'users' | 'plans' | 'log'

interface MockUser {
  id: string
  email: string
  registeredAt: string
  plan: 'free' | 'pro'
  lastLogin: string
  profiles: number
  isActive: boolean
  frequency30d: number
}

interface LogEntry {
  id: string
  date: string
  admin: string
  action: string
  target: string
  details: string
}

const MOCK_USERS: MockUser[] = [
  { id: '1', email: 'a***@gmail.com', registeredAt: '2025-06-15', plan: 'pro', lastLogin: '2026-04-01', profiles: 2, isActive: true, frequency30d: 25 },
  { id: '2', email: 'b***@outlook.com', registeredAt: '2025-09-01', plan: 'free', lastLogin: '2026-03-28', profiles: 1, isActive: true, frequency30d: 12 },
  { id: '3', email: 'c***@yahoo.fr', registeredAt: '2026-01-10', plan: 'free', lastLogin: '2026-02-15', profiles: 1, isActive: false, frequency30d: 0 },
]

const MOCK_LOG: LogEntry[] = [
  { id: '1', date: '2026-04-02T10:30:00Z', admin: 'admin@migraine-ai.app', action: 'disable_account', target: 'c***@yahoo.fr', details: 'Compte désactivé — inactivité' },
  { id: '2', date: '2026-04-01T15:00:00Z', admin: 'admin@migraine-ai.app', action: 'update_plan_config', target: 'free', details: 'analytics_range_months: 3 → 6' },
]

interface PlanConfig {
  analyticsRangeMonths: number
  iaModule: boolean
  exportPdf: boolean
  voiceInput: boolean
  maxProfiles: number
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [tab, setTab] = useState<Tab>('users')
  const [users, setUsers] = useState(MOCK_USERS)
  const [auditLog] = useState(MOCK_LOG)
  const [confirmAction, setConfirmAction] = useState<string | null>(null)

  const [freePlan, setFreePlan] = useState<PlanConfig>({ analyticsRangeMonths: 3, iaModule: false, exportPdf: true, voiceInput: true, maxProfiles: 3 })
  const [proPlan, setProPlan] = useState<PlanConfig>({ analyticsRangeMonths: 999, iaModule: true, exportPdf: true, voiceInput: true, maxProfiles: 10 })

  const [logFilter, setLogFilter] = useState('')

  const filteredLog = useMemo(() => {
    if (!logFilter) return auditLog
    return auditLog.filter((e) => e.action.includes(logFilter) || e.target.includes(logFilter))
  }, [auditLog, logFilter])

  const handleToggleActive = (userId: string) => {
    if (confirmAction !== userId) { setConfirmAction(userId); return }
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isActive: !u.isActive } : u))
    setConfirmAction(null)
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-(--color-bg-base) flex items-center justify-center p-8">
        <div className="text-center text-(--color-text-primary)">
          <h1 className="text-2xl font-semibold">Migraine AI — Admin</h1>
          <p className="mt-2 text-sm text-(--color-text-secondary)">Connexion requise (Supabase Auth + rôle admin)</p>
          <button type="button" onClick={() => setIsAuthenticated(true)} className="mt-6 rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-semibold text-(--color-text-inverse)">
            Se connecter (simulation)
          </button>
          <p className="mt-3 text-xs text-(--color-text-muted)">Session timeout : 15 min d'inactivité</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-[1200px] px-8 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Migraine AI — Administration</h1>
          <button type="button" onClick={() => setIsAuthenticated(false)} className="text-sm text-(--color-text-muted) underline">Déconnexion</button>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 rounded-(--radius-lg) bg-(--color-bg-elevated) p-1">
          {(['users', 'plans', 'log'] as Tab[]).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`flex-1 rounded-(--radius-md) py-2 text-sm font-medium transition-colors ${tab === t ? 'bg-(--color-brand) text-(--color-text-inverse)' : 'text-(--color-text-secondary) hover:text-(--color-text-primary)'}`}>
              {t === 'users' ? 'Utilisateurs' : t === 'plans' ? 'Plans' : 'Journal'}
            </button>
          ))}
        </div>

        {/* Users tab */}
        {tab === 'users' && (
          <section className="mt-6">
            <p className="text-xs text-(--color-text-muted)">{users.length} utilisateur{users.length !== 1 ? 's' : ''}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-(--color-border) text-left text-xs text-(--color-text-muted)">
                    <th className="pb-2">Email</th><th className="pb-2">Inscription</th><th className="pb-2">Plan</th><th className="pb-2">Dernière connexion</th><th className="pb-2">Fréquence 30j</th><th className="pb-2">Profils</th><th className="pb-2">Statut</th><th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-(--color-border)">
                      <td className="py-3">{u.email}</td>
                      <td className="py-3">{u.registeredAt}</td>
                      <td className="py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${u.plan === 'pro' ? 'bg-(--color-brand-light) text-(--color-brand)' : 'bg-(--color-bg-subtle) text-(--color-text-muted)'}`}>{u.plan}</span></td>
                      <td className="py-3">{u.lastLogin}</td>
                      <td className="py-3">{u.frequency30d}</td>
                      <td className="py-3">{u.profiles}</td>
                      <td className="py-3"><span className={`text-xs ${u.isActive ? 'text-(--color-success)' : 'text-(--color-danger)'}`}>{u.isActive ? 'Actif' : 'Désactivé'}</span></td>
                      <td className="py-3">
                        {confirmAction === u.id ? (
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => handleToggleActive(u.id)} className="rounded px-2 py-1 text-xs bg-(--color-danger) text-white">{u.isActive ? 'Désactiver' : 'Réactiver'}</button>
                            <button type="button" onClick={() => setConfirmAction(null)} className="text-xs text-(--color-text-muted)">Non</button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => handleToggleActive(u.id)} className="text-xs text-(--color-brand) underline">{u.isActive ? 'Désactiver' : 'Réactiver'}</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Plans tab */}
        {tab === 'plans' && (
          <section className="mt-6 grid grid-cols-2 gap-6">
            <PlanEditor title="Plan Free" config={freePlan} onChange={setFreePlan} />
            <PlanEditor title="Plan Pro" config={proPlan} onChange={setProPlan} />
          </section>
        )}

        {/* Log tab */}
        {tab === 'log' && (
          <section className="mt-6">
            <input type="text" value={logFilter} onChange={(e) => setLogFilter(e.target.value)} placeholder="Filtrer par action ou cible…" className="w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 text-sm" />
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-(--color-border) text-left text-xs text-(--color-text-muted)">
                  <th className="pb-2">Date</th><th className="pb-2">Admin</th><th className="pb-2">Action</th><th className="pb-2">Cible</th><th className="pb-2">Détails</th>
                </tr>
              </thead>
              <tbody>
                {filteredLog.map((e) => (
                  <tr key={e.id} className="border-b border-(--color-border)">
                    <td className="py-2 text-xs">{new Date(e.date).toLocaleString('fr-FR')}</td>
                    <td className="py-2 text-xs">{e.admin}</td>
                    <td className="py-2 text-xs font-medium">{e.action}</td>
                    <td className="py-2 text-xs">{e.target}</td>
                    <td className="py-2 text-xs text-(--color-text-muted)">{e.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </main>
  )
}

function PlanEditor({ title, config, onChange }: { title: string; config: PlanConfig; onChange: (c: PlanConfig) => void }) {
  return (
    <div className="rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor={`${title}-range`} className="text-xs text-(--color-text-muted)">Durée d'analyse (mois)</label>
          <input id={`${title}-range`} type="number" min={1} max={999} value={config.analyticsRangeMonths} onChange={(e) => onChange({ ...config, analyticsRangeMonths: parseInt(e.target.value) || 3 })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={config.iaModule} onChange={(e) => onChange({ ...config, iaModule: e.target.checked })} className="rounded" />Module IA</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={config.exportPdf} onChange={(e) => onChange({ ...config, exportPdf: e.target.checked })} className="rounded" />Export PDF</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={config.voiceInput} onChange={(e) => onChange({ ...config, voiceInput: e.target.checked })} className="rounded" />Saisie vocale</label>
        <div>
          <label htmlFor={`${title}-profiles`} className="text-xs text-(--color-text-muted)">Max profils</label>
          <input id={`${title}-profiles`} type="number" min={1} max={50} value={config.maxProfiles} onChange={(e) => onChange({ ...config, maxProfiles: parseInt(e.target.value) || 1 })} className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-3 py-2 text-sm" />
        </div>
      </div>
    </div>
  )
}

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
