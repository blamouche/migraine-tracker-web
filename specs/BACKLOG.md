# Migraine AI — Backlog Produit

**Version :** 1.0
**Date :** Avril 2026
**Statut :** Draft
**Référence :** PRD v1.0

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

**Total : 157 User Stories**

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
- [ ] `pnpm lint` et `pnpm typecheck` passent sans erreur sur le projet vide

---

### US-00-03 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** créer et configurer le projet Supabase (staging + production) et appliquer le schéma SQL initial,
**afin d'** avoir la base de données, l'authentification et le stockage prêts avant le développement des features.

**Critères d'acceptation :**

- [ ] Deux projets Supabase créés : `migraine-ai-staging` et `migraine-ai-prod`
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
- [ ] Les secrets Supabase et Netlify sont configurés dans GitHub Actions Secrets
- [ ] Durée totale du pipeline < 10 min sur un projet vide
- [ ] Badge CI visible dans le README

---

### US-00-05 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** configurer les déploiements Netlify pour staging (PR preview) et production (merge sur `main`),
**afin d'** avoir des URLs de review stables pour chaque Pull Request.

**Critères d'acceptation :**

- [ ] Site Netlify `migraine-ai-staging` déploie automatiquement à chaque PR avec une URL unique
- [ ] Site Netlify `migraine-ai-prod` déploie uniquement sur merge vers `main`
- [ ] Variables d'environnement Netlify configurées (Supabase URL, anon key, etc.)
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
- [ ] En mode offline, une page de fallback s'affiche si le réseau est requis

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
- [ ] Possibilité de sauvegarder un repas complet comme modèle réutilisable

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

- [ ] Le score est calculé depuis l'historique personnel (corrélation aliment → crise dans les 24-48h)
- [ ] S'affiche à côté de chaque aliment dans le journal
- [ ] Nécessite au minimum 5 occurrences pour afficher un score fiable
- [ ] Distingué visuellement des étiquettes de risque génériques (tyramine, histamine…)

---

### US-03-04 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** réutiliser des repas complets que j'ai précédemment enregistrés,
**afin de** ne pas ressaisir les mêmes informations pour mes habitudes alimentaires régulières.

**Critères d'acceptation :**

- [ ] Bouton « Utiliser un modèle » dans le formulaire du journal alimentaire
- [ ] Liste des modèles enregistrés (triés par fréquence)
- [ ] La sélection d'un modèle pré-remplit le repas entier
- [ ] Les modèles sont stockés dans `templates/repas-types/`

---

### US-03-05 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** voir les corrélations détectées entre mon alimentation et mes crises dans les 24-48h,
**afin de** prendre des décisions alimentaires informées.

**Critères d'acceptation :**

- [ ] Corrélations affichées dans la section Déclencheurs du dashboard
- [ ] Seuil de confiance ≥ 60% et ≥ 5 occurrences avant affichage
- [ ] Formulation factuelle : « Le fromage affiné précède une crise dans 78% des cas dans les 24h »

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

- [ ] Écran de consentement au premier accès au module IA
- [ ] Liste précise des données envoyées (anonymisées) et celles exclues
- [ ] Bouton « Voir ce qui sera envoyé » disponible avant chaque analyse
- [ ] L'utilisateur peut désactiver le module à tout moment

---

### US-19-02 · 🟠 Haute · PRO

**En tant que** patient Pro,
**je veux** lancer une analyse IA approfondie de mes patterns de déclencheurs,
**afin d'obtenir** des insights complexes que l'analyse locale ne peut pas détecter.

**Critères d'acceptation :**

- [ ] Appel à la demande ou automatique hebdomadaire (opt-in, décoché par défaut)
- [ ] Données envoyées anonymisées côté client avant envoi
- [ ] Résultats stockés dans `ia/patterns-ia.md`
- [ ] Badge IA distinctif sur les patterns générés par l'IA
- [ ] L'utilisateur peut valider ou rejeter chaque pattern IA

---

### US-19-03 · 🟠 Haute · PRO

**En tant que** patient Pro,
**je veux** recevoir des recommandations personnalisées basées sur mon historique,
**afin d'adopter** des habitudes de vie concrètes pour réduire mes crises.

**Critères d'acceptation :**

- [ ] Recommandations formulées en langage non médical, jamais prescriptives sur les médicaments
- [ ] Basées exclusivement sur les données personnelles
- [ ] Chaque recommandation accompagnée d'un indice de confiance
- [ ] Stockées dans `ia/recommandations.md`
- [ ] Rafraîchissables à la demande ou automatiquement (opt-in)

---

### US-19-04 · 🟠 Haute · PRO

