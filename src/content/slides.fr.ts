/**
 * Contenu porté fidèlement depuis la présentation
 * « Onboardings Agiles/overcooked-agile-ai.html » (22 slides).
 * Le document original n'est pas modifié — ceci en est la version 3D.
 */

export type Accent = 'orange' | 'gold' | 'cyan' | 'green' | 'white'

export type Block =
  | { kind: 'paragraph'; text: string; strong?: boolean }
  | { kind: 'list'; items: string[]; columns?: 1 | 2 }
  | { kind: 'cards'; items: { icon: string; title: string; text: string; color?: string }[] }
  | { kind: 'mapping'; rows: [string, string][]; leftColor?: string; rightColor?: string }
  | { kind: 'table'; head: string[]; rows: string[][] }
  | { kind: 'columns'; left: { title: string; items: string[] }; right: { title: string; items: string[] } }
  | { kind: 'code'; lines: string[] }
  | { kind: 'chips'; items: string[]; label?: string }
  | { kind: 'timer'; seconds: number }
  | { kind: 'score'; from: number; to: number; stars: number }
  | { kind: 'note'; text: string }
  | { kind: 'quote'; text: string; author?: string }
  | { kind: 'links'; items: { label: string; href: string }[] }
  | { kind: 'cycle'; steps: string[] }
  | { kind: 'slogan'; text: string }

export interface Slide {
  id: string
  kicker?: string
  title: string
  subtitle?: string
  accent: Accent
  align: 'left' | 'right' | 'center'
  /** 'bottom' ancre la carte en bas de l'écran pour laisser la scène 3D respirer */
  anchor?: 'bottom'
  blocks: Block[]
  hint?: string
}

export const SLIDE_SPACING = 26

