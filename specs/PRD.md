# Migraine AI — Product Requirements Document

**Version :** 1.0
**Date :** Avril 2026
**Statut :** Draft
**Plateforme :** Chrome / Edge (desktop) — PWA utilisable dans le navigateur ou installable
**Stockage :** File System Access API → vault Obsidian (fichiers .md locaux)

> **Périmètre :** Application web progressive (PWA) fonctionnant dans Chrome/Edge sur desktop. Toutes les données de santé sont stockées localement sur l'ordinateur de l'utilisateur via la File System Access API dans un vault Obsidian dédié. Un backend léger (Supabase) stocke exclusivement les métadonnées d'authentification et d'usage — jamais les données de santé en clair. Exception : les saisies mobiles transitent par Supabase sous forme de blobs chiffrés (AES-256-GCM) opaques côté serveur, puis sont supprimées dès synchronisation avec le vault local (voir 3.19).

---

## Sommaire

1. [Contexte et objectifs](#1-contexte-et-objectifs)
2. [Utilisateurs cibles](#2-utilisateurs-cibles)
3. [Fonctionnalités principales](#3-fonctionnalités-principales)
   - 3.1 [Journal des crises](#31-journal-des-crises)
   - 3.2 [Suivi alimentaire et déclencheurs](#32-suivi-alimentaire-et-déclencheurs)
   - 3.3 [Tableau de bord & analytics](#33-tableau-de-bord--analytics)
   - 3.4 [Rapport médical](#34-rapport-médical)
   - 3.5 [Alertes & notifications](#35-alertes--notifications)
   - 3.6 [Historique des traitements](#36-historique-des-traitements)
   - 3.7 [Détection de patterns et anticipation des crises](#37-détection-de-patterns-et-anticipation-des-crises)
   - 3.8 [Profil médical](#38-profil-médical)
   - 3.9 [Tracking du cycle menstruel](#39-tracking-du-cycle-menstruel)
   - 3.10 [Suivi des rendez-vous médicaux](#310-suivi-des-rendez-vous-médicaux)
   - 3.11 [Suivi des moyens de transport](#311-suivi-des-moyens-de-transport)
   - 3.12 [Suivi des activités sportives](#312-suivi-des-activités-sportives)
   - 3.13 [Saisie vocale assistée](#313-saisie-vocale-assistée)
   - 3.14 [Traqueur de charge mentale et changements de vie](#314-traqueur-de-charge-mentale-et-changements-de-vie)
   - 3.15 [Tracking quotidien de la douleur](#315-tracking-quotidien-de-la-douleur)
   - 3.16 [Multi-profil](#316-multi-profil)
   - 3.17 [Authentification & administration](#317-authentification--administration)
   - 3.18 [Analyses et recommandations IA (plan Pro)](#318-analyses-et-recommandations-ia-plan-pro)
   - 3.19 [Saisie mobile — mode Crise à distance](#319-saisie-mobile--mode-crise-à-distance)
   - 3.20 [Navigation & shell applicatif](#320-navigation--shell-applicatif)
   - 3.21 [Transitions, animations & micro-interactions](#321-transitions-animations--micro-interactions)
   - 3.22 [Feedback utilisateur & états visuels](#322-feedback-utilisateur--états-visuels)
   - 3.23 [Améliorations du Dashboard](#323-améliorations-du-dashboard)
   - 3.24 [Accessibilité avancée & raccourcis clavier](#324-accessibilité-avancée--raccourcis-clavier)
4. [Architecture technique](#4-architecture-technique)
5. [Modèle de données](#5-modèle-de-données)
6. [Exigences non fonctionnelles](#6-exigences-non-fonctionnelles)
   - 6.1 [Sécurité & Conformité](#61-sécurité--conformité)
   - 6.2 [Performance](#62-performance)
   - 6.3 [Accessibilité & UX](#63-accessibilité--ux)
   - 6.4 [Principes UX & UI](#64-principes-ux--ui)
   - 6.5 [Robustesse — gestion des erreurs de fichiers et accès concurrent](#65-robustesse--gestion-des-erreurs-de-fichiers-et-accès-concurrent)
   - 6.6 [Tests automatisés et assurance qualité](#66-tests-automatisés-et-assurance-qualité)
7. [Parcours utilisateur](#7-parcours-utilisateur)
8. [Roadmap](#8-roadmap)

---

## 1. Contexte et objectifs

### 1.1 Contexte

La migraine touche environ 15 % de la population française, soit plus de 10 millions de personnes. C'est l'une des maladies les plus invalidantes selon l'OMS. Le suivi médical reste souvent lacunaire : les patients peinent à fournir des informations précises à leur médecin, et les traitements modernes (anti-CGRP, gépants) nécessitent une documentation rigoureuse des crises pour être prescrits et ajustés.

Migraine AI est une application web progressive (PWA) fonctionnant dans Chrome qui stocke l'intégralité des données localement sur l'ordinateur de l'utilisateur sous forme de fichiers Markdown compatibles Obsidian.

### 1.2 Périmètre technique

| Aspect             | Choix                                                                                                                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plateforme         | Chrome / Edge (desktop) — PWA utilisable dans le navigateur ou installable en app locale                                                                                                                                                                    |
| Stockage           | File System Access API → vault Obsidian (fichiers .md locaux)                                                                                                                                                                                               |
| Format des données | YAML frontmatter dans des fichiers Markdown                                                                                                                                                                                                                 |
| Connectivité       | Offline-first — toutes les fonctionnalités core fonctionnent sans connexion après la première authentification. Météo Open-Meteo et saisie vocale gracieusement dégradées hors ligne.                                                                       |
| Authentification   | Supabase Auth — providers sociaux (Google, Apple, Facebook), email magic link, email/mot de passe (obligatoire, mais non bloquante au premier lancement hors ligne — voir 3.17) — token longue durée (30 jours), stocké en localStorage via le SDK Supabase |
| Hébergement app    | GitHub Pages / Netlify (fichiers statiques — données 100 % locales)                                                                                                                                                                                         |
| Mobile             | Saisie de crise uniquement via un mode mobile allégé (voir 3.19) — les données transitent chiffrées par Supabase et sont intégrées au vault local à la prochaine ouverture desktop                                                                          |

> **Trois modes d'accès :**
>
> - **Navigateur desktop** : l'utilisateur ouvre l'URL dans Chrome/Edge — aucune installation requise. Toutes les fonctionnalités sont disponibles.
> - **App installée desktop** : l'utilisateur clique sur « Installer Migraine AI » dans la barre d'adresse Chrome (bouton ⊕) — l'app s'ouvre dans sa propre fenêtre, sans barre de navigation, et apparaît dans le menu Démarrer / le Dock. Le comportement est identique au mode navigateur.
> - **Mobile (saisie uniquement)** : l'utilisateur ouvre l'URL depuis un navigateur mobile (iOS Safari, Android Chrome). Seul le mode Crise allégé est disponible — les données sont chiffrées et stockées temporairement dans Supabase, puis intégrées au vault local lors de la prochaine session desktop. Voir section 3.19.
>
> La File System Access API est disponible dans les deux modes desktop. La permission de lecture/écriture sur le vault est accordée une seule fois et mémorisée par Chrome. Sur mobile, l'API n'est pas disponible — d'où le mécanisme de transit chiffré.

### 1.3 Objectifs

- Permettre au patient de journaliser précisément chaque crise de migraine
- Identifier les déclencheurs personnels (alimentaires, environnementaux, hormonaux)
- Générer des rapports médicaux exploitables par les neurologues
- Faciliter l'accès aux traitements de fond en documentant rigoureusement la fréquence, l'intensité et l'impact fonctionnel des crises
- Améliorer la qualité de vie par une meilleure connaissance de sa pathologie

---

## 2. Utilisateurs cibles

| Profil               | Besoins                                                   | Fonctionnalités clés                  |
| -------------------- | --------------------------------------------------------- | ------------------------------------- |
| Patient migraineux   | Suivi des crises, identification déclencheurs, historique | Journal, dashboard, alertes, patterns |
| Neurologue / Médecin | Données fiables fréquence/intensité, suivi traitement     | Rapport PDF, export structuré         |
| Aidant / Proche      | Suivi d'un patient dépendant (enfant, personne âgée)      | Multi-profil, vaults distincts        |

---

## 3. Fonctionnalités principales

### 3.1 Journal des crises

Module central de l'application. Il propose deux modes de saisie distincts : un **mode Crise** ultra-rapide utilisable en pleine migraine, et un **mode Complet** à remplir a posteriori. Les données sont écrites dans un fichier Markdown dédié dans `crises/` via la File System Access API.

#### Données enregistrées par crise

| Champ                           | Type                         | Détails                                                            |
| ------------------------------- | ---------------------------- | ------------------------------------------------------------------ |
| Date et heure de début          | DateTime                     | Automatique ou manuelle                                            |
| Durée                           | Calculée + estimation auto   | Heure de fin saisie ou durée estimée depuis l'intensité            |
| Intensité de la douleur         | Échelle 1-10                 | Curseur visuel + échelle EVA                                       |
| Localisation de la douleur      | Sélection extensible         | Unilatérale G/D, bilatérale, front, nuque + **Autre…**             |
| Lieu de survenue                | Texte + sélection extensible | Domicile, travail, transports, extérieur + **Autre…**              |
| Symptômes associés              | Multi-sélection extensible   | Nausées, vomissements, phonophobie, photophobie, aura + **Autre…** |
| Aura                            | Booléen + description        | Type : visuelle, sensitive, motrice, aphasique + **Autre…**        |
| Traitement pris                 | Multi-sélection extensible   | Triptan, AINS, anti-CGRP, gépant + **Autre…**                      |
| Efficacité du traitement        | Échelle 0-3                  | Aucune / Partielle / Bonne / Complète                              |
| Facteurs déclencheurs suspectés | Multi-sélection extensible   | Stress, sommeil, repas sauté, alcool, météo, hormones + **Autre…** |
| Impact fonctionnel (HIT-6)      | Score calculé                | Questionnaire intégré optionnel                                    |
| Notes libres                    | Texte                        | Champ libre pour contexte supplémentaire                           |

#### Aide à la saisie et options personnelles par champ

Chaque champ du formulaire (mode Crise et mode Complet) intègre deux mécanismes systématiques :

1. **Une aide contextuelle** — description courte du champ, exemples, et conseils de saisie, accessible via une icône ⓘ à côté du label. L'aide s'affiche en tooltip ou en panneau glissant sans quitter le formulaire.
2. **L'enregistrement de nouvelles options personnelles** — chaque champ de type sélection permet d'ajouter ses propres valeurs, qui s'intègrent durablement à la liste pour toutes les saisies futures.

---

##### Comportement commun à tous les champs de sélection

**Ajout d'une valeur personnelle :**

1. L'utilisateur sélectionne **« + Ajouter… »** en bas de la liste (après les options prédéfinies)
2. Un champ texte s'ouvre inline — pas de modale, pas de navigation
3. À la validation, la valeur est enregistrée dans la saisie en cours **et** ajoutée à `config/listes-personnalisees.md`
4. Elle apparaît dans la liste dès la prochaine saisie, distinguée visuellement par une icône ✏️
5. Elle est triée par fréquence d'utilisation (les plus souvent choisies remontent en tête)

**Gestion des valeurs personnelles :**

Accessible depuis Préférences → « Gérer mes listes » :

- Renommer une valeur (la modification se propage à toutes les entrées existantes)
- Supprimer une valeur (bloqué si référencée dans des entrées existantes — avertissement explicite)
- Réordonner manuellement l'ordre d'affichage dans la liste

---

##### Détail champ par champ

**Heure de début**

| Aide                | Contenu                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| ⓘ Tooltip           | « Indiquez l'heure à laquelle la douleur a commencé. Si vous n'êtes pas sûr, utilisez l'heure actuelle. »          |
| Raccourci           | Bouton « Maintenant » pré-sélectionné par défaut                                                                   |
| Aide supplémentaire | Si l'heure saisie est dans le futur, avertissement : « Cette heure est dans le futur — souhaitez-vous corriger ? » |

---

**Intensité de la douleur**

| Aide                | Contenu                                                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| ⓘ Tooltip           | Référentiel affiché en permanence à côté du curseur — voir tableau ci-dessous                                                           |
| Aide contextuelle   | La durée estimée s'affiche immédiatement sous le curseur dès qu'une valeur est choisie : « Durée estimée : ~8h »                        |
| Ancre personnelle   | Après 5 crises, l'app affiche : « Votre intensité habituelle est 7 — utilisez-la comme repère »                                         |
| Rappel de cohérence | Au premier usage, un message invite l'utilisateur à choisir une situation personnelle de référence pour chaque palier (voir ci-dessous) |

**Référentiel d'intensité — affiché à côté du curseur :**

| Valeur | Label          | Définition fonctionnelle                              |
| ------ | -------------- | ----------------------------------------------------- |
| 1      | Imperceptible  | Légère gêne, remarquée seulement si on y pense        |
| 2      | Très légère    | Présente mais n'affecte pas l'activité                |
| 3      | Légère         | Perceptible, activité normale possible avec effort    |
| 4      | Modérée faible | Commence à gêner la concentration                     |
| 5      | Modérée        | Concentration difficile, activité ralentie            |
| 6      | Modérée forte  | Activité possible mais pénible, besoin de pauses      |
| 7      | Sévère         | Difficile de travailler ou de fonctionner normalement |
| 8      | Très sévère    | Repos forcé, toute activité est douloureuse           |
| 9      | Intense        | Incapacitant, difficile de rester debout ou de parler |
| 10     | Insupportable  | Douleur maximale imaginable, urgence médicale         |

**Ancre personnelle (configurée une fois, rappelée à chaque saisie) :**

À la première utilisation, l'app propose à l'utilisateur de définir ses propres situations de référence pour 3 paliers clés. Ces ancres sont stockées dans `config/preferences.md` et affichées en sous-texte du curseur :

> _« Pour vous, 7 = vous ne pouvez pas travailler mais vous pouvez vous déplacer. »_

Cela garantit que l'utilisateur évalue toujours sa douleur selon le même repère personnel, quelle que soit la séance de saisie.

_Ce champ ne propose pas d'options personnalisées — l'échelle 1-10 est fixe._

---

**Localisation de la douleur**

| Aide                 | Contenu                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| ⓘ Tooltip            | « Où ressentez-vous la douleur ? Sélectionnez toutes les zones concernées. » + schéma de tête illustré   |
| Options prédéfinies  | Unilatérale gauche, unilatérale droite, bilatérale, front, tempes, nuque, vertex                         |
| Options personnelles | Oui — ex : « derrière l'œil droit », « mâchoire », « cervicales »                                        |
| Tri intelligent      | Les localisations les plus souvent choisies par l'utilisateur remontent automatiquement en tête de liste |

---

**Lieu de survenue & localisation géographique**

Ce champ combine deux niveaux d'information complémentaires :

- **Le contexte sémantique** (domicile, travail…) — pour la détection de patterns et l'affichage dans l'historique
- **L'adresse géographique complète** — pour l'association précise aux données météo Open-Meteo lors d'un déplacement

| Aide                   | Contenu                                                                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| ⓘ Tooltip              | « Indiquez où vous étiez quand la crise a commencé. La localisation géographique permet d'associer les données météo exactes à votre crise. » |
| Valeur par défaut      | Localisation enregistrée dans les préférences (domicile ou lieu habituel) — pré-remplie automatiquement                                       |
| Options prédéfinies    | Domicile, travail, transports, extérieur, chez un proche, en vacances                                                                         |
| Options personnelles   | Oui — ex : « open-space », « voiture », « salle de réunion », « restaurant »                                                                  |
| Suggestion automatique | Si une corrélation forte détectée (ex : 70 % des crises au travail), badge d'alerte à côté de l'option                                        |

**Champ d'adresse géographique — autocomplétion via API :**

Sous la sélection du contexte sémantique, un champ d'adresse complète est proposé en mode Complet (optionnel en mode Crise) :

| Comportement      | Description                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| Valeur par défaut | Adresse du lieu habituel configurée dans les préférences — affichée pré-remplie                                   |
| Autocomplétion    | Dès 3 caractères saisis, suggestions d'adresses via **Photon API** (OpenStreetMap, gratuite, sans clé API)        |
| Format retourné   | Adresse complète structurée : numéro, rue, ville, code postal, pays + coordonnées lat/lon                         |
| Sélection         | L'utilisateur choisit une suggestion — l'adresse complète et les coordonnées sont enregistrées                    |
| Saisie libre      | Si l'utilisateur ne sélectionne pas de suggestion, l'adresse saisie est conservée telle quelle (sans coordonnées) |
| En mode Crise     | Le champ n'est pas affiché — la localisation par défaut des préférences est utilisée automatiquement              |
| Hors connexion    | Si Photon est indisponible, le champ reste en saisie libre et les coordonnées sont laissées vides                 |

**Lieux enregistrés — gestion des favoris :**

L'utilisateur peut enregistrer des adresses fréquentes (domicile, travail, famille…) dans ses préférences. Ces lieux apparaissent en tête de liste et sont proposés en autocomplétion prioritaire avant les résultats Photon.

```yaml
# config/preferences.md — lieux enregistrés
lieux_favoris:
  - label: 'Domicile'
    adresse: '12 rue des Lilas, 75011 Paris'
    lat: 48.8566
    lon: 2.3522
    par_defaut: true
  - label: 'Travail'
    adresse: '25 avenue de la République, 75011 Paris'
    lat: 48.8630
    lon: 2.3700
```

**Utilisation des coordonnées pour la météo :**

Quand une adresse avec coordonnées est enregistrée pour une crise, les données météo Open-Meteo sont récupérées pour ces coordonnées exactes — et non pour la localisation générale des préférences. Cela garantit des données météo précises pour les crises survenant en déplacement.

```yaml
# Dans le frontmatter de la crise
localisation_geo:
  adresse: 'Place Bellecour, 69002 Lyon'
  lat: 45.7578
  lon: 4.8320
  source: manuelle # manuelle | defaut | gps
```

---

**Symptômes associés**

| Aide                 | Contenu                                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| ⓘ Tooltip            | Description brève de chaque symptôme au survol : ex. « Phonophobie : sensibilité aux sons, besoin de silence » |
| Options prédéfinies  | Nausées, vomissements, phonophobie, photophobie, osmophobie, vertiges, troubles visuels, engourdissements      |
| Options personnelles | Oui — ex : « larmoiement », « raideur nuque », « difficulté à parler », « fatigue intense »                    |
| Sélection rapide     | Les 3 symptômes les plus fréquents de l'utilisateur sont affichés en chips en tête de liste                    |

---

**Aura**

| Aide                   | Contenu                                                                                                                           |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| ⓘ Tooltip              | « L'aura est un ensemble de symptômes neurologiques survenant avant ou pendant la crise. Elle dure généralement 20-60 minutes. »  |
| Sous-champ type d'aura | Visuelle (zigzags, points lumineux), sensitive (fourmillements), motrice (faiblesse d'un membre), aphasique (difficulté à parler) |
| Options personnelles   | Oui — ex : « vision floue », « impression de déjà-vu », « difficulté à lire »                                                     |
| Aide visuelle          | Illustrations simples des types d'aura visuels                                                                                    |

---

**Traitement pris**

| Aide                 | Contenu                                                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| ⓘ Tooltip            | « Indiquez le ou les médicaments pris dès le début de la crise. Cette information est essentielle pour évaluer l'efficacité au fil du temps. » |
| Options prédéfinies  | Alimentées depuis `traitements/` — seuls les traitements de crise actifs du profil médical sont affichés en premier                            |
| Options personnelles | Oui — ex : « Paracétamol 1g », « Doliprane », « Prednisolone »                                                                                 |
| Aide posologie       | Au survol d'un traitement, affiche la posologie enregistrée dans le profil : « Imigrane 50mg — 1 comprimé »                                    |
| Raccourci            | Dernier traitement pris pré-sélectionné par défaut                                                                                             |

---

**Efficacité du traitement**

| Aide              | Contenu                                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| ⓘ Tooltip         | Référentiel affiché à côté des options — voir tableau ci-dessous                                                                        |
| Aide contextuelle | Si un traitement vient d'être sélectionné, rappel de l'historique personnel : « Triptan : efficacité complète dans 64 % de vos crises » |
| Moment de saisie  | L'app suggère de renseigner ce champ en fin de crise plutôt qu'au début, via la notification de rappel                                  |

**Référentiel d'efficacité — affiché à côté de chaque option :**

| Valeur | Label     | Définition fonctionnelle                                       |
| ------ | --------- | -------------------------------------------------------------- |
| 0      | Aucune    | Douleur identique ou aggravée 2h après la prise                |
| 1      | Partielle | Amélioration ressentie mais douleur encore présente et gênante |
| 2      | Bonne     | Nette diminution de la douleur, activité légère possible       |
| 3      | Complète  | Disparition totale de la douleur dans les 2h                   |

_Ce champ ne propose pas d'options personnalisées — l'échelle est fixe et standardisée pour la comparaison inter-crises._

---

**Facteurs déclencheurs suspectés**

| Aide                      | Contenu                                                                                                                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ⓘ Tooltip                 | « Quels facteurs pensez-vous avoir contribué à cette crise ? Ces informations alimentent la détection de patterns. »                                                               |
| Options prédéfinies       | Stress, mauvais sommeil, repas sauté, alcool, caféine, variation météo, hormones, effort physique, écran prolongé, odeurs fortes, voyage                                           |
| Options personnelles      | Oui — ex : « réunion stressante », « bruit fort », « lumière vive », « déshydratation »                                                                                            |
| Suggestions contextuelles | L'app pré-coche automatiquement les déclencheurs probables basés sur les données du jour : si chute de pression détectée → « variation météo » pré-coché (confirmable ou décocher) |
| Badge de fréquence        | Chaque déclencheur affiche sa fréquence personnelle entre parenthèses : « Stress (78 %) »                                                                                          |

---

**Score HIT-6**

| Aide                | Contenu                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| ⓘ Tooltip           | « Le HIT-6 mesure l'impact de la migraine sur votre vie quotidienne. Ce questionnaire de 6 questions prend moins d'une minute. » |
| Questionnaire guidé | Les 6 questions s'affichent une par une avec leurs options standardisées (Jamais / Rarement / Parfois / Très souvent / Toujours) |
| Résultat immédiat   | Le score calculé (36-78) est affiché avec son interprétation : « 56 — Impact sévère »                                            |

_Ce champ ne propose pas d'options personnalisées — le questionnaire HIT-6 est standardisé._

---

**Notes libres**

| Aide                  | Contenu                                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| ⓘ Tooltip             | « Ajoutez tout contexte supplémentaire utile : ce que vous faisiez, comment vous vous sentiez avant, observations particulières. » |
| Suggestions           | L'app propose des phrases d'amorce si le champ est vide : « Ex : J'étais en réunion depuis 3h quand… »                             |
| Options personnelles  | Sans objet — champ texte libre                                                                                                     |
| Modèles réutilisables | L'utilisateur peut sauvegarder un modèle de note (ex : description type de ses crises) et l'insérer en un clic                     |

---

##### Stockage des options personnelles

Toutes les valeurs personnalisées sont centralisées dans `config/listes-personnalisees.md`, avec pour chaque valeur sa fréquence d'utilisation pour le tri intelligent :

```yaml
---
localisations_douleur_custom:
  - valeur: "derrière l'œil droit"
    utilisations: 12
  - valeur: 'cervicales'
    utilisations: 4
symptomes_custom:
  - valeur: 'larmoiement'
    utilisations: 8
  - valeur: 'raideur nuque'
    utilisations: 5
declencheurs_custom:
  - valeur: 'réunion stressante'
    utilisations: 6
  - valeur: 'bruit fort'
    utilisations: 3
traitements_custom:
  - valeur: 'Paracétamol 1g'
    utilisations: 15
notes_modeles:
  - titre: 'Description type'
    contenu: "Crise débutant par une tension dans la nuque, suivie d'une douleur pulsatile côté gauche."
---
```

#### Calcul automatique de la durée

Dès que l'intensité est saisie, une durée estimée est affichée immédiatement, calculée depuis l'historique personnel. L'utilisateur peut accepter l'estimation ou saisir l'heure de fin manuellement.

**Valeurs de référence par défaut (sans historique) :**

| Intensité          | Durée estimée |
| ------------------ | ------------- |
| 1-3 (légère)       | 2-4 heures    |
| 4-6 (modérée)      | 4-12 heures   |
| 7-8 (sévère)       | 12-24 heures  |
| 9-10 (très sévère) | 24-72 heures  |

```yaml
duree_estimee: 480 # minutes, calculée à l'ouverture
duree_reelle: 330 # minutes, confirmée par l'utilisateur en fin de crise
```

#### Deux modes de saisie : Crise et Complet

Le journal des crises propose deux modes distincts, accessibles depuis n'importe quel écran via le bouton **« + Nouvelle crise »**.

---

##### Mode Crise — saisie en pleine crise

Conçu pour être utilisé les yeux mi-clos, en moins de 20 secondes, sans réflexion. L'écran est épuré au maximum : fond sombre par défaut, texte grand, un seul geste par étape.

**Champs affichés — 3 uniquement :**

| Champ           | Interaction                                                                   | Valeur par défaut       |
| --------------- | ----------------------------------------------------------------------------- | ----------------------- |
| Heure de début  | Bouton « Maintenant » (1 tap) ou roue horaire                                 | Heure actuelle          |
| Intensité       | Curseur horizontal géant (toute la largeur de l'écran) gradué 1-10            | Aucune                  |
| Traitement pris | Chips larges avec les traitements déjà utilisés par l'utilisateur + « Aucun » | Dernier traitement pris |

**Comportement UX :**

- Le fond de l'écran passe automatiquement en **thème sombre** à l'ouverture du mode Crise, indépendamment des préférences générales
- Aucun scroll nécessaire — tout tient sur un seul écran
- La luminosité de l'écran est réduite automatiquement si l'API Screen Brightness est disponible
- Un seul bouton de validation : **« Enregistrer »** — large, centré, facilement atteignable
- À la validation, la crise est écrite immédiatement dans `crises/YYYY-MM-DD_crise.md` avec `statut: incomplet`
- Un chronomètre discret démarre en arrière-plan pour mesurer la durée réelle de la crise
- Confirmation discrète (toast 2 secondes) : _« Crise enregistrée — complétez les détails plus tard »_
- L'app se referme ou retourne à l'écran d'accueil immédiatement après — pas d'écran intermédiaire

**Accessibilité en mode Crise :**

- Taille minimale des zones tactiles : 64×64px (supérieur au standard WCAG 44px)
- Aucune animation, aucun effet visuel parasite
- Contraste maximum — texte blanc sur fond très sombre (#0F172A)
- Police agrandie (120 % de la taille normale)

---

##### Mode Complet — saisie a posteriori

Formulaire détaillé destiné à être rempli une fois la crise passée, depuis l'historique ou via la notification de rappel. Tous les champs du modèle de données sont disponibles.

**Accès au mode Complet :**

- Depuis la zone d'attention du dashboard : bouton « Compléter » sur la crise incomplète
- Depuis l'historique : action « Modifier » sur n'importe quelle entrée
- Via la notification de rappel envoyée 2h après l'enregistrement en mode Crise (configurable)
- Directement depuis le bouton « + Nouvelle crise » → choix du mode à l'ouverture

**Champs disponibles (tous optionnels sauf les 3 du mode Crise) :**

| Section      | Champs                                                    |
| ------------ | --------------------------------------------------------- |
| Douleur      | Localisation, lieu de survenue                            |
| Symptômes    | Symptômes associés, aura (type)                           |
| Traitement   | Efficacité du traitement                                  |
| Déclencheurs | Facteurs déclencheurs suspectés                           |
| Impact       | Score HIT-6 (questionnaire guidé)                         |
| Durée        | Heure de fin réelle (ou confirmation de la durée estimée) |
| Notes        | Notes libres                                              |

**Comportement UX :**

- Le formulaire s'ouvre pré-rempli avec les données saisies en mode Crise
- Les champs manquants sont mis en évidence visuellement (bordure colorée + label « À compléter »)
- Organisation en sections repliables — l'utilisateur voit immédiatement ce qui manque sans scroller tout le formulaire
- Sauvegarde automatique toutes les 30 secondes — aucune perte si l'app est fermée
- Le `statut: incomplet` est retiré du frontmatter dès que les champs essentiels sont renseignés

---

##### Notification de rappel post-crise

Après un enregistrement en mode Crise, une notification est envoyée pour inviter l'utilisateur à compléter les détails.

| Paramètre          | Valeur par défaut                                                                                 | Configurable                         |
| ------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Délai avant rappel | 2 heures après l'enregistrement                                                                   | Oui — 1h / 2h / 4h / lendemain matin |
| Message            | _« Votre crise de ce matin est enregistrée. Prenez 2 minutes pour compléter les détails ? »_      | Non                                  |
| Action directe     | Bouton « Compléter maintenant » dans la notification → ouvre le mode Complet directement          | —                                    |
| Désactivation      | Possible par crise (« Ne plus me rappeler pour cette crise ») ou globalement dans les préférences | Oui                                  |

---

##### Statut dans le fichier Markdown

```yaml
# Crise enregistrée en mode Crise — incomplète
---
date_debut: 2026-03-29T08:30
intensite: 7
traitements: [triptan]
statut: incomplet
tags: [migraine, crise]
---
# Même crise après complétion en mode Complet
---
date_debut: 2026-03-29T08:30
date_fin: 2026-03-29T14:00
duree_reelle: 330
intensite: 7
localisation_douleur: unilatérale-gauche
symptomes: [nausées, photophobie]
traitements: [triptan]
efficacite_traitement: 3
declencheurs: [stress, mauvais-sommeil]
statut: complet
tags: [migraine, crise]
---
```

#### Gestion de l'historique (CRUD)

| Action    | Comportement                                                                                    |
| --------- | ----------------------------------------------------------------------------------------------- |
| Ouvrir    | Affiche le détail complet en lecture                                                            |
| Modifier  | Ouvre le formulaire pré-rempli — tous les champs éditables                                      |
| Supprimer | Confirmation obligatoire — fichier déplacé dans `corbeille/` (purge automatique après 30 jours) |

La modification d'une entrée recalcule immédiatement les indicateurs du dashboard. La suppression est irréversible au-delà de 30 jours.

**Purge automatique de la corbeille :** à chaque ouverture de l'application, lors de la séquence de démarrage (voir 4.4), les fichiers présents dans `corbeille/` dont la date de suppression dépasse 30 jours sont supprimés définitivement du vault. La date de suppression est enregistrée dans le frontmatter de chaque fichier mis en corbeille (`supprime_le: YYYY-MM-DDTHH:MM`). Si l'app n'est pas ouverte pendant plus de 30 jours, la purge s'exécute au prochain lancement.

---

### 3.2 Suivi alimentaire et déclencheurs

Journal alimentaire simplifié (repas par repas, horodaté) permettant d'identifier les corrélations entre l'alimentation et la survenue des crises.

- Base d'aliments préconfigurée avec étiquettes de risque (tyramine, histamine, caféine, additifs)
- Saisie des facteurs environnementaux : météo, stress (1-5), qualité de sommeil, cycle menstruel
- Détection automatique de corrélations sur 24-48h précédant chaque crise
- Score de risque personnel par aliment basé sur l'historique du patient
- Autocomplétion depuis l'historique personnel — repas complets mémorisables comme modèles réutilisables (stockés dans `templates/repas-types/`)

L'historique des aliments est extrait dynamiquement depuis les fichiers `journal-alimentaire/` existants (frontmatter `aliments[]`). Aucun fichier d'index séparé n'est nécessaire.

#### Aide à la saisie des champs à échelle — journal alimentaire

**Stress (échelle 1-5)**

| Valeur | Label      | Définition fonctionnelle                            |
| ------ | ---------- | --------------------------------------------------- |
| 1      | Très calme | Aucune pression ressentie, journée détendue         |
| 2      | Calme      | Légères sollicitations, gérées sans effort          |
| 3      | Modéré     | Pression présente mais maîtrisée, quelques tensions |
| 4      | Élevé      | Tension notable, difficile à déconnecter            |
| 5      | Très élevé | Surcharge, sentiment de débordement                 |

**Qualité du sommeil (échelle 1-5)**

| Valeur | Label         | Définition fonctionnelle                                            |
| ------ | ------------- | ------------------------------------------------------------------- |
| 1      | Très mauvaise | Nuit très agitée, nombreux réveils, sensation d'épuisement au lever |
| 2      | Mauvaise      | Sommeil fragmenté ou trop court, fatigue au réveil                  |
| 3      | Correcte      | Quelques réveils mais récupération acceptable                       |
| 4      | Bonne         | Sommeil continu, réveil reposé                                      |
| 5      | Excellente    | Nuit complète et réparatrice, pleine forme au lever                 |

> Ces référentiels sont affichés en tooltip au survol de chaque valeur sur le curseur ou les boutons de sélection.

---

### 3.3 Tableau de bord & analytics

Vue synthétique de l'évolution de la pathologie. Les graphiques sont organisés en 4 onglets thématiques, chacun disposant d'un sélecteur de plage de dates indépendant.

#### Zone d'attention — entrées incomplètes

La première section visible du dashboard liste toutes les entrées incomplètes (crises et journaux alimentaires). Elle disparaît automatiquement quand il n'y en a plus. Un badge sur l'icône du dashboard indique le nombre d'entrées incomplètes.

**Actions disponibles par entrée :**

| Action               | Comportement                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| Compléter            | Ouvre le formulaire pré-rempli, curseur sur le premier champ manquant                                     |
| Ignorer (plus tard)  | Masque la carte jusqu'à la prochaine session                                                              |
| Forcer la complétion | Marque l'entrée comme complète avec `completion_forcee: true` — champs vides remplis avec `non renseigné` |

Les entrées avec `completion_forcee: true` sont exclues des calculs d'analytics nécessitant ces champs, mais restent visibles dans l'historique et comptabilisées dans la fréquence mensuelle.

#### Indicateurs clés

| Indicateur                     | Description                                                                                                                |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Fréquence mensuelle            | Nombre de jours de migraine/mois                                                                                           |
| Intensité moyenne              | Moyenne sur la période sélectionnée                                                                                        |
| Durée moyenne des crises       | En heures, avec min/max                                                                                                    |
| Efficacité des traitements     | Taux de réponse par molécule                                                                                               |
| Top déclencheurs               | Classement personnalisé des facteurs corrélés                                                                              |
| Indicateur de fréquence élevée | Alerte visuelle si ≥ 4 jours de migraine/mois — seuil configurable par l'utilisateur ou son médecin (voir note ci-dessous) |
| Score HIT-6 mensuel            | Évolution de l'impact fonctionnel                                                                                          |
| Pression atmosphérique         | Valeur et tendance sur la période                                                                                          |
| Phase lunaire lors des crises  | Répartition par phase lunaire _(section exploratoire — voir note ci-dessous)_                                              |

> **Note — Phase lunaire :** il n'existe pas de consensus scientifique établi sur le lien entre phase lunaire et migraines. Cette donnée est collectée à titre exploratoire et personnel, pour les utilisateurs qui souhaitent vérifier si une corrélation existe dans leur propre historique. La phase lunaire **n'est jamais présentée comme un facteur médical validé**, n'apparaît pas dans le rapport médical PDF (3.4), et est exclue de l'indicateur de risque du jour (3.7) sauf si l'utilisateur a explicitement validé un pattern lunaire personnel.

#### Graphiques — bibliothèque Nivo

Les graphiques sont implémentés avec **[Nivo](https://nivo.rocks)** (D3.js, React-first). Un thème global unique gère la bascule clair/sombre.

**Onglet Crises**

| Graphique                   | Type                                                                                                                                                                                                                                                                                                                | Composant Nivo             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Calendrier douleur & crises | Heatmap mensuelle combinant les crises (3.1) et le tracking quotidien de la douleur (3.15). Chaque jour affiche le niveau de douleur déclaré (0-10) ; les jours de crise sont distingués par un contour ou un marqueur spécifique superposé à la couleur d'intensité. Les jours sans saisie restent neutres (gris). | `@nivo/calendar`           |
| Fréquence des crises        | Barres mensuelles                                                                                                                                                                                                                                                                                                   | `@nivo/bar`                |
| Évolution de l'intensité    | Courbe temporelle                                                                                                                                                                                                                                                                                                   | `@nivo/line`               |
| Durée des crises            | Barres empilées                                                                                                                                                                                                                                                                                                     | `@nivo/bar` (stacked)      |
| Évolution du score HIT-6    | Courbe avec seuils                                                                                                                                                                                                                                                                                                  | `@nivo/line` + annotations |

**Onglet Déclencheurs**

| Graphique                   | Type                | Composant Nivo           |
| --------------------------- | ------------------- | ------------------------ |
| Top déclencheurs globaux    | Barres horizontales | `@nivo/bar` (horizontal) |
| Crises vs alimentation      | Scatter             | `@nivo/scatterplot`      |
| Crises vs activité sportive | Courbe multi-séries | `@nivo/line`             |
| Crises vs transport         | Barres groupées     | `@nivo/bar` (grouped)    |
| Crises vs cycle menstruel   | Courbe multi-séries | `@nivo/line`             |

**Onglet Météo & Environnement**

| Graphique                                 | Type                | Composant Nivo |
| ----------------------------------------- | ------------------- | -------------- |
| Pression atmosphérique vs crises          | Courbe double axe   | `@nivo/line`   |
| Variation de pression vs crises           | Barres + marqueurs  | `@nivo/bar`    |
| Crises par phase lunaire _(exploratoire)_ | Radar / Donut       | `@nivo/radar`  |
| Température & humidité vs crises          | Courbe multi-séries | `@nivo/line`   |

**Onglet Traitements**

| Graphique                  | Type                   | Composant Nivo        |
| -------------------------- | ---------------------- | --------------------- |
| Efficacité des traitements | Barres groupées        | `@nivo/bar` (grouped) |
| Timeline des traitements   | Gantt horizontal       | `@nivo/timerange`     |
| Consultations médicales    | Marqueurs sur timeline | `@nivo/line`          |

#### Sélecteur de plage de dates

Chaque graphique dispose de son propre sélecteur, indépendant des autres.

- **Raccourcis rapides :** 7 jours / 1 mois / 3 mois / 6 mois / 1 an / depuis le début
- **Plage personnalisée :** date de début et fin via un calendrier
- La plage sélectionnée est mémorisée par graphique entre les sessions

---

### 3.4 Rapport médical

Génération côté client (jsPDF + html2canvas) d'un document PDF structuré, destiné à être partagé avec le médecin ou neurologue avant une consultation.

**Contenu du rapport :**

- Résumé de la période (1 mois, 3 mois, 6 mois, ou personnalisé)
- Fréquence mensuelle, intensité moyenne, durée des crises avec graphiques
- Liste détaillée de chaque crise (tableau)
- Traitements utilisés et taux d'efficacité
- Top 5 des déclencheurs suspectés
- Score HIT-6 moyen
- Mention factuelle de la fréquence mensuelle par rapport au seuil configuré, sans recommandation thérapeutique
- Liste des consultations sur la période

**Export :** PDF téléchargeable depuis le navigateur.

#### Export et portabilité des données

En complément du rapport PDF médical, l'application propose des fonctionnalités d'export structuré pour la portabilité des données et la sauvegarde.

**Exports disponibles :**

| Format                    | Contenu                                                                                 | Cas d'usage                                                      |
| ------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| ZIP du vault complet      | Copie intégrale de tous les fichiers Markdown du vault, structure de dossiers préservée | Sauvegarde manuelle, migration vers une autre machine, archivage |
| CSV — Crises              | Une ligne par crise, tous les champs du frontmatter en colonnes                         | Analyse dans un tableur, import dans une autre app de suivi      |
| CSV — Journal alimentaire | Une ligne par jour, colonnes par repas et facteurs                                      | Partage avec un nutritionniste                                   |
| CSV — Traitements         | Un traitement par ligne, dates de début/fin, efficacité                                 | Historique complet pour le médecin                               |
| CSV — Douleur quotidienne | Une ligne par jour, niveau de douleur et impact                                         | Vue longitudinale exportable                                     |

**Comportement :**

- Tous les exports sont générés côté client — aucune donnée ne transite par un serveur
- L'export ZIP est accessible depuis Préférences → « Exporter mon vault »
- Les exports CSV sont accessibles depuis chaque module concerné (bouton « Exporter en CSV ») et depuis le dashboard (export global)
- L'encodage CSV est UTF-8 avec BOM pour compatibilité Excel
- Un export ZIP automatique peut être configuré dans les préférences (fréquence : hebdomadaire ou mensuel) — le fichier est écrit dans un dossier de sauvegarde choisi par l'utilisateur via la File System Access API

---

### 3.5 Alertes & notifications

Implémentation via la **Web Notifications API** + **Service Worker Background Sync**.

| Type d'alerte                   | Déclencheur                                                                                                                             |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Fréquence élevée détectée       | Le seuil configurable de jours de migraine/mois est atteint (défaut : 4 jours) — message factuel, sans mention de traitement spécifique |
| Prise excessive de médicaments  | ≥ 10 prises de triptans/mois (risque céphalée de rebond)                                                                                |
| Déclencheur alimentaire détecté | Corrélation forte identifiée avec un aliment                                                                                            |
| Rappel de consultation          | Pas de consultation depuis > 6 mois                                                                                                     |
| Rappel traitement de fond       | Notification configurable (ex : injection mensuelle)                                                                                    |
| Météo à risque                  | Corrélation identifiée avec pression atmosphérique                                                                                      |

---

### 3.6 Historique des traitements

Suivi longitudinal de tous les traitements (fond et crise). Chaque traitement est un fichier Markdown dans `traitements/`.

#### Données enregistrées

| Champ                 | Type                    | Détails                                                                      |
| --------------------- | ----------------------- | ---------------------------------------------------------------------------- |
| Nom commercial        | Texte                   | Ex : Imigrane, Aimovig, Topiramate                                           |
| Molécule active       | Texte                   | Ex : sumatriptan, érenumab, topiramate                                       |
| Classe thérapeutique  | Sélection               | Triptan / Anti-CGRP / Gépant / Bêtabloquant / Antiépileptique / AINS / Autre |
| Type                  | Sélection               | Traitement de fond / Traitement de crise                                     |
| Posologie             | Texte                   | Ex : 50 mg, 1 comprimé                                                       |
| Voie d'administration | Sélection               | Oral / Injectable / Nasal / Patch                                            |
| Date de début / fin   | Date                    | Date de fin vide si traitement en cours                                      |
| Motif d'arrêt         | Texte (optionnel)       | Ex : inefficacité, effets secondaires                                        |
| Prescripteur          | Texte (optionnel)       |                                                                              |
| Efficacité globale    | Sélection + commentaire | Efficace / Partiellement efficace / Inefficace / Non évalué                  |
| Notes                 | Texte libre             | Tolérance, effets secondaires observés                                       |

#### Évaluation de l'efficacité

| Sous-champ             | Type                                                               |
| ---------------------- | ------------------------------------------------------------------ |
| Verdict                | Efficace / Partiellement efficace / Inefficace / Non évalué        |
| Réduction de fréquence | Aucune / Légère (< 30 %) / Modérée (30-50 %) / Importante (> 50 %) |
| Tolérance              | Bonne / Acceptable / Mauvaise                                      |
| Commentaire libre      | Texte                                                              |

Le verdict s'affiche sous forme de badge coloré (vert / orange / rouge / gris) dans la vue liste.

**Vue timeline :** périodes de chaque traitement superposées à la fréquence des crises sur un axe temporel.

---

### 3.7 Détection de patterns et anticipation des crises

Module d'analyse locale des fichiers Markdown du vault pour identifier des schémas récurrents. Calcul déclenché à chaque ouverture et lors de l'ajout de toute nouvelle entrée. Minimum 10 crises enregistrées requis pour des résultats fiables.

#### Sources analysées

| Source                             | Fenêtre d'analyse                    | Module      |
| ---------------------------------- | ------------------------------------ | ----------- |
| Alimentation                       | 24-48h avant la crise                | 3.2         |
| Stress, sommeil, facteurs déclarés | 24-48h                               | 3.1         |
| Cycle menstruel                    | Phase du cycle au moment de la crise | 3.9         |
| Pression atmosphérique             | Variation sur 24h avant la crise     | Météo (4.1) |
| Température, humidité              | Jour de la crise et J-1              | Météo (4.1) |
| Phase lunaire _(exploratoire)_     | Jour de la crise                     | Lune (4.1)  |
| Transport                          | 12h avant la crise                   | 3.11        |
| Activité sportive                  | 24h avant la crise                   | 3.12        |
| Charge mentale                     | 24-48h avant la crise                | 3.14        |

#### Types de patterns détectés

| Catégorie                      | Exemple de formulation                                                                                                              |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Alimentation                   | « Le fromage affiné précède une crise dans 78 % des cas dans les 24h »                                                              |
| Combinaison multi-facteurs     | « Stress élevé + moins de 6h de sommeil → crise dans les 48h dans 82 % des cas »                                                    |
| Périodicité                    | « Une crise survient en moyenne tous les 18 jours »                                                                                 |
| Hormonal                       | « 68 % des crises surviennent dans les 2 jours précédant les règles »                                                               |
| Météo — pression               | « Chute de pression > 8 hPa/24h précède une crise dans 61 % des cas »                                                               |
| Phase lunaire _(exploratoire)_ | « 72 % de vos crises coïncident avec les 3 jours autour de la pleine lune — corrélation personnelle, non validée scientifiquement » |
| Décompression                  | « 75 % des crises surviennent dans les 24h suivant une chute de charge > 4 points »                                                 |

> Un pattern n'est affiché que s'il dépasse un seuil de confiance ≥ 60 % et s'appuie sur au moins 5 occurrences, pour éviter les faux positifs.

#### Indicateur de risque du jour

Sur l'écran d'accueil, un indicateur synthétise toutes les conditions actives comparées aux patterns connus.

| Niveau | Couleur | Signification                             |
| ------ | ------- | ----------------------------------------- |
| Faible | Vert    | Aucun pattern de risque actif             |
| Modéré | Orange  | 1 facteur de risque connu présent         |
| Élevé  | Rouge   | Combinaison de facteurs à risque détectée |

Détail au survol : _« Risque élevé : chute de pression (-9 hPa) + nuit courte hier + charge mentale élevée (8/10) depuis 3 jours »_

---

### 3.8 Profil médical

Section de paramétrage médical du patient, stockée dans `profil-medical.md` au niveau du vault.

- Type de migraine diagnostiqué (épisodique, chronique, avec aura, hémiplégique…)
- Traitements de fond et de crise en cours (références vers `traitements/`)
- Antécédents cardiovasculaires, allergies et contre-indications connues
- Médecin traitant et neurologue (nom, coordonnées)
- Contraception en cours (pertinent pour certains anti-CGRP)

---

### 3.9 Tracking du cycle menstruel

Module optionnel, activable dans les préférences. Permet de corréler le cycle hormonal avec la survenue des crises (migraine cataméniale). Données stockées dans `cycle/YYYY-MM_cycle.md`.

#### Données enregistrées

| Champ                                 | Type                                      |
| ------------------------------------- | ----------------------------------------- |
| Date de début des règles              | Date                                      |
| Durée des règles                      | Nombre de jours                           |
| Intensité des symptômes prémenstruels | Échelle 1-5 — voir référentiel ci-dessous |

#### Aide à la saisie — intensité des symptômes prémenstruels (échelle 1-5)

| Valeur | Label      | Définition fonctionnelle                                   |
| ------ | ---------- | ---------------------------------------------------------- |
| 1      | Absents    | Aucun symptôme prémenstruel perceptible                    |
| 2      | Légers     | Légère sensibilité, remarquée mais non gênante             |
| 3      | Modérés    | Gêne notable (douleurs, humeur), activité possible         |
| 4      | Importants | Douleurs ou irritabilité significatives, activité ralentie |
| 5      | Sévères    | Très invalidants, repos nécessaire                         |

#### Autres données enregistrées

| Champ                  | Type                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------- |
| Contraception en cours | Sélection (aucune / pilule combinée / progestative / DIU hormonal / DIU cuivre / autre) |
| Phase du cycle         | Calculée automatiquement (menstruelle / folliculaire / ovulatoire / lutéale)            |
| Notes                  | Texte libre                                                                             |

#### Alertes spécifiques

| Alerte                      | Déclencheur                                              |
| --------------------------- | -------------------------------------------------------- |
| Fenêtre à risque cataménial | 2 jours avant et 3 jours après le début des règles       |
| Corrélation confirmée       | ≥ 60 % des crises en phase périmenstruelle sur 3 cycles  |
| Changement de contraception | Rappel de surveiller l'évolution sur les 3 mois suivants |

---

### 3.10 Suivi des rendez-vous médicaux

Tracking des consultations passées et à venir. Chaque consultation est un fichier dans `consultations/`. Les rendez-vous sont inclus dans le rapport médical PDF.

#### Données enregistrées

| Champ                | Type                                                       |
| -------------------- | ---------------------------------------------------------- |
| Date et heure        | DateTime                                                   |
| Médecin              | Texte + sélection extensible                               |
| Spécialité           | Sélection extensible                                       |
| Type de consultation | En cabinet / Téléconsultation / Urgences / Hospitalisation |
| Motif                | Texte libre                                                |
| Résumé de l'échange  | Texte libre (Markdown)                                     |
| Décisions prises     | Multi-sélection + texte                                    |
| Ordonnances          | Texte (optionnel)                                          |
| Prochain rendez-vous | Date (optionnel) → génère un rappel automatique            |

**Rappels :** notification 7 jours avant et la veille du rendez-vous. Si aucun rendez-vous planifié depuis > 6 mois, alerte dans la zone d'attention du dashboard.

---

### 3.11 Suivi des moyens de transport

Corrélation des transports utilisés avec la survenue des crises (vibrations, pression, stress de déplacement). Données dans `transports/`. Saisie rapide en moins de 3 champs.

| Champ                  | Type                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| Date et heure de début | DateTime                                                                                         |
| Moyen de transport     | Sélection extensible (voiture, train, métro, bus, avion, vélo, marche, moto + Autre…)            |
| Durée                  | En minutes                                                                                       |
| Conditions             | Multi-sélection extensible (conduite, passager, debout, foule, bruit fort, trajet long + Autre…) |
| Distance approximative | Km (optionnel)                                                                                   |
| Notes                  | Texte libre                                                                                      |

---

### 3.12 Suivi des activités sportives

Corrélation de l'effort physique avec la survenue des crises. Données dans `sport/`. Analyse dans les 24h précédant chaque crise.

| Champ            | Type                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------- |
| Date et heure    | DateTime                                                                              |
| Type d'activité  | Sélection extensible (course, vélo, natation, yoga, musculation, randonnée… + Autre…) |
| Durée            | En minutes                                                                            |
| Intensité perçue | Échelle 1-5 — voir référentiel ci-dessous                                             |

#### Aide à la saisie — intensité de l'effort sportif (échelle 1-5)

| Valeur | Label    | Définition fonctionnelle                                                                  |
| ------ | -------- | ----------------------------------------------------------------------------------------- |
| 1      | Légère   | Effort minimal, respiration normale, conversation aisée (ex : marche tranquille)          |
| 2      | Modérée  | Légère accélération cardiaque, conversation possible (ex : marche rapide, yoga doux)      |
| 3      | Soutenue | Respiration accélérée, conversation difficile (ex : jogging, vélo à allure régulière)     |
| 4      | Intense  | Souffle court, conversation très difficile (ex : course rapide, HIIT, musculation lourde) |
| 5      | Maximale | Effort maximal, impossible de parler, récupération longue nécessaire                      |

#### Autres données enregistrées

| Champ                   | Type                                                                              |
| ----------------------- | --------------------------------------------------------------------------------- |
| Conditions              | Multi-sélection extensible (extérieur, chaleur, froid, altitude, à jeun + Autre…) |
| Fréquence cardiaque max | bpm (optionnel)                                                                   |
| Hydratation             | Bonne / Insuffisante (optionnel)                                                  |
| Notes                   | Texte libre                                                                       |

---

### 3.13 Saisie vocale assistée

Fonctionnalité transversale disponible sur tous les formulaires de saisie. Mode vocal basé sur la **Web Speech API** (Chrome natif) — particulièrement utile en pleine crise.

#### Technologies

| Composant                       | Technologie                                                                         |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| Reconnaissance vocale (online)  | Web Speech API (Chromium/Chrome) — moteur OS                                        |
| Reconnaissance vocale (offline) | Web Speech API mode offline limité de Chrome                                        |
| Synthèse vocale                 | Web Speech Synthesis API (voix système OS)                                          |
| Interprétation des réponses     | Correspondance par similarité sur les listes + règles de parsing pour nombres/dates |

#### Fonctionnement

Mode dialogue guidé séquentiel : l'assistant pose une question par champ, attend la réponse, confirme, puis passe au suivant. Résumé complet lu avant enregistrement.

```
Assistant : « Quelle est l'intensité de votre douleur de 1 à 10 ? »
Utilisateur : « Sept »
Assistant : « Intensité 7, c'est noté. Quel traitement avez-vous pris ? »
Utilisateur : « J'ai pris un triptan »
Assistant : « Triptan noté. L'heure de début est-elle maintenant, 8h30 ? »
Utilisateur : « Oui »
Assistant : « Crise enregistrée. Voulez-vous ajouter d'autres informations ? »
```

Retour configurable : **audio** (synthèse vocale) ou **texte uniquement** (utile en public).

---

### 3.14 Traqueur de charge mentale et changements de vie

Module de suivi de la charge mentale globale pour identifier les **migraines de décompression** (crises survenant lors d'une baisse soudaine du niveau de stress). Données dans `charge-mentale/`.

#### Saisie journalière (< 30 secondes, disponible en mode vocal)

| Champ                    | Type                                       |
| ------------------------ | ------------------------------------------ |
| Niveau de charge mentale | Échelle 1-10 — voir référentiel ci-dessous |

#### Aide à la saisie — charge mentale (échelle 1-10)

| Valeur           | Label                                                                                           | Définition fonctionnelle                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1                | Vide total                                                                                      | Aucune obligation, journée entièrement libre et reposante                  |
| 2                | Très léger                                                                                      | Quelques tâches simples, aucune pression                                   |
| 3                | Léger                                                                                           | Journée calme, sollicitations légères et maîtrisées                        |
| 4                | Modéré bas                                                                                      | Activité normale, charge gérable sans effort particulier                   |
| 5                | Modéré                                                                                          | Journée chargée mais équilibrée, quelques arbitrages nécessaires           |
| 6                | Modéré haut                                                                                     | Plusieurs dossiers ouverts simultanément, besoin de concentration soutenue |
| 7                | Élevé                                                                                           | Pression notable, difficulté à déconnecter en fin de journée               |
| 8                | Très élevé                                                                                      | Sentiment de débordement, tâches non finies, tension persistante           |
| 9                | Critique                                                                                        | Surcharge franche, incapacité à tout gérer, stress physiquement ressenti   |
| 10               | Effondrement                                                                                    | Dépassement total, incapacité à fonctionner normalement                    |
| Domaine dominant | Sélection extensible (professionnel, personnel, familial, financier, médical + Autre…)          |
| Humeur générale  | Sélection extensible (serein, fatigué, anxieux, irritable, triste + Autre…)                     |
| Contexte du jour | Sélection extensible (jour de travail, télétravail, week-end, vacances, arrêt maladie + Autre…) |
| Notes            | Texte libre                                                                                     |

#### Événements de vie — saisie ponctuelle

| Champ               | Type                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| Date de début / fin | Date                                                                                                      |
| Catégorie           | Sélection extensible (professionnel, relationnel, deuil, déménagement, santé, financier + Autre…)         |
| Nature              | Positif / Négatif / Neutre                                                                                |
| Intensité perçue    | Échelle 1-10 — impact subjectif sur la charge mentale, même référentiel que la charge mentale quotidienne |
| Description         | Texte libre                                                                                               |

#### Transitions de rythme détectées

| Type                   | Définition                                   | Pattern typique                          |
| ---------------------- | -------------------------------------------- | ---------------------------------------- |
| Décompression          | Charge ≥ 7 pendant ≥ 3 jours, puis chute ≤ 4 | Migraine de week-end / début de vacances |
| Surcharge soudaine     | Charge < 4 puis montée ≥ 7 en < 48h          | Crise liée au stress aigu                |
| Changement de contexte | Jour travail → vacances ou inversement       | Migraine de transition                   |
| Fatigue accumulée      | Charge ≥ 6 sur ≥ 7 jours consécutifs         | Crise en fin de semaine chargée          |

---

### 3.15 Tracking quotidien de la douleur

Module complémentaire au journal des crises permettant d'enregistrer un niveau de douleur quotidien indépendamment de la déclaration d'une crise. Données dans `daily-pain/YYYY-MM-DD.md`.

| Champ             | Type                                       |
| ----------------- | ------------------------------------------ |
| Date              | Date (obligatoire)                         |
| Niveau de douleur | Échelle 0-10 — voir référentiel ci-dessous |

#### Aide à la saisie — niveau de douleur quotidien (échelle 0-10)

Même référentiel que l'intensité des crises (section 3.1) pour garantir la cohérence entre les deux modules — une valeur 7 signifie la même chose dans le journal de crise et dans le tracking quotidien.

| Valeur | Label          | Définition fonctionnelle                              |
| ------ | -------------- | ----------------------------------------------------- |
| 0      | Aucune         | Aucune douleur ou gêne, tête complètement libre       |
| 1      | Imperceptible  | Légère gêne remarquée seulement si on y pense         |
| 2      | Très légère    | Présente mais n'affecte pas l'activité                |
| 3      | Légère         | Perceptible, activité normale possible avec effort    |
| 4      | Modérée faible | Commence à gêner la concentration                     |
| 5      | Modérée        | Concentration difficile, activité ralentie            |
| 6      | Modérée forte  | Activité possible mais pénible, besoin de pauses      |
| 7      | Sévère         | Difficile de travailler ou de fonctionner normalement |
| 8      | Très sévère    | Repos forcé, toute activité est douloureuse           |
| 9      | Intense        | Incapacitant, difficile de rester debout ou de parler |
| 10     | Insupportable  | Douleur maximale imaginable                           |

> L'ancre personnelle définie pour l'intensité des crises (3.1) s'applique également ici — le même repère personnel est rappelé sous le curseur.

#### Autres données enregistrées

| Champ                 | Type                                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| Type de douleur       | Sélection extensible (aucune, tension légère, tension modérée, sensibilité, migraine légère + Autre…) |
| Localisation          | Sélection extensible (aucune, front, tempes, nuque, globale + Autre…)                                 |
| Lié à une crise       | Booléen + référence vers le fichier crise                                                             |
| Impact sur l'activité | Échelle 0-4 — voir référentiel ci-dessous                                                             |

#### Aide à la saisie — impact sur l'activité (échelle 0-4)

| Valeur       | Label        | Définition fonctionnelle                                              |
| ------------ | ------------ | --------------------------------------------------------------------- |
| 0            | Aucun        | Activité normale, aucune limitation                                   |
| 1            | Léger        | Quelques ajustements mineurs, performance légèrement réduite          |
| 2            | Modéré       | Activité possible mais difficile, rendement significativement diminué |
| 3            | Important    | La plupart des activités sont compromises, sorties ou tâches annulées |
| 4            | Incapacitant | Impossible de travailler ou de réaliser les activités du quotidien    |
| Notes libres | Texte        |

**Comportements clés :**

- Saisie en 2 clics : date (pré-remplie) + curseur de douleur
- Option « Même niveau qu'hier » pour accélérer la saisie
- Si niveau ≥ 7, suggestion de créer une crise si aucune n'existe pour ce jour
- Graphique linéaire continu sur le dashboard avec moyenne glissante 7 jours
- Alerte si augmentation progressive sur 3 jours consécutifs

---

### 3.16 Multi-profil

Chaque profil est associé à un vault Obsidian distinct, sélectionné via la File System Access API. Isolation complète des données entre profils.

| Fonctionnalité        | Description                                                                  |
| --------------------- | ---------------------------------------------------------------------------- |
| Création de profil    | Nom, couleur d'identification, chemin du vault (sélecteur de dossier Chrome) |
| Basculer de profil    | Rechargement complet du vault associé                                        |
| Profil actif mémorisé | Dernier profil restauré au démarrage suivant                                 |
| Suppression de profil | Supprime la référence (pas le vault)                                         |
| Raccourci clavier     | `Cmd/Ctrl + P` pour ouvrir le sélecteur de profil                            |

> Le registre des profils est stocké **à deux niveaux** pour garantir la résilience :
>
> - **Local (IndexedDB)** : lu au démarrage, car il doit exister avant que l'utilisateur sélectionne un vault
> - **Supabase (`user_profiles`)** : copie synchronisée côté serveur — permet de restaurer les profils si l'utilisateur change de machine ou efface les données du navigateur
>
> Au démarrage, l'app vérifie que le registre local est cohérent avec Supabase. En cas de divergence (ex : données locales effacées mais compte Supabase intact), l'app propose de restaurer les profils depuis le serveur — l'utilisateur devra re-pointer chaque vault via le sélecteur de dossier Chrome (les chemins locaux ne sont pas transférables entre machines).

```sql
-- Table user_profiles (registre des profils — synchronisé avec le client)
id                uuid        -- identifiant unique
user_id           uuid        -- référence users.id
profile_local_id  uuid        -- UUID local du profil (même que dans profile_plans)
label             text        -- nom du profil (ex: "Moi", "Léa — ma fille")
color             text        -- couleur d'identification (hex)
created_at        timestamp   -- date de création
-- Note : le chemin du vault n'est PAS stocké côté serveur (donnée locale uniquement)
```

**Isolation & sécurité :** l'application vérifie les droits d'accès File System Access API à chaque basculement. Si le dossier vault d'un profil est introuvable, une alerte propose de le re-localiser.

#### Modèle d'abonnement par profil

**Le plan Pro est attaché à un profil, pas à un compte.** Un compte peut gérer plusieurs profils (cas aidant), chaque profil Pro faisant l'objet d'un abonnement distinct.

**Les limites du plan free sont paramétrables par l'administrateur** depuis l'interface admin (voir 3.17). Cela permet d'ajuster la frontière free/pro sans déployer de nouvelle version de l'app. L'app récupère la configuration des plans depuis Supabase à chaque ouverture de session (cache local pour usage offline).

| Plan        | Profils Pro inclus | Cas d'usage typique                                                          |
| ----------- | ------------------ | ---------------------------------------------------------------------------- |
| Free        | 0                  | Patient solo — fonctionnalités core avec les limites configurées par l'admin |
| Pro Solo    | 1 profil Pro       | Patient qui suit sa propre migraine avec accès complet                       |
| Pro Duo     | 2 profils Pro      | Aidant gérant sa migraine + celle d'un proche                                |
| Pro Famille | 3 profils Pro      | Aidant gérant plusieurs proches                                              |

> Les tarifs exacts sont définis par le business. Le tableau ci-dessus fixe la structure tarifaire, pas les prix.

#### Feature flags par plan — configurables par l'admin

Les fonctionnalités de chaque plan sont contrôlées par des **feature flags** stockés dans Supabase (table `plan_config`) et modifiables depuis l'interface d'administration. Cela permet à l'administrateur de faire évoluer l'offre free/pro sans intervention technique.

| Feature flag                    | Description                                                                 | Valeur par défaut (free) | Valeur Pro           |
| ------------------------------- | --------------------------------------------------------------------------- | ------------------------ | -------------------- |
| `ia_enabled`                    | Accès au module IA (analyses, recommandations, prédiction, résumé narratif) | `false`                  | `true`               |
| `analytics_range_months`        | Durée maximale d'analyse dans le dashboard et les graphiques                | `3` (3 mois glissants)   | `0` (illimité)       |
| `export_csv_enabled`            | Export des données en CSV                                                   | `true`                   | `true`               |
| `export_zip_enabled`            | Export ZIP du vault complet                                                 | `true`                   | `true`               |
| `module_cycle_enabled`          | Module suivi du cycle menstruel                                             | `true`                   | `true`               |
| `module_sport_enabled`          | Module suivi des activités sportives                                        | `true`                   | `true`               |
| `module_transport_enabled`      | Module suivi des transports                                                 | `true`                   | `true`               |
| `module_charge_mentale_enabled` | Module charge mentale et changements de vie                                 | `true`                   | `true`               |
| `module_daily_pain_enabled`     | Module tracking quotidien de la douleur                                     | `true`                   | `true`               |
| `pdf_report_enabled`            | Génération de rapports médicaux PDF                                         | `true`                   | `true`               |
| `vocal_input_enabled`           | Saisie vocale assistée                                                      | `true`                   | `true`               |
| `max_profiles`                  | Nombre maximal de profils par compte                                        | `1`                      | Selon palier (1/2/3) |

> L'administrateur peut à tout moment désactiver un module du plan free pour le réserver au Pro, ou ajuster la durée d'analyse du plan free. Les modifications sont prises en compte à la prochaine ouverture de l'app par chaque utilisateur.

**Comportement côté app :**

- À l'ouverture, l'app récupère la configuration du plan actif du profil depuis Supabase et la met en cache localement (IndexedDB) pour usage offline
- Si un module est désactivé pour le plan de l'utilisateur, le menu reste visible mais grisé avec un message : _« Disponible avec le plan Pro »_ — l'utilisateur voit ce qu'il gagnerait en passant au Pro
- Si la durée d'analyse est limitée (ex : 3 mois), les graphiques du dashboard affichent les données sur la période autorisée avec un message : _« Passez au Pro pour analyser tout votre historique »_
- Les données restent intégralement dans le vault, même si leur analyse est limitée par le plan — aucune donnée n'est supprimée lors d'une rétrogradation

**Règles de gestion :**

- À la création d'un nouveau profil, le profil est créé en **free** par défaut — l'utilisateur peut ensuite l'upgrader en Pro (souscription Stripe déclenchée à ce moment)
- Le plan de chaque profil est stocké dans Supabase (`profile_plans`) et vérifié à chaque chargement du vault correspondant
- Rétrograder un profil Pro en free applique immédiatement les feature flags du plan free — les résultats IA déjà générés dans le vault restent accessibles en lecture
- La suppression d'un profil Pro dans l'app annule l'abonnement Stripe associé via webhook — le vault local n'est pas touché
- Un utilisateur peut avoir un profil free et un profil Pro simultanément sur le même compte

---

### 3.17 Authentification & administration

#### Architecture générale

L'authentification repose sur **Supabase Auth** avec plusieurs méthodes de connexion. Supabase stocke exclusivement les métadonnées d'authentification et d'usage — **aucune donnée de santé ne quitte jamais l'ordinateur de l'utilisateur en clair**.

| Couche                   | Rôle                                                               | Technologie                           |
| ------------------------ | ------------------------------------------------------------------ | ------------------------------------- |
| Authentification         | Providers sociaux + méthodes natives, gestion des sessions, tokens | Supabase Auth                         |
| Métadonnées utilisateurs | Nom, email, dernière connexion, usage, plan                        | Supabase PostgreSQL                   |
| Données de santé         | Vault complet                                                      | Fichiers Markdown locaux uniquement   |
| Interface admin          | Dashboard administrateur                                           | React + TypeScript + Tailwind, Vercel |
| Paiement (futur)         | Abonnements payants                                                | Stripe                                |

#### Méthodes d'authentification supportées

**Providers sociaux (OAuth2) :**

| Provider | Priorité | Justification                                                                                                                                     |
| -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Google   | v1.0     | Provider principal — majorité des utilisateurs desktop Chrome                                                                                     |
| Apple    | v1.0     | Indispensable pour les utilisateurs iOS sur le mode mobile (`m.migraine-ai.app`) — requis par Apple pour les apps proposant une connexion sociale |
| Facebook | v1.0     | Large base d'utilisateurs grand public, particulièrement pertinent pour le profil patient non-technique                                           |

**Méthodes natives (Supabase Auth intégré) :**

| Méthode              | Priorité | Justification                                                                                                                                                                                                             |
| -------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Email magic link     | v1.0     | Connexion sans mot de passe — un lien de connexion est envoyé par email. Idéal pour les utilisateurs réticents à utiliser un provider social ou soucieux de ne pas lier leur compte Google/Apple à une app de santé       |
| Email / mot de passe | v1.0     | Méthode classique avec création de compte par email + mot de passe. Permet l'usage sans dépendance à un provider tiers. Mot de passe requis ≥ 8 caractères. Confirmation par email obligatoire avant activation du compte |

> **Écran de login :** l'écran de connexion présente les 3 boutons sociaux en haut (Google, Apple, Facebook), suivis d'un séparateur « ou », puis du formulaire email (avec deux onglets : « Magic link » et « Mot de passe »). L'ordre des boutons sociaux peut être ajusté par l'admin via la configuration.

#### Flux d'authentification utilisateur

**Premier lancement — avec connexion internet :**

1. Écran de login avec logo Migraine AI — présentation des méthodes de connexion (voir « Écran de login » ci-dessus)
2. L'utilisateur choisit sa méthode : provider social (Google / Apple / Facebook), magic link, ou email/mot de passe
3. Selon la méthode :
   - **Provider social** : redirection OAuth2 → retour dans l'app après authentification
   - **Magic link** : l'utilisateur saisit son email → un lien de connexion est envoyé → clic sur le lien → retour dans l'app
   - **Email/mot de passe** : création de compte (email + mot de passe) → email de confirmation envoyé → clic sur le lien de confirmation → connexion
4. Supabase Auth crée la session et enregistre le profil de base (nom, email, photo si disponible, date d'inscription, méthode de connexion)
5. Écran de consentement : cases à cocher distinctes pour (a) les CGU/politique de confidentialité (obligatoire) et (b) la réception de communications marketing (optionnel, décoché par défaut — voir 6.1)
6. L'application reçoit le token de session Supabase (durée de validité : 30 jours, renouvelé silencieusement)
7. L'UUID anonyme généré localement (si existant) est mergé dans le compte Supabase — les métriques d'usage antérieures sont conservées
8. L'utilisateur pointe son vault local → accès à l'application

**Premier lancement — sans connexion internet :**

1. L'app détecte l'absence de connexion et affiche un message non-bloquant : _« Connexion requise pour créer votre compte. Vous pouvez utiliser l'app maintenant — votre compte sera créé à la prochaine session connectée. »_
2. Un **UUID anonyme** est généré localement (stocké en IndexedDB) et utilisé comme identifiant temporaire
3. L'utilisateur pointe son vault local → accès immédiat à toutes les fonctionnalités gratuites
4. Les métriques d'usage sont collectées localement sous l'UUID anonyme et synchronisées avec Supabase dès qu'une connexion est disponible
5. À la prochaine session connectée, l'écran de login s'affiche automatiquement pour créer le compte et merger l'UUID

**Lancements suivants :**

1. Vérification automatique du token Supabase
2. Si valide : chargement direct du vault
3. Si expiré et connexion disponible : renouvellement silencieux via Supabase
4. Si expiré et hors connexion : l'app continue de fonctionner normalement en mode local — le renouvellement est différé à la prochaine session connectée (pas de blocage)

**Stockage des tokens (côté client) :**

| Élément                     | Stockage                                       | Durée                                  |
| --------------------------- | ---------------------------------------------- | -------------------------------------- |
| Token de session Supabase   | localStorage (géré par le SDK Supabase)        | 30 jours                               |
| Refresh token               | localStorage (géré par le SDK Supabase)        | 30 jours, renouvelé silencieusement    |
| Profil utilisateur minimal  | localStorage (nom, email, photo — cache local) | Persistant                             |
| UUID anonyme (pré-auth)     | IndexedDB                                      | Jusqu'au merge avec le compte Supabase |
| Métriques d'usage offline   | IndexedDB (file d'attente de synchronisation)  | Jusqu'à synchronisation réussie        |
| Feature flags du plan actif | IndexedDB (cache de `plan_config`)             | Rafraîchi à chaque ouverture connectée |

> **Note sur la sécurité du stockage côté client :** le localStorage n'est pas chiffré — les tokens de session sont accessibles à toute extension de navigateur ou à un accès physique à la machine. C'est le comportement standard du SDK Supabase et de la majorité des applications web. La protection repose sur la durée de vie limitée des tokens (30 jours), le renouvellement automatique, et le fait que les données sensibles (vault médical) ne transitent jamais par ces mécanismes. Les données de santé restent dans des fichiers Markdown locaux, protégés par les permissions du système de fichiers de l'OS.

> Les données de santé (vault Markdown) ne transitent jamais par Supabase. Seuls les événements d'usage anonymisés (dernière connexion, fréquence d'ouverture, nombre de profils) sont transmis.

#### Métadonnées stockées dans Supabase

Le schéma Supabase ne contient **que** des métadonnées techniques et d'usage — aucun champ médical.

```sql
-- Table users (gérée par Supabase Auth)
id            uuid        -- identifiant unique
email         text        -- email de l'utilisateur (provider social ou saisie manuelle)
name          text        -- nom complet (provider social ou saisi à l'inscription)
avatar_url    text        -- photo de profil (provider social, nullable si email/mot de passe)
auth_provider text        -- méthode de connexion : 'google' | 'apple' | 'facebook' | 'email' | 'magiclink'
created_at    timestamp   -- date d'inscription
last_sign_in  timestamp   -- dernière connexion
anonymous_id  uuid        -- UUID anonyme pré-auth, conservé après merge (nullable)

-- Table user_usage (métadonnées d'usage au niveau du compte)
user_id              uuid        -- référence users.id (ou anonymous_id avant auth)
last_active_at       timestamp   -- dernière utilisation de l'app
session_count        integer     -- nombre total de sessions (incluant sessions anonymes pré-auth)
profile_count        integer     -- nombre de profils locaux déclarés
is_active            boolean     -- compte actif ou désactivé par l'admin
marketing_consent    boolean     -- consentement explicite aux communications marketing (défaut : false)
marketing_consent_at timestamp   -- date et heure du consentement (null si non consenti)

-- Table profile_plans (plan par profil — alimentée par les webhooks Stripe)
id                uuid        -- identifiant unique
user_id           uuid        -- référence users.id
profile_local_id  uuid        -- UUID du profil local (stocké dans config/profils.md côté client)
plan              text        -- 'free' | 'pro'
stripe_subscription_id text   -- identifiant de l'abonnement Stripe (null si free)
stripe_customer_id text       -- identifiant client Stripe (null si free)
plan_activated_at timestamp   -- date d'activation du plan Pro
plan_expires_at   timestamp   -- date d'expiration (null si actif)
```

#### Événements d'usage transmis à Supabase

À chaque ouverture de l'application, une requête légère met à jour les métadonnées d'usage. **Aucun contenu du vault n'est inclus.**

| Événement                       | Données transmises                                                                                  |
| ------------------------------- | --------------------------------------------------------------------------------------------------- |
| Ouverture de l'app (connecté)   | `last_active_at`, `session_count` incrémenté dans `user_usage`                                      |
| Ouverture de l'app (hors ligne) | Métriques mises en file d'attente en IndexedDB, synchronisées dès connexion rétablie                |
| Création d'un profil local      | `profile_count` incrémenté dans `user_usage` + ligne créée dans `profile_plans` avec `plan: 'free'` |
| Suppression d'un profil local   | `profile_count` décrémenté + ligne `profile_plans` archivée                                         |
| Activation Pro sur un profil    | Stripe Checkout → webhook → `profile_plans.plan: 'pro'` + `stripe_subscription_id` enregistré       |
| Annulation Pro sur un profil    | Webhook Stripe → `profile_plans.plan: 'free'`, `plan_expires_at` mis à jour                         |
| Merge UUID anonyme → compte     | `anonymous_id` enregistré dans le profil Supabase, métriques antérieures conservées                 |
| Consentement marketing accordé  | `marketing_consent: true`, `marketing_consent_at` horodaté dans `user_usage`                        |

#### Interface d'administration web

Interface web séparée, accessible uniquement à l'administrateur, hébergée sur Vercel et connectée à Supabase.

**URL :** `https://admin.migraine-ai.app`

**Architecture :**

| Aspect          | Description                                                                             |
| --------------- | --------------------------------------------------------------------------------------- |
| Stack           | React + TypeScript + Tailwind CSS                                                       |
| Hébergement     | Vercel                                                                                  |
| Auth admin      | Supabase Auth (même méthodes que l'app utilisateur) + vérification rôle `admin` en base |
| Base de données | Supabase PostgreSQL (métadonnées uniquement)                                            |
| Session admin   | Timeout après 15 min d'inactivité                                                       |

**Accès sécurisé :**

L'administrateur est identifié par un champ `role: 'admin'` dans la table Supabase, positionné manuellement. Toute tentative d'accès à `admin.migraine-ai.app` par un compte sans ce rôle est rejetée côté serveur (Row Level Security Supabase).

**Fonctionnalités du dashboard admin :**

| Fonctionnalité            | Description                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| Liste des utilisateurs    | Nom, email masqué partiellement (`a***@gmail.com`), date d'inscription, plan              |
| Révéler un email          | Bouton explicite — action journalisée                                                     |
| Dernière connexion        | Timestamp `last_sign_in`                                                                  |
| Dernière utilisation      | Timestamp `last_active_at`                                                                |
| Fréquence d'utilisation   | Nombre de sessions sur 30 jours glissants                                                 |
| Nombre de profils         | `profile_count` déclaré par l'app                                                         |
| Plan actif par profil     | free / pro — détail par profil avec `stripe_subscription_id`                              |
| Désactiver un compte      | Passe `is_active: false` — l'utilisateur est bloqué à la prochaine tentative de connexion |
| Supprimer un compte       | Suppression de l'entrée Supabase Auth + `user_usage` — ne touche pas au vault local       |
| Export CSV                | Données non sensibles uniquement (sans emails complets par défaut)                        |
| Journal des actions admin | Toutes les actions admin sont horodatées et enregistrées                                  |

**Configuration des plans — feature flags (table `plan_config`) :**

L'administrateur dispose d'un écran dédié **« Configuration des plans »** permettant de modifier les feature flags de chaque plan sans intervention technique. Les modifications sont prises en compte par chaque utilisateur à sa prochaine ouverture de l'app.

| Paramètre                  | Type                          | Description                                                    |
| -------------------------- | ----------------------------- | -------------------------------------------------------------- |
| Module IA                  | On / Off par plan             | Active ou désactive l'accès au module IA (3.18)                |
| Durée d'analyse            | Nombre de mois (0 = illimité) | Limite la profondeur temporelle du dashboard et des graphiques |
| Module cycle menstruel     | On / Off par plan             | Active ou désactive le module 3.9                              |
| Module sport               | On / Off par plan             | Active ou désactive le module 3.12                             |
| Module transport           | On / Off par plan             | Active ou désactive le module 3.11                             |
| Module charge mentale      | On / Off par plan             | Active ou désactive le module 3.14                             |
| Module douleur quotidienne | On / Off par plan             | Active ou désactive le module 3.15                             |
| Export CSV                 | On / Off par plan             | Active ou désactive l'export CSV                               |
| Export ZIP                 | On / Off par plan             | Active ou désactive l'export ZIP du vault                      |
| Rapport PDF                | On / Off par plan             | Active ou désactive la génération de rapports médicaux         |
| Saisie vocale              | On / Off par plan             | Active ou désactive la saisie vocale assistée                  |
| Nombre max de profils      | Entier par plan               | Limite le nombre de profils par compte                         |

**Schéma Supabase — table `plan_config` :**

```sql
-- Table plan_config (feature flags par plan — modifiable depuis l'interface admin)
plan              text        -- 'free' | 'pro'
feature_key       text        -- identifiant du feature flag (ex: 'ia_enabled', 'analytics_range_months')
feature_value     text        -- valeur du flag (ex: 'true', 'false', '3', '0')
updated_at        timestamp   -- date de dernière modification
updated_by        uuid        -- identifiant admin ayant effectué la modification
```

> Chaque modification de feature flag est journalisée (date, admin, ancienne valeur, nouvelle valeur). L'administrateur ne peut à aucun moment accéder aux données du vault Markdown (données de santé). Ces fichiers ne transitent jamais par Supabase.

#### Désactivation et suppression de compte

| Action        | Comportement côté app                                              | Comportement côté vault                                           |
| ------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Désactivation | L'utilisateur est bloqué au login — token invalidé par Supabase    | Vault local intact, non touché                                    |
| Suppression   | Compte Supabase supprimé — l'utilisateur ne peut plus se connecter | Vault local intact — l'utilisateur conserve ses fichiers Markdown |

#### Abonnements payants (Stripe — futur)

L'intégration Stripe est préparée dans l'architecture mais non activée en v1.0. **Le plan Pro est souscrit par profil** — un compte peut avoir plusieurs abonnements actifs simultanément, un par profil Pro.

| Plan        | Contenu                                                                                                                                               | Abonnements Stripe associés |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| free        | Fonctionnalités core avec les limites configurées par l'admin via feature flags (voir 3.16) — par défaut : pas de module IA, analyse limitée à 3 mois | Aucun                       |
| Pro Solo    | Accès complet, toutes les fonctionnalités déverrouillées, analyse illimitée — 1 profil                                                                | 1 abonnement                |
| Pro Duo     | Idem — 2 profils                                                                                                                                      | 2 abonnements               |
| Pro Famille | Idem — 3 profils                                                                                                                                      | 3 abonnements               |

**Flux Stripe par profil :**

1. L'utilisateur active le Pro sur un profil → Stripe Checkout s'ouvre pour ce profil spécifiquement
2. Stripe crée un `subscription_id` associé à ce profil dans la table `profile_plans` (voir schéma ci-dessous)
3. Le webhook Stripe met à jour `plan: 'pro'` pour ce profil uniquement
4. En cas d'annulation ou d'échec de paiement : le module IA est désactivé sur ce profil, les autres profils ne sont pas affectés

#### Gestion des erreurs d'authentification

| Scénario                                  | Comportement                                                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Popup de connexion bloquée (OAuth)        | Message : « Autorisez les popups pour vous connecter »                                                                          |
| Utilisateur annule la connexion           | Retour à l'écran de login sans message d'erreur                                                                                 |
| Magic link expiré ou invalide             | Message : _« Ce lien de connexion a expiré. Demandez-en un nouveau. »_ — bouton « Renvoyer le lien »                            |
| Email de confirmation non reçu            | Lien « Renvoyer l'email de confirmation » visible après 60 secondes — limite à 3 renvois par heure                              |
| Mot de passe incorrect                    | Message générique : _« Email ou mot de passe incorrect »_ (pas de distinction pour éviter l'énumération de comptes)             |
| Mot de passe oublié                       | Lien « Mot de passe oublié ? » → email de réinitialisation via Supabase Auth                                                    |
| Email déjà utilisé avec un autre provider | Message : _« Un compte existe déjà avec cet email via Google. Connectez-vous avec Google ou utilisez le mot de passe oublié. »_ |
| Token expiré — connexion disponible       | Renouvellement automatique silencieux via Supabase                                                                              |
| Token expiré — hors connexion             | L'app continue de fonctionner normalement en mode local ; renouvellement différé                                                |
| Compte désactivé par l'admin              | Message : _« Votre compte a été désactivé. Contactez le support. »_                                                             |
| Premier lancement hors connexion          | UUID anonyme généré, accès immédiat à l'app, auth différée (voir flux ci-dessus)                                                |
| Synchronisation offline en échec          | File d'attente IndexedDB conservée, nouvelle tentative à la prochaine ouverture connectée                                       |

---

### 3.18 Analyses et recommandations IA (plan Pro)

Module premium réservé aux abonnés Pro, accessible via Stripe. L'IA analyse les données du vault local après anonymisation et consentement explicite de l'utilisateur — **aucune donnée identifiable n'est transmise à l'API Claude**.

#### Principe d'anonymisation avant envoi

Avant tout appel à l'API Claude (Anthropic), un pipeline d'anonymisation côté client transforme les données du vault :

| Donnée originale                     | Transformation                                                   |
| ------------------------------------ | ---------------------------------------------------------------- |
| Nom, email, identifiants             | Supprimés — jamais inclus dans le prompt                         |
| Dates exactes                        | Converties en jours relatifs (J-0, J-1, J-7…)                    |
| Lieux nommés (« bureau open-space ») | Remplacés par des catégories génériques (« lieu de travail »)    |
| Noms de médecins                     | Supprimés                                                        |
| Notes libres                         | Envoyées telles quelles — l'utilisateur est averti explicitement |

L'utilisateur valide un écran de consentement détaillé avant le premier envoi, et peut consulter à tout moment un aperçu exact de ce qui sera transmis à l'API (bouton « Voir ce qui sera envoyé »).

> Les appels API Claude sont effectués via un proxy Supabase Edge Function — la clé API Anthropic n'est jamais exposée côté client.

#### Consentement et contrôle utilisateur

- Consentement explicite requis à la première activation du module IA
- L'utilisateur peut désactiver le module à tout moment dans les préférences — aucun appel API ne sera effectué
- Les notes libres peuvent être exclues de l'envoi via une option dédiée
- Un journal local des appels effectués est conservé dans `config/ia-log.md` (date, type d'analyse, données envoyées)

#### Fonctionnalité 1 — Analyse approfondie des patterns et déclencheurs

Enrichissement du moteur de patterns existant (3.7) par l'IA. Le moteur local détecte des corrélations statistiques simples ; Claude identifie des combinaisons complexes, des tendances faibles et des interactions entre facteurs que les algorithmes classiques ne capturent pas.

**Données envoyées à Claude :** séries temporelles anonymisées des crises (intensité, durée, jours relatifs), facteurs contextuels associés, patterns déjà validés par l'utilisateur.

**Sorties générées :**

| Sortie                            | Exemple                                                                                            |
| --------------------------------- | -------------------------------------------------------------------------------------------------- |
| Patterns complexes multi-facteurs | « Semaine chargée (≥ 7/10) + fromage affiné + chute de pression → crise dans 94 % des cas »        |
| Facteurs protecteurs détectés     | « Yoga le matin réduit de 40 % la probabilité de crise dans les 24h »                              |
| Interactions non linéaires        | « Le café est neutre seul, mais combiné à < 6h de sommeil, déclenche une crise dans 70 % des cas » |
| Tendances longue durée            | « La fréquence augmente depuis 3 mois — corrélation avec la montée de la charge mentale »          |

Les patterns IA sont affichés dans la vue « Mes patterns » (3.7) avec un badge **IA** distinctif. L'utilisateur peut les valider ou rejeter comme les patterns algorithmiques.

#### Fonctionnalité 2 — Recommandations personnalisées

Recommandations concrètes et actionnables en matière d'hygiène de vie et de prévention, basées sur l'historique personnel.

| Catégorie         | Exemple                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| Alimentation      | « Éviter le fromage affiné les jours où vous dormez moins de 7h. »                                     |
| Activité physique | « Une marche de 20 min le matin semble réduire le risque dans votre cas. »                             |
| Sommeil           | « Votre seuil critique est 6h. En dessous, le risque dans les 48h augmente fortement. »                |
| Gestion du stress | « Les semaines avec charge ≥ 8/10 sur 3 jours consécutifs sont systématiquement suivies d'une crise. » |
| Cycle menstruel   | « La fenêtre J-2 / J+1 des règles est votre période la plus à risque. Anticipez votre traitement. »    |

**Règles éditoriales :** formulées en langage non médical, toujours basées sur les données personnelles, jamais prescriptives sur les médicaments, accompagnées d'un indice de confiance. Rafraîchies à la demande ou automatiquement une fois par semaine.

#### Fonctionnalité 3 — Résumé narratif pour le médecin

Génération d'un résumé en langage naturel de l'évolution de la pathologie sur une période donnée, destiné à être lu par le médecin en consultation. Ce résumé complète le rapport PDF structuré (3.4).

**Exemple de résumé généré :**

```
Résumé IA — Période du 01/01/2026 au 31/03/2026

Ce trimestre, le patient a enregistré 14 crises migraineuses (4,7/mois), d'intensité
moyenne de 6,8/10 et d'une durée moyenne de 9h — en légère hausse vs le trimestre
précédent (12 crises, 4,0/mois).

Principaux déclencheurs : manque de sommeil (< 6h, présent dans 78 % des crises)
combiné à un stress élevé (≥ 7/10 dans les 48h précédentes). Corrélation forte avec
les chutes de pression atmosphérique (> 8 hPa/24h) confirmée sur ce trimestre.

Triptan : efficacité complète dans 64 % des cas, partielle dans 28 %. Aucune crise
de rebond identifiée.

Points d'attention : le seuil de fréquence configuré (4 jours/mois) a été atteint en
janvier et février. Tendance de fréquence en légère hausse. Ces données peuvent être
utiles dans le cadre d'une discussion avec votre neurologue sur les options de traitement.
```

**Options :** période (1 mois / 3 mois / 6 mois), niveau de détail (synthétique / détaillé), langue (français / anglais). Intégrable dans le rapport PDF (3.4) en section dédiée.

#### Fonctionnalité 4 — Prédiction de crise à venir

Enrichissement de l'indicateur de risque local (3.7) par l'IA. Le moteur local calcule toujours un indicateur de risque sans appel réseau — la fonctionnalité IA vient l'affiner à la demande explicite de l'utilisateur.

**Architecture à deux niveaux :**

| Niveau                 | Calcul                       | Déclenchement                         | Données transmises           |
| ---------------------- | ---------------------------- | ------------------------------------- | ---------------------------- |
| Niveau 1 — Local (3.7) | Moteur de patterns en local  | Automatique à chaque ouverture        | Aucune — 100 % local         |
| Niveau 2 — IA (Pro)    | API Claude via Edge Function | À la demande ou automatisation opt-in | Données anonymisées du vault |

L'indicateur de risque local (niveau 1) est toujours présent sur l'écran d'accueil pour tous les utilisateurs, y compris free. Les utilisateurs Pro voient en plus un bouton **« Affiner avec l'IA »** qui déclenche l'analyse Claude à leur initiative.

**Automatisation optionnelle (Pro) :**

Dans les préférences Pro, une option **« Analyse IA automatique au démarrage »** permet à l'utilisateur qui le souhaite de retrouver la prédiction IA pré-calculée à chaque ouverture. Cette option est **décochée par défaut** — l'utilisateur doit l'activer explicitement, en connaissance de cause que ses données sont envoyées quotidiennement à l'API.

**Données utilisées :** météo du jour + prévisions J+1/J+2, charge mentale récente, sommeil récent, derniers repas, phase du cycle, intervalle depuis la dernière crise, patterns personnels validés. La phase lunaire est incluse uniquement si l'utilisateur a validé un pattern lunaire personnel.

**Affichage enrichi de l'indicateur de risque du jour :**

| Niveau | Affichage                            | Seuil   |
| ------ | ------------------------------------ | ------- |
| Faible | Vert — « Conditions favorables »     | < 25 %  |
| Modéré | Orange — « Conditions à surveiller » | 25-60 % |
| Élevé  | Rouge — « Risque de crise élevé »    | > 60 %  |

Détail au clic : _« Probabilité 72 % — Facteurs : chute de pression (-9 hPa), 2 nuits < 6h, J-1 des règles, fromage hier soir. »_

**Transparence :** l'indice de confiance et le nombre de crises de calibration sont toujours affichés. En dessous de 10 crises enregistrées : prédiction IA désactivée avec message explicatif (le niveau 1 local reste actif). Disclaimer permanent : _« Cette prédiction ne remplace pas l'avis médical. »_

#### Fréquence des appels API

| Analyse                 | Déclenchement                                 | Fréquence max  | Opt-in auto disponible   |
| ----------------------- | --------------------------------------------- | -------------- | ------------------------ |
| Patterns & déclencheurs | À la demande ou hebdomadaire (auto)           | 1 fois/semaine | Oui — décoché par défaut |
| Recommandations         | À la demande ou hebdomadaire (auto)           | 1 fois/semaine | Oui — décoché par défaut |
| Résumé narratif         | À la demande uniquement                       | Illimité       | Non                      |
| Prédiction du jour      | À la demande, ou automatique si opt-in activé | 1 fois/jour    | Oui — décoché par défaut |

> Aucun appel API n'est effectué automatiquement sans action explicite de l'utilisateur ou activation préalable de l'option correspondante dans les préférences Pro.

#### Stack IA

| Aspect                 | Choix                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| Modèle                 | Claude (Anthropic) — `claude-sonnet-4-5`                                                    |
| Appel API              | Via Supabase Edge Function (proxy sécurisé — clé API Anthropic non exposée côté client)     |
| Anonymisation          | Pipeline côté client avant envoi                                                            |
| Stockage des résultats | Fichiers Markdown locaux dans `ia/` du vault — les réponses IA ne quittent pas l'ordinateur |

**Structure du vault — dossier `ia/` :**

```
Migraine AI/
└── ia/
    ├── patterns-ia.md           ← patterns détectés par Claude, validés ou en attente
    ├── recommandations.md       ← recommandations actives + date de génération
    ├── predictions/
    │   └── YYYY-MM-DD.md        ← prédiction du jour (probabilité + facteurs)
    └── resumes/
        └── YYYY-MM-DD_resume.md ← résumés narratifs générés
```

```yaml
# ia/predictions/2026-03-29.md
---
date: 2026-03-29
probabilite_crise: 0.72
niveau_risque: élevé
facteurs_contributeurs:
  - variation_pression: -9.4
  - nuits_courtes: 2
  - phase_cycle: J-1-regles
  - aliment_risque: fromage-affiné
confiance_modele: 0.81
crises_calibration: 47
tags: [ia, prédiction]
---
```

---

### 3.19 Saisie mobile — mode Crise à distance

#### Problème adressé

La File System Access API n'est pas disponible sur les navigateurs mobiles (iOS Safari, Android Chrome) — l'app ne peut pas écrire directement dans le vault Obsidian depuis un téléphone. Pourtant, les crises de migraine surviennent n'importe où, et le mode Crise ultra-rapide (3.1) est conçu pour être utilisable les yeux mi-clos, ce qui le rend naturellement adapté au mobile.

#### Solution — buffer de transit chiffré via Supabase

Le mode mobile permet de saisir une crise depuis n'importe quel téléphone. Les données sont **chiffrées côté client avant tout envoi** et stockées temporairement dans Supabase. Elles sont ensuite aspirées dans le vault local dès que l'utilisateur ouvre l'app desktop.

**Principe : aucune donnée de santé en clair ne touche le serveur.** Supabase stocke un blob chiffré opaque — sans la clé de déchiffrement (stockée dans le vault), personne ne peut lire le contenu.

#### Flux complet

**Saisie sur mobile :**

1. L'utilisateur ouvre `https://m.migraine-ai.app` depuis son téléphone (ou un raccourci sur l'écran d'accueil)
2. Authentification automatique via le token Supabase existant (ou login Google si première fois sur ce device)
3. Écran unique : le **mode Crise allégé** — identique au mode Crise desktop (3 champs : heure, intensité, traitement), optimisé pour mobile (boutons larges, fond sombre, 0 scroll)
4. À la validation, les données de la crise sont sérialisées en YAML, **chiffrées côté client** (AES-256-GCM), puis envoyées à Supabase dans la table `mobile_transit`
5. Confirmation : _« Crise enregistrée. Elle sera intégrée à votre vault à la prochaine ouverture de Migraine AI sur votre ordinateur. »_
6. L'utilisateur peut saisir d'autres données depuis le mobile : douleur quotidienne (2 champs), charge mentale (1 champ) — même flux chiffré

**Synchronisation desktop :**

1. À chaque ouverture de l'app desktop, elle vérifie la table `mobile_transit` pour les entrées non synchronisées de l'utilisateur
2. Les blobs chiffrés sont téléchargés et **déchiffrés localement** avec la clé stockée dans `config/mobile-sync.md` du vault
3. Les données déchiffrées sont écrites dans les fichiers Markdown correspondants du vault (`crises/`, `daily-pain/`, `charge-mentale/`) avec `source: mobile` dans le frontmatter
4. Les entrées synchronisées sont immédiatement **supprimées de Supabase** — aucune rétention côté serveur
5. Les crises importées depuis le mobile apparaissent dans la zone d'attention du dashboard avec le statut `incomplet` et un badge _« Saisie mobile »_, invitant à compléter les détails en mode Complet
6. Notification toast : _« 2 entrées saisies depuis votre téléphone ont été ajoutées à votre vault. »_

#### Chiffrement

| Aspect             | Choix                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Algorithme         | AES-256-GCM (Web Crypto API — native dans tous les navigateurs)                                                                         |
| Clé de chiffrement | Générée à l'activation du mode mobile, stockée dans `config/mobile-sync.md` du vault                                                    |
| Dérivation         | La clé est dérivée d'un secret maître via PBKDF2 — le secret est affiché une seule fois lors de l'activation (QR code + copie manuelle) |
| Côté serveur       | Supabase ne stocke que le blob chiffré + métadonnées non sensibles (user_id, timestamp, statut de synchronisation) — jamais la clé      |

**Activation du mode mobile :**

1. L'utilisateur ouvre Préférences → « Activer la saisie mobile » sur l'app desktop
2. L'app génère une clé de chiffrement et l'écrit dans `config/mobile-sync.md`
3. Un QR code est affiché à l'écran, contenant le secret de dérivation
4. L'utilisateur scanne le QR code depuis son téléphone → le secret est stocké dans le localStorage du navigateur mobile
5. Le lien entre le mobile et le vault est établi — toute saisie mobile sera chiffrée avec cette clé

> Si le téléphone est perdu ou si l'utilisateur veut révoquer l'accès mobile, il peut régénérer la clé depuis l'app desktop → les anciens devices ne peuvent plus chiffrer de nouvelles entrées. Les données non synchronisées chiffrées avec l'ancienne clé restent déchiffrables par le desktop (l'historique des clés est conservé dans `config/mobile-sync.md`).

#### Interface mobile — mode Crise allégé

L'interface mobile est un sous-ensemble minimal de l'app, optimisé pour une saisie en moins de 15 secondes sur un écran tactile en pleine migraine.

**Écrans disponibles sur mobile :**

| Écran               | Champs                                                                    | Temps de saisie |
| ------------------- | ------------------------------------------------------------------------- | --------------- |
| Crise rapide        | Heure (défaut : maintenant), intensité (curseur 1-10), traitement (chips) | < 15 secondes   |
| Douleur quotidienne | Niveau de douleur (curseur 0-10)                                          | < 5 secondes    |
| Charge mentale      | Niveau (curseur 1-10)                                                     | < 5 secondes    |

**Ce qui n'est PAS disponible sur mobile :**

- Dashboard et graphiques
- Mode Complet (compléter les détails d'une crise)
- Rapport PDF
- Gestion des traitements, profil médical, préférences
- Module IA

> Le mobile est un **point d'entrée de données**, pas une app complète. L'analyse et la gestion restent sur desktop.

**UX mobile :**

- Fond sombre permanent (mode Crise)
- Taille des zones tactiles : ≥ 48×48px (standard mobile)
- Aucun scroll nécessaire — tout tient sur un seul écran
- Bouton de validation plein écran en bas : **« Enregistrer »**
- Compatible PWA mobile : installable sur l'écran d'accueil iOS/Android via « Ajouter à l'écran d'accueil »

#### Schéma Supabase — table `mobile_transit`

```sql
-- Table mobile_transit (buffer de transit chiffré — données éphémères)
id                uuid        -- identifiant unique
user_id           uuid        -- référence users.id
encrypted_payload bytea       -- données de la crise chiffrées (AES-256-GCM)
iv                bytea       -- vecteur d'initialisation du chiffrement
entry_type        text        -- 'crise' | 'daily_pain' | 'charge_mentale'
created_at        timestamp   -- date de création sur mobile
synced_at         timestamp   -- date de synchronisation desktop (null si non synchronisée)
deleted_at        timestamp   -- date de suppression post-sync (null si non supprimée)
```

**Politique de rétention :** les entrées synchronisées sont supprimées de Supabase immédiatement après la confirmation d'écriture dans le vault. Les entrées non synchronisées depuis plus de 90 jours sont purgées automatiquement (cron Supabase) avec notification préalable à l'utilisateur : _« Vous avez des saisies mobiles non synchronisées depuis 80 jours. Ouvrez Migraine AI sur votre ordinateur pour les intégrer à votre vault. »_

#### Gestion des erreurs

| Scénario                              | Comportement mobile                                                                            | Comportement desktop                                                                                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pas de connexion sur mobile           | Saisie stockée en IndexedDB local → envoyée à Supabase dès connexion rétablie                  | —                                                                                                                                                    |
| Clé de chiffrement absente sur mobile | Message : _« Saisie mobile non activée. Activez-la depuis Migraine AI sur votre ordinateur. »_ | —                                                                                                                                                    |
| Entrées en attente de sync            | —                                                                                              | Badge sur le dashboard : _« 3 saisies mobiles en attente »_ + bouton sync                                                                            |
| Échec de déchiffrement                | —                                                                                              | Message : _« Impossible de déchiffrer cette entrée. La clé a peut-être été régénérée. »_ — entrée conservée dans `mobile_transit` pour investigation |

---

## 4. Architecture technique

### 4.1 Stack technologique — v1.0

| Composant                             | Technologie                                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Application                           | Progressive Web App (Chrome/Edge) — utilisable dans le navigateur ou installable via manifest + Service Worker            |
| Stockage des données de santé         | File System Access API → fichiers Markdown locaux (vault Obsidian)                                                        |
| Interface utilisateur                 | React.js                                                                                                                  |
| Métadonnées structurées               | YAML frontmatter dans chaque fichier Markdown                                                                             |
| Bibliothèque de graphiques            | Nivo (D3.js / React)                                                                                                      |
| Génération PDF                        | jsPDF + html2canvas (côté client)                                                                                         |
| Notifications                         | Web Notifications API + Service Worker Background Sync                                                                    |
| API météo                             | Open-Meteo (gratuite, sans clé API, sans compte requis)                                                                   |
| API géographique                      | Photon (OpenStreetMap) — autocomplétion d'adresses, gratuite, sans clé API                                                |
| Données lunaires                      | suncalc (~7 Ko, calcul local sans appel réseau)                                                                           |
| Reconnaissance vocale                 | Web Speech API (Chrome natif)                                                                                             |
| Synthèse vocale                       | Web Speech Synthesis API (voix système OS)                                                                                |
| Hébergement app                       | GitHub Pages / Netlify (fichiers statiques)                                                                               |
| Authentification                      | Supabase Auth — providers sociaux (Google, Apple, Facebook) + email magic link + email/mot de passe                       |
| Base de données métadonnées           | Supabase (PostgreSQL) — métadonnées utilisateurs uniquement, zéro données de santé                                        |
| Interface admin                       | React + TypeScript + Tailwind, hébergée sur Vercel                                                                        |
| IA — Analyses & recommandations (Pro) | API Claude (Anthropic) via Supabase Edge Function                                                                         |
| Saisie mobile — chiffrement           | Web Crypto API (AES-256-GCM) — natif dans tous les navigateurs                                                            |
| Saisie mobile — transit               | Supabase (table `mobile_transit`) — blobs chiffrés, supprimés après synchronisation                                       |
| Saisie mobile — hébergement           | Sous-domaine dédié `m.migraine-ai.app` — même hébergement statique (GitHub Pages / Netlify), build séparé optimisé mobile |
| Paiement (futur)                      | Stripe                                                                                                                    |

### 4.2 Données environnementales automatiques

#### Météo — Open-Meteo

À chaque ouverture, les données météo du jour sont récupérées pour la **localisation par défaut** de l'utilisateur et stockées dans `environnement/YYYY-MM-DD_env.md`.

Lorsqu'une crise enregistre une localisation géographique différente de la localisation par défaut (déplacement, voyage), une requête Open-Meteo supplémentaire est effectuée pour les coordonnées exactes de la crise et référencée dans son frontmatter via `environnement_local`.

**Hiérarchie de localisation météo :**

| Situation                                | Source des coordonnées                               | Fichier météo                                 |
| ---------------------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| Crise au lieu habituel                   | Localisation par défaut (`preferences.md`)           | `environnement/YYYY-MM-DD_env.md`             |
| Crise en déplacement avec adresse saisie | Coordonnées de la crise (`localisation_geo.lat/lon`) | `environnement/YYYY-MM-DD_[lat]-[lon]_env.md` |
| Crise sans adresse, hors connexion       | Localisation par défaut                              | `environnement/YYYY-MM-DD_env.md`             |

**Configuration de la localisation par défaut** (dans `config/preferences.md`) :

- Option 1 : adresse saisie manuellement via l'autocomplétion Photon → coordonnées lat/lon stockées
- Option 2 : géolocalisation OS (demande permission navigateur) → coordonnées mises à jour à chaque session
- Si aucune option configurée : alerte au premier lancement invitant à définir sa localisation

| Donnée                    | Unité   | Pertinence migraine                                  |
| ------------------------- | ------- | ---------------------------------------------------- |
| Pression atmosphérique    | hPa     | Déclencheur connu — chute rapide corrélée aux crises |
| Variation de pression 24h | hPa/24h | Plus significative que la valeur absolue             |
| Température               | °C      | Corrélation chaleur extrême                          |
| Humidité relative         | %       | Facteur aggravant pour certains patients             |
| Vitesse du vent           | km/h    | Vents de type foehn corrélés aux crises              |
| Indice UV                 | 0-11    | Exposition lumineuse                                 |

**Enrichissement rétroactif :** au premier lancement du module météo, l'application propose de récupérer automatiquement les données météo historiques pour toutes les crises déjà enregistrées (API historique Open-Meteo).

**Alerte proactive :** si chute de pression > 6 hPa/24h détectée à l'ouverture, alerte sur le dashboard (uniquement si corrélation confirmée dans les patterns personnels).

#### Phase lunaire — suncalc (calcul local, exploratoire)

Calculée localement sans appel réseau. Fournit : phase lunaire (8 phases), illumination (%), prochaine pleine lune, prochaine nouvelle lune.

> **Statut exploratoire :** la phase lunaire est collectée et affichée dans le dashboard à titre personnel — elle n'a pas de validation scientifique établie en tant que facteur de migraine. Elle est exclue du rapport médical PDF et de l'indicateur de risque par défaut. Si le moteur de patterns détecte une corrélation personnelle significative, le pattern est présenté avec la mention explicite : _« corrélation personnelle, non validée scientifiquement »_.

### 4.3 Structure du vault Obsidian

```
Migraine AI/
├── config/
│   ├── preferences.md               ← thème, langue, notifications, modules actifs, localisation
│   ├── profils.md                   ← registre local des profils (UUID, label, couleur, vault path)
│   ├── listes-personnalisees.md     ← valeurs custom des champs extensibles
│   ├── patterns-valides.md          ← patterns confirmés/rejetés par l'utilisateur
│   ├── alertes.md                   ← seuils et règles d'alerte configurés
│   ├── mobile-sync.md              ← clé de chiffrement mobile + historique des clés (voir 3.19)
│   ├── ia-log.md                   ← journal des appels API IA (date, type, données envoyées — voir 3.18)
│   └── erreurs-vault.md            ← erreurs détectées au scan de validation (voir 6.5)
├── crises/                          ← YYYY-MM-DD_crise.md
├── daily-pain/                      ← YYYY-MM-DD.md
├── journal-alimentaire/             ← YYYY-MM-DD_repas.md
├── traitements/                     ← YYYY-MM-DD_nom.md
├── cycle/                           ← YYYY-MM_cycle.md
├── consultations/                   ← YYYY-MM-DD_nom-specialite.md
├── environnement/                   ← YYYY-MM-DD_env.md
├── transports/                      ← YYYY-MM-DD_trajet.md
├── sport/                           ← YYYY-MM-DD_activite.md
├── charge-mentale/                  ← YYYY-MM-DD_charge.md
│   └── evenements/                  ← YYYY-MM-DD_nom.md
├── profil-medical.md
├── ia/                              ← résultats IA (patterns, recommandations, prédictions, résumés)
├── corbeille/                       ← fichiers supprimés (purge 30 j)
└── templates/
    ├── crise.md
    ├── repas.md
    └── repas-types/
```

> **Principe clé :** toute la configuration est stockée dans des fichiers Markdown du vault. Déplacer ou synchroniser le vault suffit à transférer l'application dans son intégralité vers une autre machine.

### 4.4 Séquence de démarrage

1. **Vérification du token Supabase** — si valide : session authentifiée ; si expiré et connexion disponible : renouvellement silencieux ; si expiré et hors connexion : mode local (UUID anonyme si premier lancement)
2. **Récupération des feature flags** — lecture de la table `plan_config` depuis Supabase pour le plan actif du profil, mise en cache IndexedDB (ou lecture du cache si hors ligne)
3. **Vérification de cohérence des profils** — comparaison du registre local (IndexedDB) avec `user_profiles` Supabase ; proposition de restauration en cas de divergence (voir 3.16)
4. **Vérification de la permission File System Access API** pour le vault du profil actif — si révoquée ou dossier introuvable : écran de re-localisation (voir 6.5)
5. **Lecture séquentielle des fichiers `config/*.md`** — reconstruction des listes personnalisées, préférences UI, patterns validés, profil médical, seuils d'alerte
6. **Scan de validation du vault** — détection des fichiers corrompus (frontmatter invalide, encodage non UTF-8) et consignation dans `config/erreurs-vault.md` (voir 6.5)
7. **Purge automatique de la corbeille** — suppression définitive des fichiers dans `corbeille/` dont `supprime_le` dépasse 30 jours (voir 3.1)
8. **Synchronisation des entrées mobiles** — vérification de la table `mobile_transit` pour les entrées non synchronisées, déchiffrement local et écriture dans le vault (voir 3.19)
9. **Récupération des données météo du jour** (Open-Meteo) et calcul de la phase lunaire (suncalc)
10. **Analyse des entrées incomplètes** et calcul de l'indicateur de risque du jour
11. **Affichage de l'interface** avec l'état complet restauré — notification toast si des entrées mobiles ont été importées ou si des erreurs de vault ont été détectées

### 4.5 Configuration des graphiques Nivo

```javascript
// Thème global appliqué à tous les graphiques Nivo
const nivoTheme = {
  background: 'transparent',
  textColor: '#e2e8f0', // adapté clair/sombre via CSS variable
  fontSize: 12,
  axis: { ticks: { line: { stroke: '#4a5568' } } },
  grid: { line: { stroke: '#2d3748', strokeDasharray: '4 4' } },
  tooltip: { container: { background: '#1a202c', borderRadius: 8 } },
}
```

---

## 5. Modèle de données

### 5.1 `crises/YYYY-MM-DD_crise.md`

```yaml
---
date_debut: 2026-03-29T08:30
date_fin: 2026-03-29T14:00
duree_estimee: 480 # minutes, calculé automatiquement
duree_reelle: 330 # minutes, confirmé par l'utilisateur
completion_forcee: false
intensite: 7 # 1-10
localisation_douleur: unilatérale-gauche
lieu_survenue: travail
localisation_geo:
  adresse: '25 avenue de la République, 75011 Paris'
  lat: 48.8630
  lon: 2.3700
  source: defaut # defaut | manuelle | gps
symptomes: [nausées, photophobie]
aura: true
aura_type: visuelle
traitements: [triptan]
efficacite_traitement: 3 # 0=aucune 1=partielle 2=bonne 3=complète
declencheurs: [stress, mauvais-sommeil]
hit6_score: 52
environnement: '[[2026-03-29_env]]'
tags: [migraine, crise]
---
## Notes

Crise survenue après une nuit courte (5h). Triptan pris à 9h, soulagement partiel après 2h.
```

### 5.2 `daily-pain/YYYY-MM-DD.md`

```yaml
---
date: 2026-03-29
niveau_douleur: 4
type_douleur: tension-moderee
localisation: nuque
lie_a_crise: true
crise_ref: crises/2026-03-29_crise.md
impact_activite: 1
notes: Tension résiduelle après crise de la veille
tags: [daily-pain]
---
```

### 5.3 `journal-alimentaire/YYYY-MM-DD_repas.md`

```yaml
---
date: 2026-03-29
petit_dejeuner: [café, croissant, jus-orange]
dejeuner: [fromage-affiné, pain, vin-rouge]
diner: [pâtes, salade]
collations: [chocolat-noir]
stress: 4
sommeil_heures: 5.5
sommeil_qualite: mauvaise
hydratation: insuffisante
tags: [alimentation]
---
```

### 5.4 `environnement/YYYY-MM-DD_env.md`

```yaml
---
date: 2026-03-29
# Météo (Open-Meteo — automatique)
pression_hpa: 1013.2
variation_pression_24h: -8.4
temperature_c: 12.5
humidite_pct: 71
vent_kmh: 22
indice_uv: 3
precipitations_mm: 0
source_meteo: open-meteo
# Lune (suncalc — calcul local)
phase_lune: gibbeuse-décroissante
illumination_pct: 78
prochaine_pleine_lune: 2026-04-12
prochaine_nouvelle_lune: 2026-04-27
tags: [environnement, météo]
---
```

### 5.5 `traitements/YYYY-MM-DD_nom.md`

```yaml
---
nom: Aimovig
molecule: érenumab
classe: anti-CGRP
type: fond
posologie: 70 mg
voie: injectable
date_debut: 2026-01-15
date_fin:
motif_arret:
prescripteur: Dr. Martin (neurologue)
efficacite_verdict: efficace
efficacite_reduction_frequence: importante
efficacite_tolerance: bonne
efficacite_commentaire: Réduction de 60% des crises après 3 mois.
tags: [traitement, fond, anti-CGRP]
---
```

### 5.6 `cycle/YYYY-MM_cycle.md`

```yaml
---
annee_mois: 2026-03
date_debut_regles: 2026-03-05
duree_regles: 5
intensite_spm: 3
contraception: pilule-progestative
phase_actuelle: lutéale
tags: [cycle, hormones]
---
```

### 5.7 `consultations/YYYY-MM-DD_nom-specialite.md`

```yaml
---
date: 2026-03-10T14:30
medecin: Dr. Leroy
specialite: médecin-généraliste
lieu: Cabinet Leroy, 12 rue des Lilas, Paris 11e
type: en-cabinet
motif: Suivi migraine, renouvellement ordonnance
decisions: [nouveau-traitement, bilan-prescrit]
ordonnances: Topiramate 25mg, 1cp/jour pendant 1 mois
prochain_rdv: 2026-06-15
tags: [consultation, médecin-généraliste]
---
## Résumé de l'échange

Consultation de suivi mensuel. Légère amélioration de la fréquence (4 crises vs 7 le mois précédent). Décision d'augmenter le Topiramate à 50mg après 1 mois si bonne tolérance. Bilan sanguin prescrit.
```

### 5.8 `transports/YYYY-MM-DD_trajet.md`

```yaml
---
date: 2026-03-29T07:15
duree_min: 45
moyen: metro
conditions: [debout, foule, bruit-fort]
distance_km: 12
tags: [transport]
---
```

### 5.9 `sport/YYYY-MM-DD_activite.md`

```yaml
---
date: 2026-03-28T07:00
type: course
duree_min: 40
intensite: 3
conditions: [extérieur, froid]
frequence_cardiaque_max: 172
hydratation: insuffisante
tags: [sport, activité]
---
```

### 5.10 `charge-mentale/YYYY-MM-DD_charge.md`

```yaml
---
date: 2026-03-29
charge: 8
domaine_dominant: professionnel
humeur: anxieux
contexte: jour-de-travail
tags: [charge-mentale]
---
```

### 5.11 `config/preferences.md`

```yaml
---
theme: sombre # clair | sombre | auto
langue: fr
modules_actifs: [cycle-menstruel, journal-alimentaire, sport, transport]
graphique_periode_defaut: 3-mois
notifications_actives: true
saisie_vocale_activee: true
retour_audio: true
vault_version: 1.0
# Localisation géographique par défaut
localisation_defaut:
  adresse: '12 rue des Lilas, 75011 Paris'
  lat: 48.8566
  lon: 2.3522
  source: manuelle # manuelle | gps
# Lieux favoris (pré-remplis dans le champ adresse du formulaire de crise)
lieux_favoris:
  - label: 'Domicile'
    adresse: '12 rue des Lilas, 75011 Paris'
    lat: 48.8566
    lon: 2.3522
    par_defaut: true
  - label: 'Travail'
    adresse: '25 avenue de la République, 75011 Paris'
    lat: 48.8630
    lon: 2.3700
---
```

### 5.12 `config/listes-personnalisees.md`

```yaml
---
localisations_douleur_custom: [tempe droite, vertex]
symptomes_custom: [larmoiement, raideur nuque]
auras_custom: [engourdissement bras gauche]
traitements_custom: [Paracétamol 1g, Prednisolone]
declencheurs_custom: [écran prolongé, odeurs fortes]
lieux_survenue_custom: [bureau open-space, voiture]
transports_custom: [trottinette, bateau]
sports_custom: [pilates, escalade]
specialites_custom: [ostéopathe, acupuncteur]
domaines_charge_custom: [associatif, créatif]
humeurs_custom: [submergé, euphorique]
---
```

### 5.13 `config/patterns-valides.md`

```yaml
---
patterns:
  - id: p001
    categorie: météo
    description: 'Chute de pression > 8 hPa/24h précède une crise dans 61% des cas'
    confiance: 0.61
    occurrences: 8
    statut: validé # validé | rejeté | en-attente
  - id: p002
    categorie: alimentation
    description: 'Fromage affiné → crise dans les 24h dans 78% des cas'
    confiance: 0.78
    occurrences: 12
    statut: validé
---
```

### 5.14 `config/profils.md`

```yaml
---
profils:
  - id: 'a1b2c3d4-...' # UUID local du profil (référencé dans profile_plans côté Supabase)
    label: 'Moi'
    couleur: '#6366F1'
    vault_path: '/Users/ben/Documents/Migraine AI' # chemin local, non synchronisé côté serveur
    cree_le: 2026-03-15T10:00
    actif: true # dernier profil utilisé = restauré au démarrage
  - id: 'e5f6g7h8-...'
    label: 'Léa — ma fille'
    couleur: '#EC4899'
    vault_path: '/Users/ben/Documents/Migraine AI-Lea'
    cree_le: 2026-04-01T14:30
    actif: false
---
```

> Ce fichier est le registre local des profils, lu au démarrage avant toute interaction avec le vault. Il est dupliqué dans IndexedDB et synchronisé avec la table `user_profiles` Supabase (voir 3.16). Le `vault_path` n'est jamais transmis au serveur.

### 5.15 `config/mobile-sync.md`

```yaml
---
mobile_actif: true
cle_courante:
  id: 'key-001'
  secret_derive: 'base64-encoded-key...' # clé AES-256-GCM dérivée via PBKDF2
  cree_le: 2026-03-20T09:00
historique_cles:
  - id: 'key-001'
    cree_le: 2026-03-20T09:00
    statut: active # active | révoquée
---
```

> Ce fichier contient la clé de chiffrement pour le mode mobile (3.19). L'historique des clés permet de déchiffrer les entrées transit créées avec une ancienne clé avant révocation. **Ce fichier ne doit jamais être synchronisé via un service cloud non chiffré.**

### 5.16 `config/ia-log.md`

```yaml
---
appels:
  - date: 2026-03-29T08:15
    type: prediction # prediction | patterns | recommandations | resume
    donnees_envoyees: '47 crises anonymisées, météo J/J+1, charge mentale 7j'
    declenchement: manuel # manuel | automatique
  - date: 2026-03-22T10:00
    type: patterns
    donnees_envoyees: '47 crises anonymisées, 90j de journal alimentaire'
    declenchement: automatique
---
```

### 5.17 `config/erreurs-vault.md`

```yaml
---
derniere_analyse: 2026-03-29T08:01
erreurs:
  - fichier: 'crises/2026-02-14_crise.md'
    type: frontmatter_invalide # frontmatter_invalide | encodage_non_utf8 | fichier_vide
    date_detection: 2026-03-29T08:01
    resolu: false
---
```

### 5.18 `config/alertes.md`

```yaml
---
seuil_frequence_elevee: 4 # jours de migraine/mois déclenchant l'alerte (défaut : 4, configurable)
seuil_prise_excessive: 10 # prises de triptans/mois déclenchant l'alerte
rappel_consultation_mois: 6 # mois sans consultation avant rappel
delai_rappel_post_crise: 2h # délai avant notification de complétion (1h / 2h / 4h / lendemain)
alerte_meteo_active: true # alerte proactive si chute de pression détectée
seuil_chute_pression_hpa: 6 # chute de pression min (hPa/24h) pour déclencher l'alerte météo
---
```

### 5.19 Relations entre fichiers (liens Obsidian)

```
crise ──────────────► environnement (même date)
crise ──────────────► profil-medical
crise ──────────────► charge-mentale (même date)
profil-medical ─────► traitements (liste)
consultation ───────► traitements (décisions)
patterns-valides ───► (calculé depuis crises + toutes sources)
evenements ─────────► (fenêtre temporelle crises adjacentes)
```

---

## 6. Exigences non fonctionnelles

### 6.1 Sécurité & Conformité

**Données de santé — vault local :**

- Stockées uniquement sur l'ordinateur de l'utilisateur — ne transitent jamais par Supabase en clair. Exception : les saisies mobiles transitent sous forme de blobs chiffrés AES-256-GCM opaques côté serveur, supprimés dès synchronisation (voir 3.19)
- Seule donnée externe transmise depuis le vault : coordonnées GPS approximatives vers Open-Meteo (désactivable)
- Responsabilité de la sauvegarde à la charge de l'utilisateur (compatible iCloud Drive, Dropbox, Git)
- File System Access API : permission explicite demandée à l'utilisateur pour chaque vault

**Métadonnées d'authentification et d'usage — Supabase :**

- Données stockées : nom, email, date d'inscription, dernière connexion, fréquence d'usage, nombre de profils, plan, consentement marketing
- Aucun champ médical, aucun contenu du vault
- Row Level Security (RLS) Supabase activé — chaque utilisateur n'accède qu'à ses propres données
- Accès admin restreint par rôle en base (pas une simple whitelist d'emails)
- Journal de toutes les actions administratives
- RGPD : droit à l'oubli implémenté via la suppression de compte (vault local non touché)

**Consentement marketing — RGPD :**

- Le consentement à la réception de communications marketing (emails promotionnels, annonces produit) est collecté **séparément** de l'acceptation des CGU, lors de la création du compte
- Il est représenté par une case à cocher **décochée par défaut**, libellée explicitement : _« J'accepte de recevoir des communications de Migraine AI concernant les nouveautés et offres (optionnel) »_
- L'email de l'utilisateur n'est utilisé à des fins marketing **que si** `marketing_consent = true`
- L'utilisateur peut retirer son consentement à tout moment depuis les préférences de l'app → mise à jour immédiate de `marketing_consent` dans Supabase
- La date et heure du consentement (`marketing_consent_at`) sont conservées comme preuve de conformité
- Les emails transactionnels (confirmation de compte, notification de désactivation) ne sont pas soumis à ce consentement — ils sont envoyés quel que soit son statut

### 6.2 Performance

| Critère                      | Cible                               |
| ---------------------------- | ----------------------------------- |
| Temps de chargement initial  | < 2 secondes                        |
| Saisie en mode simplifié     | < 30 secondes                       |
| Génération d'un rapport PDF  | < 5 secondes                        |
| Lecture du vault (analytics) | < 1 seconde pour 12 mois de données |

### 6.3 Accessibilité & UX

- Interface utilisable en pleine crise : contraste élevé, texte lisible, surface des boutons ≥ 44px
- Conformité WCAG 2.1 niveau AA
- Support multilingue : français, anglais
- Fonctionnement hors ligne intégral — seule la météo est gracieusement dégradée
- Thème clair / sombre / automatique (suit le réglage de l'OS) — thème sombre recommandé en crise

### 6.4 Principes UX & UI

> **Principe fondateur :** L'utilisateur ne doit jamais avoir à chercher ce qu'il faut faire. Chaque écran a une action principale évidente. La complexité est cachée derrière des valeurs par défaut intelligentes.

**Composants de saisie :**

| Type de champ    | Composant                                      | Raison                                         |
| ---------------- | ---------------------------------------------- | ---------------------------------------------- |
| Échelle 1-10     | Curseur large + pastilles numérotées           | Surface de clic large, lisible d'un coup d'œil |
| Sélection unique | Boutons radio visuels (pas de dropdown)        | Toutes les options visibles                    |
| Multi-sélection  | Cases à cocher avec chips                      | Sélections visibles sans ouvrir de menu        |
| Texte libre      | Champ auto-extensible                          | S'agrandit avec le contenu                     |
| Date             | Sélecteur natif OS + raccourci « Aujourd'hui » | Familier, rapide                               |
| Heure            | Roue ou HH:MM + raccourci « Maintenant »       | Rapide pour l'heure courante                   |
| Liste extensible | Chips + champ « Autre… » inline                | Ajout sans quitter le formulaire               |

**Règles générales :**

| Règle                            | Application                                                                |
| -------------------------------- | -------------------------------------------------------------------------- |
| Progressive disclosure           | Champs essentiels d'abord, optionnels via « + Ajouter des détails »        |
| Valeurs par défaut intelligentes | Heure = maintenant, lieu = dernier lieu utilisé, traitement = dernier pris |
| Sauvegarde automatique           | Brouillon sauvegardé toutes les 30 secondes                                |
| Confirmation de sortie           | Demander confirmation si formulaire modifié avant de quitter               |
| Optimistic UI                    | Interface mise à jour immédiatement, sans attendre l'écriture disque       |
| Skeleton screens                 | Squelettes pendant le chargement des graphiques                            |

**Microcopy :** phrases courtes, deuxième personne, verbes d'action (`Enregistrer`, `Compléter`, `Ignorer` — jamais `OK`). Messages d'erreur sans culpabilisation.

### 6.5 Robustesse — gestion des erreurs de fichiers et accès concurrent

L'application repose entièrement sur la File System Access API pour lire et écrire dans le vault. Plusieurs scénarios d'erreur doivent être gérés explicitement.

#### Fichier Markdown corrompu ou invalide

| Scénario                                   | Comportement                                                                                                                                                                                                                                                           |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontmatter YAML invalide (syntaxe cassée) | Le fichier est signalé dans la zone d'attention du dashboard : _« Ce fichier contient une erreur et n'a pas pu être lu »_. Les données du fichier sont exclues des analytics. L'utilisateur peut ouvrir le fichier brut pour le corriger manuellement ou le supprimer. |
| Fichier Markdown vide ou sans frontmatter  | Ignoré silencieusement par le moteur de lecture — n'apparaît pas dans l'app.                                                                                                                                                                                           |
| Champ manquant dans le frontmatter         | Le fichier est chargé normalement — les champs manquants sont traités comme `null`. L'entrée est marquée `statut: incomplet` si des champs essentiels manquent.                                                                                                        |
| Encodage non UTF-8                         | Message d'avertissement : _« Ce fichier n'est pas encodé en UTF-8 et pourrait contenir des caractères incorrects. »_                                                                                                                                                   |

À chaque démarrage, un scan de validation rapide parcourt les fichiers du vault et consigne les erreurs détectées dans `config/erreurs-vault.md` (date, fichier, type d'erreur).

#### Révocation de la permission File System Access API

| Scénario                                                        | Comportement                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Permission révoquée en cours de session                         | L'écriture échoue silencieusement → message non-bloquant : _« L'accès au vault a été perdu. Veuillez ré-autoriser l'accès pour continuer à enregistrer vos données. »_ — bouton « Ré-autoriser » qui relance le sélecteur de dossier. Les données saisies en mémoire sont conservées et écrites dès la restauration de l'accès. |
| Vault introuvable au démarrage (dossier déplacé/supprimé)       | Écran d'alerte : _« Le dossier du vault n'est plus accessible. »_ — option de re-localiser le vault ou d'en sélectionner un nouveau.                                                                                                                                                                                            |
| Permission non demandée (nouveau navigateur / données effacées) | Comportement identique au premier lancement : sélecteur de dossier affiché.                                                                                                                                                                                                                                                     |

#### Accès concurrent (deux onglets / deux fenêtres)

L'application utilise un **verrou de session** via l'API BroadcastChannel (native dans Chrome) pour éviter les conflits d'écriture lorsque deux onglets accèdent au même vault.

| Scénario                                                                 | Comportement                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L'utilisateur ouvre un deuxième onglet avec le même vault                | Le deuxième onglet détecte la session existante via BroadcastChannel et affiche : _« Migraine AI est déjà ouvert dans un autre onglet. Voulez-vous continuer ici ? »_ — s'il confirme, l'onglet original se verrouille en lecture seule.                                                                                                                                          |
| Synchronisation cloud (iCloud, Dropbox, Git) avec modifications externes | L'app ne surveille pas les modifications externes en temps réel. Les fichiers sont lus au démarrage et lors des navigations entre écrans. Si un conflit est détecté (date de modification plus récente que la dernière lecture), un message propose : _« Ce fichier a été modifié à l'extérieur de Migraine AI. Voulez-vous charger la version externe ou conserver la vôtre ? »_ |

### 6.6 Tests automatisés et assurance qualité

#### Stratégie de test

| Couche                | Outil                                 | Couverture cible                                                                                                                                     |
| --------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tests unitaires       | Vitest                                | Moteur de patterns (3.7), calcul des indicateurs du dashboard, pipeline d'anonymisation IA, parsing YAML frontmatter, estimation de durée des crises |
| Tests de composants   | React Testing Library                 | Formulaires de saisie (mode Crise et Complet), sélecteurs extensibles, curseurs d'échelle, saisie vocale                                             |
| Tests d'intégration   | Vitest + mocks File System Access API | Cycle complet d'écriture/lecture/modification d'un fichier Markdown, export CSV/ZIP, gestion de la corbeille                                         |
| Tests end-to-end      | Playwright (Chromium)                 | Parcours onboarding, saisie de crise mode Crise → complétion mode Complet, génération de rapport PDF, basculement de profil                          |
| Tests d'accessibilité | axe-core + Playwright                 | Conformité WCAG 2.1 AA sur tous les écrans, contraste mode sombre, taille des zones interactives                                                     |

#### CI/CD

| Étape                         | Outil                            | Déclenchement                                      |
| ----------------------------- | -------------------------------- | -------------------------------------------------- |
| Lint + format                 | ESLint + Prettier                | À chaque push et pull request                      |
| Tests unitaires + intégration | Vitest                           | À chaque push et pull request                      |
| Tests end-to-end              | Playwright (Chromium headless)   | À chaque pull request vers `main`                  |
| Build de production           | Vite                             | À chaque merge sur `main`                          |
| Déploiement staging           | GitHub Pages / Netlify (preview) | À chaque pull request                              |
| Déploiement production        | GitHub Pages / Netlify           | À chaque merge sur `main`, après passage des tests |

#### Critères de qualité

- Couverture de tests unitaires cible : ≥ 80 % sur les modules critiques (patterns, parsing, anonymisation)
- Aucun test e2e en échec autorisé sur `main`
- Les régressions d'accessibilité bloquent le merge (axe-core en CI)

---

### 3.20 Navigation & shell applicatif

L'application v1.0 a été développée sans shell de navigation persistant : chaque page gère sa propre barre de navigation en haut de page, avec des liens contextuels. Ce modèle atteint ses limites dès que le nombre de modules augmente — l'utilisateur perd le contexte de navigation et doit revenir à l'accueil pour naviguer vers une autre section.

#### Layout principal — sidebar + contenu

L'application adopte un layout en deux colonnes :

| Zone | Comportement |
| --- | --- |
| **Sidebar** (240px, fixe à gauche) | Navigation principale regroupée par catégorie. Toujours visible sur desktop. Rétractable en mode icônes (64px) via un bouton toggle. Fermée par défaut sur tablette, ouverte en overlay au clic sur le hamburger. |
| **Zone de contenu** (fluide, max 1200px centré) | Affiche la page active avec son header contextuel (titre, breadcrumb, actions). |

#### Structure de la sidebar

La sidebar regroupe les modules en catégories logiques avec des séparateurs visuels :

| Catégorie | Liens |
| --- | --- |
| **Accès rapide** | Accueil, Nouvelle crise (bouton CTA proéminent) |
| **Suivi** | Crises, Douleur quotidienne, Alimentation, Charge mentale, Cycle, Sport, Transports |
| **Santé** | Traitements, Consultations, Profil médical |
| **Analyse** | Dashboard, Patterns, Module IA `[PRO]` |
| **Système** | Profils, Environnement, Sync mobile, Préférences |

Le lien actif est visuellement distingué (fond `--color-bg-interactive`, bordure gauche `--color-brand` 3px). Un badge numérique apparaît à côté des sections contenant des entrées incomplètes.

#### Breadcrumbs

Chaque page affiche un fil d'Ariane sous le titre de page, reflétant la hiérarchie de navigation : `Accueil > Crises > Crise du 15 mars — Édition`. Le dernier élément n'est pas cliquable.

#### Responsive — comportement tablette et petit écran

| Breakpoint | Comportement sidebar |
| --- | --- |
| ≥ 1024px | Sidebar visible en permanence (240px) |
| 768px – 1023px | Sidebar masquée, ouverte en overlay via hamburger dans le header. Overlay semi-transparent sur le contenu. |
| < 768px | Sidebar en drawer plein écran depuis la gauche. Bottom bar fixe avec 4 raccourcis : Accueil, Nouvelle crise, Dashboard, Menu. |

---

### 3.21 Transitions, animations & micro-interactions

L'UI v1.0 est fonctionnelle mais statique. L'ajout d'animations subtiles améliore la perception de fluidité et le feedback utilisateur sans impacter les performances. Toutes les animations respectent `prefers-reduced-motion` et sont désactivées en mode Crise.

#### Transitions de page

Navigation entre pages via une transition `fade + slide` légère (150ms `ease-out`). Le contenu sortant fade-out vers la gauche, le contenu entrant fade-in depuis la droite. Implémentation via `React Router` + `Framer Motion` (ou `@react-spring/web` déjà présent).

#### Micro-interactions

| Interaction | Animation |
| --- | --- |
| Hover sur carte/bouton | `scale(1.01)` + ombre portée légère, 120ms ease |
| Clic sur bouton primaire | `scale(0.97)` → `scale(1)`, 100ms |
| Ouverture d'un panneau expansible | Hauteur animée `max-height`, 200ms ease-out |
| Ajout d'un chip (sélection) | `scale(0) → scale(1)` avec léger rebond, 200ms |
| Toast de confirmation | Slide-in depuis le bas-droit, auto-dismiss avec barre de progression |
| Suppression d'une entrée | Fade-out + collapse de la ligne, 200ms |
| Changement d'onglet (dashboard) | Cross-fade du contenu, 150ms |

#### États de chargement

| Contexte | Composant |
| --- | --- |
| Chargement initial de page | Skeleton screens reprenant la structure du contenu attendu (cartes, listes, graphiques) |
| Chargement de graphique Nivo | Skeleton rectangulaire pulsant avec les dimensions exactes du graphique |
| Sauvegarde en cours | Spinner discret dans le bouton + texte « Enregistrement… » |
| Opération longue (export PDF) | Barre de progression horizontale sous le header |

---

### 3.22 Feedback utilisateur & états visuels

#### Feedback de sauvegarde

| Événement | Feedback |
| --- | --- |
| Sauvegarde automatique (brouillon) | Texte discret sous le titre : « Brouillon sauvegardé il y a 30s » — apparaît/disparaît en fade |
| Enregistrement validé | Toast success (vert) + icône ✓ animée. Redirect après 1.5s. |
| Erreur de sauvegarde | Toast error (rouge) persistant + bouton « Réessayer ». Pas de redirect. |

#### Empty states enrichis

Chaque module sans données affiche un empty state composé de :

1. Une illustration SVG mono-couleur brand (légère, non infantilisante)
2. Un titre explicatif (ex : « Pas encore de crise enregistrée »)
3. Un sous-texte bienveillant (ex : « Quand vous en aurez une, vous pourrez l'enregistrer en moins de 20 secondes. »)
4. Un CTA primaire (ex : « Enregistrer une crise ») — uniquement si l'action est pertinente

#### Indicateurs visuels sur les formulaires

| État du champ | Indicateur |
| --- | --- |
| Requis non rempli | Label rouge + icône ⚠ + bordure `--color-danger` |
| Valide | Icône ✓ verte à droite du champ (discrète) |
| Auto-save actif | Indicateur pulsant vert « ● Sauvegarde auto » en haut du formulaire |
| Modifications non sauvegardées | Point orange à côté du titre + confirmation modale si tentative de quitter |

---

### 3.23 Améliorations du Dashboard

Le dashboard v1.0 présente 4 onglets de graphiques mais souffre de plusieurs limites UX : les onglets placeholder (« coming soon »), l'absence de persistance de l'onglet actif, et un manque de contextualisation des données.

#### KPI cards améliorées

Les indicateurs clés (crises/mois, intensité moyenne, jours sans crise, traitement le plus efficace) sont présentés dans des cartes au-dessus des graphiques avec :

- Une valeur principale en `--text-3xl` bold
- Une tendance (flèche ↑↓ + pourcentage) comparée à la période précédente, colorée vert/rouge
- Un sparkline miniature (30 derniers jours) sous la valeur
- Un tooltip au survol détaillant le calcul

#### Interactions graphiques

| Amélioration | Description |
| --- | --- |
| Drill-down | Clic sur un jour du heatmap → détail de la journée (crises, douleur, facteurs) dans un panneau latéral |
| Zoom temporel | Sélection d'une plage directement sur le graphique (brush) en plus du sélecteur de dates |
| Export graphique | Bouton d'export PNG/SVG par graphique (via html2canvas déjà disponible) |
| Tooltips enrichis | Affichage multi-données au survol d'un point (douleur + traitements + météo du jour) |

#### Persistance & état

- L'onglet actif est persisté en `sessionStorage` (conservé au rechargement, pas entre sessions)
- Les filtres de date sont persistés dans l'URL (query params) pour permettre le partage/bookmark
- Les graphiques utilisent un cache mémoire pour éviter le recalcul à chaque changement d'onglet

---

### 3.24 Accessibilité avancée & raccourcis clavier

#### Raccourcis clavier globaux

| Raccourci | Action |
| --- | --- |
| `Ctrl/Cmd + N` | Nouvelle crise (mode Crise) |
| `Ctrl/Cmd + D` | Aller au Dashboard |
| `Ctrl/Cmd + P` | Sélecteur de profil |
| `Ctrl/Cmd + K` | Barre de recherche / commande rapide (Command Palette) |
| `Ctrl/Cmd + ,` | Préférences |
| `Escape` | Fermer le panneau/modale actif |
| `?` | Afficher la liste des raccourcis |

#### Command Palette

Inspirée de VS Code / Spotlight, accessible via `Ctrl/Cmd + K` :

- Champ de recherche avec autocomplétion
- Recherche dans : pages de l'app, crises récentes, traitements, actions rapides
- Navigation directe vers n'importe quel écran ou entrée
- Historique des 5 dernières commandes

#### Focus management

- Le focus est automatiquement placé sur le premier champ interactif à l'ouverture de chaque page
- Les modales piègent le focus (focus trap) et le restituent à l'élément déclencheur à la fermeture
- Skip-to-content link visible au premier `Tab` sur chaque page

---

## 7. Parcours utilisateur

### Scénario 1 : premier lancement — onboarding

Ce parcours couvre la toute première ouverture de l'application, de la connexion du compte jusqu'à la première saisie prête.

**Avec connexion internet :**

1. L'utilisateur ouvre l'URL Migraine AI dans Chrome ou lance l'app installée
2. Écran de login : boutons sociaux (Google, Apple, Facebook) + formulaire email (magic link ou mot de passe) — l'utilisateur choisit sa méthode préférée (voir 3.17)
3. Écran de consentement : acceptation des CGU (obligatoire) + case optionnelle communications marketing (décochée par défaut)
4. **Sélection du vault** : l'app explique en une phrase ce qu'est un vault Obsidian et pourquoi les données restent locales → bouton « Choisir un dossier » → sélecteur de dossier Chrome → l'app crée la structure `Migraine AI/` si le dossier est vide, ou reconnaît un vault existant
5. **Configuration de la localisation par défaut** : champ d'adresse avec autocomplétion Photon (pour la météo automatique) — ou option « Utiliser ma position » (permission navigateur) — ou « Passer pour l'instant »
6. **Profil médical rapide** (optionnel, 3 champs seulement) : type de migraine, traitement de crise habituel, traitement de fond éventuel — message : _« Complétez votre profil médical quand vous voulez dans les préférences »_
7. Écran d'accueil affiché avec un message de bienvenue et un bouton mis en avant : **« Enregistrer ma première crise »**

**Sans connexion internet (premier lancement hors ligne) :**

1. L'app détecte l'absence de connexion — message non-bloquant : _« Vous pouvez utiliser Migraine AI maintenant. Votre compte sera créé à la prochaine connexion internet. »_
2. UUID anonyme généré silencieusement (stocké en IndexedDB)
3. Sélection du vault et configuration de la localisation (identiques aux étapes 4-5 ci-dessus)
4. Accès immédiat à toutes les fonctionnalités gratuites
5. À la prochaine session connectée : bannière discrète _« Créez votre compte pour sauvegarder vos préférences et accéder aux fonctionnalités Pro »_ → reprise du flow de login à partir de l'étape 2

---

### Scénario 2 : déclaration d'une crise et génération d'un rapport

1. L'utilisateur ouvre l'app en début de crise (ou reçoit une notification de rappel)
2. Il sélectionne « Nouvelle crise » depuis l'écran d'accueil
3. En mode Crise : saisit l'heure, l'intensité et le traitement pris en < 30 secondes — fond sombre automatique
4. L'app écrit immédiatement `crises/YYYY-MM-DD_crise.md` via la File System Access API
5. 2 heures plus tard, notification de rappel : _« Votre crise de ce matin est enregistrée. Prenez 2 minutes pour compléter les détails ? »_
6. L'utilisateur ouvre le mode Complet depuis la notification → complète les champs manquants (symptômes, localisation, déclencheurs, notes)
7. Le dashboard se met à jour en relisant les fichiers Markdown du vault
8. Si le seuil de fréquence configuré est atteint, une alerte factuelle s'affiche : _« Vous avez atteint 4 jours de migraine ce mois-ci. Cette information peut être utile lors de votre prochaine consultation. »_
9. L'utilisateur génère un rapport PDF depuis le dashboard et le télécharge depuis le navigateur

---

### Scénario 3 : aidant gérant le profil d'un proche

Ce parcours couvre le cas d'un parent ou proche qui suit la migraine d'une autre personne (enfant, personne âgée) depuis son propre ordinateur.

1. L'aidant est connecté avec son propre compte sur Migraine AI — son propre vault est chargé (profil « Moi »)
2. Il ouvre le sélecteur de profil (`Cmd/Ctrl + P`) → bouton **« + Ajouter un profil »**
3. Il saisit un nom (ex : « Léa — ma fille ») et choisit une couleur d'identification
4. Il sélectionne un dossier vault distinct via le sélecteur Chrome — idéalement un dossier séparé du sien (`Migraine AI-Lea/`)
5. L'app crée la structure du vault vierge et configure la localisation par défaut pour ce profil
6. L'aidant bascule sur le profil « Léa » (`Cmd/Ctrl + P` → sélection) — rechargement complet du vault associé, badge coloré visible dans le header pour éviter toute confusion
7. Il enregistre une crise au nom du proche exactement comme pour son propre profil — toutes les données sont écrites dans `Migraine AI-Lea/crises/`
8. Pour préparer une consultation neurologique : il bascule sur le profil « Léa », ouvre le dashboard, génère un rapport PDF de la période et le télécharge

**Points de vigilance UX spécifiques à ce parcours :**

- Le profil actif est toujours visible en évidence dans le header (nom + couleur) pour éviter de saisir des données dans le mauvais vault
- La confirmation de basculement de profil rappelle explicitement : _« Vous allez passer sur le profil Léa. Toutes les saisies suivantes seront enregistrées dans son vault. »_
- Les deux vaults sont entièrement isolés — aucune donnée ne se croise

---

## 8. Roadmap

| Version | Calendrier | Fonctionnalités                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0    | T3 2026    | Application desktop PWA Chrome/Edge. Données de santé en fichiers Markdown locaux (vault Obsidian, File System Access API). Authentification via Supabase Auth : providers sociaux (Google, Apple, Facebook) + email magic link + email/mot de passe. Métadonnées d'usage (non médicales) stockées dans Supabase PostgreSQL. Interface admin en ligne (Vercel) avec configuration des plans par feature flags. Module IA (analyses, recommandations, résumé narratif, prédiction) via API Claude — réservé au plan Pro. **Saisie mobile** : mode Crise allégé via buffer de transit chiffré (AES-256-GCM) dans Supabase, synchronisé au vault à l'ouverture desktop. Stripe intégré mais abonnements non activés. |
| v2.0    | T1 2027    | Activation des abonnements payants Stripe (plan Pro : module IA + fonctionnalités premium à définir). Synchronisation cloud optionnelle du vault sur serveur certifié HDS — le vault Markdown reste la source de vérité. Partage sécurisé de rapports avec le médecin, intégration DMP. Extension mobile : mode Complet (complétion a posteriori), consultation du dashboard en lecture seule, notifications push.                                                                                                                                                                                                                                                                                                |
| v2.5    | T2 2027    | Intégration wearables (données de sommeil, fréquence cardiaque) alimentant automatiquement le vault. IA prédictive renforcée sur l'historique personnel. Accès délégué pour les aidants.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| v3.0    | T4 2027    | Téléconsultation intégrée, API partenaires santé, communauté patients anonymisée.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

### Périmètre v1.0 — scope complet

| Module                                                                                                     | Section | Inclus |
| ---------------------------------------------------------------------------------------------------------- | ------- | ------ |
| Journal des crises — mode Crise (ultra-rapide) + mode Complet (a posteriori)                               | 3.1     | ✓      |
| Aide à la saisie par champ + options personnelles extensibles                                              | 3.1     | ✓      |
| Historique, modification, suppression, corbeille                                                           | 3.1     | ✓      |
| Suivi alimentaire & autocomplétion                                                                         | 3.2     | ✓      |
| Tableau de bord & graphiques (4 onglets Nivo)                                                              | 3.3     | ✓      |
| Entrées incomplètes + forcer la complétion                                                                 | 3.3     | ✓      |
| Rapport médical PDF (génération côté client)                                                               | 3.4     | ✓      |
| Alertes & notifications (Web Notifications API)                                                            | 3.5     | ✓      |
| Historique des traitements + évaluation efficacité                                                         | 3.6     | ✓      |
| Détection de patterns & indicateur de risque                                                               | 3.7     | ✓      |
| Profil médical                                                                                             | 3.8     | ✓      |
| Tracking du cycle menstruel                                                                                | 3.9     | ✓      |
| Suivi des rendez-vous médicaux                                                                             | 3.10    | ✓      |
| Suivi des transports                                                                                       | 3.11    | ✓      |
| Suivi des activités sportives                                                                              | 3.12    | ✓      |
| Saisie vocale assistée (Web Speech API)                                                                    | 3.13    | ✓      |
| Traqueur de charge mentale & changements de vie                                                            | 3.14    | ✓      |
| Tracking quotidien de la douleur                                                                           | 3.15    | ✓      |
| Multi-profil (vaults distincts, File System Access API)                                                    | 3.16    | ✓      |
| Authentification Supabase Auth (Google, Apple, Facebook, magic link, email/mot de passe) + interface admin | 3.17    | ✓      |
| Analyses IA + recommandations + résumé narratif + prédiction (Pro, API Claude)                             | 3.18    | ✓      |
| Saisie mobile — mode Crise allégé + transit chiffré + sync desktop                                         | 3.19    | ✓      |
| Météo automatique Open-Meteo                                                                               | 4.1     | ✓      |
| Phase lunaire (suncalc — calcul local)                                                                     | 4.1     | ✓      |
| Thème clair / sombre / automatique                                                                         | 6.3     | ✓      |
| Navigation & shell applicatif (sidebar, breadcrumbs, responsive)                                           | 3.20    | ✓      |
| Transitions, animations & micro-interactions                                                               | 3.21    | ✓      |
| Feedback utilisateur & états visuels (skeleton, empty states, toasts)                                      | 3.22    | ✓      |
| Améliorations du Dashboard (KPI, drill-down, persistance)                                                  | 3.23    | ✓      |
| Accessibilité avancée & raccourcis clavier (Command Palette)                                               | 3.24    | ✓      |

---

> **Note réglementaire — Dispositif médical :** si Migraine AI est destiné à influencer des décisions thérapeutiques (ex : aide à la prescription d'anti-CGRP), il peut être qualifié de Dispositif Médical de classe I ou IIa selon le règlement européen MDR 2017/745. Une consultation juridique et réglementaire est recommandée avant le lancement commercial.
