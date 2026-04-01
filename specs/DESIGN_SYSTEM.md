# Migraine AI — Design System

**Version :** 1.0
**Date :** Avril 2026
**Statut :** Draft
**Référence :** PRD v1.0

> Ce document définit les fondations visuelles et les composants de l'interface de Migraine AI. Il est la source de vérité pour tout développeur ou designer travaillant sur l'application. Toute décision de design non couverte ici doit s'aligner sur les principes énoncés en section 1.

---

## Sommaire

1. [Principes fondateurs](#1-principes-fondateurs)
2. [Thèmes — clair, sombre, mode Crise](#2-thèmes)
3. [Couleurs](#3-couleurs)
4. [Typographie](#4-typographie)
5. [Espacement & grille](#5-espacement--grille)
6. [Composants de saisie](#6-composants-de-saisie)
7. [Composants d'affichage](#7-composants-daffichage)
8. [Icônes & illustrations](#8-icônes--illustrations)
9. [Graphiques — configuration Nivo](#9-graphiques--configuration-nivo)
10. [Mode Crise — spécifications complètes](#10-mode-crise--spécifications-complètes)
11. [Mode Mobile — spécifications](#11-mode-mobile--spécifications)
12. [Accessibilité](#12-accessibilité)
13. [Microcopy](#13-microcopy)

---

## 1. Principes fondateurs

> **Principe cardinal :** L'utilisateur ne doit jamais avoir à chercher ce qu'il faut faire. Chaque écran a une action principale évidente. La complexité est cachée derrière des valeurs par défaut intelligentes.

| Principe | Application concrète |
|---|---|
| **Utilisable en crise** | Mode Crise accessible en moins de 2 taps depuis n'importe quel écran. Fond sombre automatique. Zones tactiles ≥ 64×64px. Aucun scroll. |
| **Progressive disclosure** | Champs essentiels d'abord, options avancées accessibles via « + Ajouter des détails ». Jamais plus d'un écran de profondeur depuis l'action principale. |
| **Optimistic UI** | L'interface se met à jour immédiatement, sans attendre la confirmation de l'écriture disque. |
| **Valeurs par défaut intelligentes** | Heure = maintenant, lieu = dernier lieu utilisé, traitement = dernier pris. Le formulaire est toujours pré-rempli. |
| **Pas de culpabilisation** | Les messages d'erreur et de rappel ne jugent pas l'utilisateur. Ton neutre, bienveillant, actionnable. |
| **Clarté > densité** | Un seul objectif par écran. Pas de sidebar encombrée, pas de tableau de bord surchargé. |

---

## 2. Thèmes

L'application supporte trois thèmes. Le choix se fait dans Préférences → Apparence.

| Thème | Déclenchement | Usage principal |
|---|---|---|
| **Clair** | Manuel | Consultation de l'historique et des graphiques en journée |
| **Sombre** | Manuel ou `prefers-color-scheme: dark` (OS) | Usage général en soirée ou environnement peu éclairé |
| **Automatique** | Suit le réglage de l'OS | Valeur par défaut recommandée |
| **Mode Crise** | Automatique à l'ouverture du mode Crise | Toujours sombre — surcharge temporaire du thème actif |

Le thème est géré via des variables CSS custom (`--color-*`) et une classe sur `<html>` (`data-theme="light"` / `"dark"` / `"crisis"`). Nivo lit ces variables via le `nivoTheme` global (section 9).

---

## 3. Couleurs

### 3.1 Palette principale

```css
/* Primitives — ne pas utiliser directement dans les composants */
--primitive-indigo-50:  #EEF2FF;
--primitive-indigo-100: #E0E7FF;
--primitive-indigo-400: #818CF8;
--primitive-indigo-500: #6366F1;
--primitive-indigo-600: #4F46E5;
--primitive-indigo-700: #4338CA;

--primitive-pink-400:   #F472B6;
--primitive-pink-500:   #EC4899;

--primitive-slate-50:   #F8FAFC;
--primitive-slate-100:  #F1F5F9;
--primitive-slate-200:  #E2E8F0;
--primitive-slate-400:  #94A3B8;
--primitive-slate-500:  #64748B;
--primitive-slate-600:  #475569;
--primitive-slate-700:  #334155;
--primitive-slate-800:  #1E293B;
--primitive-slate-900:  #0F172A;
--primitive-slate-950:  #020617;
```

### 3.2 Tokens sémantiques — Thème clair

```css
[data-theme="light"] {
  /* Surfaces */
  --color-bg-base:         #F8FAFC;   /* fond principal */
  --color-bg-elevated:     #FFFFFF;   /* cartes, modales */
  --color-bg-subtle:       #F1F5F9;   /* zones de contenu secondaire */
  --color-bg-interactive:  #E0E7FF;   /* hover sur éléments interactifs */

  /* Bordures */
  --color-border:          #E2E8F0;
  --color-border-strong:   #94A3B8;

  /* Texte */
  --color-text-primary:    #0F172A;
  --color-text-secondary:  #475569;
  --color-text-muted:      #94A3B8;
  --color-text-inverse:    #FFFFFF;

  /* Brand */
  --color-brand:           #6366F1;
  --color-brand-hover:     #4F46E5;
  --color-brand-light:     #E0E7FF;

  /* Statuts */
  --color-success:         #10B981;
  --color-success-light:   #D1FAE5;
  --color-warning:         #F59E0B;
  --color-warning-light:   #FEF3C7;
  --color-danger:          #EF4444;
  --color-danger-light:    #FEE2E2;

  /* Intensité douleur — heatmap */
  --color-pain-0:          #F1F5F9;   /* aucune */
  --color-pain-1:          #DBEAFE;
  --color-pain-3:          #93C5FD;
  --color-pain-5:          #FBBF24;
  --color-pain-7:          #F97316;
  --color-pain-9:          #EF4444;
  --color-pain-10:         #7F1D1D;

  /* Crise marqueur sur heatmap */
  --color-crisis-marker:   #6366F1;
}
```

### 3.3 Tokens sémantiques — Thème sombre

```css
[data-theme="dark"] {
  --color-bg-base:         #0F172A;
  --color-bg-elevated:     #1E293B;
  --color-bg-subtle:       #334155;
  --color-bg-interactive:  #4338CA;

  --color-border:          #334155;
  --color-border-strong:   #475569;

  --color-text-primary:    #F1F5F9;
  --color-text-secondary:  #94A3B8;
  --color-text-muted:      #475569;
  --color-text-inverse:    #0F172A;

  --color-brand:           #818CF8;
  --color-brand-hover:     #6366F1;
  --color-brand-light:     #1E1B4B;

  --color-success:         #34D399;
  --color-success-light:   #064E3B;
  --color-warning:         #FBBF24;
  --color-warning-light:   #451A03;
  --color-danger:          #F87171;
  --color-danger-light:    #450A0A;

  --color-pain-0:          #1E293B;
  --color-pain-1:          #1E3A5F;
  --color-pain-3:          #1D4ED8;
  --color-pain-5:          #92400E;
  --color-pain-7:          #9A3412;
  --color-pain-9:          #7F1D1D;
  --color-pain-10:         #450A0A;

  --color-crisis-marker:   #A5B4FC;
}
```

### 3.4 Mode Crise — surcharge

```css
[data-theme="crisis"] {
  --color-bg-base:         #0F172A;   /* slate-900 — fond maximal */
  --color-bg-elevated:     #1E293B;
  --color-text-primary:    #FFFFFF;
  --color-text-secondary:  #CBD5E1;
  --color-brand:           #818CF8;
  /* Toutes les animations désactivées */
  --transition-speed:      0ms;
}
```

### 3.5 Couleurs de profil

Les profils multi-utilisateurs disposent d'une palette de 8 couleurs d'identification :

```
#6366F1  Indigo   (défaut)
#EC4899  Rose
#10B981  Emeraude
#F59E0B  Ambre
#3B82F6  Bleu
#8B5CF6  Violet
#EF4444  Rouge
#14B8A6  Teal
```

---

## 4. Typographie

### 4.1 Police

**Inter** (Google Fonts / auto-hébergée) — uniquement les variantes utilisées : 400, 500, 600, 700.

```css
--font-family: 'Inter', system-ui, -apple-system, sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', monospace; /* pour les codes YAML */
```

### 4.2 Échelle typographique

| Token | Taille | Line-height | Poids | Usage |
|---|---|---|---|---|
| `--text-xs` | 12px | 16px | 400 | Labels, badges, metadata |
| `--text-sm` | 14px | 20px | 400 | Corps secondaire, descriptions |
| `--text-base` | 16px | 24px | 400 | Corps principal |
| `--text-lg` | 18px | 28px | 500 | Sous-titres de sections |
| `--text-xl` | 20px | 28px | 600 | Titres de cartes |
| `--text-2xl` | 24px | 32px | 600 | Titres de pages |
| `--text-3xl` | 30px | 36px | 700 | Indicateurs clés du dashboard |
| `--text-crisis` | 28px | 36px | 700 | Mode Crise — labels principaux |
| `--text-crisis-value` | 48px | 56px | 800 | Mode Crise — valeur de l'intensité |

### 4.3 Mode Crise — taille augmentée

En mode Crise, toutes les tailles de police sont multipliées par 1.2 via une classe `.crisis-mode` sur le wrapper de page. Les tailles `--text-crisis` et `--text-crisis-value` sont déjà définies pour ce contexte.

---

## 5. Espacement & grille

### 5.1 Échelle d'espacement

Base : 4px. Tous les espacements sont des multiples de 4.

```
4px   → --space-1
8px   → --space-2
12px  → --space-3
16px  → --space-4
20px  → --space-5
24px  → --space-6
32px  → --space-8
40px  → --space-10
48px  → --space-12
64px  → --space-16
```

### 5.2 Grille — desktop

- Layout principal : sidebar fixe 240px + contenu fluide
- Padding de page : `--space-8` (32px) horizontalement
- Gutter entre colonnes : `--space-6` (24px)
- Largeur max du contenu : 1200px centré

### 5.3 Grille — mode mobile (`m.migraine-ai.app`)

- Layout mono-colonne, plein écran
- Padding horizontal : `--space-4` (16px)
- Pas de sidebar, pas de navigation

### 5.4 Border radius

```
--radius-sm:   4px    /* inputs, badges */
--radius-md:   8px    /* cartes, boutons */
--radius-lg:   12px   /* modales, panels */
--radius-xl:   16px   /* mode Crise — chips larges */
--radius-full: 9999px /* chips de sélection ronde, avatars */
```

---

## 6. Composants de saisie

### 6.1 Curseur d'échelle (Scale Slider)

Utilisé pour : intensité douleur (1-10), stress (1-5), sommeil (1-5), charge mentale (1-10), effort sportif (1-5), douleur quotidienne (0-10), impact activité (0-4).

**Spécifications :**

| Propriété | Valeur normale | Valeur Mode Crise |
|---|---|---|
| Hauteur de la piste | 8px | 12px |
| Diamètre du thumb | 28px | 44px |
| Largeur totale | 100% du conteneur | 100% de l'écran |
| Zone tactile min | 44×44px | 64×64px |
| Couleur piste vide | `--color-border` | `--color-border` |
| Couleur piste remplie | Gradient douleur (vert → orange → rouge) | Idem |

**Comportement :**
- Les pastilles numérotées s'affichent sous la piste à intervalle régulier (toutes les valeurs entières)
- Le tooltip de définition fonctionnelle (ex : « 7 — Sévère ») apparaît au-dessus du thumb en temps réel
- L'ancre personnelle de l'utilisateur (ex : « Pour vous, 7 = ne peut pas travailler ») s'affiche en sous-texte sous la piste dès qu'une valeur est sélectionnée
- Couleur du thumb : suit le gradient douleur selon la valeur

### 6.2 Chips de sélection (Selection Chips)

Utilisés pour les champs de multi-sélection extensibles (symptômes, déclencheurs, traitements, etc.).

**Spécifications :**

```
Padding       : 8px 16px
Border-radius : --radius-full
Font-size     : --text-sm
Font-weight   : 500
Border        : 1.5px solid --color-border
Hauteur min   : 36px
Zone tactile  : ≥ 44px (padding vertical auto-agrandi)
```

**États :**

| État | Background | Border | Texte |
|---|---|---|---|
| Default | `--color-bg-elevated` | `--color-border` | `--color-text-primary` |
| Hover | `--color-bg-interactive` | `--color-brand` | `--color-brand` |
| Selected | `--color-brand` | `--color-brand` | `--color-text-inverse` |
| Custom (✏️) | `--color-bg-subtle` | `--color-border-strong` | `--color-text-secondary` |
| Disabled | `--color-bg-subtle` | `--color-border` | `--color-text-muted` |

**Mode Crise :** chips en `--radius-xl`, hauteur min 56px, font-size `--text-lg`.

### 6.3 Boutons radio visuels

Utilisés à la place des dropdowns pour les sélections uniques (type consultation, voie d'administration, etc.). Toutes les options sont visibles sans ouvrir de menu.

```
Border-radius : --radius-md
Padding       : 12px 16px
Border        : 1.5px solid --color-border
Min-width     : 80px
```

Les états sont identiques aux chips.

### 6.4 Champ texte

```
Height        : 40px (--space-10)
Padding       : 0 --space-3
Border        : 1.5px solid --color-border
Border-radius : --radius-md
Font-size     : --text-base
```

**Auto-extensible** (textarea) : part de 1 ligne, grandit avec le contenu, max 6 lignes avant scroll interne.

**États :**

| État | Border |
|---|---|
| Default | `--color-border` |
| Focus | `--color-brand` (2px) |
| Error | `--color-danger` (2px) |
| Disabled | `--color-border` (opacité 50%) |

### 6.5 Boutons d'action

| Variante | Usage | Background | Texte |
|---|---|---|---|
| Primary | Action principale de la page | `--color-brand` | `--color-text-inverse` |
| Secondary | Action secondaire | `--color-bg-subtle` | `--color-text-primary` |
| Danger | Suppression, actions irréversibles | `--color-danger` | `--color-text-inverse` |
| Ghost | Actions de navigation tertiaires | transparent | `--color-brand` |

**Tailles :**

| Taille | Hauteur | Padding H | Font |
|---|---|---|---|
| sm | 32px | 12px | `--text-sm` |
| md (défaut) | 40px | 16px | `--text-base` |
| lg | 48px | 24px | `--text-lg` |
| crisis | 64px | 32px | `--text-crisis` |

**Bouton « Enregistrer » — Mode Crise :** variante `crisis`, pleine largeur, position fixe en bas de l'écran avec `padding-bottom: env(safe-area-inset-bottom)` pour iPhone.

### 6.6 Champ d'autocomplétion (adresse Photon)

- Dès 3 caractères : suggestions sous le champ (max 5 résultats)
- Chaque suggestion sur 2 lignes : adresse courte en gras + adresse complète en muted
- Sélection au clic ou au clavier (flèches + Entrée)
- Si hors connexion : champ reste en saisie libre avec icône 🔌 et message inline « Suggestions indisponibles hors ligne »

### 6.7 Champ « + Ajouter… » (valeur personnalisée)

Dernier élément dans toute liste extensible. À l'activation :
- Un champ texte inline s'ouvre sous la liste (pas de modale)
- Bouton « Ajouter » et bouton « ✕ » à droite
- La valeur est sauvegardée dans la saisie ET dans `config/listes-personnalisees.md`
- Un badge ✏️ est ajouté à la chip créée pour la distinguer des valeurs prédéfinies

---

## 7. Composants d'affichage

### 7.1 Cartes (Cards)

```
Background    : --color-bg-elevated
Border        : 1px solid --color-border
Border-radius : --radius-lg
Padding       : --space-6
Box-shadow    : 0 1px 3px rgba(0,0,0,0.08) [thème clair]
              : aucune [thème sombre]
```

**Variante entrée incomplète :** bordure gauche 3px `--color-warning`, fond légèrement teinté `--color-warning-light`.

**Variante saisie mobile importée :** badge « Saisie mobile 📱 » en haut à droite de la carte, même style que l'entrée incomplète + couleur `--color-brand`.

### 7.2 Toast / Notification inline

```
Border-radius : --radius-md
Padding       : --space-3 --space-4
Position      : fixed, bottom --space-6, right --space-6
Max-width     : 360px
Durée         : 2s (mode Crise) / 4s (normal)
Animation     : slide-in-up 200ms ease-out, fade-out 200ms
```

**Variantes :** success (vert), warning (ambre), info (brand), error (rouge). En mode Crise, animations désactivées — le toast s'affiche instantanément.

### 7.3 Zone d'attention — entrées incomplètes

Section collante en haut du dashboard. Se cache automatiquement quand il n'y a plus d'entrées incomplètes. Badge numérique sur l'icône de navigation.

Chaque entrée affiche : type d'entrée, date, résumé minimal, et les actions Compléter / Ignorer / Forcer.

### 7.4 Indicateur de risque du jour

Widget sur l'écran d'accueil. Trois niveaux visuels :

| Niveau | Couleur | Icône | Libellé |
|---|---|---|---|
| Faible | `--color-success` | ✓ | « Conditions favorables » |
| Modéré | `--color-warning` | ⚠ | « Conditions à surveiller » |
| Élevé | `--color-danger` | ⚡ | « Risque de crise élevé » |

Détail accessible au clic — liste des facteurs actifs. Pour les utilisateurs Pro avec analyse IA : bouton « Affiner avec l'IA » en dessous.

### 7.5 Badge de plan

Badge inline affiché à côté des fonctionnalités réservées au Pro.

```
Texte         : « Pro »
Background    : gradient indigo-violet (--color-brand → #8B5CF6)
Couleur texte : blanc
Padding       : 2px 8px
Border-radius : --radius-full
Font-size     : --text-xs
Font-weight   : 700
```

Quand un module est désactivé par un feature flag : le label du menu reste visible mais grisé avec le badge Pro et un message au survol : « Disponible avec le plan Pro ».

### 7.6 Sélecteur de profil

Accessible via `Cmd/Ctrl + P` ou l'avatar en haut à droite. Affiche tous les profils avec leur couleur, nom et plan actif. Le profil actif est visible en permanence dans le header (point coloré + nom abrégé).

---

## 8. Icônes & illustrations

- **Bibliothèque icônes :** [Lucide React](https://lucide.dev) — cohérent, léger, React-natif
- **Taille standard :** 20×20px (stroke 1.5px)
- **Taille mode Crise :** 28×28px (stroke 2px)
- **Taille navigation :** 24×24px

**Illustrations :**
- Schéma de tête (localisation douleur) : SVG inline simple, stylisé avec les couleurs du design system
- Types d'aura visuels : illustrations SVG minimalistes (4 types)
- Écrans vides (empty states) : illustrations légères mono-couleur brand, accompagnées d'un CTA

---

## 9. Graphiques — configuration Nivo

Tous les graphiques utilisent un thème global unique qui lit les variables CSS du thème actif.

```javascript
// nivoTheme.ts — importé dans chaque composant Nivo
export const nivoTheme = {
  background:  'transparent',
  textColor:   'var(--color-text-secondary)',
  fontSize:    12,
  fontFamily:  'Inter, system-ui, sans-serif',
  axis: {
    domain: { line: { stroke: 'var(--color-border)', strokeWidth: 1 } },
    ticks:  { line: { stroke: 'var(--color-border)', strokeWidth: 1 },
               text: { fill: 'var(--color-text-muted)', fontSize: 11 } },
    legend: { text: { fill: 'var(--color-text-secondary)', fontSize: 12 } },
  },
  grid: {
    line: { stroke: 'var(--color-border)', strokeDasharray: '4 4' },
  },
  tooltip: {
    container: {
      background:   'var(--color-bg-elevated)',
      border:       '1px solid var(--color-border)',
      borderRadius: 8,
      color:        'var(--color-text-primary)',
      fontSize:     13,
      boxShadow:    '0 4px 12px rgba(0,0,0,0.15)',
    },
  },
  legends: {
    text: { fill: 'var(--color-text-secondary)', fontSize: 12 },
  },
}
```

### 9.1 Heatmap calendrier douleur & crises (`@nivo/calendar`)

Ce graphique combine deux sources de données : le suivi quotidien de la douleur (3.15) et les crises (3.1).

**Rendu par cellule (jour) :**
- **Couleur de fond** : gradient selon `niveau_douleur` (0-10) — tokens `--color-pain-*`
- **Marqueur de crise** : contour/bordure de 2px `--color-crisis-marker` (indigo) superposé si une crise existe ce jour. En mode hover, tooltip détaille : niveau de douleur + intensité de crise + traitement pris
- **Jour sans saisie** : `--color-pain-0` (gris neutre)
- **Cellule size** : 14×14px desktop, 10×10px si > 6 mois

```typescript
// Exemple de structure de données pour le composant
type CalendarDay = {
  day:          string    // 'YYYY-MM-DD'
  value:        number    // niveau_douleur 0-10 (source: daily-pain ou crise si absent)
  hasCrisis:    boolean   // true si fichier crises/ existe ce jour
  crisisIntensity?: number  // intensité de la crise si hasCrisis
}
```

**Légende :** deux légendes côte à côte — gradient douleur 0→10, et carré avec contour indigo = « Jour de crise ».

---

## 10. Mode Crise — spécifications complètes

Le mode Crise est l'écran le plus critique de l'application. Il est conçu pour une utilisation en pleine migraine, les yeux mi-clos, en moins de 20 secondes.

### 10.1 Comportements automatiques à l'ouverture

1. Application du thème `[data-theme="crisis"]` sur `<html>`
2. Tentative de réduction de la luminosité via Screen Brightness API (non bloquant si indisponible)
3. Désactivation de toutes les animations et transitions (`--transition-speed: 0ms`)
4. Focus automatique sur le curseur d'intensité

### 10.2 Layout

```
┌─────────────────────────────────────┐
│         [Logo discret]              │
│                                     │
│  Heure de début          [Maintenant]│
│  ──────────────────────────────────  │
│                                     │
│  Intensité  1 ━━━━━━●━━━━ 10        │
│             [7 — Sévère]            │
│                                     │
│  Traitement                         │
│  [Triptan ✓] [AINS] [Aucun] [+]    │
│                                     │
│                                     │
│  ┌──────────────────────────────┐   │
│  │         ENREGISTRER          │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

- **Pas de scroll** — tout tient sur un seul écran quelle que soit la hauteur
- **Bouton Enregistrer** : position fixe en bas, pleine largeur, hauteur 64px, font-weight 700
- **Pas d'en-tête de navigation**, pas de sidebar visible
- **Toast de confirmation** (2s) : `« Crise enregistrée — complétez les détails plus tard »`
- **Retour à l'accueil immédiat** après validation

### 10.3 Accessibilité spécifique

| Critère | Valeur |
|---|---|
| Zones tactiles minimales | 64×64px (vs 44px standard WCAG) |
| Contraste texte / fond | ≥ 7:1 (AAA) |
| Police | 120% de la taille standard (`--text-crisis`) |
| Animations | 0ms — aucune |
| Focus visible | Outline 3px `--color-brand`, offset 2px |

---

## 11. Mode Mobile — spécifications

URL : `https://m.migraine-ai.app` — build séparé, optimisé mobile.

### 11.1 Layout mobile

- Mono-colonne, plein écran, pas de sidebar
- Safe area insets respectés (iPhone notch / Dynamic Island)
- `viewport: width=device-width, initial-scale=1, maximum-scale=1` (désactive le zoom involontaire)
- Thème sombre permanent (mode Crise toujours actif sur mobile)

### 11.2 Zones tactiles

Taille minimum : 48×48px (standard mobile WCAG) — augmentée à 56px pour les actions principales.

### 11.3 Écrans disponibles

| Écran | Champs | Temps cible |
|---|---|---|
| Crise rapide | Heure, intensité (curseur), traitement (chips) | < 15 secondes |
| Douleur quotidienne | Niveau de douleur (curseur) | < 5 secondes |
| Charge mentale | Niveau (curseur) | < 5 secondes |

Chaque écran est une page unique sans navigation — bouton « Enregistrer » pleine largeur, fixe en bas.

---

## 12. Accessibilité

Conformité cible : **WCAG 2.1 niveau AA** sur tous les écrans, vérifiée via axe-core en CI.

| Critère | Implémentation |
|---|---|
| Contraste texte/fond | ≥ 4.5:1 (AA) en thème clair et sombre — ≥ 7:1 en mode Crise |
| Taille zones tactiles | ≥ 44×44px (64×64px en mode Crise) |
| Focus visible | Outline 2px brand, jamais supprimé sans alternative |
| Landmarks ARIA | `<main>`, `<nav>`, `<aside>` — pas de `div` soup |
| Labels formulaires | Tous les inputs ont un `<label>` associé explicitement |
| Icônes sans texte | `aria-label` obligatoire |
| Animations | Respecte `prefers-reduced-motion` — toutes les transitions désactivées si actif |
| Langage | `lang="fr"` sur `<html>` |
| Erreurs | Messages d'erreur associés aux champs via `aria-describedby` |
| Tooltips | Accessibles au clavier (focus) et au survol |

---

## 13. Microcopy

### 13.1 Principes

- **Deuxième personne** : « Vos crises », « Vous avez enregistré… »
- **Verbes d'action** : `Enregistrer`, `Compléter`, `Ignorer`, `Affiner`, `Générer` — jamais `OK` ou `Valider`
- **Pas de culpabilisation** : pas de « Vous avez oublié », pas de « Erreur » sans contexte
- **Phrases courtes** : max 12 mots pour les toasts et confirmations
- **Ton neutre et bienveillant** — jamais alarmiste sur les données médicales

### 13.2 Formulations types

| Contexte | Formulation |
|---|---|
| Toast post-crise | *« Crise enregistrée — complétez les détails plus tard »* |
| Rappel post-crise | *« Votre crise de ce matin est enregistrée. Prenez 2 minutes pour compléter les détails ? »* |
| Alerte fréquence | *« Vous avez atteint 4 jours de migraine ce mois-ci. Cette information peut être utile lors de votre prochaine consultation. »* |
| Saisie mobile confirmée | *« Crise enregistrée. Elle sera intégrée à votre vault à la prochaine ouverture sur votre ordinateur. »* |
| Accès hors connexion | *« Vous pouvez utiliser Migraine AI maintenant. Votre compte sera créé à la prochaine connexion internet. »* |
| Module Pro désactivé | *« Disponible avec le plan Pro »* |
| Entrée incomplète | *« Cette saisie est incomplète — complétez-la quand vous êtes prêt »* |
| Confirmation suppression | *« Ce fichier sera déplacé dans la corbeille et supprimé définitivement dans 30 jours »* |
| Erreur générique auth | *« Email ou mot de passe incorrect »* |
| Magic link expiré | *« Ce lien de connexion a expiré. Demandez-en un nouveau. »* |

### 13.3 Aides contextuelles (tooltips ⓘ)

Les tooltips d'aide ne doivent pas dépasser 2 phrases. Format : définition du champ + exemple ou conseil. Ils s'ouvrent au clic sur l'icône ⓘ (mobile) ou au survol (desktop), sans bloquer le formulaire.