export const slides: Slide[] = [
  // ───────────────────────── ACTE I — OUVERTURE
  {
    id: 'hero',
    kicker: '🍳 SFEIR ONBOARDING',
    title: 'THE AGILE KITCHEN',
    subtitle: 'Parlons d’Agilité — sans prétention, en s’amusant 🍳',
    accent: 'orange',
    align: 'center',
    blocks: [{ kind: 'note', text: 'by SFEIR × Overcooked' }],
    hint: 'Faites défiler — ou flèches ←/→ comme des slides',
  },
  {
    id: 'what-is-overcooked',
    title: 'WHAT IS OVERCOOKED?',
    accent: 'orange',
    align: 'left',
    blocks: [
      {
        kind: 'cards',
        items: [
          { icon: '🎮', title: 'COOPÉRATIF', text: 'Un jeu frénétique de cuisine coopérative où chaque joueur a son rôle' },
          { icon: '⏱️', title: 'SOUS PRESSION', text: 'Des commandes à préparer sous pression, dans un temps imparti' },
          { icon: '🤝', title: 'CHAOS JOYEUX', text: 'Un chaos joyeux qui révèle l’essentiel : la communication et la coordination' },
        ],
      },
      { kind: 'paragraph', text: 'Objectif : préparer des plats en équipe, dans un restaurant chaotique', strong: true },
    ],
  },
  // ───────────────────────── ACTE II — LES NIVEAUX
  {
    id: 'level-1-1',
    kicker: 'LEVEL 1-1',
    title: 'SOUPE À L’OIGNON',
    subtitle: 'In Onion We Trust ! 🧅',
    accent: 'orange',
    align: 'center',
    blocks: [{ kind: 'timer', seconds: 240 }],
    hint: 'Appuyez sur T pour démarrer / mettre en pause',
  },
  {
    id: 'good-game',
    title: 'GOOD GAME !',
    accent: 'gold',
    align: 'center',
    blocks: [
      { kind: 'score', from: 0, to: 1847, stars: 3 },
      { kind: 'note', text: '💬 Comment faire encore mieux ?' },
      { kind: 'paragraph', text: 'Vous avez 3 minutes pour trouver ensemble vos axes d’amélioration' },
      { kind: 'timer', seconds: 180 },
    ],
  },
  {
    id: 'better-team',
    title: 'SAME KITCHEN. BETTER TEAM.',
    subtitle: 'Même cuisine, même recette — mais l’expérience change tout',
    accent: 'orange',
    align: 'left',
    blocks: [
      {
        kind: 'columns',
        left: {
          title: '❌ AVANT — CHAOS INDIVIDUEL',
          items: ['Chacun fait ce qu’il veut', 'Pas de coordination', 'Plats brûlés, retards', 'Communication absente', 'Score minimal'],
        },
        right: {
          title: '✅ APRÈS — COORDINATION',
          items: ['Rôles définis clairement', 'Communication constante', 'Flux de travail optimisé', 'Gestion des priorités', 'Score amélioré !'],
        },
      },
      { kind: 'timer', seconds: 240 },
    ],
    hint: 'Tentez de faire mieux en profitant de l’expérience acquise',
  },
  {
    id: 'yeah',
    title: 'YEAH ! 🎉',
    accent: 'green',
    align: 'center',
    blocks: [
      { kind: 'score', from: 1847, to: 2341, stars: 4 },
      { kind: 'note', text: '💬 Qu’est-ce qui a changé ? Qu’avez-vous appris ?' },
      { kind: 'paragraph', text: 'Partagez vos observations sur la coordination et la communication' },
      { kind: 'timer', seconds: 180 },
    ],
  },
  // ───────────────────────── ACTE III — AGILITÉ
  {
    id: 'back-to-work',
    title: 'BACK TO WORK. (sorry)',
    subtitle: 'En quoi un jeu vidéo nous aide-t-il à parler d’Agilité ?',
    accent: 'white',
    align: 'left',
    blocks: [
      {
        kind: 'list',
        columns: 2,
        items: [
          '🔄 Approche empirique',
          '👥 Importance des rôles',
          '🗂️ Priorisation du backlog',
          '🛑 Stop starting, start finishing',
          '📊 Limites du WIP',
          '✅ Critères d’acceptation',
          '🔁 Amélioration continue',
          '💬 Communication !',
        ],
      },
    ],
  },
  {
    id: 'empirical',
    title: 'EMPIRICAL APPROACH',
    accent: 'orange',
    align: 'left',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Empirique : qui s’appuie sur l’expérience et l’observation — pas sur la théorie seule. On inspecte, on s’adapte, en toute transparence.',
      },
      { kind: 'cycle', steps: ['🔬 TRY', '❌ FAIL', '📚 LEARN', '🔄 REPEAT'] },
      {
        kind: 'note',
        text: 'Dans Overcooked comme en Agilité — chaque partie est une itération. Inspecter → Adapter → Transparence',
      },
    ],
  },
  {
    id: 'brigade',
    title: 'THE KITCHEN BRIGADE',
    accent: 'orange',
    align: 'left',
    blocks: [
      {
        kind: 'cards',
        items: [
          {
            icon: '👨‍🍳',
            title: 'PRODUCT OWNER — Chef de Cuisine',
            text: 'WHAT & WHY — Définit la vision, priorise les commandes, protège l’équipe des distractions',
            color: '#60a5fa',
          },
          {
            icon: '🧑‍💼',
            title: 'SCRUM MASTER — Maître d’Hôtel',
            text: 'COACH — Facilite les cérémonies, débloque les obstacles, améliore le flux de l’équipe',
            color: '#ec4899',
          },
          {
            icon: '👩‍💻',
            title: 'DELIVERY TEAM — La Brigade',
            text: 'HOW — Exécute, livre, s’auto-organise, décide comment accomplir le travail',
            color: '#32FF7E',
          },
        ],
      },
      { kind: 'paragraph', text: 'Une équipe Scrum est une brigade complète et autonome', strong: true },
    ],
  },
  {
    id: 'backlog',
    title: 'BACKLOG PRIORITIZATION',
    subtitle: 'Dans Overcooked, tu prépares les plats les plus urgents en premier',
    accent: 'gold',
    align: 'left',
    blocks: [
      {
        kind: 'list',
        items: [
          '🎯 Choisir ce qui apporte le plus de valeur — le plus urgent, le plus impactant',
          '✋ Le finir jusqu’au bout — ne jamais laisser une tâche à 80 %',
          '➡️ Puis passer à la suite — libérer le flux, ne pas commencer 10 choses',
        ],
      },
      { kind: 'slogan', text: 'CHOISIR · FINIR · PASSER À LA SUITE' },
    ],
  },
  {
    id: 'user-story',
    title: 'WRITE THE USER STORY',
    accent: 'orange',
    align: 'left',
    blocks: [
      { kind: 'code', lines: ['En tant que [🧑 rôle]', 'Je veux [🎯 objectif]', 'Afin de [💡 valeur business]'] },
      { kind: 'note', text: '✏️ Écrivons ensemble la User Story du Sprint 2 !' },
      {
        kind: 'paragraph',
        text: '✅ Critères d’acceptation — quand est-ce que c’est « terminé » ? Le DoD = « le plat est servi chaud, complet, dans les temps » — le Sprint Goal = viser les 3 étoiles',
      },
    ],
  },
  {
    id: 'mapping-scrum',
    title: 'OVERCOOKED ↔ SCRUM',
    accent: 'orange',
    align: 'left',
    blocks: [
      {
        kind: 'mapping',
        leftColor: '#FF6B1A',
        rightColor: '#00E5FF',
        rows: [
          ['Commandes de plats', 'Product Backlog'],
          ['Niveau (2 min 30)', 'Sprint'],
          ['Préparation des ingrédients', 'Développement des features'],
          ['Score final', 'Valeur livrée'],
          ['Réflexion entre les niveaux', 'Rétrospective'],
          ['La cuisine et ses obstacles', 'Environnement de travail'],
          ['Coordination des joueurs', 'Collaboration d’équipe'],
          ['Adaptation aux nouvelles cuisines', 'Adaptation au changement'],
          ['Objectif 3 étoiles', 'Sprint Goal'],
        ],
      },
    ],
  },
  {
    id: 'frameworks',
    title: 'AGILE FRAMEWORKS',
    accent: 'cyan',
    align: 'left',
    blocks: [
      {
        kind: 'table',
        head: ['', 'SCRUM', 'SAFe', 'KANBAN', 'WATERFALL'],
        rows: [
          ['Approche', 'Itérative', 'Scalée', 'Continue', 'Séquentielle'],
          ['Équipe', 'Petite', 'Enterprise', 'Variable', 'Traditionnelle'],
          ['Timeboxing', 'Sprints', 'PI Planning', 'Flux continu', 'Phases'],
          ['WIP', 'Par sprint', 'Par PI', 'Explicite', 'Par phase'],
          ['Forces', 'Clarté', 'Multi-équipes', 'Flexibilité', 'Documentation'],
          ['Livraison', 'Fin sprint', 'PI sync', 'Continue', 'Fin projet'],
        ],
      },
    ],
  },
  // ───────────────────────── ACTE IV — L'IA ENTRE DANS LA CUISINE
  {
    id: 'ai-enters',
    kicker: '⚡ SECTION BREAK — AI ENTERS THE KITCHEN',
    title: 'WHAT IF THE CHEF WAS AN AI?',
    subtitle: 'L’Intelligence Artificielle entre dans la cuisine agile',
    accent: 'cyan',
    align: 'center',
    blocks: [{ kind: 'chips', items: ['🤖 Machine Learning', '⚡ Automatisation', '🧠 Intelligence augmentée'] }],
  },
  {
    id: 'ai-team-member',
    title: 'AI AS A TEAM MEMBER',
    accent: 'cyan',
    align: 'left',
    blocks: [
      {
        kind: 'mapping',
        leftColor: '#00E5FF',
        rightColor: '#FFFFFF',
        rows: [
          ['🤖 PO', 'Génération de user stories, analyse de feedback utilisateur, priorisation assistée'],
          ['🤖 SM', 'Détection de blocages, analyse de vélocité, prédiction des risques de sprint'],
          ['🤖 Dev', 'Pair programming (Copilot), génération de tests, revue de code automatisée'],
        ],
      },
      { kind: 'chips', label: 'OUTILS', items: ['GitHub Copilot', 'Jira AI', 'Miro AI', 'Notion AI', 'Cursor', 'Linear AI'] },
      { kind: 'paragraph', text: 'L’IA est un coéquipier — pas un remplaçant 🚀', strong: true },
    ],
  },
  {
    id: 'ai-ceremonies',
    title: 'AI IN SCRUM CEREMONIES',
    accent: 'cyan',
    align: 'left',
    blocks: [
      {
        kind: 'cards',
        items: [
          { icon: '📅', title: 'SPRINT PLANNING', text: 'L’IA estime les story points via l’historique des sprints et suggère un backlog optimisé', color: '#00E5FF' },
          { icon: '☀️', title: 'DAILY STANDUP', text: 'L’IA détecte les blocages dans les messages Slack/Teams et alerte le Scrum Master', color: '#00E5FF' },
          { icon: '🔍', title: 'SPRINT REVIEW', text: 'L’IA génère automatiquement le rapport de sprint et le résumé des fonctionnalités livrées', color: '#00E5FF' },
          { icon: '🔄', title: 'RÉTROSPECTIVE', text: 'L’IA analyse les sentiments d’équipe et suggère des actions d’amélioration concrètes', color: '#00E5FF' },
        ],
      },
    ],
  },
  {
    id: 'building-ai',
    title: 'BUILDING AI WITH AGILITY',
    accent: 'gold',
    align: 'left',
    blocks: [
      {
        kind: 'mapping',
        leftColor: '#FF6B1A',
        rightColor: '#00E5FF',
        rows: [
          ['📋 Backlog', 'Pipeline de données'],
          ['⏱️ Sprint', 'Cycle d’entraînement du modèle'],
          ['✅ DoD', 'Métriques de performance (accuracy, F1)'],
          ['🔄 Rétro', 'Ajustement des hyperparamètres'],
          ['🚀 Release', 'Déploiement du modèle en production'],
        ],
      },
      { kind: 'quote', text: 'Un modèle IA s’entraîne par epochs — une équipe Agile par sprints' },
    ],
  },
  {
    id: 'nn-is-your-team',
    title: 'THE NEURAL NETWORK IS YOUR TEAM',
    accent: 'cyan',
    align: 'left',
    blocks: [
      {
        kind: 'mapping',
        leftColor: '#00E5FF',
        rightColor: '#FF6B1A',
        rows: [
          ['Neurones (nœuds)', 'Membres de l’équipe'],
          ['Poids synaptiques', 'Communication & confiance'],
          ['Forward pass', 'Exécution du sprint'],
          ['Loss function', 'Écart au Sprint Goal'],
          ['Backpropagation', 'Rétrospective'],
          ['Learning rate', 'Vélocité de l’équipe'],
          ['Epoch', 'Sprint'],
          ['Overfitting', 'Trop de process, pas assez d’adaptabilité'],
          ['Régularisation', 'Le framework Scrum'],
        ],
      },
      { kind: 'slogan', text: 'CHAQUE SPRINT ENTRAÎNE VOTRE ÉQUIPE COMME UNE EPOCH ENTRAÎNE UN MODÈLE' },
    ],
    hint: '→ Visualisation en 3D au slide suivant',
  },
  {
    id: 'nn-live',
    kicker: 'VISUALISATION EN DIRECT',
    title: 'LE RÉSEAU, EN 3D',
    accent: 'cyan',
    align: 'center',
    anchor: 'bottom',
    blocks: [
      {
        kind: 'note',
        text: 'Forward pass = Sprint · Loss = écart au Sprint Goal · Backprop = Rétro · Epoch = Sprint',
      },
    ],
    hint: 'Survolez les neurones pour découvrir leur rôle 🧠',
  },
  {
    id: 'ai-tools',
    title: 'AI TOOLS FOR AGILE TEAMS',
    accent: 'cyan',
    align: 'left',
    blocks: [
      {
        kind: 'cards',
        items: [
          { icon: '💻', title: 'CODE', text: 'GitHub Copilot · Cursor · Tabnine', color: '#00E5FF' },
          { icon: '📋', title: 'PLANNING', text: 'Jira AI · Linear · Height AI', color: '#00E5FF' },
          { icon: '🤝', title: 'COLLAB', text: 'Notion AI · Miro · Confluence AI', color: '#00E5FF' },
          { icon: '🧪', title: 'TESTING', text: 'Testim · Applitools · Mabl', color: '#00E5FF' },
        ],
      },
      { kind: 'paragraph', text: 'L’IA amplifie l’équipe — elle ne la remplace pas 🚀', strong: true },
    ],
  },
  // ───────────────────────── ACTE V — RESSOURCES & CLÔTURE
  {
    id: 'scrum-guide',
    title: 'THE SCRUM GUIDE',
    accent: 'gold',
    align: 'left',
    blocks: [
      { kind: 'paragraph', text: '📖 Tout ce dont vous avez besoin pour démarrer tient en 13 pages', strong: true },
      { kind: 'links', items: [{ label: '🌐 scrumguides.org', href: 'https://scrumguides.org' }] },
      { kind: 'paragraph', text: 'Le Scrum Guide 2020 — disponible en français' },
      { kind: 'quote', text: 'La simplicité est la sophistication suprême', author: 'Leonardo da Vinci' },
      { kind: 'chips', label: 'CERTIFICATIONS', items: ['PSM', 'PSD', 'PAL'] },
    ],
  },
  {
    id: 'merci',
    title: 'MERCI À TOUS',
    subtitle: 'Et bienvenue chez SFEIR',
    accent: 'gold',
    align: 'center',
    blocks: [
      { kind: 'paragraph', text: 'Onboarding Agile — The Agile Kitchen × AI' },
      { kind: 'chips', items: ['🍳 THE AGILE KITCHEN', '🤖 × AI', '🎮 OVERCOOKED'] },
    ],
    hint: 'Cliquez n’importe où pour un feu d’artifice ✦',
  },
]

export const TOTAL_SLIDES = slides.length

/** Position z du slide i (0-based) dans le monde 3D */
export const slideZ = (i: number) => -i * SLIDE_SPACING
