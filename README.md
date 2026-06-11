# The Agile Kitchen × AI — version 3D immersive

Transposition en **expérience 3D** de la présentation d'onboarding
`~/Downloads/Onboardings Agiles/overcooked-agile-ai.html` (**le document original est intact** —
ce projet en est la copie 3D). Les 22 slides sont conservés à l'identique : textes, tableaux,
minuteurs d'atelier, scores animés, raccourcis clavier — mais traversés par une caméra
cinématique dans un monde 3D construit avec react-three-fiber (base du projet `../showcase/`).

## Lancer

```bash
npm install
npm run dev       # http://localhost:5173
npm run build && npm run preview
```

## Conduite de la présentation (identique à l'original)

| Commande | Action |
|---|---|
| `→` / `Espace` | Slide suivant |
| `←` | Slide précédent |
| `T` | Démarrer / mettre en pause le minuteur du slide courant |
| `F` | Plein écran |
| Molette / tactile | Défilement libre dans le monde 3D |

Barre de progression en haut, compteur « X / 22 » en haut à droite, flèches en bas.

## Les 22 slides, fidèlement portés

- **Slides 1-2** — Ouverture « THE AGILE KITCHEN » : braises pyrotechniques, toque néon.
- **Slides 3-6** — Niveaux Overcooked : oignon 3D du niveau 1-1, **minuteurs fonctionnels**
  (4 min / 3 min, anneau SVG vert→orange→rouge), **scores animés** (0→1847, 1847→2341),
  étoiles ★ tournoyantes (3 puis 4).
- **Slides 7-13** — Agilité : cycle TRY→FAIL→LEARN→REPEAT en orbite, panneaux de la brigade
  (PO bleu / SM rose / Team vert), tickets de backlog dorés, tores entrelacés Overcooked↔Scrum,
  tableaux de mapping et de frameworks complets.
- **Slides 14-17** — L'IA entre dans la cuisine : bascule d'ambiance cyan, grille-circuit,
  pluie de données, cœur IA wireframe, satellites d'outils.
- **Slides 18-19** — **Le réseau de neurones du canvas original porté en 3D** : 5 couches
  (Vision produit → Refinement → Développement → Test & QA → Valeur livrée) + Scrum Master
  en régularisation, pulses forward/backprop, **tooltips au survol de chaque neurone**.
- **Slides 20-22** — Outils IA en orbite, Scrum Guide doré (13 pages), MERCI À TOUS avec
  feu d'artifice au clic.

## Architecture

- Contenu intégral dans `src/content/slides.fr.ts` (typé `Block[]` : paragraphes, listes,
  tableaux, mappings, colonnes avant/après, code, chips, citations, minuteurs, scores…),
  rendu par `src/components/dom/Overlay.tsx`.
- Caméra sur rail `CatmullRomCurve3` (22 stations), zones 3D dans
  `src/components/canvas/zones/`, post-processing Bloom/Vignette/Noise, éclairage
  procédural Lightformers, `AdaptiveDpr` + `PerformanceMonitor`.
- Identité visuelle de l'original : palette `#FF6B1A / #FFD700 / #00E5FF / #32FF7E` sur
  fond `#0A0205`, typos Bebas Neue · Space Grotesk · Orbitron (Google Fonts).
