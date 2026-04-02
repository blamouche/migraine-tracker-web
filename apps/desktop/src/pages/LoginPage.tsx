import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/authStore'

type AuthTab = 'magic-link' | 'password'
type PasswordMode = 'login' | 'signup'

const emailSchema = z.object({
  email: z.string().email('Adresse email invalide'),
})

const passwordSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

type EmailForm = z.infer<typeof emailSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export function LoginPage() {
  const [tab, setTab] = useState<AuthTab>('magic-link')
  const [passwordMode, setPasswordMode] = useState<PasswordMode>('login')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const {
    signInWithProvider,
    signInWithMagicLink,
    signUp,
    signIn,
    resetPassword,
    error,
    clearError,
    user,
    isLoading,
  } = useAuthStore()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/', { replace: true })
    }
  }, [user, isLoading, navigate])

  const magicLinkForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    clearError()
    await signInWithProvider(provider)
  }

  const handleMagicLink = async (data: EmailForm) => {
    clearError()
    await signInWithMagicLink(data.email)
    if (!useAuthStore.getState().error) {
      setMagicLinkSent(true)
    }
  }

  const handlePassword = async (data: PasswordForm) => {
    clearError()
    if (passwordMode === 'signup') {
      await signUp(data.email, data.password)
      if (!useAuthStore.getState().error) {
        setSignupSuccess(true)
      }
    } else {
      await signIn(data.email, data.password)
    }
  }

  const handleResetPassword = async () => {
    const email = passwordForm.getValues('email')
    if (!email) {
      passwordForm.setError('email', { message: 'Saisissez votre email pour réinitialiser' })
      return
    }
    clearError()
    await resetPassword(email)
    if (!useAuthStore.getState().error) {
      setResetSent(true)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base) px-4">
      <div className="w-full max-w-[400px] rounded-(--radius-xl) bg-(--color-bg-elevated) p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-(--color-text-primary)">Migraine AI</h1>
          <p className="mt-2 text-sm text-(--color-text-secondary)">
            Connectez-vous pour commencer à suivre vos migraines
          </p>
        </div>

        {/* Google login */}
        <button
          type="button"
          onClick={() => handleSocialLogin('google')}
          className="flex w-full items-center justify-center gap-3 rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-4 py-3 text-sm font-medium text-(--color-text-primary) transition-colors hover:bg-(--color-bg-subtle)"
        >
          <GoogleIcon />
          Continuer avec Google
        </button>

        {/* Separator */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-(--color-border)" />
          <span className="text-sm text-(--color-text-muted)">ou</span>
          <div className="h-px flex-1 bg-(--color-border)" />
        </div>

        {/* Tabs */}
        <div className="mb-4 flex rounded-(--radius-md) border border-(--color-border)">
          <button
            type="button"
            onClick={() => {
              setTab('magic-link')
              clearError()
            }}
            className={`flex-1 rounded-l-(--radius-md) px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'magic-link'
                ? 'bg-(--color-brand) text-(--color-text-inverse)'
                : 'text-(--color-text-secondary) hover:bg-(--color-bg-subtle)'
            }`}
          >
            Magic link
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('password')
              clearError()
            }}
            className={`flex-1 rounded-r-(--radius-md) px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'password'
                ? 'bg-(--color-brand) text-(--color-text-inverse)'
                : 'text-(--color-text-secondary) hover:bg-(--color-bg-subtle)'
            }`}
          >
            Mot de passe
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-(--radius-md) bg-(--color-danger-light) px-4 py-3 text-sm text-(--color-danger)">
            {error}
          </div>
        )}

        {/* Magic link form */}
        {tab === 'magic-link' && (
          <>
            {magicLinkSent ? (
              <div className="rounded-(--radius-md) bg-(--color-success-light) px-4 py-3 text-sm text-(--color-success)">
                <p className="font-medium">Lien envoyé !</p>
                <p className="mt-1">
                  Vérifiez votre boîte mail et cliquez sur le lien pour vous connecter. Le lien est
                  valide 15 minutes.
                </p>
                <button
                  type="button"
                  onClick={() => setMagicLinkSent(false)}
                  className="mt-2 text-sm font-medium underline"
                >
                  Renvoyer le lien
                </button>
              </div>
            ) : (
              <form
                onSubmit={magicLinkForm.handleSubmit(handleMagicLink)}
                className="flex flex-col gap-4"
              >
                <div>
                  <label
                    htmlFor="ml-email"
                    className="mb-1 block text-sm font-medium text-(--color-text-primary)"
                  >
                    Email
                  </label>
                  <input
                    id="ml-email"
                    type="email"
                    autoComplete="email"
                    placeholder="vous@exemple.com"
                    {...magicLinkForm.register('email')}
                    className="w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-4 py-3 text-sm text-(--color-text-primary) outline-none transition-colors focus:border-(--color-brand) placeholder:text-(--color-text-muted)"
                  />
                  {magicLinkForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-(--color-danger)">
                      {magicLinkForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={magicLinkForm.formState.isSubmitting}
                  className="w-full rounded-(--radius-md) bg-(--color-brand) px-4 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover) disabled:opacity-50"
                >
                  {magicLinkForm.formState.isSubmitting
                    ? 'Envoi en cours...'
                    : 'Envoyer le lien de connexion'}
                </button>
              </form>
            )}
          </>
        )}

        {/* Password form */}
        {tab === 'password' && (
          <>
            {signupSuccess ? (
              <div className="rounded-(--radius-md) bg-(--color-success-light) px-4 py-3 text-sm text-(--color-success)">
                <p className="font-medium">Compte créé !</p>
                <p className="mt-1">
                  Un email de confirmation a été envoyé. Cliquez sur le lien pour activer votre
                  compte.
                </p>
              </div>
            ) : resetSent ? (
              <div className="rounded-(--radius-md) bg-(--color-success-light) px-4 py-3 text-sm text-(--color-success)">
                <p className="font-medium">Email envoyé !</p>
                <p className="mt-1">
                  Vérifiez votre boîte mail pour réinitialiser votre mot de passe.
                </p>
                <button
                  type="button"
                  onClick={() => setResetSent(false)}
                  className="mt-2 text-sm font-medium underline"
                >
                  Retour
                </button>
              </div>
            ) : (
              <form
                onSubmit={passwordForm.handleSubmit(handlePassword)}
                className="flex flex-col gap-4"
              >
                <div>
                  <label
                    htmlFor="pw-email"
                    className="mb-1 block text-sm font-medium text-(--color-text-primary)"
                  >
                    Email
                  </label>
                  <input
                    id="pw-email"
                    type="email"
                    autoComplete="email"
                    placeholder="vous@exemple.com"
                    {...passwordForm.register('email')}
                    className="w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-4 py-3 text-sm text-(--color-text-primary) outline-none transition-colors focus:border-(--color-brand) placeholder:text-(--color-text-muted)"
                  />
                  {passwordForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-(--color-danger)">
                      {passwordForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="pw-password"
                    className="mb-1 block text-sm font-medium text-(--color-text-primary)"
                  >
                    Mot de passe
                  </label>
                  <input
                    id="pw-password"
                    type="password"
                    autoComplete={passwordMode === 'signup' ? 'new-password' : 'current-password'}
                    placeholder="8 caractères minimum"
                    {...passwordForm.register('password')}
                    className="w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-4 py-3 text-sm text-(--color-text-primary) outline-none transition-colors focus:border-(--color-brand) placeholder:text-(--color-text-muted)"
                  />
                  {passwordForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-(--color-danger)">
                      {passwordForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={passwordForm.formState.isSubmitting}
                  className="w-full rounded-(--radius-md) bg-(--color-brand) px-4 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover) disabled:opacity-50"
                >
                  {passwordForm.formState.isSubmitting
                    ? 'Chargement...'
                    : passwordMode === 'signup'
                      ? 'Créer mon compte'
                      : 'Se connecter'}
                </button>
                <div className="flex items-center justify-between text-sm">
                  {passwordMode === 'login' ? (
                    <>
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        className="text-(--color-text-secondary) underline hover:text-(--color-text-primary)"
                      >
                        Mot de passe oublié ?
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPasswordMode('signup')
                          clearError()
                        }}
                        className="font-medium text-(--color-brand) hover:text-(--color-brand-hover)"
                      >
                        Créer un compte
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordMode('login')
                        clearError()
                      }}
                      className="font-medium text-(--color-brand) hover:text-(--color-brand-hover)"
                    >
                      Déjà un compte ? Se connecter
                    </button>
                  )}
                </div>
              </form>
            )}
          </>
        )}

        {/* Info */}
        <p className="mt-6 text-center text-xs text-(--color-text-muted)">
          Un compte est requis pour utiliser Migraine AI.
        </p>
      </div>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  )
}

