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

| Commande             | Description                            |
| -------------------- | -------------------------------------- |
| `pnpm dev`           | Lance toutes les apps en développement |
| `pnpm build`         | Build de production (toutes les apps)  |
| `pnpm test`          | Tests unitaires (Vitest)               |
| `pnpm test:coverage` | Tests avec rapport de couverture       |
| `pnpm test:e2e`      | Tests E2E (Playwright + axe-core)      |
| `pnpm lint`          | Lint (ESLint)                          |
| `pnpm typecheck`     | Vérification des types TypeScript      |
| `pnpm format`        | Formatage (Prettier)                   |

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

## Liens des apps

- Desktop: https://migraine-ai-desktop.netlify.app/
- Admin: https://migraine-ai-admin.netlify.app
- Mobile: https://migraine-ai-mobile.netlify.app

## Services de deploiement (gestion technique)

### Services utilises

| Service | Role | Configuration source |
| --- | --- | --- |
| GitHub Actions | CI/CD (lint, typecheck, tests, build, deploiement) | `.github/workflows/ci.yml` |
| Netlify | Hebergement statique des 3 apps (`desktop`, `mobile`, `admin`) | `netlify.toml`, `apps/*/netlify.toml` |
| Supabase | Auth, base PostgreSQL, Edge Functions (`claude-proxy`, `delete-user`) | `supabase/migrations`, `supabase/functions`, `supabase/seed.sql` |

### Strategie de deploiement

- Pull Request vers `main` ou `prod`:
  - pipeline CI complet
  - deploiement preview Netlify des 3 apps (`deploy-staging`)
- Push sur `prod`:
  - pipeline CI + E2E
  - deploiement production Netlify des 3 apps (`deploy-production`)

### Gestion des secrets

| Secret | Ou le configurer | Usage |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | GitHub Actions Secrets + `.env` local | Build front (URL projet Supabase) |
| `VITE_SUPABASE_ANON_KEY` | GitHub Actions Secrets + `.env` local | Build front (anon key publique) |
| `NETLIFY_AUTH_TOKEN` | GitHub Actions Secrets | Authentification CLI Netlify |
| `NETLIFY_SITE_ID_DESKTOP` | GitHub Actions Secrets | Cible deploiement app desktop |
| `NETLIFY_SITE_ID_MOBILE` | GitHub Actions Secrets | Cible deploiement app mobile |
| `NETLIFY_SITE_ID_ADMIN` | GitHub Actions Secrets | Cible deploiement app admin |
| `ANTHROPIC_API_KEY` | Secrets Supabase (`supabase secrets set`) | Utilisee uniquement dans l'Edge Function `claude-proxy` |
| `SUPABASE_SERVICE_ROLE_KEY` | Secrets Supabase (`supabase secrets set`) | Operations admin serveur (`delete-user`) |

### Operations de maintenance (Supabase)

```bash
# Appliquer les migrations SQL
supabase db push --project-id <project_id>

# Deployer les Edge Functions
supabase functions deploy claude-proxy --project-id <project_id>
supabase functions deploy delete-user --project-id <project_id>

# Mettre a jour les secrets serveur
supabase secrets set ANTHROPIC_API_KEY=<value> SUPABASE_SERVICE_ROLE_KEY=<value> --project-id <project_id>
```
