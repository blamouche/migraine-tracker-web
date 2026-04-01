import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '@/lib/supabase'
import { removeAnonymousId, getAnonymousId } from '@/lib/anonymous'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      try {
        const { data, error: authError } = await supabase.auth.getSession()

        if (authError) {
          setError('Ce lien de connexion a expiré. Demandez-en un nouveau.')
          return
        }

        if (data.session) {
          // Merge anonymous ID if exists
          const anonId = await getAnonymousId()
          if (anonId) {
            try {
              await supabase.rpc('merge_anonymous_id', {
                p_anonymous_id: anonId,
                p_user_id: data.session.user.id,
              })
            } catch {
              // Non-blocking: merge failure doesn't prevent login
            }
            await removeAnonymousId()
          }

          navigate('/onboarding/consent', { replace: true })
        } else {
          setError('Ce lien de connexion a expiré. Demandez-en un nouveau.')
        }
      } catch {
        setError('Une erreur est survenue. Veuillez réessayer.')
      }
    }

    handleCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--color-bg-base) px-4">
        <div className="w-full max-w-[400px] rounded-(--radius-xl) bg-(--color-bg-elevated) p-8 text-center shadow-lg">
          <div className="mb-4 rounded-(--radius-md) bg-(--color-danger-light) px-4 py-3 text-sm text-(--color-danger)">
            {error}
          </div>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover)"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--color-bg-base)">
      <p className="text-sm text-(--color-text-secondary)">Connexion en cours...</p>
    </div>
  )
}