**En tant que** patient Pro,
**je veux** générer un résumé narratif de l'évolution de ma pathologie pour mon médecin,
**afin d'enrichir** mon rapport PDF d'un texte rédigé.

**Critères d'acceptation :**

- [ ] Résumé générable sur 1 mois / 3 mois / 6 mois
- [ ] Niveau de détail : synthétique ou détaillé
- [ ] Langue : français ou anglais
- [ ] Intégrable dans le rapport PDF (section dédiée)
- [ ] Stocké dans `ia/resumes/YYYY-MM-DD_resume.md`

---

### US-19-05 · 🟠 Haute · PRO

**En tant que** patient Pro,
**je veux** affiner l'indicateur de risque local avec une analyse IA,
**afin d'obtenir** une probabilité de crise plus précise.

**Critères d'acceptation :**

- [ ] Bouton « Affiner avec l'IA » affiché sous l'indicateur de risque local
- [ ] Déclenché à la demande uniquement par défaut
- [ ] Option d'automatisation au démarrage (opt-in, décoché par défaut)
- [ ] Probabilité affichée en % avec détail des facteurs contributeurs
- [ ] Disclaimer permanent : « Ne remplace pas l'avis médical »

---

### US-19-06 · 🟡 Moyenne · PRO

**En tant que** patient Pro,
**je veux** voir un journal de tous les appels IA effectués,
**afin de** contrôler exactement ce qui a été envoyé à l'API.

**Critères d'acceptation :**

- [ ] Journal stocké dans `config/ia-log.md`
- [ ] Contenu : date, type d'analyse, résumé des données envoyées, déclenchement (manuel/auto)
- [ ] Accessible depuis Préférences → Module IA

---

### US-19-07 · 🟡 Moyenne · PRO

**En tant que** patient Pro,
**je veux** pouvoir exclure mes notes libres de l'envoi à l'API IA,
**afin de** protéger les informations les plus personnelles.

**Critères d'acceptation :**

- [ ] Option « Exclure les notes libres » dans les préférences du module IA
- [ ] Si activée, le champ `notes` est supprimé avant anonymisation et envoi
- [ ] L'utilisateur est informé que cette exclusion peut réduire la qualité des analyses

---

### US-19-08 · 🟡 Moyenne · PRO

**En tant que** patient Pro,
**je veux** que l'app m'indique clairement quand il n'y a pas assez de données pour une prédiction fiable,
**afin de** ne pas me fier à des résultats peu significatifs.

**Critères d'acceptation :**

- [ ] En dessous de 10 crises : module IA de prédiction désactivé avec message explicatif
- [ ] L'indicateur de risque local (niveau 1) reste toujours actif
- [ ] L'indice de confiance et le nombre de crises de calibration sont toujours affichés

---

## EPIC E20 — Saisie mobile — mode Crise à distance

> En tant que patient en déplacement, je veux saisir une crise depuis mon téléphone, afin de ne pas perdre l'enregistrement faute d'avoir mon ordinateur.

### US-20-01 · 🔴 Critique · FREE

**En tant que** patient,
**je veux** activer la saisie mobile depuis l'app desktop,
**afin de** lier mon téléphone à mon vault de façon sécurisée.

**Critères d'acceptation :**

- [ ] Activation depuis Préférences → « Activer la saisie mobile »
- [ ] Génération d'une clé AES-256-GCM stockée dans `config/mobile-sync.md`
- [ ] QR code affiché contenant le secret de dérivation
- [ ] L'utilisateur scanne le QR code depuis son téléphone — secret stocké dans localStorage mobile

---

### US-20-02 · 🔴 Critique · FREE

**En tant que** patient en pleine crise loin de son ordinateur,
**je veux** enregistrer une crise depuis mon téléphone en moins de 15 secondes,
**afin de** ne pas perdre l'enregistrement par manque d'accès au desktop.

**Critères d'acceptation :**

- [ ] Interface mobile disponible sur `m.migraine-ai.app`
- [ ] 3 champs : heure (défaut : maintenant), intensité (curseur), traitement (chips)
- [ ] Fond sombre permanent, zones tactiles ≥ 48px, aucun scroll
- [ ] Données sérialisées en YAML, chiffrées (AES-256-GCM) et envoyées à Supabase
- [ ] Confirmation : « Crise enregistrée. Elle sera intégrée à votre vault à la prochaine ouverture. »

---

### US-20-03 · 🟠 Haute · FREE

**En tant que** patient en déplacement,
**je veux** enregistrer mon niveau de douleur quotidien et ma charge mentale depuis mon téléphone,
**afin de** maintenir mon suivi même loin de mon ordinateur.

**Critères d'acceptation :**

