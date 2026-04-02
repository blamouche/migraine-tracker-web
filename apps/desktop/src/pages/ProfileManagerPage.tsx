import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useProfileStore } from '@/stores/profileStore'
import { PLAN_LABELS, PROFILE_COLORS } from '@/types/profile'

export function ProfileManagerPage() {
  const navigate = useNavigate()
  const { profiles, activeProfileId, createProfile, deleteProfile, switchProfile } = useProfileStore()

  const [showCreate, setShowCreate] = useState(false)
  const [newNom, setNewNom] = useState('')
  const [newCouleur, setNewCouleur] = useState(PROFILE_COLORS[0]!)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [switchConfirm, setSwitchConfirm] = useState<string | null>(null)

  const handleCreate = () => {
    if (!newNom.trim()) return
    createProfile({ nom: newNom.trim(), couleur: newCouleur, vaultPath: null, plan: 'free' })
    setNewNom('')
    setShowCreate(false)
  }

  const handleSwitch = (profileId: string) => {
    switchProfile(profileId)
    setSwitchConfirm(null)
    // Force reload to switch vault context
    window.location.href = '/'
  }

  const handleDelete = (profileId: string) => {
    deleteProfile(profileId)
    setDeleteConfirm(null)
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Gestion des profils</h1>
          <button type="button" onClick={() => navigate('/')} className="text-sm text-(--color-text-muted) hover:text-(--color-text-primary)">Retour</button>
        </div>

        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Chaque profil dispose de son propre vault avec des données totalement isolées.
        </p>

        {/* Profile list */}
        <ul className="mt-6 space-y-3">
          {profiles.map((profile) => (
            <li key={profile.id} className={`rounded-(--radius-lg) border p-4 ${profile.id === activeProfileId ? 'border-(--color-brand) bg-(--color-brand-light)' : 'border-(--color-border) bg-(--color-bg-elevated)'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: profile.couleur }}>
                    {profile.nom.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{profile.nom}</p>
                    <p className="text-xs text-(--color-text-muted)">
                      {PLAN_LABELS[profile.plan]}
                      {profile.id === activeProfileId && ' · Actif'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {profile.id !== activeProfileId && (
                    <>
                      {switchConfirm === profile.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs">Basculer ?</span>
                          <button type="button" onClick={() => handleSwitch(profile.id)} className="rounded-(--radius-md) bg-(--color-brand) px-3 py-1.5 text-xs text-(--color-text-inverse)">Oui</button>
                          <button type="button" onClick={() => setSwitchConfirm(null)} className="text-xs text-(--color-text-muted)">Non</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setSwitchConfirm(profile.id)} className="rounded-(--radius-md) border border-(--color-brand) px-3 py-1.5 text-xs text-(--color-brand)">Basculer</button>
                      )}
                    </>
                  )}
                  {deleteConfirm === profile.id ? (
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => handleDelete(profile.id)} className="rounded-(--radius-md) bg-(--color-danger) px-3 py-1.5 text-xs text-white">Supprimer</button>
                      <button type="button" onClick={() => setDeleteConfirm(null)} className="text-xs text-(--color-text-muted)">Non</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setDeleteConfirm(profile.id)} className="text-xs text-(--color-danger)">Supprimer</button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {profiles.length === 0 && (
          <p className="mt-6 text-center text-sm text-(--color-text-secondary)">
            Aucun profil créé. Créez votre premier profil ci-dessous.
          </p>
        )}

        {/* Create new profile */}
        {showCreate ? (
          <div className="mt-6 rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg-elevated) p-4">
            <h2 className="text-sm font-semibold">Nouveau profil</h2>
            <div className="mt-3 space-y-3">
              <div>
                <label htmlFor="profile-nom" className="text-sm font-medium">Nom du profil *</label>
                <input id="profile-nom" type="text" value={newNom} onChange={(e) => setNewNom(e.target.value)} placeholder="Ex : Mon fils, Ma mère…" className="mt-1 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-3 py-2 text-sm" />
              </div>
              <div>
                <span className="text-sm font-medium">Couleur</span>
                <div className="mt-2 flex gap-2">
                  {PROFILE_COLORS.map((color) => (
                    <button key={color} type="button" onClick={() => setNewCouleur(color)} className={`h-8 w-8 rounded-full border-2 ${newCouleur === color ? 'border-white ring-2 ring-(--color-brand)' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleCreate} disabled={!newNom.trim()} className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm text-(--color-text-inverse) disabled:opacity-50">Créer</button>
                <button type="button" onClick={() => setShowCreate(false)} className="text-sm text-(--color-text-muted)">Annuler</button>
              </div>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setShowCreate(true)} className="mt-6 w-full rounded-(--radius-md) border border-dashed border-(--color-border) py-3 text-sm text-(--color-text-muted) hover:border-(--color-brand) hover:text-(--color-brand)">
            + Créer un nouveau profil
          </button>
        )}

        <p className="mt-4 text-xs text-(--color-text-muted)">
          Raccourci : Cmd/Ctrl + P pour basculer rapidement entre profils.
        </p>
      </div>
    </main>
  )
}
