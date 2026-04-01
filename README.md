# Migraine AI

Suivi intelligent de vos migraines — PWA offline-first.

## Setup local

```bash
# 1. Cloner le repo
git clone git@github.com:blamouche/migraine-tracker-web.git
cd migraine-tracker-web

# 2. Installer les dépendances
pnpm install

# 3. Configurer les variables d'environnement
cp .env.example .env

# 4. Lancer en développement
pnpm dev
```

## Scripts

| Commande | Description |
|---|---|
| `pnpm dev` | Lance toutes les apps en développement |
| `pnpm build` | Build de production (toutes les apps) |
| `pnpm test` | Tests unitaires (Vitest) |
| `pnpm test:coverage` | Tests avec rapport de couverture |
| `pnpm test:e2e` | Tests E2E (Playwright + axe-core) |
| `pnpm lint` | Lint (ESLint) |
| `pnpm typecheck` | Vérification des types TypeScript |
| `pnpm format` | Formatage (Prettier) |

## Structure

```
apps/
  desktop/    → App principale (PWA) — localhost:5173
  mobile/     → App mobile légère — localhost:5174
  admin/      → Interface admin — localhost:5175
packages/
  shared/     → Types et utilitaires partagés
  tsconfig/   → Configs TypeScript partagées
  eslint-config/ → Config ESLint partagée
supabase/
  migrations/ → Schéma SQL
  functions/  → Edge Functions (proxy Claude)
  seed.sql    → Données initiales
```

## Stack

React 19 · Vite 6 · TypeScript 5 · Tailwind CSS v4 · Zustand · Vitest · Playwright · Supabase · Turborepo