- [ ] Écran Douleur quotidienne : 1 champ (curseur 0-10), < 5 secondes
- [ ] Écran Charge mentale : 1 champ (curseur 1-10), < 5 secondes
- [ ] Même flux chiffré que la saisie de crise

---

### US-20-04 · 🔴 Critique · FREE

**En tant que** patient,
**je veux** que mes saisies mobiles soient automatiquement intégrées dans mon vault à l'ouverture du desktop,
**afin de** retrouver toutes mes données au bon endroit sans action manuelle.

**Critères d'acceptation :**

- [ ] Vérification de `mobile_transit` au démarrage desktop
- [ ] Déchiffrement local avec la clé de `config/mobile-sync.md`
- [ ] Écriture dans `crises/`, `daily-pain/`, `charge-mentale/` avec `source: mobile`
- [ ] Crises mobiles apparaissent en zone d'attention avec badge « Saisie mobile »
- [ ] Entrées synchronisées supprimées de Supabase immédiatement
- [ ] Toast de confirmation : « X entrées saisies depuis votre téléphone ont été ajoutées. »

---

### US-20-05 · 🟠 Haute · FREE

**En tant que** patient hors connexion sur mobile,
**je veux** que mes saisies soient conservées localement et envoyées dès le retour de connexion,
**afin de** ne rien perdre même sans internet.

**Critères d'acceptation :**

- [ ] Saisie stockée en IndexedDB sur le mobile si hors connexion
- [ ] Envoi automatique à Supabase dès connexion rétablie
- [ ] Aucun message d'erreur bloquant — l'utilisateur voit sa saisie confirmée

---

### US-20-06 · 🟡 Moyenne · FREE

**En tant que** patient,
**je veux** pouvoir révoquer l'accès mobile et régénérer la clé de chiffrement,
**afin de** sécuriser mon vault si je perds mon téléphone.

**Critères d'acceptation :**

- [ ] Option « Régénérer la clé » dans Préférences → Saisie mobile
- [ ] Les anciens appareils ne peuvent plus chiffrer de nouvelles entrées
- [ ] Les entrées non synchronisées avec l'ancienne clé restent déchiffrables (historique des clés)
- [ ] Notification confirmant la révocation

---

### US-20-07 · 🟢 Basse · FREE

**En tant que** patient avec des saisies mobiles non synchronisées depuis longtemps,
**je veux** être prévenu avant que ces données soient purgées,
**afin de** les synchroniser avant leur suppression automatique.

**Critères d'acceptation :**

- [ ] Notification à 80 jours sans synchronisation
- [ ] Message : « Vous avez des saisies mobiles non synchronisées depuis 80 jours. Ouvrez Migraine AI sur votre ordinateur. »
- [ ] Purge automatique à 90 jours (cron Supabase)

---

## EPIC E21 — Administration & feature flags

> En tant qu'administrateur, je veux gérer les utilisateurs et configurer les plans depuis une interface dédiée, afin de piloter l'offre sans intervention technique.

### US-21-01 · 🔴 Critique · ADMIN

**En tant qu'** administrateur,
**je veux** me connecter à l'interface d'administration sur `admin.migraine-ai.app`,
**afin d'accéder** aux fonctionnalités de gestion.

**Critères d'acceptation :**

