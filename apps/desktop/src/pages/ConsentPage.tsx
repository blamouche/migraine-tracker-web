import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

export function ConsentPage() {
  const [cgu, setCgu] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const acceptConsent = useOnboardingStore((s) => s.acceptConsent)
  const user = useAuthStore((s) => s.user)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cgu) return

    setSubmitting(true)

    // Persist marketing consent + create user plan in Supabase
    if (user) {
      try {
        await Promise.all([
          supabase.from('user_usage').upsert(
            {
              user_id: user.id,
              marketing_consent: marketing,
              marketing_consent_at: marketing ? new Date().toISOString() : null,
            },
            { onConflict: 'user_id' },
          ),
          supabase.from('user_plans').upsert(
            {
              user_id: user.id,
              plan: 'free',
              plan_activated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
          ),
        ])
      } catch {
        // Non-blocking
      }
    }

    acceptConsent(cgu, marketing)
    navigate('/onboarding/vault', { replace: true })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base) px-4">
      <div className="w-full max-w-[480px] rounded-(--radius-xl) bg-(--color-bg-elevated) p-8 shadow-lg">
        <h1 className="text-xl font-bold text-(--color-text-primary)">
          Conditions d&apos;utilisation
        </h1>
        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Avant de continuer, veuillez prendre connaissance de nos conditions.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          {/* CGU checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={cgu}
              onChange={(e) => setCgu(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-(--color-brand)"
            />
            <span className="text-sm text-(--color-text-primary)">
              J&apos;accepte les{' '}
              <a
                href="/cgu"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-(--color-brand) underline hover:text-(--color-brand-hover)"
              >
                conditions générales d&apos;utilisation
              </a>{' '}
              <span className="text-(--color-danger)">*</span>
            </span>
          </label>

          {/* Marketing checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-(--color-brand)"
            />
            <span className="text-sm text-(--color-text-secondary)">
              J&apos;accepte de recevoir des communications concernant les nouveautés et conseils de
              Migraine AI (optionnel)
            </span>
          </label>

          <button
            type="submit"
            disabled={!cgu || submitting}
            className="mt-2 w-full rounded-(--radius-md) bg-(--color-brand) px-4 py-3 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover) disabled:opacity-50"
          >
            {submitting ? 'Chargement...' : 'Continuer'}
          </button>
        </form>
      </div>
    </main>
  )
}
