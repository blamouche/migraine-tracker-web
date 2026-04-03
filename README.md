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

## Vault (stockage local)

Les donnees de sante sont stockees localement sur la machine de l'utilisateur via la **File System Access API** du navigateur. Le vault est un dossier choisi par l'utilisateur dans lequel l'application cree et gere une arborescence de fichiers Markdown.

### Generation de l'ID

Chaque entree (crise, douleur quotidienne, repas, etc.) recoit un identifiant unique genere via :

```typescript
crypto.randomUUID()
```

Cela produit un UUID v4 conforme RFC 4122 (ex: `550e8400-e29b-41d4-a716-446655440000`). L'ID est genere cote client au moment de la creation de l'entree dans le store Zustand correspondant.

### Structure du dossier vault

A l'initialisation (`ensureVaultStructure()` dans `apps/desktop/src/lib/vault/handle.ts`), l'application cree un dossier racine `Migraine AI/` contenant 13 sous-dossiers :

```
Dossier choisi par l'utilisateur/
└── Migraine AI/
    ├── crises/                  → Fiches de crises migraineuses
    ├── daily-pain/              → Suivi quotidien de la douleur
    ├── charge-mentale/          → Entrees de charge mentale / stress
    ├── journal-alimentaire/     → Journal alimentaire
    ├── config/                  → Configuration (modules.md, ia-log.md)
    ├── corbeille/               → Suppression douce (purge auto > 30 jours)
    ├── cycle/                   → Suivi du cycle menstruel
    ├── consultations/           → Comptes-rendus de consultations
    ├── transports/              → Trajets (declencheurs potentiels)
    ├── sport/                   → Activites sportives
    ├── environnement/           → Donnees environnementales
    ├── ia/                      → Analyses IA, patterns, resumes
    └── templates/               → Modeles (repas, etc.)
```

### Format des fichiers

Tous les fichiers sont au format **Markdown avec frontmatter YAML** :

```yaml
---
id: 550e8400-e29b-41d4-a716-446655440000
date: 2026-04-03
heure_debut: "14:30"
intensite: 7
cree_le: 2026-04-03T14:30:00.000Z
modifie_le: 2026-04-03T16:45:00.000Z
---

## Notes
Contexte additionnel...
```

### Convention de nommage des fichiers

| Categorie | Pattern | Exemple |
| --- | --- | --- |
| Crise | `{date}_crise.md` | `2026-04-03_crise.md` |
| Douleur quotidienne | `{date}.md` | `2026-04-03.md` |
| Repas | `{date}_repas_{id8}.md` | `2026-04-03_repas_550e8400.md` |
| Transport | `{date}_transport_{id}.md` | `2026-04-03_transport_550e8400.md` |
| Consultation | `{date}_consultation_{id}.md` | `2026-04-03_consultation_550e8400.md` |
| Cycle | `{dateDebut}_cycle_{id}.md` | `2026-04-03_cycle_550e8400.md` |
| Sport | `{date}_sport_{id}.md` | `2026-04-03_sport_550e8400.md` |

### Persistance du handle

Le handle du dossier vault est stocke dans **IndexedDB** (base `migraine-ai`, store `keyval`, cle `vault-handle:{userId}`). A chaque redemarrage, l'application verifie la permission d'acces via `queryPermission()` / `requestPermission()`. Si la permission est perdue, l'utilisateur est redirige vers la page de reconnexion vault.

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