- [ ] Connexion via Supabase Auth (même méthodes que l'app utilisateur)
- [ ] Vérification du rôle `admin` en base de données (RLS)
- [ ] Session timeout après 15 minutes d'inactivité
- [ ] Toutes les actions sont journalisées dans `admin_log`

---

### US-21-02 · 🔴 Critique · ADMIN

**En tant qu'** administrateur,
**je veux** voir la liste de tous les utilisateurs avec leurs métriques clés,
**afin de** monitorer l'usage de la plateforme.

**Critères d'acceptation :**

- [ ] Nom, email masqué (`a***@gmail.com`), date d'inscription, plan, dernière connexion
- [ ] Dernière utilisation, fréquence d'utilisation sur 30 jours glissants, nombre de profils
- [ ] Plan actif par profil avec `stripe_subscription_id`
- [ ] Bouton « Révéler l'email » — action journalisée

---

### US-21-03 · 🟠 Haute · ADMIN

**En tant qu'** administrateur,
**je veux** configurer les feature flags du plan free et du plan Pro,
**afin de** faire évoluer l'offre sans déploiement technique.

**Critères d'acceptation :**

- [ ] Écran dédié « Configuration des plans »
- [ ] Tous les feature flags modifiables : modules, durée d'analyse, exports, saisie vocale, max profils
- [ ] Modification prise en compte par chaque utilisateur à sa prochaine ouverture d'app
- [ ] Chaque modification journalisée (date, admin, ancienne valeur, nouvelle valeur)

---

### US-21-04 · 🟠 Haute · ADMIN

**En tant qu'** administrateur,
**je veux** désactiver temporairement un compte utilisateur,
**afin de** gérer les abus ou les situations exceptionnelles.

**Critères d'acceptation :**

- [ ] Bascule `is_active: false` dans `user_usage`
- [ ] L'utilisateur est bloqué au login dès la prochaine tentative
- [ ] Message affiché à l'utilisateur : « Votre compte a été désactivé. Contactez le support. »
- [ ] Le vault local de l'utilisateur n'est pas touché

---

### US-21-05 · 🟡 Moyenne · ADMIN

**En tant qu'** administrateur,
**je veux** supprimer définitivement un compte utilisateur,
**afin de** respecter une demande RGPD de droit à l'oubli.

**Critères d'acceptation :**

- [ ] Suppression de l'entrée Supabase Auth + `user_usage`
- [ ] L'utilisateur ne peut plus se connecter
- [ ] Le vault local n'est pas touché
- [ ] Action journalisée et irréversible (confirmation en deux étapes)

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

- [ ] Journal horodaté avec : admin, action, cible, ancienne/nouvelle valeur
- [ ] Filtrable par admin, type d'action, période
- [ ] Non modifiable — lecture seule

---

## EPIC E22 — Infrastructure, robustesse & qualité

> En tant qu'équipe de développement, nous voulons que l'application soit robuste, bien testée et déployable en continu, afin de livrer une expérience fiable aux utilisateurs.

### US-22-01 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** que la séquence de démarrage exécute toutes les opérations critiques dans le bon ordre,
**afin que** l'app soit toujours dans un état cohérent à l'ouverture.

**Critères d'acceptation :**

- [ ] 11 étapes exécutées séquentiellement (voir Architecture Technique section 12)
- [ ] Chaque étape gère ses propres erreurs sans bloquer les suivantes (sauf FSAPI critique)
- [ ] Temps total de démarrage < 2 secondes

---

### US-22-02 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** que les fichiers Markdown corrompus soient détectés et signalés sans bloquer l'application,
**afin que** les erreurs de vault n'empêchent pas l'utilisation de l'app.

**Critères d'acceptation :**

- [ ] Scan de validation à chaque démarrage
- [ ] Erreurs consignées dans `config/erreurs-vault.md`
- [ ] Fichiers corrompus signalés dans la zone d'attention (non bloquants)
- [ ] Fichiers vides ignorés silencieusement

---

### US-22-03 · 🔴 Critique · TECH

**En tant que** développeur,
**je veux** gérer les conflits d'accès lorsque l'utilisateur ouvre deux onglets sur le même vault,
**afin d'éviter** les corruptions de données par écriture concurrente.

**Critères d'acceptation :**

- [ ] Verrou de session via BroadcastChannel
- [ ] Le deuxième onglet propose de prendre le contrôle ou de rester en lecture seule
- [ ] L'onglet original bascule en lecture seule si le verrou est cédé

---

### US-22-04 · 🟠 Haute · TECH

**En tant que** développeur,
**je veux** gérer la révocation de la permission FSAPI en cours de session,
**afin que** l'utilisateur soit guidé pour restaurer l'accès sans perdre ses données saisies.

**Critères d'acceptation :**

- [ ] Message non-bloquant avec bouton « Ré-autoriser »
- [ ] Les données saisies en mémoire sont conservées jusqu'à restauration de l'accès
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

- [ ] Vitest configuré et intégré en CI
- [ ] Modules couverts : moteur de patterns, parsing YAML, pipeline d'anonymisation IA, purge corbeille
- [ ] Rapport de couverture généré à chaque push
- [ ] Build bloqué si couverture < 80% sur les modules critiques

---

### US-22-07 · 🟠 Haute · TECH

**En tant que** développeur,
**je veux** avoir des tests E2E couvrant les parcours utilisateurs principaux,
**afin de** garantir que les fonctionnalités critiques fonctionnent de bout en bout.

**Critères d'acceptation :**

- [ ] Playwright (Chromium headless) configuré en CI
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

- [ ] ESLint + Prettier sur chaque push et pull request
- [ ] Tests unitaires + intégration sur chaque push
- [ ] Tests E2E sur chaque PR vers `main`
- [ ] Build Vite sur chaque merge sur `main`
- [ ] Déploiement staging (preview Netlify) sur chaque PR
- [ ] Déploiement production automatique après passage de tous les tests

---

_Fin du backlog v1.0 — 147 User Stories réparties en 22 Epics_
