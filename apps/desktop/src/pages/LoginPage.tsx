import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/authStore'
import { useOnboardingStore } from '@/stores/onboardingStore'

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
  } = useAuthStore()
  const navigate = useNavigate()
  const setStep = useOnboardingStore((s) => s.setStep)

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

  const handleSkip = () => {
    setStep('consent')
    navigate('/onboarding/consent')
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

        {/* Social login buttons */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="flex w-full items-center justify-center gap-3 rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-4 py-3 text-sm font-medium text-(--color-text-primary) transition-colors hover:bg-(--color-bg-subtle)"
          >
            <GoogleIcon />
            Continuer avec Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('apple')}
            className="flex w-full items-center justify-center gap-3 rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-4 py-3 text-sm font-medium text-(--color-text-primary) transition-colors hover:bg-(--color-bg-subtle)"
          >
            <AppleIcon />
            Continuer avec Apple
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('facebook')}
            className="flex w-full items-center justify-center gap-3 rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-elevated) px-4 py-3 text-sm font-medium text-(--color-text-primary) transition-colors hover:bg-(--color-bg-subtle)"
          >
            <FacebookIcon />
            Continuer avec Facebook
          </button>
        </div>

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

        {/* Skip / offline mode */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm text-(--color-text-muted) underline hover:text-(--color-text-secondary)"
          >
            Continuer sans compte
          </button>
          <p className="mt-1 text-xs text-(--color-text-muted)">
            Vos données resteront sur cet appareil
          </p>
        </div>
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

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      <path d="M14.94 9.63c-.023-2.174 1.773-3.22 1.853-3.27-1.008-1.476-2.58-1.677-3.14-1.7-1.337-.136-2.61.787-3.29.787-.68 0-1.73-.767-2.843-.747-1.463.02-2.812.85-3.565 2.16-1.52 2.636-.39 6.543 1.092 8.683.724 1.047 1.588 2.222 2.722 2.18 1.092-.044 1.504-.707 2.824-.707 1.32 0 1.69.707 2.843.685 1.174-.02 1.92-1.067 2.64-2.117.832-1.214 1.175-2.39 1.196-2.45-.026-.012-2.295-.882-2.318-3.497zM12.77 3.18c.6-.73 1.007-1.744.896-2.755-.866.035-1.916.577-2.537 1.305-.556.643-1.043 1.67-.912 2.656.966.075 1.953-.49 2.553-1.206z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M18 9a9 9 0 10-10.406 8.89v-6.29H5.309V9h2.285V7.017c0-2.255 1.343-3.501 3.4-3.501.984 0 2.014.176 2.014.176v2.215h-1.135c-1.118 0-1.467.694-1.467 1.406V9h2.496l-.399 2.6h-2.097v6.29A9.002 9.002 0 0018 9z"
        fill="#1877F2"
      />
      <path
        d="M12.396 11.6l.399-2.6h-2.496V7.313c0-.712.349-1.406 1.467-1.406h1.135V3.692s-1.03-.176-2.014-.176c-2.057 0-3.4 1.246-3.4 3.501V9H5.309v2.6h2.285v6.29a9.07 9.07 0 002.812 0v-6.29h2.097z"
        fill="#fff"
      />
    </svg>
  )
}
