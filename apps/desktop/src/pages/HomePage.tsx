import { useAuthStore } from '@/stores/authStore'

export function HomePage() {
  const { user, isAnonymous, signOut } = useAuthStore()

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-[1200px] px-8 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Migraine AI</h1>
          {user && (
            <button
              type="button"
              onClick={() => signOut()}
              className="text-sm text-(--color-text-secondary) underline hover:text-(--color-text-primary)"
            >
              Déconnexion
            </button>
          )}
        </div>

        <div className="mt-8">
          {isAnonymous && (
            <div className="mb-6 rounded-(--radius-md) bg-(--color-warning-light) px-4 py-3 text-sm text-(--color-warning)">
              Vous utilisez Migraine AI sans compte. Créez un compte pour sauvegarder vos
              préférences et accéder aux fonctionnalités Pro.
            </div>
          )}

          <div className="rounded-(--radius-xl) bg-(--color-bg-elevated) p-8 text-center">
            <p className="text-lg font-medium">Bienvenue sur Migraine AI</p>
            <p className="mt-2 text-sm text-(--color-text-secondary)">
              Commencez par enregistrer votre première crise pour construire votre historique.
            </p>
            <button
              type="button"
              className="mt-6 rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover)"
            >
              Enregistrer ma première crise
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
