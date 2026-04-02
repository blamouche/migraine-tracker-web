# Migraine AI — Architecture Technique

**Version :** 1.0
**Date :** Avril 2026
**Statut :** Draft
**Référence :** PRD v1.0

> Ce document est la référence technique pour l'implémentation de Migraine AI. Il décrit la structure du code, les flux de données, les patterns d'intégration et les décisions d'architecture. Il est complémentaire au PRD (fonctionnel) et au Design System (visuel).

---

## Sommaire

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack technologique](#2-stack-technologique)
3. [Structure du projet](#3-structure-du-projet)
4. [Couche de stockage — File System Access API](#4-couche-de-stockage--file-system-access-api)
5. [Couche de stockage — Supabase](#5-couche-de-stockage--supabase)
6. [Authentification](#6-authentification)
7. [Gestion des profils & feature flags](#7-gestion-des-profils--feature-flags)
8. [Saisie mobile — transit chiffré](#8-saisie-mobile--transit-chiffré)
9. [Module IA](#9-module-ia)
10. [Données environnementales](#10-données-environnementales)
11. [Service Worker & offline](#11-service-worker--offline)
12. [Séquence de démarrage](#12-séquence-de-démarrage)
13. [Gestion des erreurs](#13-gestion-des-erreurs)
14. [Tests & CI/CD](#14-tests--cicd)
15. [Déploiement](#15-déploiement)
16. [Schéma Supabase complet](#16-schéma-supabase-complet)

---

## 1. Vue d'ensemble

Migraine AI est une **Progressive Web App offline-first** dont toutes les données de santé résident sur la machine de l'utilisateur. Le backend (Supabase) ne manipule que des métadonnées non-médicales et des blobs chiffrés éphémères (transit mobile).

```
┌─────────────────────────────────────────────────────────────────┐
│                      NAVIGATEUR (Chrome/Edge)                   │
│                                                                 │
│   ┌──────────────────────────────────────┐  ┌───────────────┐  │
│   │         React PWA App                │  │ Service Worker│  │
│   │                                      │  │  (offline +   │  │
│   │  ┌──────────┐  ┌────────────────┐   │  │  notifications│  │
│   │  │  UI Layer│  │ Business Logic │   │  │  )            │  │
│   │  │  (React) │  │  (hooks/stores)│   │  └───────────────┘  │
│   │  └──────────┘  └───────┬────────┘   │                     │
│   │                        │            │                     │
│   │  ┌────────────────┐  ┌─┴──────────┐ │                     │
│   │  │   IndexedDB    │  │ FSAPI Layer│ │                     │
│   │  │(profils, cache,│  │(vault I/O) │ │                     │
│   │  │ queue offline) │  └─────┬──────┘ │                     │
│   │  └────────────────┘        │        │                     │
│   └────────────────────────────│────────┘                     │
│                                │                              │
│                    ┌───────────▼──────────┐                   │
│                    │  Vault Obsidian local │                   │
│                    │  (fichiers .md)       │                   │
│                    └──────────────────────┘                   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS (métadonnées + blobs chiffrés)
                    ┌────────▼────────┐
                    │    Supabase     │
                    │  Auth + Postgres│
                    │  + Edge Fns     │
                    │  + mobile_transit│
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
       ┌──────▼──┐  ┌────────▼─┐  ┌────────▼─┐
       │ Open-   │  │  Claude  │  │  Stripe  │
       │ Meteo   │  │  API     │  │  API     │
       └─────────┘  └──────────┘  └──────────┘
```

**Principes clés :**

- Les données de santé ne quittent jamais l'ordinateur de l'utilisateur en clair
- L'app est fonctionnelle hors ligne après la première session
- Supabase est optionnel pour l'usage de base (mode UUID anonyme)

---

## 2. Stack technologique

### 2.1 Frontend

| Composant        | Technologie               | Version cible | Justification                              |
| ---------------- | ------------------------- | ------------- | ------------------------------------------ |
| Framework        | React                     | 19.x          | Ecosystème, Nivo, Server Components futurs |
| Build            | Vite                      | 6.x           | DX, HMR, build PWA optimal                 |
| PWA              | vite-plugin-pwa + Workbox | latest        | Service Worker automatisé                  |
| Routeur          | React Router              | v7            | File-based routing                         |
| State            | Zustand                   | 5.x           | Léger, pas de boilerplate                  |
| Formulaires      | React Hook Form + Zod     | latest        | Validation typée                           |
| Styles           | Tailwind CSS v4           | 4.x           | Variables CSS natives, pas de purge        |
| Graphiques       | Nivo                      | 0.87+         | D3/React-first, thème global               |
| PDF              | jsPDF + html2canvas       | latest        | Génération côté client                     |
| Chiffrement      | Web Crypto API            | native        | AES-256-GCM sans dépendance                |
| Voix             | Web Speech API            | native        | Chrome natif                               |
| Lune             | suncalc                   | 1.9.x         | ~7Ko, calcul local                         |
| Tests unitaires  | Vitest                    | latest        | Compatible Vite                            |
| Tests composants | React Testing Library     | latest        |                                            |
| Tests E2E        | Playwright                | latest        | Chromium headless                          |
| Accessibilité    | axe-core                  | latest        | WCAG 2.1 AA en CI                          |
| Lint             | ESLint + Prettier         | latest        |                                            |
| Types            | TypeScript                | 5.x           | Strict mode                                |

### 2.2 Backend (Supabase)

| Composant       | Service Supabase               | Usage                                                       |
| --------------- | ------------------------------ | ----------------------------------------------------------- |
| Auth            | Supabase Auth                  | Google, Apple, Facebook OAuth + magic link + email/password |
| Base de données | PostgreSQL (Supabase)          | Métadonnées, profils, plans, feature flags                  |
| API proxy IA    | Supabase Edge Functions (Deno) | Proxy Claude API — clé API non exposée côté client          |
| Transit mobile  | Supabase PostgreSQL + CRON     | Table `mobile_transit` — blobs chiffrés éphémères           |
| RLS             | Row Level Security             | Isolation des données par utilisateur                       |

### 2.3 Hébergement

| Cible           | Service                       | Notes                                                     |
| --------------- | ----------------------------- | --------------------------------------------------------- |
| App desktop     | GitHub Pages / Netlify        | Fichiers statiques, CDN global                            |
| App mobile      | `m.migraine-ai.app` (Netlify) | Build séparé, même repo — route `/mobile` ou sous-domaine |
| Interface admin | Netlify                       | `admin.migraine-ai.app` — React + Supabase admin          |

---

## 3. Structure du projet

```
migraine-ai/
├── apps/
│   ├── desktop/                     ← App principale (PWA Chrome/Edge)
│   │   ├── src/
│   │   │   ├── components/          ← Composants UI partagés
│   │   │   │   ├── ui/              ← Design System (Button, Chip, Slider…)
│   │   │   │   ├── forms/           ← Formulaires métier (CriseForm, AlimentaireForm…)
│   │   │   │   ├── charts/          ← Composants Nivo wrappés
│   │   │   │   └── layout/          ← Sidebar, Header, ProfileBadge…
│   │   │   ├── features/            ← Modules métier
│   │   │   │   ├── crises/
│   │   │   │   ├── alimentaire/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── traitements/
│   │   │   │   ├── patterns/
│   │   │   │   ├── rapport/
│   │   │   │   ├── cycle/
│   │   │   │   ├── consultations/
│   │   │   │   ├── transports/
│   │   │   │   ├── sport/
│   │   │   │   ├── charge-mentale/
│   │   │   │   ├── daily-pain/
│   │   │   │   └── ia/
│   │   │   ├── lib/
│   │   │   │   ├── vault/           ← Couche File System Access API
│   │   │   │   │   ├── reader.ts    ← Lecture et parsing YAML
│   │   │   │   │   ├── writer.ts    ← Écriture et sérialisation
│   │   │   │   │   ├── validator.ts ← Validation des fichiers au démarrage
│   │   │   │   │   └── watcher.ts  ← BroadcastChannel (accès concurrent)
│   │   │   │   ├── supabase/        ← Client Supabase, types générés
│   │   │   │   ├── auth/            ← Flux auth, token refresh, UUID anonyme
│   │   │   │   ├── crypto/          ← AES-256-GCM (mobile transit)
│   │   │   │   ├── meteo/           ← Client Open-Meteo + Photon
│   │   │   │   ├── patterns/        ← Moteur de détection patterns local
│   │   │   │   ├── export/          ← Génération CSV, ZIP, PDF
│   │   │   │   └── indexeddb/       ← Stores persistants (profils, cache, queue)
│   │   │   ├── hooks/               ← Custom hooks React
│   │   │   ├── stores/              ← Zustand stores globaux
│   │   │   ├── types/               ← Types TypeScript partagés
│   │   │   └── routes/              ← Pages / routing
│   │   ├── public/
│   │   │   ├── manifest.webmanifest
│   │   │   └── icons/
│   │   └── vite.config.ts
│   │
│   ├── mobile/                      ← App mobile légère (m.migraine-ai.app)
│   │   └── src/
│   │       ├── screens/             ← CriseScreen, DouleurScreen, ChargeScreen
│   │       ├── lib/crypto/          ← Même module AES-256-GCM
│   │       └── lib/supabase/        ← Client Supabase (transit uniquement)
│   │
│   └── admin/                       ← Interface admin (admin.migraine-ai.app)
│       └── src/
│           ├── pages/               ← Users, Plans, FeatureFlags, Logs
│           └── lib/supabase/
│
├── packages/
│   └── shared/                      ← Types et utilitaires partagés entre apps
│       ├── types/                   ← Interfaces YAML frontmatter, Supabase rows
│       └── utils/                  ← Parsers YAML, formateurs de dates
│
├── supabase/
│   ├── migrations/                  ← SQL de création des tables
│   ├── functions/                   ← Edge Functions (proxy Claude)
│   │   └── claude-proxy/
│   │       └── index.ts
│   └── seed.sql
│
└── tests/
    ├── unit/                        ← Vitest
    ├── integration/                 ← Vitest + mocks FSAPI
    └── e2e/                         ← Playwright
```

---

## 4. Couche de stockage — File System Access API

### 4.1 Principes

Toutes les lectures et écritures du vault passent par `lib/vault/`. Aucun composant React ne touche directement la FSAPI — il appelle un hook ou une fonction de cette couche.

```typescript
// lib/vault/reader.ts
export async function readVaultFile(
  dirHandle: FileSystemDirectoryHandle,
  relativePath: string,
): Promise<{ frontmatter: Record<string, unknown>; body: string } | null>

// lib/vault/writer.ts
export async function writeVaultFile(
  dirHandle: FileSystemDirectoryHandle,
  relativePath: string,
  frontmatter: Record<string, unknown>,
  body?: string,
): Promise<void>

// lib/vault/writer.ts
export async function moveToTrash(
  dirHandle: FileSystemDirectoryHandle,
  relativePath: string,
  suppressedAt: Date,
): Promise<void>
```

### 4.2 Parsing YAML

Bibliothèque : **js-yaml** (ou **yaml** — à choisir selon les besoins). Le parsing est centralisé dans `lib/vault/reader.ts`.

Les erreurs de parsing (frontmatter invalide, encodage non-UTF-8) sont capturées, journalisées dans `config/erreurs-vault.md`, et propagées à la zone d'attention du dashboard — elles ne bloquent pas le démarrage.

### 4.3 Accès concurrent — BroadcastChannel

```typescript
// lib/vault/watcher.ts
const CHANNEL_NAME = 'migraine-ai-session'

export function initSessionLock(onConflict: () => void): void {
  const bc = new BroadcastChannel(CHANNEL_NAME)
  // À l'ouverture, annonce la session courante
  bc.postMessage({ type: 'session-open', tabId: crypto.randomUUID() })
  // Si une autre session répond, déclenche le callback de conflit
  bc.onmessage = (e) => {
    if (e.data.type === 'session-open') onConflict()
  }
}
```

L'onglet conflictuel bascule en lecture seule — les éléments de saisie sont désactivés avec une bannière d'avertissement.

### 4.4 Permission FSAPI — persistance

La permission de lecture/écriture sur le vault est accordée une fois via `showDirectoryPicker()` et mémorisée par Chrome dans IndexedDB via `FileSystemHandle.requestPermission()`. Au démarrage, l'app tente de restaurer le handle depuis IndexedDB avant de redemander la permission.

```typescript
// lib/indexeddb/vaultHandleStore.ts
export async function saveVaultHandle(
  profileId: string,
  handle: FileSystemDirectoryHandle,
): Promise<void>

export async function restoreVaultHandle(
  profileId: string,
): Promise<FileSystemDirectoryHandle | null>
```

### 4.5 Purge de la corbeille

Exécutée à chaque démarrage (étape 7 de la séquence — section 12). Parcourt `corbeille/`, lit le champ `supprime_le` de chaque fichier, supprime définitivement ceux dont la date dépasse 30 jours.

```typescript
// lib/vault/writer.ts
export async function purgeTrash(dirHandle: FileSystemDirectoryHandle): Promise<number> // nombre de fichiers purgés
```

---

## 5. Couche de stockage — Supabase

### 5.1 Client Supabase

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types.gen' // types générés par supabase gen types

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
```

Le client est un singleton importé dans les hooks et services. Jamais instancié dans les composants.

### 5.2 Types générés

Les types Supabase sont générés automatiquement via la CLI :

```bash
supabase gen types typescript --project-id $PROJECT_ID > apps/desktop/src/lib/supabase/types.gen.ts
```

Ces types sont partagés dans `packages/shared/types/supabase.ts`.

### 5.3 Row Level Security

Toutes les tables ont RLS activé. Les policies suivent le pattern :

```sql
-- Exemple sur user_usage
CREATE POLICY "users can read own usage"
  ON user_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users can update own usage"
  ON user_usage FOR UPDATE
  USING (auth.uid() = user_id);
```

Les admins ont des policies séparées vérifiées via `auth.jwt() -> 'role' = 'admin'`.

### 5.4 File d'attente offline (IndexedDB)

Les événements d'usage produits hors ligne sont mis en file d'attente dans IndexedDB et rejoués dès que la connexion est rétablie.

```typescript
// lib/indexeddb/offlineQueue.ts
type QueuedEvent = {
  id: string
  table: string
  operation: 'insert' | 'update'
  payload: Record<string, unknown>
  createdAt: Date
}

export async function enqueue(event: QueuedEvent): Promise<void>
export async function flushQueue(): Promise<void> // appelé au démarrage si connecté
```

---

## 6. Authentification

### 6.1 Flux général

```
App démarrée
     │
     ▼
Token Supabase présent en localStorage ?
     │
     ├── OUI ──► Token valide ? ──► OUI ──► Session restaurée
     │                   │
     │                   └── NON ──► Connecté ? ──► OUI ──► Refresh silencieux
     │                                       │
     │                                       └── NON ──► Mode local (token expiré)
     │
     └── NON ──► Connecté ?
                   │
                   ├── OUI ──► Écran de login
                   │
                   └── NON ──► UUID anonyme (IndexedDB)
                               Mode local, auth différée
```

### 6.2 Méthodes d'authentification

```typescript
// lib/auth/providers.ts

// Provider social
export async function signInWithProvider(provider: 'google' | 'apple' | 'facebook'): Promise<void> {
  await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
}

// Magic link
export async function signInWithMagicLink(email: string): Promise<void> {
  await supabase.auth.signInWithOtp({ email })
}

// Email / mot de passe — inscription
export async function signUp(email: string, password: string): Promise<void> {
  await supabase.auth.signUp({ email, password })
}

// Email / mot de passe — connexion
export async function signIn(email: string, password: string): Promise<void> {
  await supabase.auth.signInWithPassword({ email, password })
}

// Réinitialisation mot de passe
export async function resetPassword(email: string): Promise<void> {
  await supabase.auth.resetPasswordForEmail(email)
}
```

### 6.3 UUID anonyme (pre-auth)

```typescript
// lib/auth/anonymous.ts
export async function getOrCreateAnonymousId(): Promise<string> {
  const stored = await idb.get<string>('anonymous_id')
  if (stored) return stored
  const id = crypto.randomUUID()
  await idb.set('anonymous_id', id)
  return id
}

export async function mergeAnonymousId(anonymousId: string, userId: string): Promise<void> {
  // Met à jour anonymous_id dans users via Supabase RPC
  await supabase.rpc('merge_anonymous_id', { anonymous_id: anonymousId, user_id: userId })
  await idb.delete('anonymous_id')
}
```

### 6.4 Hook React

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const session = useAuthStore((s) => s.session)
  const user = useAuthStore((s) => s.user)
  const isAnon = useAuthStore((s) => s.isAnonymous)

  return { session, user, isAnonymous: isAnon, isAuthenticated: !!session }
}
```

### 6.5 Consentement marketing

Le consentement est collecté lors de l'onboarding (case décochée par défaut) et mis à jour immédiatement dans Supabase. Il est rétractable depuis Préférences → Compte.

```typescript
// lib/auth/consent.ts
export async function updateMarketingConsent(userId: string, consent: boolean): Promise<void> {
  await supabase
    .from('user_usage')
    .update({
      marketing_consent: consent,
      marketing_consent_at: consent ? new Date().toISOString() : null,
    })
    .eq('user_id', userId)
}
```

---

## 7. Gestion des profils & feature flags

### 7.1 Registre des profils

Les profils sont stockés à deux niveaux synchronisés : IndexedDB (source de vérité locale) et Supabase `user_profiles` (backup serveur).

```typescript
// lib/indexeddb/profileStore.ts
type LocalProfile = {
  id: string // UUID
  label: string
  color: string // hex
  vaultPath: string // non synchronisé côté Supabase
  createdAt: Date
  isActive: boolean
}

export async function getProfiles(): Promise<LocalProfile[]>
export async function saveProfile(profile: LocalProfile): Promise<void>
export async function setActiveProfile(id: string): Promise<void>
```

### 7.2 Feature flags

```typescript
// lib/featureFlags.ts
type FeatureFlags = {
  ia_enabled: boolean
  analytics_range_months: number // 0 = illimité
  export_csv_enabled: boolean
  export_zip_enabled: boolean
  module_cycle_enabled: boolean
  module_sport_enabled: boolean
  module_transport_enabled: boolean
  module_charge_mentale_enabled: boolean
  module_daily_pain_enabled: boolean
  pdf_report_enabled: boolean
  vocal_input_enabled: boolean
  max_profiles: number
}

// Récupérés depuis Supabase (plan_config) au démarrage
// Mis en cache IndexedDB pour usage offline
export async function fetchFeatureFlags(plan: 'free' | 'pro'): Promise<FeatureFlags>

export async function getCachedFeatureFlags(): Promise<FeatureFlags>

// Hook React
export function useFeatureFlag(key: keyof FeatureFlags): boolean | number
```

Quand un feature flag est à `false`, le composant concerné affiche son état "locked" (grisé + badge Pro) — il n'est pas démonté du DOM pour préserver le SEO et les transitions.

---

## 8. Saisie mobile — transit chiffré

### 8.1 Génération et stockage de la clé

```typescript
// lib/crypto/mobileKey.ts

// Côté desktop — génération
export async function generateMobileKey(): Promise<{
  cryptoKey: CryptoKey
  exportedBase64: string
}> {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // extractable
    ['encrypt', 'decrypt'],
  )
  const exported = await crypto.subtle.exportKey('raw', key)
  return {
    cryptoKey: key,
    exportedBase64: btoa(String.fromCharCode(...new Uint8Array(exported))),
  }
}

// La clé exportée est écrite dans config/mobile-sync.md
// et encodée dans le QR code affiché à l'utilisateur
```

### 8.2 Chiffrement (côté mobile)

```typescript
// lib/crypto/encrypt.ts
export async function encryptPayload(
  data: string, // YAML sérialisé de l'entrée
  keyBase64: string, // clé lue depuis localStorage mobile (scannée via QR)
): Promise<{ encryptedBase64: string; ivBase64: string }> {
  const keyBytes = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0))
  const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, [
    'encrypt',
  ])
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(data)
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, encoded)
  return {
    encryptedBase64: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    ivBase64: btoa(String.fromCharCode(...iv)),
  }
}
```

### 8.3 Déchiffrement (côté desktop)

```typescript
// lib/crypto/decrypt.ts
export async function decryptPayload(
  encryptedBase64: string,
  ivBase64: string,
  keyBase64: string,
): Promise<string> {
  // Logique symétrique à encryptPayload — retourne le YAML en clair
}
```

### 8.4 Flux Supabase — table `mobile_transit`

```typescript
// lib/supabase/mobileTransit.ts

// Côté mobile — envoi après chiffrement
export async function pushTransitEntry(entry: {
  user_id: string
  encrypted_payload: Uint8Array
  iv: Uint8Array
  entry_type: 'crise' | 'daily_pain' | 'charge_mentale'
}): Promise<void>

// Côté desktop — récupération au démarrage
export async function fetchPendingEntries(userId: string): Promise<TransitEntry[]>

// Côté desktop — suppression après intégration dans le vault
export async function markSynced(ids: string[]): Promise<void>
```

---

## 9. Module IA

### 9.1 Edge Function proxy Claude

La clé API Anthropic est stockée côté serveur dans les secrets Supabase. Le client envoie uniquement les données anonymisées.

```typescript
// supabase/functions/claude-proxy/index.ts
import Anthropic from 'npm:@anthropic-ai/sdk'

Deno.serve(async (req) => {
  // Vérification du JWT Supabase
  const authHeader = req.headers.get('Authorization')
  // ... vérification JWT ...

  const { prompt, analysisType } = await req.json()

  const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  return new Response(JSON.stringify(message.content), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### 9.2 Pipeline d'anonymisation côté client

```typescript
// lib/ia/anonymizer.ts
type VaultSnapshot = {
  crises: CriseEntry[]
  alimentaire: AlimentaireEntry[]
  chargeMentale: ChargeMentaleEntry[]
  // ... autres sources
}

export function anonymize(snapshot: VaultSnapshot): AnonymizedSnapshot {
  return {
    // Dates → jours relatifs (J-0, J-1, J-7…)
    crises: snapshot.crises.map((c) => ({
      ...c,
      date_debut: toDayOffset(c.date_debut),
      date_fin: c.date_fin ? toDayOffset(c.date_fin) : null,
      // Lieux nommés → catégories génériques
      lieu_survenue: generalizeLocation(c.lieu_survenue),
      // Notes libres incluses si l'utilisateur a consenti
    })),
    // Médecins → supprimés
    // Identifiants → supprimés
  }
}
```

### 9.3 Journal des appels IA

Chaque appel est journalisé dans `config/ia-log.md` côté vault (jamais côté Supabase).

```typescript
// lib/ia/logger.ts
export async function logIaCall(entry: {
  type: 'prediction' | 'patterns' | 'recommandations' | 'resume'
  dataSummary: string // description lisible des données envoyées
  triggeredBy: 'manual' | 'auto'
}): Promise<void>
```

---

## 10. Données environnementales

### 10.1 Open-Meteo

```typescript
// lib/meteo/openMeteo.ts

const BASE_URL = 'https://api.open-meteo.com/v1/forecast'

export async function fetchDailyMeteo(
  lat: number,
  lon: number,
  date: string, // YYYY-MM-DD
): Promise<MeteoData>

export async function fetchHistoricalMeteo(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
): Promise<MeteoData[]>

type MeteoData = {
  date: string
  pression_hpa: number
  variation_pression_24h: number
  temperature_c: number
  humidite_pct: number
  vent_kmh: number
  indice_uv: number
  precipitations_mm: number
}
```

Hors connexion : la fonction lève une erreur silencieuse capturée par le caller, qui utilise les dernières données disponibles ou laisse le champ vide.

### 10.2 Photon (géocodage)

```typescript
// lib/meteo/photon.ts
export async function searchAddress(query: string): Promise<AddressSuggestion[]>

type AddressSuggestion = {
  label: string
  address: string
  lat: number
  lon: number
}
```

### 10.3 suncalc (phase lunaire)

```typescript
// lib/meteo/moon.ts
import SunCalc from 'suncalc'

export function getMoonPhase(date: Date): {
  phase: string // 'nouvelle-lune' | 'premier-croissant' | ... (8 phases)
  illumination: number // 0-1
  nextFullMoon: Date
  nextNewMoon: Date
}
```

---

## 11. Service Worker & offline

### 11.1 Configuration Workbox (via vite-plugin-pwa)

```typescript
// vite.config.ts
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.open-meteo\.com\//,
        handler: 'NetworkFirst',
        options: { cacheName: 'meteo-cache', expiration: { maxAgeSeconds: 3600 } },
      },
      {
        urlPattern: /^https:\/\/photon\.komoot\.io\//,
        handler: 'NetworkFirst',
        options: { cacheName: 'geocoding-cache', expiration: { maxAgeSeconds: 86400 } },
      },
    ],
  },
})
```

### 11.2 Notifications — Web Notifications API

```typescript
// lib/notifications.ts
export async function requestPermission(): Promise<NotificationPermission>

export function schedulePostCrisisReminder(
  crisisId: string,
  delayHours: number, // config utilisateur : 1 / 2 / 4 / lendemain
): void

export function scheduleConsultationReminder(consultationDate: Date): void
```

Les rappels sont planifiés via `setTimeout` en Service Worker pour persister même si l'app est fermée.

---

## 12. Séquence de démarrage

Voir PRD section 4.4 pour la description fonctionnelle. Implémentation :

```typescript
// lib/startup.ts
export async function runStartupSequence(profileId: string): Promise<StartupResult> {
  // 1. Auth / token
  const session = await refreshOrRestoreSession()

  // 2. Feature flags
  const flags = session ? await fetchFeatureFlags(session.plan) : await getCachedFeatureFlags()

  // 3. Cohérence profils
  if (session) await syncProfilesWithSupabase(profileId)

  // 4. Permission FSAPI
  const dirHandle = await restoreOrRequestVaultHandle(profileId)
  if (!dirHandle) return { status: 'vault-not-found' }

  // 5. Lecture config/*.md
  const config = await loadVaultConfig(dirHandle)

  // 6. Scan de validation
  const errors = await validateVault(dirHandle)
  if (errors.length) await writeErrorLog(dirHandle, errors)

  // 7. Purge corbeille
  const purged = await purgeTrash(dirHandle)

  // 8. Sync mobile
  if (session) {
    const mobileEntries = await fetchPendingEntries(session.userId)
    if (mobileEntries.length) await integrateTransitEntries(dirHandle, mobileEntries)
  }

  // 9. Météo + lune
  const meteo = await fetchDailyMeteo(config.localisation.lat, config.localisation.lon, today())
  const moon = getMoonPhase(new Date())

  // 10. Entrées incomplètes + indicateur de risque
  const incomplete = await findIncompleteEntries(dirHandle)
  const riskIndicator = await computeRiskIndicator(dirHandle, config)

  // 11. Résultat → initialise les stores Zustand
  return { status: 'ok', config, flags, meteo, moon, incomplete, riskIndicator, purged }
}
```

---

## 13. Gestion des erreurs

### 13.1 Hiérarchie des erreurs

```typescript
// types/errors.ts
export class VaultError extends Error {}
export class VaultPermissionError extends VaultError {}
export class VaultFileParseError extends VaultError {
  constructor(
    public filePath: string,
    message: string,
  ) {
    super(message)
  }
}
export class VaultFileNotFoundError extends VaultError {}

export class NetworkError extends Error {}
export class MeteoUnavailableError extends NetworkError {}
export class SupabaseError extends NetworkError {}

export class CryptoError extends Error {}
export class DecryptionError extends CryptoError {}
```

### 13.2 Boundary d'erreur React

```typescript
// components/VaultErrorBoundary.tsx
// Capture VaultPermissionError → affiche l'écran de re-localisation du vault
// Capture VaultFileParseError → affiche un toast non-bloquant + consigne l'erreur
// Les NetworkError → silencieuses (dégradation gracieuse)
```

### 13.3 Politique de retry

| Opération             | Retry  | Délai                                     |
| --------------------- | ------ | ----------------------------------------- |
| Fetch Open-Meteo      | 2 fois | 1s, 3s                                    |
| Fetch Supabase (sync) | 3 fois | 2s, 5s, 10s                               |
| Écriture FSAPI        | 0      | — (erreur immédiate, conservé en mémoire) |
| Appel Claude (IA)     | 1 fois | 3s                                        |

---

## 14. Tests & CI/CD

### 14.1 Stratégie de test

```typescript
// Exemples de ce qui est testé par couche

// Unitaire (Vitest) — lib/patterns/engine.test.ts
describe('Pattern engine', () => {
  it('détecte une corrélation météo à 61% avec ≥5 occurrences')
  it('ignore les patterns sous le seuil de confiance 60%')
  it('exclut les entrées completion_forcee des analytics de déclencheurs')
})

// Unitaire — lib/vault/reader.test.ts
describe('YAML parser', () => {
  it('parse un frontmatter valide')
  it('retourne null sur frontmatter invalide sans throw')
  it('traite les champs manquants comme null')
})

// Intégration — lib/vault/integration.test.ts
describe('Vault write/read cycle', () => {
  it('écrit une crise et la relit identique')
  it('déplace un fichier dans corbeille avec supprime_le')
  it('purge les fichiers corbeille > 30 jours')
})

// E2E — tests/e2e/onboarding.spec.ts (Playwright)
test('Onboarding complet — Google OAuth + sélection vault + première crise', async ({ page }) => {
  // Utilise un vault de test temporaire
})

test('Mode Crise — saisie en < 20s, toast, retour accueil', async ({ page }) => {})
test('Génération rapport PDF — téléchargement vérifié', async ({ page }) => {})
test('Basculement de profil — vault correct chargé', async ({ page }) => {})
```

### 14.2 Mock FSAPI

```typescript
// tests/mocks/fsapi.ts
// Simule FileSystemDirectoryHandle en mémoire pour les tests unitaires/intégration
export function createInMemoryVault(initialFiles: Record<string, string> = {}) {
  // Retourne un handle compatible avec l'interface FSAPI
}
```

### 14.3 Pipeline CI/CD

```yaml
# .github/workflows/ci.yml
jobs:
  lint:
    steps: [eslint, prettier --check]

  unit-tests:
    steps: [vitest run --coverage]
    threshold: 80%   # modules critiques : patterns, vault, anonymisation

  e2e-tests:
    steps: [playwright test --project=chromium]
    condition: pull_request → main

  accessibility:
    steps: [playwright + axe-core sur tous les écrans]
    fail-on: any WCAG 2.1 AA violation

  build:
    steps: [vite build]
    condition: merge → main

  deploy-staging:
    steps: [netlify deploy --alias preview-{PR_NUMBER}]
    condition: pull_request

  deploy-production:
    steps: [netlify deploy --prod]
    condition: merge → main + all checks pass
```

### 14.4 Variables d'environnement

```bash
# .env.local (non commité)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Supabase secrets (CLI — jamais dans le code)
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 15. Déploiement

### 15.1 App desktop + mobile

```
Branche main → build Vite → Netlify
  ├── / (desktop PWA)
  └── Sous-domaine m.migraine-ai.app (mobile — build séparé)
```

Le manifest PWA et le Service Worker sont générés par `vite-plugin-pwa`. L'app est installable via Chrome (bouton ⊕ dans la barre d'adresse).

### 15.2 Interface admin

```
Branche main → build Vite → Netlify
  └── admin.migraine-ai.app
```

Accès protégé par Supabase Auth + vérification du rôle `admin` côté client (RLS + vérification JWT `role = 'admin'`). Configuration Netlify dédiée dans `apps/admin/netlify.toml`.

### 15.3 Supabase

```bash
# Déploiement des migrations
supabase db push --project-id $PROJECT_ID

# Déploiement des Edge Functions
supabase functions deploy claude-proxy --project-id $PROJECT_ID
```

---

## 16. Schéma Supabase complet

```sql
-- ============================================================
-- AUTH — géré par Supabase Auth (table auth.users)
-- Champs personnalisés via user_metadata ou table séparée
-- ============================================================

-- ============================================================
-- UTILISATEURS & USAGE
-- ============================================================

CREATE TABLE user_usage (
  user_id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_active_at       TIMESTAMPTZ,
  session_count        INTEGER DEFAULT 0,
  profile_count        INTEGER DEFAULT 0,
  is_active            BOOLEAN DEFAULT TRUE,
  marketing_consent    BOOLEAN DEFAULT FALSE,
  marketing_consent_at TIMESTAMPTZ,
  auth_provider        TEXT    -- 'google' | 'apple' | 'facebook' | 'email' | 'magiclink'
);

CREATE TABLE user_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_local_id UUID NOT NULL,          -- UUID local du profil (depuis config/profils.md)
  label            TEXT NOT NULL,
  color            TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
  -- Note : vault_path NON stocké ici
);

-- ============================================================
-- PLANS & FEATURE FLAGS
-- ============================================================

CREATE TABLE profile_plans (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_local_id       UUID NOT NULL,
  plan                   TEXT NOT NULL DEFAULT 'free',  -- 'free' | 'pro'
  stripe_subscription_id TEXT,
  stripe_customer_id     TEXT,
  plan_activated_at      TIMESTAMPTZ,
  plan_expires_at        TIMESTAMPTZ
);

CREATE TABLE plan_config (
  plan          TEXT NOT NULL,    -- 'free' | 'pro'
  feature_key   TEXT NOT NULL,
  feature_value TEXT NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_by    UUID REFERENCES auth.users(id),
  PRIMARY KEY (plan, feature_key)
);

-- Valeurs initiales
INSERT INTO plan_config (plan, feature_key, feature_value) VALUES
  ('free', 'ia_enabled',                  'false'),
  ('free', 'analytics_range_months',      '3'),
  ('free', 'export_csv_enabled',          'true'),
  ('free', 'export_zip_enabled',          'true'),
  ('free', 'module_cycle_enabled',        'true'),
  ('free', 'module_sport_enabled',        'true'),
  ('free', 'module_transport_enabled',    'true'),
  ('free', 'module_charge_mentale_enabled','true'),
  ('free', 'module_daily_pain_enabled',   'true'),
  ('free', 'pdf_report_enabled',          'true'),
  ('free', 'vocal_input_enabled',         'true'),
  ('free', 'max_profiles',               '1'),
  ('pro',  'ia_enabled',                  'true'),
  ('pro',  'analytics_range_months',      '0'),
  ('pro',  'export_csv_enabled',          'true'),
  ('pro',  'export_zip_enabled',          'true'),
  ('pro',  'module_cycle_enabled',        'true'),
  ('pro',  'module_sport_enabled',        'true'),
  ('pro',  'module_transport_enabled',    'true'),
  ('pro',  'module_charge_mentale_enabled','true'),
  ('pro',  'module_daily_pain_enabled',   'true'),
  ('pro',  'pdf_report_enabled',          'true'),
  ('pro',  'vocal_input_enabled',         'true'),
  ('pro',  'max_profiles',               '3');

-- ============================================================
-- TRANSIT MOBILE
-- ============================================================

CREATE TABLE mobile_transit (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_payload BYTEA NOT NULL,
  iv                BYTEA NOT NULL,
  entry_type        TEXT NOT NULL CHECK (entry_type IN ('crise', 'daily_pain', 'charge_mentale')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  synced_at         TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ
);

-- CRON Supabase — purge automatique des entrées non synchronisées > 90 jours
SELECT cron.schedule(
  'purge-mobile-transit',
  '0 3 * * *',   -- chaque nuit à 3h UTC
  $$DELETE FROM mobile_transit
    WHERE synced_at IS NULL
    AND created_at < NOW() - INTERVAL '90 days'$$
);

-- ============================================================
-- JOURNAL ADMIN
-- ============================================================

CREATE TABLE admin_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID REFERENCES auth.users(id),
  action      TEXT NOT NULL,   -- 'reveal_email' | 'disable_account' | 'delete_account' | 'update_flag'
  target_id   UUID,            -- user_id ou profile_id concerné
  old_value   TEXT,
  new_value   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE user_usage       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_plans    ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_config      ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_transit   ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_log        ENABLE ROW LEVEL SECURITY;

-- plan_config en lecture publique (pas de données sensibles)
CREATE POLICY "anyone can read plan_config"
  ON plan_config FOR SELECT USING (TRUE);

-- Utilisateurs — accès à leurs propres données uniquement
CREATE POLICY "own data only" ON user_usage
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "own data only" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "own data only" ON profile_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "own data only" ON mobile_transit
  FOR ALL USING (auth.uid() = user_id);

-- Admins — accès complet journalisé
CREATE POLICY "admin full access" ON user_usage
  FOR ALL USING ((auth.jwt() ->> 'role') = 'admin');
-- (idem pour les autres tables)
```
