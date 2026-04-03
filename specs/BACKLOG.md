# Migraine AI — Backlog Produit

**Version :** 1.1
**Date :** Avril 2026
**Statut :** Draft
**Référence :** PRD v1.0 (sections 3.20–3.26 ajoutées)

> Ce document liste l'ensemble des Epics et User Stories du projet Migraine AI pour la v1.0. Les stories sont rédigées du point de vue des trois personas principaux : **Patient** (utilisateur solo), **Aidant** (gère le profil d'un proche), et **Admin** (administrateur de la plateforme). Chaque story inclut des critères d'acceptation.

---

## Conventions

- **Priorité :** 🔴 Critique · 🟠 Haute · 🟡 Moyenne · 🟢 Basse
- **Plan :** `[FREE]` disponible en plan gratuit · `[PRO]` réservé au plan Pro
- **ID :** format `EPIC-XX` / `US-XX-YY` (XX = numéro d'Epic, YY = numéro de story)

---

## Sommaire des Epics

| #   | Epic                                           | PRD     | Stories |
| --- | ---------------------------------------------- | ------- | ------- |
| E00 | Mise en place du projet                        | —       | 10      |
| E01 | Onboarding & authentification                  | 3.17    | 8       |
| E02 | Journal des crises                             | 3.1     | 14      |
| E03 | Suivi alimentaire & déclencheurs               | 3.2     | 6       |
| E04 | Tableau de bord & analytics                    | 3.3     | 10      |
| E05 | Rapport médical & export des données           | 3.4     | 7       |
| E06 | Alertes & notifications                        | 3.5     | 7       |
| E07 | Historique des traitements                     | 3.6     | 5       |
| E08 | Détection de patterns & indicateur de risque   | 3.7     | 6       |
| E09 | Profil médical                                 | 3.8     | 3       |
| E10 | Tracking du cycle menstruel                    | 3.9     | 5       |
| E11 | Suivi des rendez-vous médicaux                 | 3.10    | 4       |
| E12 | Suivi des transports                           | 3.11    | 3       |
| E13 | Suivi des activités sportives                  | 3.12    | 3       |
| E14 | Saisie vocale assistée                         | 3.13    | 4       |
| E15 | Traqueur de charge mentale & événements de vie | 3.14    | 5       |
| E16 | Tracking quotidien de la douleur               | 3.15    | 4       |
| E17 | Multi-profil & abonnements                     | 3.16    | 8       |
| E18 | Données environnementales                      | 4.2     | 5       |
| E19 | Module IA                                      | 3.18    | 8       |
| E20 | Saisie mobile — mode Crise à distance          | 3.19    | 7       |
| E21 | Administration & feature flags                 | 3.17    | 7       |
| E22 | Infrastructure, robustesse & qualité           | 6.5/6.6 | 9       |
| E23 | Navigation & shell applicatif                  | 3.20    | 5       |
| E24 | Animations, transitions & états de chargement  | 3.21    | 5       |
| E25 | Feedback, empty states & polish UI             | 3.22    | 6       |
| E26 | Accessibilité avancée & raccourcis clavier     | 3.24    | 4       |
| E27 | Création du profil par défaut à l'onboarding   | 3.16/3.17 | 4     |
| E28 | Vue calendrier consolidée                       | 3.25    | 6       |
| E29 | Personnalisation des modules de suivi           | 3.26    | 5       |
| E30 | Prérequis déploiement & activation admin        | —       | 6       |
| E31 | Gestion avancée des utilisateurs (admin)        | ✅     | 5       |
| E32 | Statistiques d'utilisation (admin)               | ✅     | 4       |
| E33 | Export utilisateurs & emails (admin)              | ✅     | 3       |
| E34 | Configuration dynamique des plans & modules (admin) | ✅     | 5       |
| E35 | Activation Magic Link & email/password             | ✅     | 4       |
| E36 | Suppression du mode multi-profils                   | ✅     | 8       |
| E37 | Picto météo pour le module environnement             | ✅     | 1       |
| E38 | Changement du dossier vault depuis les paramètres    | —     | 3       |
| E39 | Reconnexion rapide — skip onboarding utilisateur connu | ✅     | 4       |
| E40 | Saisie mobile étendue — tous types d'enregistrements    | —      | 6       |

**Total : 232 User Stories**

---

## EPIC E00 — Mise en place du projet

> En tant que développeur, je veux disposer d'un socle technique opérationnel — monorepo configuré, services cloud provisionnés, pipeline CI/CD actif — afin que l'équipe puisse commencer à développer les features sans friction.

### US-00-01 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** initialiser le monorepo pnpm avec Turborepo et la structure `apps/` + `packages/`,
**afin de** partager les types, utilitaires et config entre desktop, mobile et admin sans duplication.

**Critères d'acceptation :**

- [x] `pnpm-workspace.yaml` déclare `apps/*` et `packages/*`
- [x] `turbo.json` définit les pipelines `build`, `test`, `lint`
- [x] Les apps `desktop`, `mobile`, `admin` et le package `shared` sont scaffoldés avec leurs `package.json` respectifs
- [x] `pnpm install` depuis la racine installe toutes les dépendances sans erreur
- [x] `turbo build` compile toutes les apps depuis la racine

---

### US-00-02 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** configurer TypeScript strict, ESLint et Prettier en config partagée,
**afin d'** avoir une base de code cohérente et d'attraper les erreurs de type à la compilation.

**Critères d'acceptation :**

- [x] `packages/tsconfig/` exporte `base.json` et `react.json` étendus dans chaque app
- [x] `tsconfig.json` de chaque app active `strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- [x] `packages/eslint-config/` exporte une config ESLint partagée (React, TypeScript, a11y)
- [x] `prettier.config.js` à la racine avec `printWidth: 100`, `singleQuote: true`, `semi: false`
- [x] `pnpm lint` et `pnpm typecheck` passent sans erreur sur le projet vide

---

### US-00-03 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** créer et configurer le projet Supabase et appliquer le schéma SQL initial,
**afin d'** avoir la base de données, l'authentification et le stockage prêts avant le développement des features.

**Critères d'acceptation :**

- [x] Un projet Supabase créé : `migraine-ai` (unique pour dev/staging/prod)
- [x] Migration initiale appliquée : tables `user_profiles`, `user_usage`, `profile_plans`, `plan_config`, `mobile_transit`, `admin_log`
- [x] Seed `plan_config` appliqué (valeurs free/pro définies dans ARCHITECTURE_TECHNIQUE.md §11)
- [x] RLS activé sur toutes les tables avec les politiques définies
- [x] Variables d'environnement documentées dans `.env.example`
- [x] CRON job de purge `mobile_transit` (90 jours) configuré via pg_cron

---

### US-00-04 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** configurer le pipeline GitHub Actions (lint → tests → build → deploy),
**afin que** chaque PR soit validée automatiquement avant merge.

**Critères d'acceptation :**

- [x] Workflow `ci.yml` : ESLint → Vitest (coverage ≥ 80 %) → Playwright E2E → axe-core → Vite build
- [x] Le workflow échoue et bloque le merge si une violation d'accessibilité est détectée
- [x] Les secrets Supabase et Netlify sont configurés dans GitHub Actions Secrets
- [ ] Durée totale du pipeline < 10 min sur un projet vide
- [ ] Badge CI visible dans le README

---

### US-00-05 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** configurer les déploiements Netlify pour staging (PR preview) et production (merge sur `main`),
**afin d'** avoir des URLs de review stables pour chaque Pull Request.

**Critères d'acceptation :**

- [x] Site Netlify `migraine-ai-staging` déploie automatiquement à chaque PR avec une URL unique
- [x] Site Netlify `migraine-ai-prod` déploie sur merge vers `prod`
- [x] Variables d'environnement Netlify configurées (Supabase URL, anon key, etc.)
- [x] Headers de sécurité configurés dans `netlify.toml` (CSP, HSTS, X-Frame-Options)
- [x] Redirect `/* → /index.html` configuré pour le routing SPA

---

### US-00-06 · 🟠 Haute · TECH

**En tant que** développeur,
**je veux** configurer les domaines DNS (`migraine-ai.app`, `m.migraine-ai.app`, `admin.migraine-ai.app`),
**afin que** chaque app soit accessible sur son URL canonique dès le premier déploiement.

**Critères d'acceptation :**

- [ ] `migraine-ai.app` pointe vers l'app desktop (Netlify)
- [ ] `m.migraine-ai.app` pointe vers l'app mobile (Netlify)
- [ ] `admin.migraine-ai.app` pointe vers l'app admin (Netlify)
- [ ] Certificats TLS auto-renouvelables actifs sur les 3 domaines
- [ ] Redirection HTTP → HTTPS active
- [ ] Les URLs de callback OAuth Supabase incluent les 3 domaines en liste blanche

---

### US-00-07 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** configurer le manifest PWA et le service worker Workbox pour l'app desktop,
**afin que** l'application soit installable et fonctionne en mode hors-ligne.

**Critères d'acceptation :**

- [x] `manifest.webmanifest` : `name`, `short_name`, `icons` (192 + 512px), `display: standalone`, `theme_color`
- [x] `vite-plugin-pwa` configuré avec stratégie `NetworkFirst` pour Open-Meteo et Photon
- [x] Stratégie `CacheFirst` pour les assets statiques (JS, CSS, polices)
- [ ] L'app passe le test "Installable" dans Lighthouse
- [ ] Un prompt d'installation personnalisé s'affiche après la 2e visite
- [x] En mode offline, une page de fallback s'affiche si le réseau est requis (`apps/desktop/public/offline.html`)

---

### US-00-08 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** initialiser Tailwind CSS v4 avec les tokens du Design System (`DESIGN_SYSTEM.md`),
**afin que** les custom properties CSS et les classes utilitaires soient disponibles dès le premier composant.

**Critères d'acceptation :**

- [x] Tailwind v4 installé et configuré dans `packages/shared/src/styles/`
- [x] CSS custom properties `--color-*`, `--font-*`, `--radius-*` définies dans `globals.css`
- [x] Thèmes `[data-theme="light"]`, `[data-theme="dark"]` et `[data-theme="crisis"]` opérationnels
- [x] Le `nivoTheme` exporté depuis `packages/shared/src/charts/nivoTheme.ts` lit les custom properties
- [x] Polices Inter chargées via `@fontsource/inter` (subsets latin uniquement)
- [x] Un composant `ThemeProvider` applique le thème en fonction des préférences système et du store

---

### US-00-09 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** mettre en place l'infrastructure de tests (Vitest + React Testing Library + Playwright + axe-core),
**afin de** pouvoir écrire et lancer des tests dès la première feature.

**Critères d'acceptation :**

- [x] `vitest.config.ts` configuré avec `jsdom`, coverage via `@vitest/coverage-v8`
- [x] `@testing-library/react` + `@testing-library/user-event` installés et un test smoke passe
- [x] `playwright.config.ts` configuré pour Chromium uniquement, base URL = `localhost:5173`
- [x] `@axe-core/playwright` intégré : chaque test E2E inclut un check `checkA11y()`
- [x] Commandes `pnpm test`, `pnpm test:e2e`, `pnpm test:coverage` fonctionnelles depuis la racine
- [x] Rapport de coverage généré en HTML dans `coverage/`

---

### US-00-10 · 🟠 Haute · TECH

**En tant que** développeur,
**je veux** configurer la gestion des secrets et variables d'environnement pour tous les environnements,
**afin de** ne jamais exposer de clés sensibles dans le code source ou les logs.

**Critères d'acceptation :**

- [x] `.env.example` documenté avec toutes les variables requises et leur description
- [x] `.env` et `.env.local` ajoutés au `.gitignore`
- [x] La clé `ANTHROPIC_API_KEY` n'est accessible que côté Supabase Edge Function (jamais dans le bundle client)
- [x] Un script `scripts/check-env.ts` vérifie la présence de toutes les variables au démarrage en développement
- [ ] La Supabase Edge Function `claude-proxy` est déployée avec ses secrets via `supabase secrets set`
- [x] Documentation dans le README : setup local en < 5 commandes

---

## EPIC E01 — Onboarding & authentification

> En tant qu'utilisateur, je veux pouvoir créer un compte et accéder à l'application de façon simple et sécurisée, afin de commencer à suivre mes migraines.

### US-01-01 · 🔴 Critique · FREE

**En tant que** nouveau patient,
**je veux** me connecter avec mon compte Google, Apple ou Facebook,
**afin de** créer mon compte sans gérer un mot de passe supplémentaire.

**Critères d'acceptation :**

- [x] L'écran de login affiche les 3 boutons sociaux (Google, Apple, Facebook) et un séparateur « ou »
- [x] Le flux OAuth redirige vers le provider et retourne dans l'app après succès
- [ ] Si la popup est bloquée, un message explicite invite à l'autoriser
- [x] Si l'utilisateur annule, retour à l'écran de login sans message d'erreur

---

### US-01-02 · 🟠 Haute · FREE

**En tant que** patient qui ne souhaite pas lier un compte social,
**je veux** créer un compte avec mon email et un mot de passe,
**afin de** conserver le contrôle total de mes identifiants.

**Critères d'acceptation :**

- [x] Formulaire email + mot de passe (≥ 8 caractères)
- [x] Email de confirmation envoyé après inscription
- [x] Le compte n'est activé qu'après clic sur le lien de confirmation
- [ ] Un lien « Renvoyer l'email » est disponible après 60s

---

### US-01-03 · 🟠 Haute · FREE

**En tant que** patient qui préfère ne pas gérer de mot de passe,
**je veux** me connecter via un magic link envoyé par email,
**afin de** me connecter en un clic sans risque d'oublier un mot de passe.

**Critères d'acceptation :**

- [x] L'utilisateur saisit son email, reçoit un lien valide 15 minutes
- [x] Si le lien est expiré, message clair avec bouton « Renvoyer »
- [ ] La limite de renvoi est de 3 par heure

---

### US-01-04 · 🔴 Critique · FREE

**En tant que** patient sans connexion internet lors du premier lancement,
**je veux** pouvoir utiliser l'application immédiatement sans créer de compte,
**afin de** ne pas bloquer ma première saisie de crise par une contrainte technique.

**Critères d'acceptation :**

- [x] Un UUID anonyme est généré et stocké en IndexedDB
- [x] Un message non-bloquant explique que le compte sera créé à la prochaine connexion
- [x] Toutes les fonctionnalités gratuites sont accessibles
- [x] À la prochaine session connectée, le flow de login s'affiche automatiquement
- [x] Les métriques d'usage pré-auth sont conservées après merge du compte

---

### US-01-05 · 🔴 Critique · FREE

**En tant que** patient de retour sur l'application,
**je veux** être reconnecté automatiquement sans ressaisir mes identifiants,
**afin de** accéder à mon vault sans friction.

**Critères d'acceptation :**

- [x] Le token Supabase (30 jours) est vérifié au démarrage
- [x] Si valide : chargement direct, sans écran de login
- [x] Si expiré et connecté : renouvellement silencieux
- [x] Si expiré et hors ligne : l'app fonctionne normalement en mode local

---

### US-01-06 · 🔴 Critique · FREE

**En tant que** patient,
**je veux** choisir mon dossier vault Obsidian lors du premier lancement,
**afin de** stocker mes données de santé là où je le décide.

**Critères d'acceptation :**

- [x] Une explication en une phrase précède le sélecteur de dossier
- [x] L'app crée la structure `Migraine AI/` si le dossier est vide
- [x] L'app reconnaît et charge un vault existant
- [x] La permission FSAPI est mémorisée par Chrome pour les sessions suivantes

---

### US-01-07 · 🟠 Haute · FREE

**En tant que** patient lors de son inscription,
**je veux** donner ou refuser mon consentement aux communications marketing séparément des CGU,
**afin de** garder le contrôle sur l'utilisation de mon email.

**Critères d'acceptation :**

- [x] Deux cases distinctes : CGU (obligatoire) et marketing (optionnel, décochée par défaut)
- [x] L'inscription est impossible sans acceptation des CGU
- [x] Le consentement marketing est horodaté et stocké dans Supabase
- [ ] L'utilisateur peut retirer son consentement depuis les Préférences → Compte

---

### US-01-08 · 🟡 Moyenne · FREE

**En tant que** patient lors de son premier lancement,
**je veux** saisir rapidement les 3 informations clés de mon profil médical,
**afin que** l'app soit immédiatement personnalisée sans avoir à tout remplir d'un coup.

**Critères d'acceptation :**

- [x] 3 champs seulement : type de migraine, traitement de crise habituel, traitement de fond
- [x] Champs optionnels — bouton « Passer pour l'instant » visible
- [x] Un message invite à compléter le profil dans les préférences ultérieurement

---

## EPIC E02 — Journal des crises

> En tant que patient, je veux enregistrer chaque crise de migraine avec un minimum d'effort, afin d'avoir un historique précis à montrer à mon médecin et d'identifier mes déclencheurs.

### US-02-01 · 🔴 Critique · FREE

**En tant que** patient en pleine crise,
**je veux** enregistrer une crise en moins de 20 secondes avec 3 champs uniquement,
**afin de** ne pas aggraver ma douleur par une saisie trop longue.

**Critères d'acceptation :**

- [x] Accès au mode Crise en ≤ 2 taps depuis n'importe quel écran
- [x] Seuls 3 champs : heure de début (pré-remplie), intensité (curseur), traitement (chips)
- [x] Fond sombre automatique à l'ouverture
- [x] Aucun scroll nécessaire — tout sur un seul écran
- [x] Validation = écriture immédiate dans `crises/YYYY-MM-DD_crise.md` avec `statut: incomplet`
- [x] Toast de confirmation 2 secondes puis retour à l'accueil

---

### US-02-02 · 🔴 Critique · FREE

**En tant que** patient après sa crise,
**je veux** compléter les détails d'une crise enregistrée en mode rapide,
**afin que** les informations dans le vault soient complètes pour l'analyse.

**Critères d'acceptation :**

- [x] Accès depuis la zone d'attention du dashboard, l'historique, ou la notification de rappel
- [x] Formulaire pré-rempli avec les données du mode Crise
- [x] Champs manquants mis en évidence (bordure + label « À compléter »)
- [x] Sauvegarde automatique toutes les 30 secondes
- [x] `statut: incomplet` retiré dès que les champs essentiels sont renseignés

---

### US-02-03 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** que l'app m'aide à définir ce que signifie chaque niveau d'intensité pour moi personnellement,
**afin de** rester cohérent dans mes évaluations d'une crise à l'autre.

**Critères d'acceptation :**

- [x] Référentiel de définitions fonctionnelles affiché à côté du curseur (1=Imperceptible → 10=Insupportable)
- [ ] Après 5 crises, l'app propose de définir des ancres personnelles pour 3 paliers clés
- [x] L'ancre personnelle est rappelée en sous-texte du curseur à chaque saisie
- [ ] Les ancres sont stockées dans `config/preferences.md`

---

### US-02-04 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** que la durée de ma crise soit estimée automatiquement selon l'intensité déclarée,
**afin de** ne pas avoir à calculer moi-même quand je suis en pleine souffrance.

**Critères d'acceptation :**

- [x] La durée estimée s'affiche immédiatement sous le curseur d'intensité
- [x] Les valeurs de référence par défaut sont utilisées sans historique
- [x] Avec historique : estimation personnalisée depuis les crises précédentes
- [x] L'utilisateur peut confirmer l'estimation ou saisir l'heure de fin réelle

---

### US-02-05 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** ajouter mes propres valeurs aux listes de symptômes, déclencheurs, lieux et traitements,
**afin de** ne pas être limité aux options prédéfinies qui ne reflètent pas mon cas.

**Critères d'acceptation :**

- [x] Chaque champ de sélection a un élément « + Ajouter… » en bas de liste
- [x] Le champ texte s'ouvre inline, sans modale ni navigation
- [ ] La valeur est sauvegardée dans la saisie ET dans `config/listes-personnalisees.md`
- [x] La valeur personnalisée est distinguée par un badge ✏️
- [ ] Les valeurs sont triées par fréquence d'utilisation

---

### US-02-06 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** voir une aide contextuelle pour chaque champ du formulaire,
**afin de** comprendre ce qu'on me demande sans devoir chercher une documentation externe.

**Critères d'acceptation :**

- [x] Icône ⓘ à côté de chaque label de champ
- [x] Tooltip au clic (mobile) ou au survol (desktop)
- [x] Contenu : définition courte du champ + exemple ou conseil
- [x] Ne bloque pas le formulaire — dismissable immédiatement

---

### US-02-07 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** renseigner le score HIT-6 lors d'une saisie de crise,
**afin de** documenter l'impact fonctionnel de mes migraines pour mon neurologue.

**Critères d'acceptation :**

- [x] 6 questions standardisées affichées une par une
- [x] Options : Jamais / Rarement / Parfois / Très souvent / Toujours
- [x] Score calculé (36-78) affiché avec son interprétation immédiatement
- [x] Champ optionnel — skip possible

---

### US-02-08 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** recevoir un rappel 2 heures après avoir enregistré une crise en mode rapide,
**afin de** ne pas oublier de compléter les détails quand je vais mieux.

**Critères d'acceptation :**

- [ ] Notification envoyée avec le délai configuré (1h / 2h / 4h / lendemain matin)
- [ ] Action directe dans la notification : bouton « Compléter maintenant »
- [ ] Désactivable par crise ou globalement dans les préférences
- [ ] Délai configurable dans les préférences

---

### US-02-09 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** consulter l'historique de toutes mes crises,
**afin de** retrouver une crise passée et vérifier mes données.

**Critères d'acceptation :**

- [x] Liste des crises avec date, intensité, durée, statut (complet/incomplet)
- [x] Tri par date décroissante par défaut
- [x] Filtres : période, intensité, statut
- [x] Accès au détail complet d'une crise en lecture

---

### US-02-10 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** pouvoir modifier une crise enregistrée,
**afin de** corriger une erreur ou ajouter des informations oubliées.

**Critères d'acceptation :**

- [x] Formulaire pré-rempli avec les données existantes
- [x] Tous les champs sont éditables
- [x] La modification recalcule immédiatement les indicateurs du dashboard
- [x] Pas de versionnage — la modification écrase le fichier Markdown

---

### US-02-11 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** supprimer une crise enregistrée par erreur,
**afin de** garder un historique propre.

**Critères d'acceptation :**

- [x] Confirmation obligatoire avant suppression
- [x] Le fichier est déplacé dans `corbeille/` avec `supprime_le` horodaté
- [x] La crise disparaît de l'historique et des analytics immédiatement
- [x] Message : « Ce fichier sera supprimé définitivement dans 30 jours »

---

### US-02-12 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** que les fichiers en corbeille soient purgés automatiquement après 30 jours,
**afin de** ne pas avoir à gérer manuellement le nettoyage de mon vault.

**Critères d'acceptation :**

- [x] La purge s'exécute à chaque démarrage de l'application
- [x] Seuls les fichiers dont `supprime_le` dépasse 30 jours sont supprimés
- [x] Aucune notification pour la purge routine
- [x] Si l'app n'est pas ouverte depuis > 30 jours, la purge s'exécute au prochain lancement

---

### US-02-13 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** voir la liste de mes entrées incomplètes en haut du dashboard,
**afin de** savoir rapidement ce que j'ai à compléter.

**Critères d'acceptation :**

- [x] Section visible uniquement quand il y a des entrées incomplètes
- [x] Actions disponibles : Compléter / Ignorer (jusqu'à la prochaine session) / Forcer
- [x] Badge numérique sur l'icône de navigation du dashboard
- [x] Les entrées avec `completion_forcee: true` sont exclues des analytics sensibles

---

### US-02-14 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** que les déclencheurs probables du jour soient pré-cochés dans le formulaire de crise,
**afin de** gagner du temps et ne pas oublier les facteurs évidents.

**Critères d'acceptation :**

- [ ] Si une chute de pression est détectée : « variation météo » pré-coché
- [ ] Si sommeil court la nuit précédente : « mauvais sommeil » pré-coché
- [ ] Les suggestions sont confirmables ou décochables en un tap
- [ ] Chaque déclencheur affiche sa fréquence personnelle entre parenthèses

---

## EPIC E03 — Suivi alimentaire & déclencheurs

> En tant que patient, je veux journaliser mon alimentation et mes facteurs environnementaux, afin d'identifier les corrélations avec mes crises.

### US-03-01 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** enregistrer mes repas par type (petit-déjeuner, déjeuner, dîner, collation),
**afin de** pouvoir analyser les corrélations entre alimentation et crises.

**Critères d'acceptation :**

- [x] Saisie horodatée par repas
- [x] Base d'aliments préconfigurée avec étiquettes de risque (tyramine, histamine, caféine)
- [x] Autocomplétion depuis l'historique personnel
- [x] Possibilité de sauvegarder un repas complet comme modèle réutilisable

---

### US-03-02 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** renseigner quotidiennement mon niveau de stress, la qualité de mon sommeil et mon hydratation,
**afin d'identifier** les corrélations avec mes crises sur 24-48h.

**Critères d'acceptation :**

- [x] Stress : échelle 1-5 avec référentiel fonctionnel affiché au survol
- [x] Sommeil : échelle 1-5 avec référentiel fonctionnel
- [x] Hydratation : Bonne / Insuffisante
- [x] Champs accessibles depuis le journal alimentaire du jour

---

### US-03-03 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** voir un score de risque personnel pour chaque aliment,
**afin de** savoir quels aliments me concernent personnellement plutôt que génériquement.

**Critères d'acceptation :**

- [x] Le score est calculé depuis l'historique personnel (corrélation aliment → crise dans les 24-48h)
- [x] S'affiche à côté de chaque aliment dans le journal
- [x] Nécessite au minimum 5 occurrences pour afficher un score fiable
- [x] Distingué visuellement des étiquettes de risque génériques (tyramine, histamine…)

---

### US-03-04 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** réutiliser des repas complets que j'ai précédemment enregistrés,
**afin de** ne pas ressaisir les mêmes informations pour mes habitudes alimentaires régulières.

**Critères d'acceptation :**

- [x] Bouton « Utiliser un modèle » dans le formulaire du journal alimentaire
- [x] Liste des modèles enregistrés (triés par fréquence)
- [x] La sélection d'un modèle pré-remplit le repas entier
- [x] Les modèles sont stockés dans `templates/repas-types/`

---

### US-03-05 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** voir les corrélations détectées entre mon alimentation et mes crises dans les 24-48h,
**afin de** prendre des décisions alimentaires informées.

**Critères d'acceptation :**

- [x] Corrélations affichées dans la section Déclencheurs du dashboard
- [x] Seuil de confiance ≥ 60% et ≥ 5 occurrences avant affichage
- [x] Formulation factuelle : « Le fromage affiné précède une crise dans 78% des cas dans les 24h »

---

### US-03-06 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** consulter l'historique de mon journal alimentaire,
**afin de** retrouver ce que j'ai mangé avant une crise particulière.

**Critères d'acceptation :**

- [x] Liste des journaux par date avec résumé des repas
- [x] Accès au détail complet d'un jour
- [x] Modification et suppression possibles (même mécanisme que les crises)

---

## EPIC E04 — Tableau de bord & analytics

> En tant que patient, je veux visualiser l'évolution de ma pathologie à travers des graphiques clairs, afin de comprendre mes patterns et de préparer mes consultations médicales.

### US-04-01 · 🔴 Critique · FREE

**En tant que** patient,
**je veux** voir une heatmap calendrier combinant mes crises et mon suivi quotidien de la douleur,
**afin d'avoir** une vue d'ensemble visuelle de mes mois.

**Critères d'acceptation :**

- [x] Chaque jour coloré selon le niveau de douleur déclaré (0-10)
- [x] Jours de crise distingués par un contour indigo superposé
- [x] Jours sans saisie en gris neutre
- [x] Tooltip au survol : niveau de douleur + intensité crise + traitement pris
- [x] Légende double : gradient douleur + marqueur crise

---

### US-04-02 · 🔴 Critique · FREE

**En tant que** patient,
**je veux** voir mes indicateurs clés sur la période sélectionnée,
**afin d'évaluer** rapidement l'évolution de ma pathologie.

**Critères d'acceptation :**

- [x] Fréquence mensuelle, intensité moyenne, durée moyenne, efficacité des traitements
- [x] Top déclencheurs, score HIT-6 mensuel, pression atmosphérique
- [x] Indicateur de fréquence élevée si ≥ seuil configuré (défaut : 4 jours/mois)
- [x] Formulation factuelle sans recommandation thérapeutique

---

### US-04-03 · 🔴 Critique · FREE

**En tant que** patient,
**je veux** filtrer tous mes graphiques par période,
**afin de** comparer différentes périodes et analyser des tendances spécifiques.

**Critères d'acceptation :**

- [x] Raccourcis : 7j / 1 mois / 3 mois / 6 mois / 1 an / depuis le début
- [x] Plage personnalisée via calendrier
- [x] Chaque graphique a son propre sélecteur indépendant
- [ ] La plage sélectionnée est mémorisée entre les sessions
- [ ] En plan FREE : données limitées à 3 mois (configurable par l'admin) avec message d'upgrade

---

### US-04-04 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** voir l'évolution de la fréquence et de l'intensité de mes crises en graphique,
**afin de** constater objectivement si ma situation s'améliore ou se dégrade.

**Critères d'acceptation :**

- [x] Barres mensuelles pour la fréquence des crises
- [x] Courbe temporelle pour l'évolution de l'intensité
- [x] Barres empilées pour la durée des crises (min/moy/max)
- [x] Courbe avec seuils pour l'évolution du score HIT-6

---

### US-04-05 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** voir la corrélation entre la pression atmosphérique et mes crises,
**afin de** confirmer ou infirmer ce déclencheur météo dans mon cas personnel.

**Critères d'acceptation :**

- [ ] Courbe double axe : pression atmosphérique vs fréquence des crises
- [ ] Barres + marqueurs pour les variations de pression vs crises
- [ ] Données issues de Open-Meteo pour ma localisation par défaut

---

### US-04-06 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** voir l'efficacité comparative de mes traitements en graphique,
**afin de** choisir le traitement le plus efficace lors d'une crise.

**Critères d'acceptation :**

- [ ] Barres groupées par traitement : efficacité 0/1/2/3
- [ ] Timeline Gantt des périodes de traitement
- [ ] Marqueurs des consultations médicales sur la timeline

---

### US-04-07 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** voir la corrélation de mes crises avec mon cycle menstruel, mon activité sportive et mes transports,
**afin de** comprendre l'influence de ces facteurs sur mes migraines.

**Critères d'acceptation :**

- [ ] Graphique crises vs cycle menstruel (courbe multi-séries)
- [ ] Graphique crises vs activité sportive
- [ ] Graphique crises vs transports (barres groupées)

---

### US-04-08 · 🟢 Basse · FREE

**En tant que** patient curieux,
**je veux** voir la répartition de mes crises par phase lunaire à titre exploratoire,
**afin de** vérifier personnellement si une corrélation existe dans mon cas.

**Critères d'acceptation :**

- [ ] Graphique radar ou donut par phase lunaire (8 phases)
- [ ] Note explicite : donnée exploratoire, non validée scientifiquement
- [ ] Non inclus dans le rapport médical PDF
- [ ] Non inclus dans l'indicateur de risque par défaut

---

### US-04-09 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** voir un indicateur visuel de risque de crise pour aujourd'hui,
**afin d'anticiper** une éventuelle crise et adapter ma journée.

**Critères d'acceptation :**

- [x] Trois niveaux : Faible (vert) / Modéré (orange) / Élevé (rouge)
- [x] Détail au survol / au clic : liste des facteurs actifs
- [x] Calculé localement, sans appel réseau (niveau 1 — voir E19 pour le niveau IA)
- [x] Visible sur l'écran d'accueil

---

### US-04-10 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** que le dashboard se recharge automatiquement après toute modification du vault,
**afin de** toujours voir des données à jour sans rafraîchissement manuel.

**Critères d'acceptation :**

- [x] Recalcul des indicateurs après ajout, modification ou suppression d'une entrée
- [ ] Skeleton screens pendant le rechargement des graphiques
- [x] Optimistic UI : la mise à jour est immédiate côté interface

---

## EPIC E05 — Rapport médical & export des données

> En tant que patient, je veux générer un rapport médical structuré et exporter mes données, afin de partager des informations fiables avec mon médecin et de sauvegarder mes données.

### US-05-01 · 🔴 Critique · FREE

**En tant que** patient,
**je veux** générer un rapport PDF structuré pour ma prochaine consultation,
**afin que** mon médecin ait toutes les informations nécessaires en quelques pages.

**Critères d'acceptation :**

- [x] Période sélectionnable : 1 mois / 3 mois / 6 mois / personnalisé
- [x] Contenu : résumé de période, fréquence, intensité, durée, traitements, déclencheurs, HIT-6, consultations
- [x] Mention factuelle de la fréquence par rapport au seuil configuré (sans recommandation thérapeutique)
- [x] Génération entièrement côté client (jsPDF + html2canvas)
- [x] Téléchargement direct depuis le navigateur

---

### US-05-02 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** exporter mes crises en CSV,
**afin de** les analyser dans un tableur ou de les transmettre à une autre application.

**Critères d'acceptation :**

- [x] Une ligne par crise, tous les champs du frontmatter en colonnes
- [x] Encodage UTF-8 avec BOM (compatibilité Excel)
- [x] Bouton « Exporter en CSV » accessible depuis le module Crises et depuis le dashboard
- [x] Génération entièrement côté client — aucune donnée transmise à un serveur

---

### US-05-03 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** exporter mon journal alimentaire, mes traitements et ma douleur quotidienne en CSV,
**afin de** les partager avec des spécialistes (nutritionniste, médecin).

**Critères d'acceptation :**

- [x] CSV journal alimentaire : une ligne par jour, colonnes par repas et facteurs
- [x] CSV traitements : un traitement par ligne, dates, efficacité
- [ ] CSV douleur quotidienne : une ligne par jour, niveau de douleur et impact
- [x] Même standard d'encodage que US-05-02

---

### US-05-04 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** exporter une copie complète de mon vault en ZIP,
**afin de** sauvegarder l'intégralité de mes données ou de migrer vers une autre machine.

**Critères d'acceptation :**

- [x] Accessible depuis Préférences → « Exporter mon vault »
- [x] ZIP contient tous les fichiers Markdown avec la structure de dossiers préservée
- [x] Génération côté client — aucune donnée transmise à un serveur

---

### US-05-05 · 🟢 Basse · FREE

**En tant que** patient organisé,
**je veux** configurer un export ZIP automatique à fréquence régulière,
**afin de** avoir toujours une sauvegarde récente sans y penser.

**Critères d'acceptation :**

- [ ] Fréquence configurable : hebdomadaire ou mensuel
- [ ] Le fichier est écrit dans un dossier de sauvegarde choisi via la FSAPI
- [ ] Notification toast à chaque export réussi

---

### US-05-06 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** supprimer mon compte Supabase et toutes mes métadonnées,
**afin d'exercer** mon droit à l'oubli (RGPD).

**Critères d'acceptation :**

- [ ] Action disponible dans Préférences → Compte → Supprimer mon compte
- [ ] Confirmation en deux étapes (message explicatif + bouton rouge)
- [ ] Suppression de l'entrée Supabase Auth + user_usage
- [ ] Le vault local n'est pas touché — message explicatif à ce sujet

---

### US-05-07 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** pouvoir retirer mon consentement marketing et mettre à jour mes préférences de contact,
**afin de** contrôler l'utilisation de mon email par Migraine AI.

**Critères d'acceptation :**

- [ ] Toggle dans Préférences → Compte → Consentement marketing
- [ ] Mise à jour immédiate dans Supabase (`marketing_consent = false`)
- [ ] Les emails transactionnels (confirmation, notifications) continuent d'arriver

---

## EPIC E06 — Alertes & notifications

> En tant que patient, je veux recevoir des alertes intelligentes et des rappels utiles, afin de ne pas manquer d'informations importantes sur l'évolution de ma pathologie.

### US-06-01 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** être alerté quand j'atteins le seuil de fréquence élevée mensuelle,
**afin de** pouvoir en parler à mon médecin en consultation.

**Critères d'acceptation :**

- [x] Alerte déclenchée quand le seuil configuré est atteint (défaut : 4 jours/mois)
- [x] Formulation factuelle et non-alarmiste, sans mention de traitement spécifique
- [x] Seuil configurable par l'utilisateur depuis les préférences
- [x] L'alerte s'affiche une seule fois par période mensuelle

---

### US-06-02 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** être averti si je prends plus de 10 triptans par mois,
**afin d'éviter** le risque de céphalée de rebond.

**Critères d'acceptation :**

- [x] Comptage automatique depuis les fichiers crises du mois en cours
- [x] Alerte factuelle : « Vous avez pris X triptans ce mois-ci. Un usage fréquent peut entraîner des céphalées de rebond — à évoquer avec votre médecin. »
- [x] Ne se déclenche qu'une fois par palier de 10

---

### US-06-03 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** être notifié quand je n'ai pas eu de consultation médicale depuis 6 mois,
**afin de** ne pas oublier de prendre rendez-vous.

**Critères d'acceptation :**

- [ ] Alerte dans la zone d'attention du dashboard
- [ ] Configurable : durée en mois depuis Préférences → Alertes
- [ ] Disparaît automatiquement si une consultation est enregistrée

---

### US-06-04 · 🟡 Moyenne · FREE

**En tant que** patient ayant un traitement de fond injectable mensuel,
**je veux** recevoir un rappel pour ma prochaine injection,
**afin de** ne pas oublier mon traitement.

**Critères d'acceptation :**

- [ ] Rappel configurable : fréquence, heure, message personnalisé
- [ ] Déclenché depuis le module Traitements
- [ ] Notification système via Web Notifications API

---

### US-06-05 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** être alerté quand une chute de pression atmosphérique est détectée,
**afin d'anticiper** une possible crise et me préparer.

**Critères d'acceptation :**

- [ ] Alerte uniquement si une corrélation pression/crise est confirmée dans les patterns personnels
- [ ] Seuil configurable (défaut : -6 hPa/24h)
- [ ] S'affiche sur le dashboard à l'ouverture de l'app
- [ ] Désactivable depuis Préférences → Alertes

---

### US-06-06 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** être notifié d'un déclencheur alimentaire fort détecté,
**afin de** pouvoir éviter cet aliment à l'avenir.

**Critères d'acceptation :**

- [ ] Déclenchée quand une corrélation forte (≥ 70%) est confirmée avec un aliment
- [ ] Formulation : « Corrélation forte détectée : [aliment] précède une crise dans X% de vos cas »
- [ ] Ne se déclenche qu'une fois par aliment

---

### US-06-07 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** être rappelé 7 jours avant et la veille d'un rendez-vous médical planifié,
**afin de** ne pas oublier mes consultations.

**Critères d'acceptation :**

- [ ] Rappels automatiques à J-7 et J-1
- [ ] Notification système avec le nom du médecin et l'heure
- [ ] Désactivable par rendez-vous

---

## EPIC E07 — Historique des traitements

> En tant que patient, je veux tenir un historique précis de tous mes traitements, afin que mon médecin ait une vue complète de mon parcours thérapeutique.

### US-07-01 · 🔴 Critique · FREE

**En tant que** patient,
**je veux** enregistrer un nouveau traitement (fond ou crise) avec ses caractéristiques,
**afin de** constituer un historique thérapeutique complet pour mon médecin.

**Critères d'acceptation :**

- [x] Champs : nom, molécule, classe, type, posologie, voie, dates, prescripteur, notes
- [x] Classe thérapeutique : Triptan / Anti-CGRP / Gépant / Bêtabloquant / Antiépileptique / AINS / Autre
- [x] Date de fin vide si traitement en cours
- [x] Fichier Markdown créé dans `traitements/`

---

### US-07-02 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** évaluer l'efficacité d'un traitement de fond,
**afin de** garder une trace de mes retours d'expérience pour la consultation.

**Critères d'acceptation :**

- [x] Verdict : Efficace / Partiellement efficace / Inefficace / Non évalué
- [x] Réduction de fréquence : Aucune / Légère / Modérée / Importante
- [x] Tolérance : Bonne / Acceptable / Mauvaise
- [x] Commentaire libre
- [x] Badge coloré (vert/orange/rouge/gris) dans la vue liste

---

### US-07-03 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** voir une timeline de mes traitements superposée à la fréquence de mes crises,
**afin d'évaluer** visuellement l'efficacité d'un traitement de fond.

**Critères d'acceptation :**

- [x] Timeline Gantt des périodes de chaque traitement
- [x] Fréquence mensuelle des crises superposée sur le même axe temporel
- [x] Accessible depuis le dashboard (onglet Traitements)

---

### US-07-04 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** que les traitements de crise actifs de mon profil médical soient pré-listés dans le formulaire de crise,
**afin de** ne pas les ressaisir à chaque crise.

**Critères d'acceptation :**

- [x] Les traitements de crise actifs (date_fin vide + type = crise) s'affichent en chips dans le formulaire
- [ ] Au survol d'un traitement : posologie enregistrée affichée
- [ ] Dernier traitement pris pré-sélectionné par défaut

---

### US-07-05 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** consulter et modifier mon historique de traitements,
**afin de** corriger une erreur ou ajouter un traitement oublié.

**Critères d'acceptation :**

- [x] Vue liste avec badge d'efficacité, dates de début/fin, classe
- [x] Modification possible de tous les champs
- [x] Suppression avec confirmation (même mécanisme corbeille que les crises)

---

## EPIC E08 — Détection de patterns & indicateur de risque

> En tant que patient, je veux que l'app identifie automatiquement mes patterns de déclencheurs, afin de mieux anticiper et prévenir mes crises.

### US-08-01 · 🔴 Critique · FREE

**En tant que** patient,
**je veux** que l'app analyse automatiquement mes données pour détecter des patterns de déclencheurs,
**afin de** connaître mes facteurs personnels sans avoir à faire l'analyse moi-même.

**Critères d'acceptation :**

- [x] Analyse déclenchée à chaque ouverture et après chaque nouvelle entrée
- [x] Minimum 10 crises requis pour des résultats fiables
- [x] Seuil de confiance ≥ 60% et ≥ 5 occurrences avant affichage
- [x] Sources analysées : alimentation, stress, sommeil, météo, cycle, transport, sport, charge mentale

---

### US-08-02 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** valider ou rejeter les patterns détectés par l'app,
**afin que** l'indicateur de risque ne s'appuie que sur des patterns que j'ai confirmés.

**Critères d'acceptation :**

- [x] Chaque pattern affiché avec boutons Valider / Rejeter
- [x] Statut stocké dans `config/patterns-valides.md`
- [x] Seuls les patterns validés alimentent l'indicateur de risque
- [x] Les patterns rejetés ne réapparaissent pas sauf si la confiance augmente significativement

---

### US-08-03 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** que l'indicateur de risque du jour synthétise tous mes patterns actifs,
**afin de** savoir en un coup d'œil si aujourd'hui est un jour à risque.

**Critères d'acceptation :**

- [x] Trois niveaux : Faible / Modéré / Élevé avec code couleur
- [x] Détail au clic : liste des facteurs actifs avec explication
- [x] Calculé entièrement en local — aucun appel réseau
- [x] Visible en premier sur l'écran d'accueil

---

### US-08-04 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** que l'app détecte les migraines de décompression (chute de charge mentale),
**afin de** comprendre pourquoi j'ai des crises le week-end ou en début de vacances.

**Critères d'acceptation :**

- [x] Pattern détecté : charge ≥ 7 pendant ≥ 3 jours, puis chute ≤ 4
- [x] Formulation : « 75% de vos crises surviennent dans les 24h suivant une chute de charge > 4 points »
- [x] Intégré à l'indicateur de risque du jour

---

### US-08-05 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** que l'app détecte des patterns de combinaisons de facteurs,
**afin de** comprendre les interactions entre déclencheurs.

**Critères d'acceptation :**

- [x] Combinaisons multi-facteurs analysées (ex : stress élevé + sommeil court)
- [x] Formulation : « Stress élevé + moins de 6h de sommeil → crise dans les 48h dans 82% des cas »
- [x] Minimum 5 occurrences requis pour chaque combinaison

---

### US-08-06 · 🟢 Basse · FREE

**En tant que** patient,
**je veux** voir la périodicité estimée de mes crises,
**afin d'anticiper** approximativement la prochaine.

**Critères d'acceptation :**

- [x] Calcul de l'intervalle moyen entre les crises
- [x] Affiché dans les patterns : « Une crise survient en moyenne tous les X jours »
- [x] Intervalle de confiance affiché (min / moy / max)

---

## EPIC E09 — Profil médical

> En tant que patient, je veux renseigner mon profil médical, afin que l'app soit personnalisée à ma pathologie et à mon traitement.

### US-09-01 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** renseigner mon profil médical complet,
**afin que** l'app connaisse ma pathologie et personnalise ses suggestions.

**Critères d'acceptation :**

- [x] Type de migraine (épisodique, chronique, avec aura, hémiplégique…)
- [x] Traitements de fond et de crise en cours (références vers `traitements/`)
- [x] Antécédents cardiovasculaires, allergies, contre-indications
- [x] Médecin traitant et neurologue (nom, coordonnées)
- [x] Contraception en cours
- [x] Stocké dans `profil-medical.md`

---

### US-09-02 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** modifier mon profil médical à tout moment,
**afin de** le maintenir à jour après une consultation ou un changement de traitement.

**Critères d'acceptation :**

- [x] Accès depuis Préférences → Profil médical
- [x] Tous les champs éditables
- [x] Modification propagée automatiquement aux formulaires de crise (traitements pré-listés)

---

### US-09-03 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** que le profil médical soit inclus dans le rapport PDF,
**afin que** le médecin ait le contexte complet en un seul document.

**Critères d'acceptation :**

- [x] Section « Profil patient » en première page du rapport
- [x] Inclut : type de migraine, traitements en cours, antécédents pertinents
- [x] Médecin traitant et neurologue mentionnés si renseignés

---

## EPIC E10 — Tracking du cycle menstruel

> En tant que patiente, je veux suivre mon cycle menstruel et le corréler avec mes crises, afin d'identifier et d'anticiper la migraine cataméniale.

### US-10-01 · 🟠 Haute · FREE

**En tant que** patiente,
**je veux** activer et configurer le module cycle menstruel,
**afin de** pouvoir tracker mes données hormonales séparément des autres données.

**Critères d'acceptation :**

- [x] Module désactivé par défaut — activation dans Préférences → Modules
- [x] Choix de contraception configurable (aucune / pilule combinée / progestative / DIU hormonal / DIU cuivre / autre)
- [x] Le module apparaît dans la navigation uniquement si activé

---

### US-10-02 · 🟠 Haute · FREE

**En tant que** patiente,
**je veux** enregistrer le début de mes règles, leur durée et l'intensité des symptômes prémenstruels,
**afin de** tracker mon cycle et ses impacts.

**Critères d'acceptation :**

- [x] Date de début des règles, durée en jours
- [x] Intensité des symptômes : échelle 1-5 avec référentiel fonctionnel
- [x] Phase du cycle calculée automatiquement (menstruelle / folliculaire / ovulatoire / lutéale)
- [x] Notes libres
- [x] Stocké dans `cycle/YYYY-MM_cycle.md`

---

### US-10-03 · 🟠 Haute · FREE

**En tant que** patiente,
**je veux** être alertée quand j'entre dans la fenêtre à risque cataménial,
**afin d'anticiper** une éventuelle crise périmenstruelle.

**Critères d'acceptation :**

- [x] Alerte déclenchée 2 jours avant le début des règles
- [x] Alerte maintenue jusqu'à 3 jours après le début
- [ ] Message factuel, non alarmiste (fonction isInCatamenialWindow implémentée, alerte UI à connecter)

---

### US-10-04 · 🟡 Moyenne · FREE

**En tant que** patiente,
**je veux** voir la corrélation entre mon cycle et mes crises en graphique,
**afin de** confirmer ou infirmer la migraine cataméniale dans mon cas.

**Critères d'acceptation :**

- [ ] Graphique crises vs cycle (courbe multi-séries)
- [ ] Si ≥ 60% des crises en phase périmenstruelle sur 3 cycles : alerte « Corrélation confirmée »
- [ ] Inclus dans le rapport médical PDF

---

### US-10-05 · 🟢 Basse · FREE

**En tant que** patiente ayant changé de contraception,
**je veux** être rappelée de surveiller l'évolution sur les 3 prochains mois,
**afin de** détecter un impact éventuel sur mes migraines.

**Critères d'acceptation :**

- [ ] Alerte déclenchée automatiquement après un changement de contraception dans le profil
- [ ] Rappel mensuel pendant 3 mois avec message de suivi

---

## EPIC E11 — Suivi des rendez-vous médicaux

> En tant que patient, je veux consigner mes consultations médicales, afin d'avoir un historique complet de mon parcours de soins et de ne pas oublier les rendez-vous à venir.

### US-11-01 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** enregistrer une consultation médicale avec ses détails,
**afin d'avoir** un historique complet des décisions prises avec mon médecin.

**Critères d'acceptation :**

- [x] Champs : date/heure, médecin, spécialité, type, motif, résumé, décisions, ordonnances, prochain RDV
- [x] Type : En cabinet / Téléconsultation / Urgences / Hospitalisation
- [x] Résumé en Markdown (formatage simple)
- [x] Stocké dans `consultations/`

---

### US-11-02 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** que les consultations soient incluses dans le rapport médical PDF,
**afin que** mon médecin voit l'historique des consultations sur la période.

**Critères d'acceptation :**

- [x] Section dédiée dans le rapport avec liste des consultations sur la période
- [x] Pour chaque consultation : date, médecin, décisions prises

---

### US-11-03 · 🟡 Moyenne · FREE

**En tant que** patient ayant planifié un rendez-vous,
**je veux** recevoir des rappels 7 jours avant et la veille de la consultation,
**afin de** ne pas l'oublier.

**Critères d'acceptation :**

- [ ] Rappels automatiques si `prochain_rdv` est renseigné
- [ ] Notification système avec nom du médecin, heure, lieu
- [ ] Désactivable par rendez-vous

---

### US-11-04 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** consulter et modifier l'historique de mes rendez-vous médicaux,
**afin de** corriger une erreur ou ajouter des notes après coup.

**Critères d'acceptation :**

- [x] Vue liste chronologique
- [x] Modification de tous les champs
- [x] Suppression avec confirmation (mécanisme corbeille)

---

## EPIC E12 — Suivi des transports

> En tant que patient, je veux tracker mes déplacements, afin d'identifier si certains moyens de transport déclenchent mes migraines.

### US-12-01 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** enregistrer un trajet en moins de 3 champs,
**afin de** suivre mes transports sans y passer trop de temps.

**Critères d'acceptation :**

- [x] Champs : date/heure, moyen de transport, durée, conditions, distance (optionnel)
- [x] Moyen : voiture, train, métro, bus, avion, vélo, marche, moto + Autre
- [x] Conditions : conduite, passager, debout, foule, bruit fort, trajet long + Autre
- [x] Stocké dans `transports/`

---

### US-12-02 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** voir la corrélation entre mes transports et mes crises dans les 12h suivantes,
**afin d'identifier** si certains trajets sont des déclencheurs.

**Critères d'acceptation :**

- [ ] Corrélation analysée sur les 12h précédant chaque crise
- [ ] Graphique crises vs transports dans le dashboard
- [ ] Intégré au moteur de patterns

---

### US-12-03 · 🟢 Basse · FREE

**En tant que** patient,
**je veux** consulter et modifier mon historique de trajets,
**afin de** corriger une erreur ou supprimer un trajet mal saisi.

**Critères d'acceptation :**

- [x] Vue liste des trajets avec résumé
- [x] Modification et suppression (mécanisme corbeille)

---

## EPIC E13 — Suivi des activités sportives

> En tant que patient, je veux tracker mon activité physique, afin de comprendre l'impact de l'exercice sur mes migraines.

### US-13-01 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** enregistrer une activité sportive avec son type et son intensité,
**afin d'analyser** son impact sur mes crises dans les 24h.

**Critères d'acceptation :**

- [x] Champs : date/heure, type, durée, intensité (1-5), conditions, FC max (optionnel), hydratation
- [x] Types extensibles : course, vélo, natation, yoga, musculation, randonnée + Autre
- [x] Référentiel d'intensité fonctionnel affiché au survol
- [x] Stocké dans `sport/`

---

### US-13-02 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** voir la corrélation entre mon activité sportive et mes crises,
**afin de** savoir si l'exercice est un facteur protecteur ou déclencheur dans mon cas.

**Critères d'acceptation :**

- [ ] Corrélation sur les 24h précédant chaque crise
- [ ] Graphique crises vs activité dans le dashboard (courbe multi-séries)
- [ ] Distingue sport intense vs modéré

---

### US-13-03 · 🟢 Basse · FREE

**En tant que** patient,
**je veux** consulter et modifier mon historique d'activités sportives,
**afin de** corriger une erreur ou supprimer une saisie.

**Critères d'acceptation :**

- [x] Vue liste chronologique avec type et intensité
- [x] Modification et suppression (mécanisme corbeille)

---

## EPIC E14 — Saisie vocale assistée

> En tant que patient en pleine crise, je veux dicter mes données à voix haute, afin de saisir une crise sans regarder l'écran.

### US-14-01 · 🟠 Haute · FREE

**En tant que** patient en pleine crise,
**je veux** activer un mode de saisie vocale guidé,
**afin de** renseigner mon formulaire sans avoir à toucher l'écran.

**Critères d'acceptation :**

- [x] Mode dialogue séquentiel : une question par champ
- [x] Basé sur Web Speech API (Chrome natif)
- [x] Fonctionne en mode Crise et en mode Complet
- [x] Confirmation avant enregistrement : résumé complet lu avant validation

---

### US-14-02 · 🟡 Moyenne · FREE

**En tant que** patient en public,
**je veux** basculer la saisie vocale en mode texte uniquement (sans synthèse vocale),
**afin de** ne pas déranger mon entourage.

**Critères d'acceptation :**

- [x] Option « Mode silencieux » dans les préférences vocales
- [x] La dictée fonctionne mais les réponses de l'assistant s'affichent en texte seulement
- [x] Configurable par défaut ou par session

---

### US-14-03 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** utiliser la saisie vocale pour enregistrer ma charge mentale quotidienne,
**afin de** réaliser cette saisie rapide sans mobiliser mes yeux.

**Critères d'acceptation :**

- [ ] Disponible depuis le module charge mentale
- [ ] Dialogue minimal : « Quel est votre niveau de charge aujourd'hui, de 1 à 10 ? »
- [ ] Confirmation et enregistrement en < 30 secondes

---

### US-14-04 · 🟢 Basse · FREE

**En tant que** patient dont la connexion est instable,
**je veux** que la saisie vocale fonctionne partiellement hors ligne,
**afin de** ne pas perdre cette fonctionnalité lors d'une crise.

**Critères d'acceptation :**

- [ ] Mode offline limité de Chrome activé automatiquement si pas de connexion
- [ ] Message informatif si la reconnaissance est dégradée hors ligne

---

## EPIC E15 — Traqueur de charge mentale & événements de vie

> En tant que patient, je veux suivre ma charge mentale quotidienne, afin d'identifier et d'anticiper les migraines de décompression.

### US-15-01 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** saisir mon niveau de charge mentale quotidien en moins de 30 secondes,
**afin de** ne pas y passer trop de temps tout en alimentant les analyses de patterns.

**Critères d'acceptation :**

- [x] Saisie principale : niveau de charge 1-10 avec référentiel fonctionnel
- [x] Champs complémentaires : domaine dominant, humeur, contexte du jour, notes libres
- [x] Tous les champs de sélection extensibles
- [ ] Saisie disponible en mode vocal
- [x] Stocké dans `charge-mentale/`

---

### US-15-02 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** enregistrer un événement de vie significatif,
**afin d'analyser** son impact sur mes crises autour de cette période.

**Critères d'acceptation :**

- [x] Champs : dates début/fin, catégorie, nature (positif/négatif/neutre), intensité perçue, description
- [x] Catégories extensibles : professionnel, relationnel, deuil, déménagement, santé, financier + Autre
- [x] Stocké dans `charge-mentale/evenements/`

---

### US-15-03 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** que l'app détecte automatiquement les patterns de décompression dans mon historique,
**afin de** comprendre pourquoi j'ai des crises le week-end ou à la fin d'une période intense.

**Critères d'acceptation :**

- [ ] Pattern détecté : charge ≥ 7 pendant ≥ 3 jours puis chute ≤ 4
- [ ] Fenêtre d'analyse : 24h après la chute
- [ ] Formulation explicite du pattern dans la vue « Mes patterns »

---

### US-15-04 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** voir l'évolution de ma charge mentale sur une période et sa corrélation avec mes crises,
**afin d'identifier** les périodes à risque.

**Critères d'acceptation :**

- [ ] Graphique courbe de charge mentale avec marqueurs de crises
- [ ] Accessible depuis le dashboard

---

### US-15-05 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** consulter et modifier mon historique de charge mentale,
**afin de** corriger une entrée ou compléter des notes.

**Critères d'acceptation :**

- [x] Vue liste des saisies quotidiennes
- [x] Modification et suppression (mécanisme corbeille)

---

## EPIC E16 — Tracking quotidien de la douleur

> En tant que patient, je veux enregistrer chaque jour mon niveau de douleur, afin d'avoir une vue continue de mon état entre les crises déclarées.

### US-16-01 · 🔴 Critique · FREE

**En tant que** patient,
**je veux** renseigner mon niveau de douleur quotidien en 2 clics,
**afin de** maintenir un journal continu sans effort.

**Critères d'acceptation :**

- [x] Saisie principale : date (pré-remplie) + curseur de douleur 0-10
- [x] Option « Même niveau qu'hier » pour accélérer la saisie répétitive
- [x] Ancre personnelle rappelée sous le curseur (même repère que le journal des crises)
- [x] Stocké dans `daily-pain/YYYY-MM-DD.md`

---

### US-16-02 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** lier une entrée de douleur quotidienne à une crise enregistrée ce jour,
**afin de** maintenir la cohérence entre les deux modules.

**Critères d'acceptation :**

- [x] Booléen « Lié à une crise » + référence vers le fichier crise du jour
- [x] Si niveau ≥ 7 et aucune crise créée ce jour : suggestion de créer une crise

---

### US-16-03 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** voir mon niveau de douleur quotidien sur une courbe continue dans le dashboard,
**afin d'avoir** une vue longitudinale de mon état général.

**Critères d'acceptation :**

- [ ] Graphique linéaire continu intégré dans la heatmap calendrier (combiné avec les crises)
- [ ] Moyenne glissante sur 7 jours affichée en surimpression
- [ ] Alerte si augmentation progressive sur 3 jours consécutifs

---

### US-16-04 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** consulter et modifier mon historique de douleur quotidienne,
**afin de** corriger une saisie erronée.

**Critères d'acceptation :**

- [x] Vue liste des entrées avec niveau et type de douleur
- [x] Modification et suppression (mécanisme corbeille)

---

## EPIC E17 — Multi-profil & abonnements

> En tant qu'aidant, je veux gérer plusieurs profils dans l'application, afin de suivre la migraine d'un proche depuis mon propre compte, avec des données totalement isolées.

### US-17-01 · 🔴 Critique · FREE

**En tant qu'** aidant,
**je veux** créer un nouveau profil associé à un vault distinct,
**afin de** suivre la migraine d'un proche sans mélanger ses données avec les miennes.

**Critères d'acceptation :**

- [x] Champs : nom du profil, couleur d'identification, sélection du dossier vault
- [x] Chaque profil a son propre vault Obsidian (dossier séparé)
- [x] Isolation complète des données entre profils
- [x] Profil créé en FREE par défaut

---

### US-17-02 · 🔴 Critique · FREE

**En tant qu'** aidant,
**je veux** basculer rapidement entre les profils que je gère,
**afin de** ne pas me tromper de vault lors de la saisie.

**Critères d'acceptation :**

- [ ] Raccourci clavier `Cmd/Ctrl + P` pour ouvrir le sélecteur de profil
- [ ] Rechargement complet du vault lors du changement
- [x] Le profil actif est visible en permanence dans le header (nom + couleur)
- [x] Confirmation de basculement : « Vous allez passer sur le profil X. »

---

### US-17-03 · 🟠 Haute · FREE

**En tant qu'** utilisateur changeant de machine,
**je veux** que mes profils soient restaurés depuis Supabase,
**afin de** retrouver ma configuration sans tout recréer.

**Critères d'acceptation :**

- [ ] Au démarrage, l'app compare les profils locaux (IndexedDB) avec Supabase `user_profiles`
- [ ] En cas de divergence : proposition de restauration depuis le serveur
- [ ] L'utilisateur doit re-pointer chaque vault manuellement (chemins non transférables)

---

### US-17-04 · 🟡 Moyenne · FREE

**En tant qu'** utilisateur,
**je veux** supprimer un profil de la liste,
**afin de** retirer un proche dont je ne gère plus la migraine.

**Critères d'acceptation :**

- [x] La suppression retire la référence au profil (IndexedDB + Supabase)
- [x] Le vault local n'est pas touché
- [ ] Si un abonnement Pro est actif sur ce profil : annulation Stripe déclenchée via webhook
- [x] Confirmation en deux étapes

---

### US-17-05 · 🟠 Haute · PRO

**En tant qu'** utilisateur,
**je veux** souscrire à un abonnement Pro pour un profil spécifique,
**afin de** débloquer le module IA et les fonctionnalités avancées uniquement pour ce profil.

**Critères d'acceptation :**

- [ ] Stripe Checkout s'ouvre pour le profil sélectionné spécifiquement
- [ ] Le plan Pro est attaché au profil, pas au compte
- [ ] Un compte peut avoir des profils free et Pro simultanément
- [ ] En cas d'annulation : module IA désactivé sur ce profil uniquement

---

### US-17-06 · 🟠 Haute · FREE/PRO

**En tant qu'** utilisateur,
**je veux** que les fonctionnalités de mon plan soient appliquées automatiquement à l'ouverture,
**afin de** ne pas avoir à configurer manuellement ce à quoi j'ai accès.

**Critères d'acceptation :**

- [ ] Feature flags récupérés depuis Supabase `plan_config` au démarrage
- [x] Mis en cache IndexedDB pour usage offline
- [ ] Modules désactivés visibles mais grisés avec badge Pro
- [ ] Dashboard limité à 3 mois si `analytics_range_months = 3`

---

### US-17-07 · 🟡 Moyenne · FREE

**En tant qu'** utilisateur en plan free souhaitant passer Pro,
**je veux** voir clairement ce que je gagnerais en passant au plan Pro,
**afin de** prendre une décision informée.

**Critères d'acceptation :**

- [ ] Chaque fonctionnalité Pro grisée affiche un message « Disponible avec le plan Pro »
- [ ] Page dédiée comparant free et Pro
- [ ] Les données accumulées en free restent intégralement accessibles après upgrade

---

### US-17-08 · 🟡 Moyenne · FREE

**En tant qu'** utilisateur Pro qui rétrograde en free,
**je veux** que mes données soient préservées,
**afin de** ne rien perdre malgré le changement de plan.

**Critères d'acceptation :**

- [ ] Les feature flags du plan free s'appliquent immédiatement
- [ ] Les résultats IA déjà générés dans le vault restent accessibles en lecture
- [ ] Les données du vault ne sont jamais supprimées lors d'une rétrogradation

---

## EPIC E18 — Données environnementales

> En tant que patient, je veux que l'app récupère automatiquement les données météo pour ma localisation, afin d'analyser l'impact de l'environnement sur mes crises sans saisie manuelle.

### US-18-01 · 🔴 Critique · FREE

**En tant que** patient,
**je veux** configurer ma localisation par défaut pour la météo automatique,
**afin que** les données météo du jour soient récupérées sans que j'aie à saisir mon adresse à chaque fois.

**Critères d'acceptation :**

- [x] Option 1 : adresse saisie via autocomplétion Photon
- [x] Option 2 : géolocalisation OS (permission navigateur)
- [x] Option 3 : lieux favoris enregistrés (domicile, travail…)
- [x] Si aucune option : alerte au premier lancement

---

### US-18-02 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** que les données météo (pression, température, humidité, vent, UV) soient récupérées automatiquement chaque jour,
**afin de** les corréler avec mes crises sans effort.

**Critères d'acceptation :**

- [x] Récupération via Open-Meteo à chaque ouverture (gratuite, sans clé API)
- [x] Stocké dans `environnement/YYYY-MM-DD_env.md`
- [ ] Hors connexion : utilisation des dernières données disponibles
- [x] Variation de pression sur 24h calculée et stockée

---

### US-18-03 · 🟡 Moyenne · FREE

**En tant que** patient en déplacement,
**je veux** que les données météo de mes crises en voyage correspondent à ma localisation réelle,
**afin d'avoir** des corrélations météo précises même hors de mon domicile.

**Critères d'acceptation :**

- [ ] Si une crise enregistre une adresse différente de la localisation par défaut : requête Open-Meteo supplémentaire pour cette localisation
- [ ] Fichier météo distinct créé pour la localisation spécifique

---

### US-18-04 · 🟡 Moyenne · FREE

**En tant que** patient qui découvre l'application avec des crises déjà passées,
**je veux** récupérer les données météo historiques pour mes crises déjà enregistrées,
**afin de** bénéficier des corrélations météo dès le départ.

**Critères d'acceptation :**

- [ ] Proposition au premier lancement du module météo : « Récupérer la météo historique ? »
- [ ] API historique Open-Meteo utilisée pour les dates passées
- [ ] Traitement en arrière-plan sans bloquer l'interface

---

### US-18-05 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** que la phase lunaire de chaque jour soit calculée localement et stockée,
**afin de** pouvoir explorer une éventuelle corrélation personnelle à titre informatif.

**Critères d'acceptation :**

- [x] Calcul via suncalc (calcul local, sans appel réseau)
- [x] Données stockées dans `environnement/YYYY-MM-DD_env.md` : phase, illumination, prochaine pleine/nouvelle lune
- [x] Affiché dans le dashboard avec label explicite : donnée exploratoire, non validée scientifiquement

---

## EPIC E19 — Module IA

> En tant que patient Pro, je veux accéder à des analyses IA approfondies de mes données, afin d'obtenir des insights personnalisés que les algorithmes classiques ne peuvent pas détecter.

### US-19-01 · 🟠 Haute · PRO

**En tant que** patient Pro,
**je veux** voir les conditions d'utilisation détaillées avant d'activer le module IA,
**afin de** comprendre exactement quelles données sont envoyées à l'API.

**Critères d'acceptation :**

- [x] Écran de consentement au premier accès au module IA
- [x] Liste précise des données envoyées (anonymisées) et celles exclues
- [x] Bouton « Voir ce qui sera envoyé » disponible avant chaque analyse
- [x] L'utilisateur peut désactiver le module à tout moment

---

### US-19-02 · 🟠 Haute · PRO

**En tant que** patient Pro,
**je veux** lancer une analyse IA approfondie de mes patterns de déclencheurs,
**afin d'obtenir** des insights complexes que l'analyse locale ne peut pas détecter.

**Critères d'acceptation :**

- [x] Appel à la demande ou automatique hebdomadaire (opt-in, décoché par défaut)
- [x] Données envoyées anonymisées côté client avant envoi
- [x] Résultats stockés dans `ia/patterns-ia.md`
- [x] Badge IA distinctif sur les patterns générés par l'IA
- [x] L'utilisateur peut valider ou rejeter chaque pattern IA

---

### US-19-03 · 🟠 Haute · PRO

**En tant que** patient Pro,
**je veux** recevoir des recommandations personnalisées basées sur mon historique,
**afin d'adopter** des habitudes de vie concrètes pour réduire mes crises.

**Critères d'acceptation :**

- [x] Recommandations formulées en langage non médical, jamais prescriptives sur les médicaments
- [x] Basées exclusivement sur les données personnelles
- [x] Chaque recommandation accompagnée d'un indice de confiance
- [x] Stockées dans `ia/recommandations.md`
- [x] Rafraîchissables à la demande ou automatiquement (opt-in)

---

### US-19-04 · 🟠 Haute · PRO

**En tant que** patient Pro,
**je veux** générer un résumé narratif de l'évolution de ma pathologie pour mon médecin,
**afin d'enrichir** mon rapport PDF d'un texte rédigé.

**Critères d'acceptation :**

- [x] Résumé générable sur 1 mois / 3 mois / 6 mois
- [x] Niveau de détail : synthétique ou détaillé
- [x] Langue : français ou anglais
- [x] Intégrable dans le rapport PDF (section dédiée)
- [x] Stocké dans `ia/resumes/YYYY-MM-DD_resume.md`

---

### US-19-05 · 🟠 Haute · PRO

**En tant que** patient Pro,
**je veux** affiner l'indicateur de risque local avec une analyse IA,
**afin d'obtenir** une probabilité de crise plus précise.

**Critères d'acceptation :**

- [x] Bouton « Affiner avec l'IA » affiché sous l'indicateur de risque local
- [x] Déclenché à la demande uniquement par défaut
- [x] Option d'automatisation au démarrage (opt-in, décoché par défaut)
- [x] Probabilité affichée en % avec détail des facteurs contributeurs
- [x] Disclaimer permanent : « Ne remplace pas l'avis médical »

---

### US-19-06 · 🟡 Moyenne · PRO

**En tant que** patient Pro,
**je veux** voir un journal de tous les appels IA effectués,
**afin de** contrôler exactement ce qui a été envoyé à l'API.

**Critères d'acceptation :**

- [x] Journal stocké dans `config/ia-log.md`
- [x] Contenu : date, type d'analyse, résumé des données envoyées, déclenchement (manuel/auto)
- [x] Accessible depuis Préférences → Module IA

---

### US-19-07 · 🟡 Moyenne · PRO

**En tant que** patient Pro,
**je veux** pouvoir exclure mes notes libres de l'envoi à l'API IA,
**afin de** protéger les informations les plus personnelles.

**Critères d'acceptation :**

- [x] Option « Exclure les notes libres » dans les préférences du module IA
- [x] Si activée, le champ `notes` est supprimé avant anonymisation et envoi
- [x] L'utilisateur est informé que cette exclusion peut réduire la qualité des analyses

---

### US-19-08 · 🟡 Moyenne · PRO

**En tant que** patient Pro,
**je veux** que l'app m'indique clairement quand il n'y a pas assez de données pour une prédiction fiable,
**afin de** ne pas me fier à des résultats peu significatifs.

**Critères d'acceptation :**

- [x] En dessous de 10 crises : module IA de prédiction désactivé avec message explicatif
- [x] L'indicateur de risque local (niveau 1) reste toujours actif
- [x] L'indice de confiance et le nombre de crises de calibration sont toujours affichés

---

## EPIC E20 — Saisie mobile — mode Crise à distance

> En tant que patient en déplacement, je veux saisir une crise depuis mon téléphone, afin de ne pas perdre l'enregistrement faute d'avoir mon ordinateur.

### US-20-01 · 🔴 Critique · FREE

**En tant que** patient,
**je veux** activer la saisie mobile depuis l'app desktop,
**afin de** lier mon téléphone à mon vault de façon sécurisée.

**Critères d'acceptation :**

- [x] Activation depuis Préférences → « Activer la saisie mobile »
- [x] Génération d'une clé AES-256-GCM stockée dans `config/mobile-sync.md`
- [x] QR code affiché contenant le secret de dérivation
- [x] L'utilisateur scanne le QR code depuis son téléphone — secret stocké dans localStorage mobile

---

### US-20-02 · 🔴 Critique · FREE

**En tant que** patient en pleine crise loin de son ordinateur,
**je veux** enregistrer une crise depuis mon téléphone en moins de 15 secondes,
**afin de** ne pas perdre l'enregistrement par manque d'accès au desktop.

**Critères d'acceptation :**

- [x] Interface mobile disponible sur `m.migraine-ai.app`
- [x] 3 champs : heure (défaut : maintenant), intensité (curseur), traitement (chips)
- [x] Fond sombre permanent, zones tactiles ≥ 48px, aucun scroll
- [x] Données sérialisées en YAML, chiffrées (AES-256-GCM) et envoyées à Supabase
- [x] Confirmation : « Crise enregistrée. Elle sera intégrée à votre vault à la prochaine ouverture. »

---

### US-20-03 · 🟠 Haute · FREE

**En tant que** patient en déplacement,
**je veux** enregistrer mon niveau de douleur quotidien et ma charge mentale depuis mon téléphone,
**afin de** maintenir mon suivi même loin de mon ordinateur.

**Critères d'acceptation :**

- [x] Écran Douleur quotidienne : 1 champ (curseur 0-10), < 5 secondes
- [x] Écran Charge mentale : 1 champ (curseur 1-10), < 5 secondes
- [x] Même flux chiffré que la saisie de crise

---

### US-20-04 · 🔴 Critique · FREE

**En tant que** patient,
**je veux** que mes saisies mobiles soient automatiquement intégrées dans mon vault à l'ouverture du desktop,
**afin de** retrouver toutes mes données au bon endroit sans action manuelle.

**Critères d'acceptation :**

- [x] Vérification de `mobile_transit` au démarrage desktop
- [x] Déchiffrement local avec la clé de `config/mobile-sync.md`
- [x] Écriture dans `crises/`, `daily-pain/`, `charge-mentale/` avec `source: mobile`
- [ ] Crises mobiles apparaissent en zone d'attention avec badge « Saisie mobile »
- [x] Entrées synchronisées supprimées de Supabase immédiatement
- [x] Toast de confirmation : « X entrées saisies depuis votre téléphone ont été ajoutées. »

---

### US-20-05 · 🟠 Haute · FREE

**En tant que** patient hors connexion sur mobile,
**je veux** que mes saisies soient conservées localement et envoyées dès le retour de connexion,
**afin de** ne rien perdre même sans internet.

**Critères d'acceptation :**

- [x] Saisie stockée en IndexedDB sur le mobile si hors connexion
- [x] Envoi automatique à Supabase dès connexion rétablie
- [x] Aucun message d'erreur bloquant — l'utilisateur voit sa saisie confirmée

---

### US-20-06 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** pouvoir révoquer l'accès mobile et régénérer la clé de chiffrement,
**afin de** sécuriser mon vault si je perds mon téléphone.

**Critères d'acceptation :**

- [x] Option « Régénérer la clé » dans Préférences → Saisie mobile
- [x] Les anciens appareils ne peuvent plus chiffrer de nouvelles entrées
- [x] Les entrées non synchronisées avec l'ancienne clé restent déchiffrables (historique des clés)
- [x] Notification confirmant la révocation

---

### US-20-07 · 🟢 Basse · FREE

**En tant que** patient avec des saisies mobiles non synchronisées depuis longtemps,
**je veux** être prévenu avant que ces données soient purgées,
**afin de** les synchroniser avant leur suppression automatique.

**Critères d'acceptation :**

- [x] Notification à 80 jours sans synchronisation
- [ ] Message : « Vous avez des saisies mobiles non synchronisées depuis 80 jours. Ouvrez Migraine AI sur votre ordinateur. »
- [x] Purge automatique à 90 jours (cron Supabase)

---

## EPIC E21 — Administration & feature flags

> En tant qu'administrateur, je veux gérer les utilisateurs et configurer les plans depuis une interface dédiée, afin de piloter l'offre sans intervention technique.

### US-21-01 · 🔴 Critique · ADMIN

**En tant qu'** administrateur,
**je veux** me connecter à l'interface d'administration sur `admin.migraine-ai.app`,
**afin d'accéder** aux fonctionnalités de gestion.

**Critères d'acceptation :**

- [x] Connexion via Supabase Auth (même méthodes que l'app utilisateur)
- [x] Vérification du rôle `admin` en base de données (RLS)
- [x] Session timeout après 15 minutes d'inactivité
- [x] Toutes les actions sont journalisées dans `admin_log`

---

### US-21-02 · 🔴 Critique · ADMIN

**En tant qu'** administrateur,
**je veux** voir la liste de tous les utilisateurs avec leurs métriques clés,
**afin de** monitorer l'usage de la plateforme.

**Critères d'acceptation :**

- [x] Nom, email masqué (`a***@gmail.com`), date d'inscription, plan, dernière connexion
- [x] Dernière utilisation, fréquence d'utilisation sur 30 jours glissants, nombre de profils
- [x] Plan actif par profil avec `stripe_subscription_id`
- [x] Bouton « Révéler l'email » — action journalisée

---

### US-21-03 · 🟠 Haute · ADMIN

**En tant qu'** administrateur,
**je veux** configurer les feature flags du plan free et du plan Pro,
**afin de** faire évoluer l'offre sans déploiement technique.

**Critères d'acceptation :**

- [x] Écran dédié « Configuration des plans »
- [x] Tous les feature flags modifiables : modules, durée d'analyse, exports, saisie vocale, max profils
- [x] Modification prise en compte par chaque utilisateur à sa prochaine ouverture d'app
- [x] Chaque modification journalisée (date, admin, ancienne valeur, nouvelle valeur)

---

### US-21-04 · 🟠 Haute · ADMIN

**En tant qu'** administrateur,
**je veux** désactiver temporairement un compte utilisateur,
**afin de** gérer les abus ou les situations exceptionnelles.

**Critères d'acceptation :**

- [x] Bascule `is_active: false` dans `user_usage`
- [x] L'utilisateur est bloqué au login dès la prochaine tentative
- [x] Message affiché à l'utilisateur : « Votre compte a été désactivé. Contactez le support. »
- [x] Le vault local de l'utilisateur n'est pas touché

---

### US-21-05 · 🟡 Moyenne · ADMIN

**En tant qu'** administrateur,
**je veux** supprimer définitivement un compte utilisateur,
**afin de** respecter une demande RGPD de droit à l'oubli.

**Critères d'acceptation :**

- [ ] Suppression de l'entrée Supabase Auth + `user_usage` via Edge Function `delete-user` (nécessite `service_role_key`)
- [ ] Suppression en cascade : `user_profiles`, `profile_plans`, `mobile_transit` (via `ON DELETE CASCADE`)
- [ ] L'utilisateur ne peut plus se connecter
- [ ] Le vault local n'est pas touché
- [ ] Action journalisée dans `admin_log` avant suppression (irréversible)
- [ ] Confirmation en deux étapes : saisie de l'email utilisateur pour valider
- [ ] Composant `DeleteUserDialog.tsx` avec double confirmation

---

### US-21-06 · 🟡 Moyenne · ADMIN

**En tant qu'** administrateur,
**je veux** exporter les données d'usage non sensibles en CSV,
**afin de** les analyser dans un tableur.

**Critères d'acceptation :**

- [ ] Export sans emails complets par défaut
- [ ] Colonnes : date inscription, plan, fréquence, nombre de profils, consentement marketing
- [ ] Action journalisée

---

### US-21-07 · 🟡 Moyenne · ADMIN

**En tant qu'** administrateur,
**je veux** consulter le journal de toutes les actions administratives,
**afin de** maintenir une traçabilité complète des interventions.

**Critères d'acceptation :**

- [x] Journal horodaté avec : admin, action, cible, ancienne/nouvelle valeur
- [x] Filtrable par admin, type d'action, période
- [x] Non modifiable — lecture seule

---

## EPIC E22 — Infrastructure, robustesse & qualité

> En tant qu'équipe de développement, nous voulons que l'application soit robuste, bien testée et déployable en continu, afin de livrer une expérience fiable aux utilisateurs.

### US-22-01 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** que la séquence de démarrage exécute toutes les opérations critiques dans le bon ordre,
**afin que** l'app soit toujours dans un état cohérent à l'ouverture.

**Critères d'acceptation :**

- [x] 11 étapes exécutées séquentiellement (voir Architecture Technique section 12)
- [x] Chaque étape gère ses propres erreurs sans bloquer les suivantes (sauf FSAPI critique)
- [x] Temps total de démarrage < 2 secondes

---

### US-22-02 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** que les fichiers Markdown corrompus soient détectés et signalés sans bloquer l'application,
**afin que** les erreurs de vault n'empêchent pas l'utilisation de l'app.

**Critères d'acceptation :**

- [x] Scan de validation à chaque démarrage
- [x] Erreurs consignées dans `config/erreurs-vault.md`
- [x] Fichiers corrompus signalés dans la zone d'attention (non bloquants)
- [x] Fichiers vides ignorés silencieusement

---

### US-22-03 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** gérer les conflits d'accès lorsque l'utilisateur ouvre deux onglets sur le même vault,
**afin d'éviter** les corruptions de données par écriture concurrente.

**Critères d'acceptation :**

- [x] Verrou de session via BroadcastChannel
- [x] Le deuxième onglet propose de prendre le contrôle ou de rester en lecture seule
- [x] L'onglet original bascule en lecture seule si le verrou est cédé

---

### US-22-04 · 🟠 Haute · TECH

**En tant que** développeur,
**je veux** gérer la révocation de la permission FSAPI en cours de session,
**afin que** l'utilisateur soit guidé pour restaurer l'accès sans perdre ses données saisies.

**Critères d'acceptation :**

- [ ] Message non-bloquant avec bouton « Ré-autoriser »
- [x] Les données saisies en mémoire sont conservées jusqu'à restauration de l'accès
- [ ] Si le vault est introuvable au démarrage : écran de re-localisation proposé

---

### US-22-05 · 🟠 Haute · TECH

**En tant que** développeur,
**je veux** que les conflits de synchronisation cloud (Dropbox, iCloud) soient détectés et proposés à la résolution,
**afin d'éviter** les overwrite silencieux de données.

**Critères d'acceptation :**

- [ ] Détection via date de modification du fichier
- [ ] Si conflit : choix entre version externe et version locale
- [ ] Pas de surveillance en temps réel — vérification à chaque navigation entre écrans

---

### US-22-06 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** avoir une couverture de tests unitaires ≥ 80% sur les modules critiques,
**afin de** détecter les régressions avant la mise en production.

**Critères d'acceptation :**

- [x] Vitest configuré et intégré en CI
- [ ] Modules couverts : moteur de patterns, parsing YAML, pipeline d'anonymisation IA, purge corbeille
- [ ] Rapport de couverture généré à chaque push
- [ ] Build bloqué si couverture < 80% sur les modules critiques

---

### US-22-07 · 🟠 Haute · TECH

**En tant que** développeur,
**je veux** avoir des tests E2E couvrant les parcours utilisateurs principaux,
**afin de** garantir que les fonctionnalités critiques fonctionnent de bout en bout.

**Critères d'acceptation :**

- [x] Playwright (Chromium headless) configuré en CI
- [ ] Scénarios couverts : onboarding, mode Crise, complétion, rapport PDF, basculement de profil
- [ ] Aucun test E2E en échec autorisé sur la branche `main`

---

### US-22-08 · 🟠 Haute · TECH

**En tant que** développeur,
**je veux** que les régressions d'accessibilité bloquent le merge sur `main`,
**afin de** maintenir la conformité WCAG 2.1 AA en continu.

**Critères d'acceptation :**

- [ ] axe-core intégré dans les tests Playwright
- [ ] Tous les écrans testés (thème clair, sombre, mode Crise)
- [ ] Contraste, taille des zones tactiles, labels ARIA vérifiés automatiquement
- [ ] Violation WCAG AA = merge bloqué

---

### US-22-09 · 🟠 Haute · TECH

**En tant que** développeur,
**je veux** un pipeline CI/CD complet (lint → tests → build → déploiement),
**afin de** livrer les mises à jour en production de façon fiable et automatisée.

**Critères d'acceptation :**

- [x] ESLint + Prettier sur chaque push et pull request
- [x] Tests unitaires + intégration sur chaque push
- [x] Tests E2E sur chaque PR vers `main`
- [x] Build Vite sur chaque merge sur `main`
- [x] Déploiement staging (preview Netlify) sur chaque PR
- [x] Déploiement production automatique sur push vers `prod` après passage de tous les tests

---

---

## EPIC E23 — Navigation & shell applicatif

> En tant qu'utilisateur, je veux naviguer facilement entre toutes les sections de l'application via une navigation persistante et intuitive, afin de ne jamais perdre mon contexte et d'accéder à n'importe quel module en un clic.

### US-23-01 · 🔴 Critique · FREE

**En tant que** patient,
**je veux** disposer d'une sidebar de navigation permanente regroupant tous les modules par catégorie,
**afin de** naviguer vers n'importe quelle section sans revenir à l'accueil.

**Critères d'acceptation :**

- [x] Sidebar fixe à gauche (240px) visible sur desktop (≥ 1024px)
- [x] Modules regroupés par catégorie avec séparateurs : Accès rapide, Suivi, Santé, Analyse, Système
- [x] Le lien actif est visuellement distingué (fond `--color-bg-interactive`, bordure gauche `--color-brand` 3px)
- [x] Bouton « Nouvelle crise » en CTA proéminent en haut de la sidebar
- [x] Un badge numérique apparaît à côté des sections contenant des entrées incomplètes
- [x] Le sélecteur de profil est visible en bas de la sidebar (avatar + nom + couleur)

---

### US-23-02 · 🔴 Critique · FREE

**En tant que** patient,
**je veux** pouvoir réduire la sidebar en mode icônes,
**afin de** gagner de l'espace de contenu quand j'en ai besoin.

**Critères d'acceptation :**

- [x] Bouton toggle en bas de la sidebar pour basculer entre mode étendu (240px) et mode icônes (64px)
- [x] En mode icônes : seules les icônes Lucide sont affichées, avec tooltip au survol pour le label
- [x] Le mode est persisté en `localStorage`
- [x] Animation fluide de transition entre les deux modes (200ms ease)

---

### US-23-03 · 🔴 Critique · FREE

**En tant que** patient utilisant un écran moyen (tablette, petit laptop),
**je veux** que la navigation s'adapte à la taille de mon écran,
**afin que** l'application soit utilisable quelle que soit ma résolution.

**Critères d'acceptation :**

- [x] 768px – 1023px : sidebar masquée par défaut, ouverte en overlay au clic sur un bouton hamburger dans le header
- [x] Overlay semi-transparent sur le contenu quand la sidebar est ouverte en mode overlay
- [x] < 768px : sidebar en drawer plein écran + bottom bar fixe avec 4 raccourcis (Accueil, Nouvelle crise, Dashboard, Menu)
- [x] La bottom bar respecte `env(safe-area-inset-bottom)` pour iOS
- [x] Le bouton hamburger est visible dans le header uniquement quand la sidebar est masquée

---

### US-23-04 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** voir un fil d'Ariane (breadcrumb) en haut de chaque page,
**afin de** savoir où je me trouve dans l'application et remonter facilement dans la hiérarchie.

**Critères d'acceptation :**

- [x] Breadcrumb affiché sous le titre de page : `Accueil > Section > Page courante`
- [x] Chaque élément sauf le dernier est cliquable et navigue vers la page correspondante
- [x] Le dernier élément est affiché en texte non cliquable (`--color-text-muted`)
- [x] Sur mobile (< 768px), seul le lien parent direct est affiché (ex : `← Crises`)

---

### US-23-05 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** que toutes les pages de l'application partagent un layout commun (sidebar + header + contenu),
**afin que** l'expérience soit cohérente et prévisible sur tous les écrans.

**Critères d'acceptation :**

- [x] Composant `AppLayout` wrappant toutes les routes protégées
- [x] Header contextuel avec : titre de la page, breadcrumb, actions spécifiques à la page (ex : bouton Export sur le Dashboard)
- [x] La zone de contenu respecte `max-w-[1200px]` centré avec padding `--space-8`
- [x] Le mode Crise (`/crisis/quick`) bypass le layout (plein écran, pas de sidebar)
- [x] Le layout gère le scroll du contenu indépendamment de la sidebar (sidebar non scrollable ou scroll indépendant)

---

## EPIC E24 — Animations, transitions & états de chargement

> En tant qu'utilisateur, je veux que l'application soit fluide et réactive visuellement, avec des transitions naturelles et un feedback immédiat, afin que l'expérience soit agréable et professionnelle.

### US-24-01 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** que la navigation entre les pages soit accompagnée d'une transition visuelle fluide,
**afin de** percevoir le changement de contexte sans effet de « saut » brutal.

**Critères d'acceptation :**

- [x] Transition `fade + slide` (150ms `ease-out`) entre les pages via React Router
- [x] Le contenu sortant fade-out, le contenu entrant fade-in
- [x] La transition est désactivée si `prefers-reduced-motion: reduce` est actif
- [x] La transition est désactivée en mode Crise (`--transition-speed: 0ms`)
- [x] Implémentation via `@react-spring/web` (déjà en dépendance) ou Framer Motion

---

### US-24-02 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** voir des skeleton screens pendant le chargement des données,
**afin de** percevoir que l'app charge sans voir un écran vide.

**Critères d'acceptation :**

- [x] Skeleton screens pour : les cartes KPI du dashboard, les graphiques Nivo, les listes d'historique, les formulaires pré-remplis
- [x] Les skeletons reprennent les dimensions exactes des composants finaux (pas de saut de layout)
- [x] Animation pulsante subtile (`opacity: 0.4 → 0.7`, boucle infinie, 1.5s)
- [x] Couleur du skeleton : `--color-bg-subtle` sur fond `--color-bg-base`
- [x] Les skeletons sont remplacés par les données réelles sans flash

---

### US-24-03 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** que les interactions courantes (sélection de chip, ouverture de panneau, suppression) soient accompagnées de micro-animations,
**afin que** l'interface soit vivante et que chaque action ait un feedback visuel.

**Critères d'acceptation :**

- [x] Sélection de chip : `scale(0 → 1)` avec léger rebond (200ms)
- [x] Ouverture de panneau expansible : hauteur animée `max-height` (200ms ease-out)
- [x] Suppression d'une ligne d'historique : fade-out + collapse (200ms)
- [x] Hover sur carte : `scale(1.01)` + ombre portée légère (120ms ease)
- [x] Changement d'onglet (dashboard) : cross-fade du contenu (150ms)
- [x] Toutes les animations respectent `prefers-reduced-motion`

---

### US-24-04 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** voir un indicateur de progression lors des opérations longues (export PDF, chargement initial),
**afin de** savoir que l'opération est en cours et estimer le temps restant.

**Critères d'acceptation :**

- [x] Barre de progression horizontale sous le header pour les exports (PDF, ZIP)
- [x] Spinner discret dans le bouton de sauvegarde + texte « Enregistrement… » pendant l'écriture
- [x] L'écran de chargement initial (démarrage app) affiche un logo animé + barre de progression des 11 étapes de démarrage
- [x] En cas d'opération bloquée > 10s, un bouton « Annuler » apparaît

---

### US-24-05 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** que les toasts de confirmation soient plus informatifs et contrôlables,
**afin de** ne pas manquer un feedback important ou pouvoir annuler une action.

**Critères d'acceptation :**

- [x] Toast enrichi avec : icône de statut (✓/⚠/✕), message, barre de progression pour l'auto-dismiss
- [x] Toast de suppression avec bouton « Annuler » pendant 5 secondes (undo pattern)
- [x] Position : fixe en bas-droit, empilables (max 3 visibles simultanément)
- [x] Dismissable au clic ou au swipe (mobile)
- [x] Les toasts d'erreur ne se ferment pas automatiquement — fermeture manuelle requise

---

## EPIC E25 — Feedback, empty states & polish UI

> En tant qu'utilisateur, je veux que chaque écran de l'application communique clairement son état (vide, chargement, erreur, succès), afin de toujours savoir ce qui se passe et ce que je peux faire.

### US-25-01 · 🟠 Haute · FREE

**En tant que** nouveau patient qui n'a pas encore de données,
**je veux** voir un message d'accueil clair et engageant sur chaque section vide,
**afin de** comprendre à quoi sert le module et comment commencer.

**Critères d'acceptation :**

- [x] Chaque module sans données affiche un empty state : illustration SVG + titre + sous-texte + CTA
- [x] Les illustrations sont mono-couleur `--color-brand`, légères et non infantilisantes
- [x] Les CTA sont contextuels : « Enregistrer ma première crise », « Ajouter un repas », « Déclarer un traitement »
- [x] Les messages sont bienveillants et non culpabilisants (pas de « Rien ici ! »)
- [x] En mode sombre, les illustrations s'adaptent au thème (opacité réduite ou couleurs inversées)

---

### US-25-02 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** voir un indicateur clair de sauvegarde automatique sur les formulaires,
**afin de** savoir que mes données ne sont pas perdues si je quitte la page.

**Critères d'acceptation :**

- [x] Indicateur pulsant vert « ● Sauvegarde auto » en haut du formulaire quand l'auto-save est actif
- [x] Texte « Brouillon sauvegardé il y a Xs » affiché discrètement sous le titre, mis à jour en temps réel
- [x] Si des modifications non sauvegardées existent : point orange à côté du titre de page
- [x] Confirmation modale si l'utilisateur tente de quitter avec des modifications non sauvegardées (via `beforeunload` + React Router blocker)

---

### US-25-03 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** que la validation des formulaires soit visible en temps réel (inline),
**afin de** corriger mes erreurs au fur et à mesure plutôt qu'à la soumission.

**Critères d'acceptation :**

- [x] Validation inline : le champ est validé au `blur` (perte de focus)
- [x] Champ requis non rempli : label rouge + icône ⚠ + bordure `--color-danger`
- [x] Champ valide : icône ✓ verte discrète à droite du champ
- [x] Message d'erreur affiché sous le champ (pas dans un toast) via `aria-describedby`
- [x] Le bouton de soumission est désactivé visuellement si des erreurs existent, avec tooltip explicatif

---

### US-25-04 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** pouvoir annuler une suppression pendant quelques secondes,
**afin de** ne pas regretter une action irréversible faite par erreur.

**Critères d'acceptation :**

- [x] La suppression d'une entrée (crise, repas, traitement…) affiche un toast avec bouton « Annuler » pendant 5 secondes
- [x] Pendant ces 5 secondes, l'entrée est masquée de la liste mais pas encore supprimée du vault
- [x] Si « Annuler » est cliqué, l'entrée réapparaît immédiatement
- [x] Après 5 secondes sans action, la suppression est définitive (déplacement vers la corbeille)
- [x] L'animation de disparition/réapparition est fluide (fade + collapse/expand)

---

### US-25-05 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** que les cartes KPI du dashboard affichent des tendances visuelles,
**afin de** voir immédiatement si ma situation s'améliore ou se dégrade.

**Critères d'acceptation :**

- [x] Chaque carte KPI affiche : valeur principale en `--text-3xl` bold + tendance (flèche ↑↓ + %)
- [x] Tendance comparée à la période précédente : vert si amélioration, rouge si dégradation
- [x] Sparkline miniature (30 jours) sous la valeur principale
- [x] Tooltip au survol détaillant le calcul et la période de comparaison
- [x] Les 4 KPI couverts : crises/mois, intensité moyenne, jours sans crise, efficacité traitement

---

### US-25-06 · 🟢 Basse · FREE

**En tant que** patient,
**je veux** que les graphiques du dashboard offrent des interactions avancées,
**afin d'** explorer mes données plus en profondeur sans quitter le dashboard.

**Critères d'acceptation :**

- [x] Clic sur un jour du heatmap calendrier → panneau latéral avec le détail de la journée
- [x] Sélection d'une plage temporelle directement sur le graphique (brush/zoom)
- [x] Bouton d'export PNG/SVG par graphique individuel
- [x] Tooltips enrichis multi-données au survol (douleur + traitements + météo du jour)
- [x] Les filtres de date sont persistés dans l'URL (query params) pour le bookmark

---

## EPIC E26 — Accessibilité avancée & raccourcis clavier

> En tant qu'utilisateur avancé ou en situation de handicap, je veux pouvoir naviguer et agir dans l'application entièrement au clavier, afin d'être efficace sans dépendre de la souris.

### US-26-01 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** disposer de raccourcis clavier pour les actions les plus fréquentes,
**afin de** naviguer plus vite dans l'application.

**Critères d'acceptation :**

- [x] `Ctrl/Cmd + N` : ouvrir le mode Crise (nouvelle crise)
- [x] `Ctrl/Cmd + D` : aller au Dashboard
- [x] `Ctrl/Cmd + P` : ouvrir le sélecteur de profil
- [x] `Ctrl/Cmd + ,` : ouvrir les Préférences
- [x] `Escape` : fermer le panneau/modale actif
- [x] `?` : afficher un panneau overlay listant tous les raccourcis
- [x] Les raccourcis ne s'activent pas si un champ de saisie a le focus

---

### US-26-02 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** disposer d'une Command Palette pour rechercher et naviguer rapidement,
**afin d'** accéder à n'importe quelle page ou entrée en quelques frappes.

**Critères d'acceptation :**

- [x] Ouverte via `Ctrl/Cmd + K` — champ de recherche centré en overlay
- [x] Recherche dans : pages de l'app, crises récentes (par date), traitements actifs, actions rapides (« Nouvelle crise », « Exporter PDF »…)
- [x] Résultats affichés en temps réel avec icônes de catégorie
- [x] Navigation au clavier (flèches + Entrée pour sélectionner)
- [x] Historique des 5 dernières commandes affiché à l'ouverture (avant toute saisie)
- [x] Fermée via `Escape` ou clic en dehors

---

### US-26-03 · 🟡 Moyenne · FREE

**En tant que** patient utilisant un lecteur d'écran ou naviguant au clavier,
**je veux** que le focus soit géré correctement sur toutes les pages et modales,
**afin de** ne jamais perdre mon contexte de navigation.

**Critères d'acceptation :**

- [x] Focus automatiquement placé sur le premier champ interactif à l'ouverture de chaque page
- [x] Les modales piègent le focus (focus trap) — Tab ne sort pas de la modale
- [x] À la fermeture d'une modale, le focus revient à l'élément déclencheur
- [x] Skip-to-content link visible au premier `Tab`, masqué visuellement sinon
- [x] Tous les éléments interactifs ont un outline de focus visible (`2px --color-brand, offset 2px`)
- [x] L'ordre de tabulation suit l'ordre visuel de lecture (pas de `tabindex` positif)

---

### US-26-04 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** pouvoir naviguer dans les listes et historiques entièrement au clavier,
**afin de** consulter et agir sur mes données sans souris.

**Critères d'acceptation :**

- [x] Flèches haut/bas pour naviguer entre les lignes d'un historique
- [x] Entrée pour ouvrir/déplier une entrée
- [x] `e` pour éditer l'entrée sélectionnée, `Delete/Backspace` pour supprimer (avec confirmation)
- [x] Les filtres sont accessibles au clavier (Tab pour atteindre, Espace/Entrée pour activer)
- [x] L'entrée sélectionnée est visuellement distinguée (fond `--color-bg-interactive`)

---

---

## EPIC E27 — Création du profil par défaut à l'onboarding

> En tant que nouvel utilisateur, je veux indiquer le nom de mon profil lors de l'onboarding, afin qu'un premier profil soit créé automatiquement et disponible dans toute l'application dès le départ.

### US-27-01 · 🔴 Critique · FREE

**En tant que** nouveau patient,
**je veux** saisir le nom de mon profil lors de l'onboarding (après le consentement et avant la sélection du vault),
**afin que** mon premier profil soit identifié et utilisable immédiatement dans l'application.

**Critères d'acceptation :**

- [ ] L'étape de nommage du profil s'affiche entre le consentement CGU et la sélection du vault
- [ ] Champ obligatoire : nom du profil (ex : « Moi », « Sarah », « Mon suivi »)
- [ ] Valeur pré-remplie avec le prénom issu du provider social (si disponible), modifiable
- [ ] Sélection optionnelle d'une couleur d'identification (palette issue du Design System, couleur par défaut attribuée automatiquement)
- [ ] Bouton de validation : « Continuer » — désactivé tant que le nom est vide

---

### US-27-02 · 🔴 Critique · FREE

**En tant que** nouveau patient,
**je veux** que mon premier profil soit créé automatiquement à l'issue de l'étape de nommage,
**afin de** pouvoir utiliser l'application sans configuration supplémentaire.

**Critères d'acceptation :**

- [ ] Un profil est créé en IndexedDB avec : UUID généré, nom saisi, couleur choisie, plan `free`
- [ ] Le profil est synchronisé dans Supabase `user_profiles` dès que la connexion est disponible
- [ ] Le profil est défini comme profil actif
- [ ] Le vault sélectionné à l'étape suivante est automatiquement associé à ce profil
- [ ] Le profil apparaît dans le header (nom + couleur) dès la fin de l'onboarding
- [ ] En mode hors-ligne (UUID anonyme), le profil est créé localement et synchronisé au merge du compte

---

### US-27-03 · 🟠 Haute · FREE

**En tant que** patient ayant terminé l'onboarding,
**je veux** que mon profil créé à l'onboarding soit le même que celui visible dans le sélecteur multi-profil (E17),
**afin que** je puisse ultérieurement ajouter d'autres profils à côté du mien sans incohérence.

**Critères d'acceptation :**

- [ ] Le profil créé à l'onboarding utilise exactement la même structure de données que les profils créés via le sélecteur multi-profil (US-17-01)
- [ ] Le profil apparaît dans le sélecteur de profil (`Cmd/Ctrl + P`) comme premier profil de la liste
- [ ] Le nom et la couleur sont modifiables depuis Préférences → Profil
- [ ] Si l'utilisateur ajoute un second profil (E17), le profil d'onboarding reste inchangé

---

### US-27-04 · 🟡 Moyenne · FREE

**En tant que** patient ayant utilisé l'app en mode hors-ligne sans compte,
**je veux** que le profil créé lors de l'onboarding offline soit conservé et rattaché à mon compte lors de la création ultérieure,
**afin de** ne pas perdre mon profil ni devoir le recréer.

**Critères d'acceptation :**

- [ ] Le profil créé sous UUID anonyme est conservé en IndexedDB
- [ ] Lors du merge du compte (US-01-04), le profil est synchronisé vers Supabase `user_profiles` avec le `user_id` définitif
- [ ] Le `profile_local_id` reste identique (pas de changement d'UUID)
- [ ] L'entrée `profile_plans` est créée avec le plan `free` associée au bon `user_id`

---

## EPIC E28 — Vue calendrier consolidée

> En tant que patient, je veux voir l'ensemble de mes données enregistrées dans une vue calendrier visuelle et intuitive, afin d'avoir un aperçu rapide de mon suivi quotidien et d'être encouragé à compléter les jours manquants.

### US-28-01 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** voir une vue calendrier mensuelle affichant des indicateurs visuels (icônes + couleurs) pour chaque type de donnée enregistré par jour (crises, douleur, alimentation, traitements, sport, transport, cycle, charge mentale, météo, RDV),
**afin de** visualiser d'un coup d'œil l'ensemble de mon suivi sur le mois.

**Critères d'acceptation :**

- [ ] La vue calendrier affiche le mois en cours par défaut dans une grille mensuelle plein écran
- [ ] Chaque cellule-jour affiche les indicateurs iconographiques des données enregistrées ce jour-là (selon la table définie en PRD 3.25)
- [ ] Les jours sans aucune donnée ont un style visuel distinct (opacité réduite ou fond hachuré)
- [ ] Seuls les indicateurs des modules activés par l'utilisateur (3.26) sont affichés
- [ ] Une légende des icônes est accessible en permanence via un panneau rétractable

---

### US-28-02 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** naviguer entre les mois et cliquer sur un jour pour voir le détail complet de la journée,
**afin de** pouvoir explorer mon historique et accéder rapidement aux données d'un jour précis.

**Critères d'acceptation :**

- [ ] Flèches mois précédent / suivant pour naviguer entre les mois
- [ ] Sélecteur de mois/année pour accéder directement à un mois éloigné
- [ ] Bouton « Aujourd'hui » pour revenir au mois courant
- [ ] Clic sur un jour → ouverture d'un panneau latéral (drawer) avec le détail complet de la journée
- [ ] Le panneau latéral liste toutes les entrées du jour avec un lien de navigation vers le formulaire d'édition de chaque entrée
- [ ] Survol d'un jour → tooltip résumant les données clés

---

### US-28-03 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** filtrer les types de données affichés sur le calendrier,
**afin de** me concentrer sur les éléments qui m'intéressent (ex : crises + alimentation uniquement).

**Critères d'acceptation :**

- [ ] Barre de filtres en haut de la vue calendrier avec un toggle par type de donnée
- [ ] L'activation/désactivation d'un filtre met à jour le calendrier instantanément
- [ ] Les filtres sélectionnés sont persistés en `sessionStorage` (conservés au rechargement de la page)
- [ ] Les modules désactivés par l'utilisateur (3.26) n'apparaissent pas dans les filtres

---

### US-28-04 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** voir un message encourageant et une barre de progression quand mon taux de complétion mensuel est bas,
**afin d'** être motivé à enregistrer mes données régulièrement pour améliorer la qualité de mes analyses.

**Critères d'acceptation :**

- [ ] Un bandeau s'affiche en haut de la vue calendrier si le taux de complétion du mois en cours est < 60 %
- [ ] Message dynamique : _« Vous avez renseigné X jours sur Y ce mois-ci. Plus vos données sont complètes, plus les analyses seront pertinentes ! »_
- [ ] Barre de progression visuelle du taux de complétion
- [ ] Le bandeau est masqué dès que le taux atteint 60 %
- [ ] Le taux de complétion prend en compte uniquement les modules activés par l'utilisateur

---

### US-28-05 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** pouvoir saisir rapidement des données depuis un jour vide du calendrier,
**afin de** compléter facilement les jours manquants sans naviguer vers chaque formulaire individuellement.

**Critères d'acceptation :**

- [ ] Les jours sans données affichent un badge « + » cliquable
- [ ] Au clic sur le badge, un menu rapide propose les types de saisie pertinents (nouvelle crise, douleur du jour, alimentation, etc.)
- [ ] Seuls les modules activés par l'utilisateur sont proposés dans le menu
- [ ] La saisie rapide pré-remplit la date du jour sélectionné dans le formulaire ouvert

---

### US-28-06 · 🟡 Moyenne · FREE

**En tant que** patient utilisant un écran mobile ou étroit,
**je veux** que la vue calendrier s'adapte en une liste chronologique lisible,
**afin de** retrouver les mêmes informations sans perte de lisibilité sur petit écran.

**Critères d'acceptation :**

- [ ] Sur écrans < 768 px, la vue bascule automatiquement vers une liste chronologique verticale
- [ ] Chaque entrée de la liste affiche la date, les icônes des données enregistrées et un résumé textuel
- [ ] Clic sur une entrée → même panneau de détail que sur la vue calendrier
- [ ] Navigation clavier complète : flèches pour se déplacer entre les jours, `Enter` pour ouvrir le détail

---

## EPIC E29 — Personnalisation des modules de suivi

> En tant que patient, je veux choisir les modules de suivi actifs dans mon application, afin de simplifier mon interface en ne voyant que les éléments pertinents pour mon cas personnel.

### US-29-01 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** accéder à une page Préférences → Modules de suivi listant tous les modules optionnels avec un toggle on/off,
**afin de** choisir les éléments que je souhaite suivre dans l'application.

**Critères d'acceptation :**

- [ ] Page accessible depuis Préférences → Modules de suivi
- [ ] Liste de tous les modules optionnels (selon la table définie en PRD 3.26) avec toggle, description courte et icône
- [ ] Les modules du socle (Journal des crises, Dashboard, Rapport médical, Profil médical) ne sont pas listés — ils sont toujours actifs
- [ ] Les modules désactivés par le plan (feature flags admin) sont affichés grisés avec le badge _« Disponible avec le plan Pro »_ et ne peuvent pas être activés
- [ ] Message de confirmation lors de la désactivation : _« Vos données existantes sont conservées. Vous pouvez réactiver ce module à tout moment. »_
- [ ] Les préférences sont stockées dans `config/modules.md` dans le vault

---

### US-29-02 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** que la navigation et les menus ne montrent que les modules que j'ai activés,
**afin de** ne pas être encombré par des fonctionnalités que je n'utilise pas.

**Critères d'acceptation :**

- [ ] Les entrées de menu des modules désactivés sont complètement masquées (pas grisées)
- [ ] La mise à jour de la navigation est immédiate au toggle d'un module dans les préférences
- [ ] La Command Palette (3.24) ne propose pas les actions liées à des modules désactivés
- [ ] Les raccourcis clavier liés à des modules désactivés sont inactifs

---

### US-29-03 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** que les formulaires de saisie, le dashboard et le rapport PDF n'affichent que les éléments des modules activés,
**afin que** toute l'application soit cohérente avec ma sélection de modules.

**Critères d'acceptation :**

- [ ] Les champs de formulaire liés à un module désactivé ne sont pas affichés (ex : pas de section « Transport » dans le formulaire de crise si le module transport est désactivé)
- [ ] Les graphiques et KPI du dashboard liés à un module désactivé ne sont pas affichés
- [ ] Les sections du rapport PDF liées à un module désactivé sont exclues
- [ ] Les indicateurs de la vue calendrier (E28) des modules désactivés ne sont pas affichés
- [ ] La détection de patterns (3.7) ne calcule pas les corrélations avec des modules désactivés

---

### US-29-04 · 🟡 Moyenne · FREE

**En tant que** patient ayant désactivé un module,
**je veux** que mes données existantes soient conservées et redeviennent visibles si je réactive le module,
**afin de** ne jamais perdre de données en changeant ma configuration.

**Critères d'acceptation :**

- [ ] Désactiver un module ne supprime aucune donnée du vault
- [ ] Réactiver un module rend immédiatement visibles toutes les données précédemment enregistrées
- [ ] Les analyses et patterns recalculent en incluant les données du module réactivé
- [ ] Le rapport PDF inclut à nouveau les sections du module réactivé

---

### US-29-05 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** que ma configuration de modules soit synchronisée entre mes appareils,
**afin de** retrouver la même interface simplifiée partout.

**Critères d'acceptation :**

- [ ] Les préférences de modules sont stockées dans `config/modules.md` dans le vault
- [ ] La synchronisation suit le même mécanisme que les autres données de configuration du vault
- [ ] En cas de conflit (modification simultanée sur deux appareils), la dernière modification l'emporte (last-write-wins)
- [ ] En mode hors-ligne, les préférences sont appliquées depuis le cache local et synchronisées au retour en ligne

---

---

## EPIC E30 — Prérequis déploiement & activation admin

> En tant qu'équipe de développement, nous voulons préparer l'infrastructure technique nécessaire au déploiement des 3 apps et à l'activation du panel admin avec de vraies données Supabase, afin de passer de l'environnement local à la production.

### US-30-01 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** configurer le client Supabase et les dépendances dans l'app admin,
**afin que** le panel admin puisse se connecter à la base de données réelle.

**Critères d'acceptation :**

- [x] `@supabase/supabase-js` ajouté à `apps/admin/package.json`
- [x] `apps/admin/vite.config.ts` inclut `envDir: resolve(__dirname, '../..')` pour lire les variables d'environnement depuis la racine du monorepo
- [x] `apps/admin/src/lib/supabase.ts` créé avec le client Supabase typé (même pattern que `apps/desktop/src/lib/supabase.ts`)
- [x] Le client est utilisable dans les hooks et composants admin
- [ ] Les types Supabase sont partagés via `@migraine-ai/shared`

---

### US-30-02 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** ajouter une migration SQL pour la policy d'écriture `plan_config` par les admins,
**afin que** les administrateurs puissent modifier les feature flags depuis l'interface.

**Critères d'acceptation :**

- [x] Migration `supabase/migrations/00002_admin_plan_config_policy.sql` créée
- [x] Policy `INSERT`, `UPDATE`, `DELETE` sur `plan_config` pour les admins (`auth.jwt() -> 'app_metadata' ->> 'role'`)
- [x] La policy `SELECT` publique existante est conservée
- [x] Migration appliquée en production

---

### US-30-03 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** créer une fonction Postgres `get_admin_user_list()` pour le panel admin,
**afin de** pouvoir lister les utilisateurs avec leurs métriques sans exposer `auth.users` côté client.

**Critères d'acceptation :**

- [x] Migration `supabase/migrations/00003_admin_user_list_function.sql` créée
- [x] Fonction `SECURITY DEFINER` qui joint `auth.users` avec `user_usage`, `user_profiles`, `profile_plans`
- [x] Retourne : `user_id`, email masqué (`a***@gmail.com`), date d'inscription, plan actif, dernière connexion, nombre de profils, fréquence 30 jours
- [x] Accessible uniquement aux admins (vérification `auth.jwt() -> 'app_metadata' ->> 'role'` dans la fonction)
- [x] Fonction `reveal_user_email(target_user_id)` séparée qui journalise l'action dans `admin_log`

---

### US-30-04 · 🟠 Haute · TECH

**En tant que** développeur,
**je veux** créer une Edge Function `delete-user` pour la suppression RGPD,
**afin que** les administrateurs puissent supprimer définitivement un compte sans accès direct au `service_role_key` côté client.

**Critères d'acceptation :**

- [x] `supabase/functions/delete-user/index.ts` créé (Deno Edge Function)
- [x] Vérifie que l'appelant est admin (JWT `role = 'admin'`)
- [x] Utilise `supabase.auth.admin.deleteUser()` avec le `service_role_key`
- [x] Journalise l'action dans `admin_log` avant suppression
- [x] Retourne un statut de confirmation ou une erreur détaillée
- [ ] Secret `SUPABASE_SERVICE_ROLE_KEY` configuré via `supabase secrets set`

---

### US-30-05 · 🟠 Haute · TECH

**En tant que** développeur,
**je veux** créer les configurations Netlify pour les apps admin et mobile,
**afin que** les 3 apps soient déployables sur Netlify avec leurs domaines respectifs.

**Critères d'acceptation :**

- [x] `apps/admin/netlify.toml` créé avec : `publish = "dist"`, redirect SPA `/* → /index.html`, headers de sécurité (CSP, HSTS, X-Frame-Options)
- [x] `apps/mobile/netlify.toml` créé avec la même structure adaptée au mobile
- [x] Les headers CSP de l'admin incluent `connect-src 'self' https://*.supabase.co`
- [x] Les trois apps sont buildables indépendamment via `pnpm --filter @migraine-ai/admin build`

---

### US-30-06 · 🟠 Haute · TECH

**En tant que** développeur,
**je veux** mettre à jour le document d'architecture technique pour refléter le choix Netlify pour les 3 apps,
**afin que** la documentation soit alignée avec la décision d'hébergement.

**Critères d'acceptation :**

- [x] Section 15.2 de `specs/ARCHITECTURE_TECHNIQUE.md` mise à jour : admin sur Netlify (pas Vercel)
- [x] Les 3 sous-domaines documentés : `migraine-ai.app` (desktop), `m.migraine-ai.app` (mobile), `admin.migraine-ai.app` (admin)
- [x] Schéma de déploiement cohérent avec `netlify.toml` de chaque app

---

---

## EPIC E31 — Gestion avancée des utilisateurs (admin)

> En tant qu'administrateur, je veux pouvoir visualiser les informations clés de chaque utilisateur et effectuer des actions de gestion (changement de plan, désactivation, suppression) directement depuis l'interface admin, afin de piloter la plateforme efficacement.

### US-31-01 · 🔴 Critique · ADMIN

**En tant qu'** administrateur,
**je veux** voir pour chaque utilisateur sa date d'inscription, son plan (gratuit/payant), sa dernière connexion et son statut (actif/désactivé),
**afin de** monitorer rapidement l'état de chaque compte.

**Critères d'acceptation :**

- [x] La liste utilisateurs affiche les colonnes : email masqué, date d'inscription, plan (`free`/`pro`), dernière connexion, statut (`actif`/`désactivé`)
- [x] Le plan est affiché avec un badge visuel distinct (couleur différente pour free et pro)
- [x] La dernière connexion affiche une date formatée en français ou « — » si jamais connecté
- [x] Le statut est affiché en vert (actif) ou rouge (désactivé)
- [x] Les données proviennent de la fonction `get_admin_user_list()` en temps réel

---

### US-31-02 · 🟠 Haute · ADMIN

**En tant qu'** administrateur,
**je veux** accéder à une fiche détaillée d'un utilisateur en cliquant sur sa ligne,
**afin de** voir l'ensemble de ses informations et effectuer des actions de gestion.

**Critères d'acceptation :**

- [x] Clic sur une ligne ouvre un panneau latéral (drawer) ou une modale avec les détails de l'utilisateur
- [x] Informations affichées : email complet (avec bouton « Révéler » journalisé), date d'inscription, plan actif, dernière connexion, nombre de profils, nombre de sessions 30j, provider d'authentification, consentement marketing
- [x] Le panneau contient les boutons d'action : changer de plan, désactiver/réactiver, supprimer
- [x] Fermeture du panneau par bouton ou clic à l'extérieur

---

### US-31-03 · 🟠 Haute · ADMIN

**En tant qu'** administrateur,
**je veux** basculer un utilisateur entre le plan gratuit et le plan payant,
**afin de** gérer manuellement les abonnements (offre promotionnelle, support, correction).

**Critères d'acceptation :**

- [x] Bouton ou switch « Changer de plan » dans la fiche utilisateur
- [x] Confirmation requise avant application (« Passer de free à pro ? »)
- [x] Mise à jour de la table `user_plans` : champ `plan` modifié via RPC `change_user_plan()`
- [x] Si aucune entrée `user_plans` n'existe, en créer une avec le plan sélectionné
- [x] Action journalisée dans `admin_log` avec l'ancien et le nouveau plan
- [x] Le changement est reflété immédiatement dans la liste utilisateurs

---

### US-31-04 · 🟠 Haute · ADMIN

**En tant qu'** administrateur,
**je veux** désactiver ou réactiver un compte utilisateur,
**afin de** gérer les abus ou restaurer un accès temporairement suspendu.

**Critères d'acceptation :**

- [x] Bouton « Désactiver » (si actif) ou « Réactiver » (si désactivé) dans la fiche utilisateur
- [x] Confirmation requise avant exécution
- [x] Mise à jour de `user_usage.is_active` en base
- [x] Action journalisée dans `admin_log`
- [x] Le statut est mis à jour immédiatement dans la liste et la fiche
- [ ] L'utilisateur désactivé voit le message « Votre compte a été désactivé. Contactez le support. » à sa prochaine connexion

---

### US-31-05 · 🟠 Haute · ADMIN

**En tant qu'** administrateur,
**je veux** supprimer définitivement un compte utilisateur,
**afin de** respecter une demande de suppression ou un droit à l'oubli (RGPD).

**Critères d'acceptation :**

- [x] Bouton « Supprimer le compte » dans la fiche utilisateur, visuellement distinct (rouge, zone danger)
- [x] Double confirmation : étape 1 (« Êtes-vous sûr ? ») + étape 2 (saisie de l'email de l'utilisateur pour valider)
- [x] Appel à l'Edge Function `delete-user` qui supprime le compte via `supabase.auth.admin.deleteUser()`
- [x] Suppression en cascade : `user_usage`, `user_plans`, `mobile_transit`
- [x] Action journalisée dans `admin_log` avant suppression (irréversible)
- [x] L'utilisateur disparaît de la liste après suppression
- [x] Le vault local de l'utilisateur n'est pas touché (données restent sur sa machine)

---

---

## EPIC E32 — Statistiques d'utilisation (admin)

> En tant qu'administrateur, je veux visualiser les statistiques d'utilisation de la plateforme via des graphiques, afin de suivre la croissance et l'engagement des utilisateurs dans le temps.

### US-32-01 · 🔴 Critique · ADMIN

**En tant qu'** administrateur,
**je veux** voir un onglet « Statistiques » dans l'interface admin,
**afin d'** accéder à une vue d'ensemble de l'utilisation de la plateforme.

**Critères d'acceptation :**

- [x] Nouvel onglet « Stats » ajouté à la navigation admin (à côté de Utilisateurs, Plans, Journal)
- [x] KPIs en haut de page : nombre total d'utilisateurs, utilisateurs actifs (30j), nouveaux ce mois-ci, ratio free/pro
- [x] Les données sont récupérées via une fonction Postgres `get_admin_stats()` (SECURITY DEFINER)
- [x] Affichage d'un loader pendant le chargement

---

### US-32-02 · 🟠 Haute · ADMIN

**En tant qu'** administrateur,
**je veux** voir un graphique des nouvelles inscriptions mois par mois,
**afin de** suivre la croissance de la plateforme.

**Critères d'acceptation :**

- [x] Graphique en barres affichant le nombre de nouvelles inscriptions par mois
- [x] Période affichée : 12 derniers mois par défaut
- [x] Chaque barre affiche le nombre exact au survol (tooltip)
- [x] Les données proviennent de `auth.users.created_at` agrégé par mois via une fonction Postgres
- [x] Axe X : mois (format « Jan 2026 »), Axe Y : nombre d'inscriptions
- [x] Bibliothèque graphique : Recharts

---

### US-32-03 · 🟠 Haute · ADMIN

**En tant qu'** administrateur,
**je veux** voir un graphique d'utilisation de la plateforme avec une granularité ajustable (jour, semaine, mois),
**afin de** comprendre les tendances d'engagement des utilisateurs.

**Critères d'acceptation :**

- [x] Graphique en ligne affichant le nombre d'utilisateurs actifs (sessions) par période
- [x] Sélecteur de granularité : jour, semaine, mois
- [x] Période affichée : 30 derniers jours (jour), 12 dernières semaines (semaine), 12 derniers mois (mois)
- [x] Les données proviennent de `user_usage.last_active_at` agrégé par la granularité choisie via une fonction Postgres
- [x] Tooltip au survol avec la valeur exacte et la date
- [x] Le graphique se met à jour dynamiquement au changement de granularité

---

### US-32-04 · 🟡 Moyenne · ADMIN

**En tant qu'** administrateur,
**je veux** voir la répartition des plans (free vs pro) sur le graphique d'inscriptions et d'utilisation,
**afin de** suivre l'adoption du plan payant.

**Critères d'acceptation :**

- [x] Le graphique des inscriptions affiche des barres empilées (free en gris, pro en couleur brand)
- [x] Le graphique d'utilisation affiche deux courbes superposées (free et pro)
- [x] Légende visible avec les deux catégories
- [x] Les fonctions Postgres retournent les données ventilées par plan

---

### US-32-05 · 🟡 Moyenne · ADMIN

**En tant qu'** administrateur,
**je veux** voir un graphique dédié à la répartition des utilisateurs entre les différents niveaux d'abonnement,
**afin de** comprendre la distribution des plans et identifier des opportunités de conversion.

**Critères d'acceptation :**

- [x] Graphique en camembert (pie chart) ou donut affichant la répartition actuelle des utilisateurs par niveau d'abonnement (free, pro, et tout futur plan)
- [x] Chaque segment affiche le pourcentage et le nombre absolu d'utilisateurs
- [x] Tooltip au survol avec le détail (nom du plan, nombre, pourcentage)
- [x] Légende visible avec les couleurs associées à chaque plan
- [x] KPI complémentaires affichés à côté du graphique : taux de conversion free → pro, évolution du ratio sur les 30 derniers jours
- [x] Les données proviennent d'une fonction Postgres `get_subscription_distribution()` (SECURITY DEFINER)
- [x] Le graphique se met à jour en temps réel lors du rechargement de la page

---

---

## EPIC E33 — Export utilisateurs & emails (admin)

> En tant qu'administrateur, je veux pouvoir exporter les données utilisateurs et les listes d'emails filtrées depuis l'interface admin, afin d'analyser les données dans un tableur ou de préparer des campagnes de communication ciblées.

### US-33-01 · 🟠 Haute · ADMIN

**En tant qu'** administrateur,
**je veux** exporter la liste complète des utilisateurs en CSV,
**afin de** l'analyser dans un tableur.

**Critères d'acceptation :**

- [x] Bouton « Exporter CSV » visible dans l'onglet Utilisateurs
- [x] Le CSV contient les colonnes : email masqué, date d'inscription, plan, dernière connexion, sessions 30j, statut, consentement marketing
- [x] Les emails sont masqués par défaut (`a***@gmail.com`) pour protéger la vie privée
- [x] Le fichier est généré côté client (Blob + URL.createObjectURL) et téléchargé automatiquement
- [x] Nom du fichier : `migraine-ai-utilisateurs_YYYY-MM-DD.csv`
- [x] Action journalisée dans `admin_log`

---

### US-33-02 · 🟠 Haute · ADMIN

**En tant qu'** administrateur,
**je veux** exporter une liste d'emails filtrée par plan (gratuit ou payant),
**afin de** cibler des communications spécifiques à un segment d'utilisateurs.

**Critères d'acceptation :**

- [x] Bouton « Exporter emails » avec sélecteur de filtre par plan : Tous, Free uniquement, Pro uniquement
- [x] L'export contient les emails complets (non masqués) — via fonction Postgres `export_admin_emails(plan_filter, activity_filter)`
- [x] L'action de révélation groupée est journalisée une seule fois dans `admin_log` (pas une entrée par email)
- [x] Format CSV avec colonnes : email, plan, date d'inscription
- [x] Nom du fichier : `migraine-ai-emails-{filtre}_YYYY-MM-DD.csv`
- [x] Confirmation requise avant export (« Vous allez exporter N emails. Cette action sera journalisée. »)

---

### US-33-03 · 🟠 Haute · ADMIN

**En tant qu'** administrateur,
**je veux** exporter une liste d'emails filtrée par dernière connexion,
**afin d'** identifier et contacter les utilisateurs actifs ou inactifs.

**Critères d'acceptation :**

- [x] Filtre par dernière connexion : actifs (< 30 jours), inactifs (30-90 jours), dormants (> 90 jours), jamais connectés
- [x] Combinable avec le filtre par plan (ex : « Pro + inactifs 30-90j »)
- [x] L'export contient : email complet, plan, dernière connexion, date d'inscription
- [x] Fonction Postgres `export_admin_emails(plan_filter, activity_filter)` pour filtrer côté serveur
- [x] Confirmation et journalisation comme US-33-02
- [x] Nom du fichier : `migraine-ai-emails-{filtre-plan}-{filtre-activite}_YYYY-MM-DD.csv`

---

---

## EPIC E34 — Configuration dynamique des plans & modules (admin)

> En tant qu'administrateur, je veux configurer finement les paramètres et modules disponibles pour chaque plan (free/pro) depuis l'onglet Plans de l'interface admin, avec une prise en compte immédiate côté utilisateur sans déconnexion, afin de piloter l'offre en temps réel. Les modules désactivés restent visibles mais inutilisables.

### US-34-01 · 🔴 Critique · ADMIN

**En tant qu'** administrateur,
**je veux** voir dans l'onglet Plans la liste complète de tous les paramètres et modules de l'application pour chaque plan,
**afin de** configurer l'offre de manière exhaustive.

**Critères d'acceptation :**

- [x] Chaque plan (free/pro) affiche tous les feature flags existants dans `plan_config`, organisés en deux sections : « Paramètres » (valeurs numériques) et « Modules » (activé/désactivé)
- [x] Section Paramètres : `analytics_range_months`, `max_profiles` — champs numériques éditables
- [x] Section Modules : `ia_enabled`, `module_cycle_enabled`, `module_sport_enabled`, `module_transport_enabled`, `module_charge_mentale_enabled`, `module_daily_pain_enabled`, `pdf_report_enabled`, `vocal_input_enabled`, `export_csv_enabled`, `export_zip_enabled` — toggles on/off
- [x] Chaque module affiche son nom lisible (pas la clé technique) et une description courte
- [x] Si un nouveau feature flag est ajouté en base, il apparaît automatiquement dans l'interface

---

### US-34-02 · 🟠 Haute · ADMIN

**En tant qu'** administrateur,
**je veux** activer ou désactiver un module pour un plan donné,
**afin de** contrôler les fonctionnalités accessibles aux utilisateurs de ce plan.

**Critères d'acceptation :**

- [x] Toggle on/off pour chaque module avec retour visuel immédiat
- [x] La modification est persistée dans `plan_config` via upsert
- [x] Chaque modification est journalisée dans `admin_log` (ancienne valeur → nouvelle valeur)
- [x] Un toast de confirmation s'affiche après sauvegarde réussie
- [x] En cas d'erreur réseau, le toggle revient à son état précédent avec un message d'erreur

---

### US-34-03 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** que l'app desktop recharge la configuration `plan_config` périodiquement sans déconnexion,
**afin que** les changements de plan effectués par l'admin soient reflétés en temps réel côté utilisateur.

**Critères d'acceptation :**

- [x] Le store de modules (`moduleStore` ou `planStore`) interroge `plan_config` à intervalle régulier (toutes les 5 minutes) ou à chaque changement de page
- [x] Si un module passe de `true` à `false`, l'état est mis à jour dans le store sans recharger la page
- [x] Aucune déconnexion/reconnexion nécessaire pour voir les changements
- [x] Le premier chargement au démarrage de l'app reste inchangé (lecture depuis le cache puis sync)

---

### US-34-04 · 🔴 Critique · TECH

**En tant que** utilisateur,
**je veux** que les modules désactivés par l'admin soient visibles mais non utilisables dans mon interface,
**afin de** comprendre que la fonctionnalité existe mais n'est pas disponible pour mon plan.

**Critères d'acceptation :**

- [x] Un module désactivé apparaît dans la navigation/sidebar avec un style atténué (opacité réduite, icône cadenas)
- [x] Le clic sur un module désactivé affiche un message : « Cette fonctionnalité n'est pas disponible avec votre plan actuel. » avec un lien vers l'upgrade (ou simple info si pas de plan supérieur)
- [x] Les formulaires d'un module désactivé ne sont pas accessibles (redirection vers le message ci-dessus)
- [x] Les données existantes d'un module désactivé restent consultables en lecture seule (l'historique ne disparaît pas)
- [x] Le composant `ModuleGate` (ou équivalent) encapsule chaque module et gère l'état activé/désactivé

---

### US-34-05 · 🟡 Moyenne · ADMIN

**En tant qu'** administrateur,
**je veux** pouvoir comparer visuellement les plans free et pro côte à côte,
**afin de** vérifier la cohérence de la configuration avant de la publier.

**Critères d'acceptation :**

- [x] Affichage des deux plans en colonnes côte à côte (déjà le cas, à enrichir)
- [x] Les différences entre free et pro sont mises en évidence visuellement (surlignage ou badge « Différent »)
- [x] Un bouton « Copier la config de Pro vers Free » (ou inversement) avec confirmation
- [ ] Un résumé des modifications non encore vues par les utilisateurs (basé sur `updated_at` vs dernière consultation)

---

---

## EPIC E35 — Activation Magic Link & email/password

> En tant qu'utilisateur, je veux pouvoir me connecter avec un Magic Link (lien envoyé par email) ou avec un email et mot de passe classique en plus de Google, afin d'avoir le choix de ma méthode d'authentification.

### US-35-01 · 🔴 Critique · FREE

**En tant qu'** utilisateur,
**je veux** me connecter avec un Magic Link (email OTP),
**afin de** ne pas avoir besoin de mémoriser un mot de passe.

**Critères d'acceptation :**

- [x] Le bouton « Continuer avec un Magic Link » est fonctionnel sur la page de login
- [x] L'utilisateur saisit son email et reçoit un lien de connexion par email
- [x] Le clic sur le lien redirige vers l'app et connecte automatiquement l'utilisateur
- [ ] Le provider Supabase Auth Email est activé et configuré (templates email en français)
- [x] Les Redirect URLs Supabase incluent les domaines de l'app (localhost + Netlify)
- [x] Message de confirmation affiché : « Un lien de connexion a été envoyé à votre adresse email »
- [x] Gestion de l'erreur si l'email est invalide ou si le service est indisponible

---

### US-35-02 · 🔴 Critique · FREE

**En tant qu'** utilisateur,
**je veux** créer un compte avec email et mot de passe,
**afin de** me connecter de manière traditionnelle.

**Critères d'acceptation :**

- [x] Formulaire d'inscription fonctionnel : email + mot de passe + confirmation du mot de passe
- [x] Validation Zod : email valide, mot de passe ≥ 8 caractères, confirmation identique
- [x] Appel à `supabase.auth.signUp()` avec redirection après confirmation
- [ ] Email de confirmation envoyé par Supabase (template en français)
- [x] Message affiché : « Un email de confirmation a été envoyé. Vérifiez votre boîte de réception. »
- [x] L'utilisateur ne peut pas accéder à l'app sans avoir confirmé son email

---

### US-35-03 · 🔴 Critique · FREE

**En tant qu'** utilisateur,
**je veux** me connecter avec mon email et mot de passe existants,
**afin d'** accéder à mon compte.

**Critères d'acceptation :**

- [x] Formulaire de connexion fonctionnel : email + mot de passe
- [x] Appel à `supabase.auth.signInWithPassword()`
- [x] Messages d'erreur en français : « Email ou mot de passe incorrect », « Veuillez confirmer votre email »
- [x] Lien « Mot de passe oublié ? » visible sous le formulaire
- [x] Après connexion réussie, redirection vers la HomePage (ou onboarding si première connexion)

---

### US-35-04 · 🟠 Haute · FREE

**En tant qu'** utilisateur,
**je veux** réinitialiser mon mot de passe si je l'ai oublié,
**afin de** retrouver l'accès à mon compte.

**Critères d'acceptation :**

- [x] Page « Mot de passe oublié » accessible depuis le formulaire de connexion
- [x] L'utilisateur saisit son email et reçoit un lien de réinitialisation
- [x] Appel à `supabase.auth.resetPasswordForEmail()` avec `redirectTo` vers une page de reset
- [x] Page de reset : saisie du nouveau mot de passe + confirmation
- [x] Appel à `supabase.auth.updateUser({ password })` pour appliquer le changement
- [x] Message de succès et redirection vers la page de login

---

## EPIC E36 — Suppression du mode multi-profils

> En tant qu'équipe produit, nous voulons supprimer le mode multi-profils de l'application (desktop, admin, base de données), afin de simplifier l'architecture : un compte = un profil. Pour suivre un proche, l'utilisateur doit créer un compte séparé.

**Impact :** Cette Epic rend obsolètes E17 (Multi-profil & abonnements) et E27 (Création du profil par défaut à l'onboarding). Les stories concernées sont remplacées par les stories ci-dessous.

### US-36-01 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** supprimer la table `user_profiles` et simplifier `profile_plans` en rattachant le plan directement au `user_id`,
**afin de** refléter le modèle un compte = un profil dans la base de données.

**Critères d'acceptation :**

- [x] Nouvelle migration Supabase qui supprime la table `user_profiles`
- [x] La table `profile_plans` est renommée ou remplacée par `user_plans` avec `user_id` comme clé (sans `profile_local_id`)
- [x] Les politiques RLS sont mises à jour en conséquence
- [x] La colonne `profile_count` est supprimée de `user_usage`
- [x] Le champ `max_profiles` est supprimé de `plan_config` et du seed

---

### US-36-02 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** supprimer le `profileStore` et toute la logique multi-profils du frontend,
**afin de** simplifier la gestion d'état côté client.

**Critères d'acceptation :**

- [x] Le fichier `profileStore.ts` est supprimé
- [x] Les feature flags sont rattachés directement au compte utilisateur (via `authStore` ou un nouveau `planStore`)
- [x] Toutes les références à `activeProfileId`, `switchProfile`, `profiles[]` sont supprimées du code
- [x] Le localStorage `migraine-ai-profiles` n'est plus utilisé

---

### US-36-03 · 🔴 Critique · FREE

**En tant que** patient,
**je veux** que mon vault soit directement associé à mon compte (sans notion de profil intermédiaire),
**afin de** simplifier l'accès à mes données.

**Critères d'acceptation :**

- [x] Les fonctions vault (`saveVaultHandle`, `restoreVaultHandle`, `checkVaultAccess`) utilisent `user.id` directement au lieu de `profileId`
- [x] Tous les modules vault (crises, dailyPain, alimentaire, sport, transport, cycle, chargeMentale, consultation) sont mis à jour
- [x] Le `medicalProfileStore` fonctionne sans référence au profil
- [x] Migration transparente pour les utilisateurs existants : le vault du profil actif devient le vault du compte

---

### US-36-04 · 🔴 Critique · FREE

**En tant que** patient,
**je veux** que l'onboarding ne me demande plus de nommer un profil,
**afin que** l'inscription soit plus rapide et intuitive.

**Critères d'acceptation :**

- [x] L'étape `ProfileSetupPage` est supprimée ou remplacée par une étape simplifiée (nom d'affichage du compte)
- [x] Le flow onboarding passe directement du consentement à la sélection du vault
- [x] Le `onboardingStore` ne contient plus l'étape `profile-setup`
- [x] Le nom affiché dans le header est le nom du compte (metadata Supabase) et non plus le nom d'un profil

---

### US-36-05 · 🔴 Critique · FREE

**En tant que** patient,
**je veux** que la page de gestion des profils (`ProfileManagerPage`) soit supprimée,
**afin qu'** il n'y ait plus de sélecteur multi-profils dans l'application.

**Critères d'acceptation :**

- [x] La page `ProfileManagerPage.tsx` est supprimée
- [x] La route correspondante est retirée du routeur
- [x] Le lien vers le gestionnaire de profils est retiré du Sidebar
- [x] Le raccourci clavier `Cmd/Ctrl + P` pour le sélecteur de profil est supprimé
- [x] Le badge de couleur de profil dans le header est supprimé

---

### US-36-06 · 🟠 Haute · TECH

**En tant que** développeur,
**je veux** supprimer les types et constantes liés au multi-profils,
**afin de** nettoyer le code et éviter toute confusion.

**Critères d'acceptation :**

- [x] Le type `UserProfile` (dans `apps/desktop/src/types/profile.ts`) est supprimé ou simplifié en type `UserAccount`
- [x] Les constantes `PROFILE_COLORS`, `UserProfileFormData` sont supprimées
- [x] Le type `UserProfile` dans `packages/shared/src/types/index.ts` est supprimé
- [x] Toutes les interfaces et types qui référencent `profileLocalId` sont nettoyés

---

### US-36-07 · 🟠 Haute · ADMIN

**En tant qu'** administrateur,
**je veux** que l'interface d'administration ne référence plus les multi-profils,
**afin que** le tableau de bord reflète le modèle un compte = un profil.

**Critères d'acceptation :**

- [x] La colonne « Profiles » est supprimée du tableau des utilisateurs dans l'admin
- [x] La fonction RPC `get_admin_user_list()` ne retourne plus `profile_count`
- [x] Le plan est affiché au niveau du compte, pas du profil
- [x] Les onglets ou sections liés aux profils sont retirés si existants

---

### US-36-08 · 🟡 Moyenne · FREE

**En tant que** patient ayant utilisé le mode multi-profils avant la mise à jour,
**je veux** que mes données soient migrées proprement vers le nouveau modèle,
**afin de** ne perdre aucune donnée lors de la transition.

**Critères d'acceptation :**

- [x] Un script de migration identifie le profil actif (ou le premier profil) de chaque utilisateur et le conserve comme profil unique
- [x] Le vault associé à ce profil devient le vault du compte
- [x] Les profils secondaires ne sont pas supprimés du stockage local (vault conservé), mais ne sont plus accessibles depuis l'app
- [x] Un message informatif est affiché aux utilisateurs concernés lors de la première connexion post-migration

---

## EPIC E37 — Picto météo pour le module environnement

> En tant qu'utilisateur, je veux que le pictogramme du module « Données environnementales » évoque la météo, afin que l'icône soit immédiatement compréhensible.

### US-37-01 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** que l'icône du module environnement représente la météo (ex : soleil avec nuage, thermomètre, etc.),
**afin de** comprendre immédiatement à quoi correspond ce module dans la navigation.

**Critères d'acceptation :**

- [x] L'icône actuelle du module environnement est remplacée par une icône évoquant la météo (ex : `Cloud`, `CloudSun`, `Thermometer` ou équivalent Lucide)
- [x] L'icône est mise à jour partout où le module apparaît : sidebar, dashboard, onboarding
- [x] L'icône reste cohérente avec le Design System existant (taille, couleur, style)
- [x] Le label « Données environnementales » reste inchangé

---

## EPIC E38 — Changement du dossier vault depuis les paramètres

> En tant qu'utilisateur, je veux pouvoir modifier le dossier source de mon vault depuis les paramètres de l'application, afin de déplacer mes données ou de pointer vers un autre emplacement sans devoir refaire l'onboarding.

### US-38-01 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** accéder à un réglage « Dossier vault » dans mes paramètres,
**afin de** voir quel dossier est actuellement utilisé pour stocker mes données.

**Critères d'acceptation :**

- [ ] Une section « Stockage / Vault » est visible dans la page Paramètres
- [ ] Le chemin du dossier vault actuellement configuré est affiché
- [ ] Un bouton « Modifier » permet d'ouvrir le sélecteur de dossier natif (File System Access API)

---

### US-38-02 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** sélectionner un nouveau dossier vault via le sélecteur de fichiers,
**afin de** pointer l'application vers un autre emplacement de données.

**Critères d'acceptation :**

- [ ] Le clic sur « Modifier » ouvre le sélecteur de dossier natif du navigateur
- [ ] Le nouveau dossier est validé (structure vault existante détectée, ou nouveau dossier vide accepté)
- [ ] Le handle du vault est mis à jour dans IndexedDB
- [ ] L'application recharge les données depuis le nouveau vault
- [ ] Un message de confirmation s'affiche : « Vault mis à jour avec succès »
- [ ] En cas d'erreur (dossier inaccessible, permissions insuffisantes) : message d'erreur explicite

---

### US-38-03 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** être averti si le nouveau dossier vault est vide ou ne contient pas de données existantes,
**afin de** ne pas perdre mes données par erreur.

**Critères d'acceptation :**

- [ ] Si le dossier sélectionné est vide : message « Ce dossier est vide. L'application créera la structure de données. Continuer ? »
- [ ] Si le dossier contient une structure vault valide : message « Données existantes détectées. L'application utilisera ces données. »
- [ ] Si le dossier contient des fichiers non reconnus : avertissement « Ce dossier contient des fichiers non reconnus. Voulez-vous tout de même l'utiliser ? »
- [ ] L'ancien dossier vault n'est pas supprimé ni modifié

---

## EPIC E39 — Reconnexion rapide — skip onboarding utilisateur connu

> En tant qu'utilisateur déjà inscrit, je veux que l'application me redirige directement vers le contenu principal lors de ma connexion, sans me redemander d'accepter les CGU, de cocher le consentement marketing ni de paramétrer mon profil, afin de gagner du temps et d'éviter une expérience répétitive.

### US-39-01 · 🔴 Critique · FREE

**En tant que** patient déjà inscrit,
**je veux** que l'application détecte que mon compte existe déjà lors de la connexion,
**afin de** ne pas repasser par les étapes d'onboarding.

**Critères d'acceptation :**

- [ ] À la connexion (OAuth, email/password ou magic link), l'app vérifie si l'utilisateur possède déjà un profil complet (consentement CGU horodaté + vault configuré)
- [ ] Si le profil est complet : redirection directe vers le tableau de bord (skip total de l'onboarding)
- [ ] Si le profil est incomplet (ex. migration de données) : seules les étapes manquantes sont affichées

---

### US-39-02 · 🔴 Critique · FREE

**En tant que** patient déjà inscrit,
**je veux** que mon consentement CGU et mes préférences de communication soient conservés d'une session à l'autre,
**afin de** ne pas devoir recocher ces cases à chaque connexion.

**Critères d'acceptation :**

- [ ] Le consentement CGU (horodaté) est stocké dans le profil Supabase et vérifié à la connexion
- [ ] Le consentement marketing (horodaté) est stocké dans le profil Supabase et vérifié à la connexion
- [ ] Si les deux consentements sont présents, les écrans CGU et communications sont complètement ignorés
- [ ] Si les CGU ont été mises à jour depuis le dernier consentement : l'écran CGU est ré-affiché avec un message « Nos conditions ont été mises à jour »

---

### US-39-03 · 🟠 Haute · FREE

**En tant que** patient déjà inscrit,
**je veux** que l'étape de paramétrage du profil médical soit ignorée si je l'ai déjà complétée ou explicitement passée,
**afin de** ne pas revoir cet écran à chaque connexion.

**Critères d'acceptation :**

- [ ] L'app vérifie si l'étape profil médical a déjà été complétée ou explicitement ignorée (flag `onboarding_profile_done` dans Supabase)
- [ ] Si le flag est présent : l'écran de profil médical est ignoré
- [ ] Si le flag est absent (nouvel utilisateur ou migration) : l'écran de profil est affiché normalement
- [ ] Le flag est positionné dès que l'utilisateur clique « Passer pour l'instant » ou valide le formulaire

---

### US-39-04 · 🟡 Moyenne · FREE

**En tant que** patient déjà inscrit,
**je veux** que l'étape de sélection du vault soit ignorée si un vault est déjà configuré,
**afin de** accéder directement à mes données sans re-sélectionner mon dossier.

**Critères d'acceptation :**

- [ ] L'app vérifie si un handle vault valide existe en IndexedDB au lancement
- [ ] Si le handle est valide et le vault accessible : skip de l'écran de sélection du vault
- [ ] Si le handle est invalide ou les permissions ont été révoquées : l'écran de sélection est ré-affiché avec un message « Veuillez re-sélectionner votre dossier »
- [ ] Le flux complet (connexion → contenu) ne présente aucun écran intermédiaire pour un utilisateur entièrement configuré

---

## EPIC E40 — Saisie mobile étendue — tous types d'enregistrements

> En tant que patient en déplacement, je veux pouvoir enregistrer rapidement depuis mon téléphone tout type d'événement de suivi (pas seulement les crises et la douleur), afin de maintenir un suivi complet même loin de mon ordinateur. L'architecture suit celle d'E20 : données chiffrées AES-256-GCM, transit via Supabase, intégration au vault à l'ouverture du desktop.

### US-40-01 · 🟠 Haute · FREE

**En tant que** patient en déplacement,
**je veux** enregistrer une prise de traitement depuis mon téléphone,
**afin de** ne pas oublier de consigner mon traitement quand je ne suis pas devant mon ordinateur.

**Critères d'acceptation :**

- [ ] Écran mobile « Traitement » : sélection du traitement (chips parmi ceux du profil), heure (défaut : maintenant), dose optionnelle
- [ ] Validation en un tap, temps de saisie < 10 secondes
- [ ] Données sérialisées en YAML, chiffrées (AES-256-GCM) et envoyées à Supabase (`mobile_transit`)
- [ ] Intégration au vault desktop dans `traitements/` avec `source: mobile` (même flux qu'US-20-04)

---

### US-40-02 · 🟠 Haute · FREE

**En tant que** patient,
**je veux** enregistrer un aliment ou un déclencheur potentiel depuis mon téléphone,
**afin de** capturer un repas ou une exposition suspecte au moment où elle se produit.

**Critères d'acceptation :**

- [ ] Écran mobile « Alimentation / Déclencheur » : champ texte libre + chips parmi les déclencheurs fréquents du profil, heure (défaut : maintenant)
- [ ] Validation rapide, temps de saisie < 15 secondes
- [ ] Même flux chiffré que les saisies de crise (E20)
- [ ] Intégration au vault desktop dans `alimentation/` ou `declencheurs/` avec `source: mobile`

---

### US-40-03 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** enregistrer une note libre depuis mon téléphone,
**afin de** capturer un contexte ou une observation que je ne veux pas oublier (mauvaise nuit, stress, météo ressentie…).

**Critères d'acceptation :**

- [ ] Écran mobile « Note » : champ texte libre (max 500 caractères), heure (défaut : maintenant)
- [ ] Validation en un tap
- [ ] Même flux chiffré que les saisies de crise (E20)
- [ ] Intégration au vault desktop dans `notes/` avec `source: mobile`

---

### US-40-04 · 🟡 Moyenne · PRO

**En tant que** patient avec le plan Pro,
**je veux** enregistrer une activité sportive depuis mon téléphone,
**afin de** consigner mon effort physique au moment où il a lieu.

**Critères d'acceptation :**

- [ ] Écran mobile « Sport » : type d'activité (chips), durée (sélecteur rapide : 15/30/45/60 min), intensité (léger/modéré/intense)
- [ ] Validation rapide, temps de saisie < 10 secondes
- [ ] Même flux chiffré que les saisies de crise (E20)
- [ ] Intégration au vault desktop dans `sport/` avec `source: mobile`

---

### US-40-05 · 🟡 Moyenne · PRO

**En tant que** patient avec le plan Pro,
**je veux** enregistrer un événement de charge mentale ou un événement de vie depuis mon téléphone,
**afin de** capturer un pic de stress ou un événement marquant en temps réel.

**Critères d'acceptation :**

- [ ] Écran mobile « Charge mentale » : curseur 1-10, catégorie optionnelle (travail, famille, santé…), note courte optionnelle
- [ ] Validation rapide, temps de saisie < 10 secondes
- [ ] Même flux chiffré que les saisies de crise (E20)
- [ ] Intégration au vault desktop dans `charge-mentale/` avec `source: mobile`

---

### US-40-06 · 🔴 Critique · FREE

**En tant que** patient,
**je veux** accéder à un menu d'accueil mobile me proposant tous les types de saisie disponibles,
**afin de** choisir rapidement ce que je veux enregistrer.

**Critères d'acceptation :**

- [ ] Écran d'accueil mobile affichant les types de saisie sous forme de boutons larges : Crise, Douleur, Traitement, Alimentation, Note, Sport, Charge mentale
- [ ] Les types PRO sont visibles mais verrouillés pour les utilisateurs FREE (avec indication « Pro »)
- [ ] Les types affichés respectent les modules activés par l'utilisateur (E29 — personnalisation des modules)
- [ ] Fond sombre permanent, zones tactiles ≥ 48 px
- [ ] Accès direct au type le plus fréquent de l'utilisateur mis en avant (ex. « Crise » en premier si c'est le plus utilisé)

---

_Fin du backlog v1.4 — 232 User Stories réparties en 40 Epics_
