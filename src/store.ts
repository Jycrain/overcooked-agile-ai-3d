import { create } from 'zustand'
import { TOTAL_SLIDES } from './content/slides.fr'

export interface NeuronInfo {
  name: string
  role: string
  detail: string
  color: string
}

interface ShowState {
  started: boolean
  /** Séquence d'ouverture : plongée cosmique + déflagration après « Entrer en cuisine » */
  intro: 'idle' | 'playing' | 'done'
  /** Incrémenté au moment de la déflagration — déclenche le flash DOM */
  introFlash: number
  quality: 'high' | 'low'
  /** Slide courant, 0-based (affiché 1..22) */
  currentSlide: number
  /** Élément scrollable de drei ScrollControls */
  scrollEl: HTMLElement | null
  /** Slide visé par la navigation (peut devancer currentSlide pendant le scroll lissé) */
  targetSlide: number
  /** Incrémenté à chaque appui sur T — les minuteurs du slide courant réagissent */
  timerSignal: number
  /** Neurone survolé dans la visualisation du réseau (slide 19), null sinon */
  hoveredNeuron: NeuronInfo | null
  start: () => void
  finishIntro: () => void
  flashIntro: () => void
  setHoveredNeuron: (info: NeuronInfo | null) => void
  setQuality: (quality: 'high' | 'low') => void
  setCurrentSlide: (index: number) => void
  setScrollEl: (el: HTMLElement | null) => void
  pressTimer: () => void
}

export const useShow = create<ShowState>()((set) => ({
  started: false,
  intro: 'idle',
  introFlash: 0,
  quality: 'high',
  currentSlide: 0,
  scrollEl: null,
  targetSlide: 0,
  timerSignal: 0,
  hoveredNeuron: null,
  // reduced motion : pas de plongée, on arrive directement posé sur le slide 1
  start: () => set({ started: true, intro: prefersReducedMotion ? 'done' : 'playing' }),
  finishIntro: () => set({ intro: 'done' }),
  flashIntro: () => set((s) => ({ introFlash: s.introFlash + 1 })),
  setHoveredNeuron: (hoveredNeuron) => set({ hoveredNeuron }),
  setQuality: (quality) => set({ quality }),
  setCurrentSlide: (currentSlide) => set({ currentSlide }),
  setScrollEl: (scrollEl) => set({ scrollEl }),
  pressTimer: () => set((s) => ({ timerSignal: s.timerSignal + 1 })),
}))

export const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Canal temps réel du bouquet final (slide 22) — volontairement HORS zustand :
 * écrit chaque frame par la chorégraphie (ZoneFinal), lu chaque frame par les
 * effets (Effects) et la pyrotechnie, sans déclencher de re-render React.
 */
export const finaleState = {
  /** secondes écoulées depuis l'arrivée sur le slide final, -1 hors du slide */
  tau: -1,
  /** échelle de temps des particules (ralenti suspendu au pic) */
  timeScale: 1,
  /** intensité 0..1 du surge post-processing de l'apothéose */
  surge: 0,
}

/** Saute au slide i (0-based) en pilotant le scroll de drei */
export function jumpToSlide(i: number) {
  const { scrollEl } = useShow.getState()
  if (!scrollEl) return
  const clamped = Math.max(0, Math.min(TOTAL_SLIDES - 1, i))
  // mémorise la cible pour que des appuis rapides s'enchaînent sans attendre le scroll lissé
  useShow.setState({ targetSlide: clamped })
  const max = scrollEl.scrollHeight - scrollEl.clientHeight
  scrollEl.scrollTo({
    top: (clamped / (TOTAL_SLIDES - 1)) * max,
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  })
}
