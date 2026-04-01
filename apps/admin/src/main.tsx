import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import './styles/globals.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <main className="min-h-screen bg-(--color-bg-base) p-8 text-(--color-text-primary)">
      <h1 className="text-2xl font-semibold">Migraine AI — Admin</h1>
      <p className="mt-2 text-(--color-text-secondary)">
        Interface d&apos;administration en cours de développement.
      </p>
    </main>
  </StrictMode>,
)
