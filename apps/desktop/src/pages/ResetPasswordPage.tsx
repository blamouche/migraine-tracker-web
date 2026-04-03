import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/authStore'

const resetSchema = z
  .object({
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type ResetForm = z.infer<typeof resetSchema>

export function ResetPasswordPage() {
  const [success, setSuccess] = useState(false)
  const { updatePassword, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const form = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  })

  const handleSubmit = async (data: ResetForm) => {
    clearError()
    const ok = await updatePassword(data.password)
    if (ok) {
      setSuccess(true)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base) px-4">
      <div className="w-full max-w-[400px] rounded-(--radius-xl) bg-(--color-bg-elevated) p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-(--color-text-primary)">
            Réinitialiser le mot de passe
          </h1>
          <p className="mt-2 text-sm text-(--color-text-secondary)">
            Choisissez un nouveau mot de passe pour votre compte.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-(--radius-md) bg-(--color-danger-light) px-4 py-3 text-sm text-(--color-danger)">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="mb-4 rounded-(--radius-md) bg-(--color-success-light) px-4 py-3 text-sm text-(--color-success)">
              <p className="font-medium">Mot de passe modifié !</p>
              <p className="mt-1">Votre mot de passe a été mis à jour avec succès.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="rounded-(--radius-md) bg-(--color-brand) px-6 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover)"
            >
              Se connecter
            </button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="rp-password"
                className="mb-1 block text-sm font-medium text-(--color-text-primary)"
              >
                Nouveau mot de passe
              </label>
              <input
                id="rp-password"
                type="password"
                autoComplete="new-password"
                placeholder="8 caractères minimum"
                {...form.register('password')}
                className="w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-4 py-3 text-sm text-(--color-text-primary) outline-none transition-colors focus:border-(--color-brand) placeholder:text-(--color-text-muted)"
              />
              {form.formState.errors.password && (
                <p className="mt-1 text-sm text-(--color-danger)">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="rp-confirm"
                className="mb-1 block text-sm font-medium text-(--color-text-primary)"
              >
                Confirmer le mot de passe
              </label>
              <input
                id="rp-confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Confirmez votre mot de passe"
                {...form.register('confirmPassword')}
                className="w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-4 py-3 text-sm text-(--color-text-primary) outline-none transition-colors focus:border-(--color-brand) placeholder:text-(--color-text-muted)"
              />
              {form.formState.errors.confirmPassword && (
                <p className="mt-1 text-sm text-(--color-danger)">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full rounded-(--radius-md) bg-(--color-brand) px-4 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover) disabled:opacity-50"
            >
              {form.formState.isSubmitting ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
