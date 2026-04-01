import { ThemeProvider } from './components/layout/ThemeProvider'

export function App() {
  return (
    <ThemeProvider>
      <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
        <div className="mx-auto max-w-[1200px] px-8 py-8">
          <h1 className="text-2xl font-semibold">Migraine AI</h1>
          <p className="mt-2 text-(--color-text-secondary)">
            Bienvenue sur Migraine AI. L&apos;application est en cours de développement.
          </p>
        </div>
      </main>
    </ThemeProvider>
  )
}
