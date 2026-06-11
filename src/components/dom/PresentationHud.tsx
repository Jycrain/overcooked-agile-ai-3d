import { useEffect } from 'react'
import { TOTAL_SLIDES } from '../../content/slides.fr'
import { jumpToSlide, useShow } from '../../store'

/**
 * HUD de présentation porté de l'original : barre de progression,
 * compteur « X / 22 », flèches de navigation, raccourcis clavier
 * (←/→/Espace naviguer, F plein écran, T minuteur).
 */
export function PresentationHud() {
  const currentSlide = useShow((s) => s.currentSlide)
  const started = useShow((s) => s.started)
  const intro = useShow((s) => s.intro)

  useEffect(() => {
    // un défilement manuel (molette/tactile) resynchronise la cible de navigation
    const syncTarget = () => useShow.setState((s) => ({ targetSlide: s.currentSlide }))
    window.addEventListener('wheel', syncTarget, { passive: true })
    window.addEventListener('touchmove', syncTarget, { passive: true })

    const onKey = (e: KeyboardEvent) => {
      if (!useShow.getState().started) return
      // la cible (et non le slide courant) permet d'enchaîner les appuis pendant le scroll lissé
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        jumpToSlide(useShow.getState().targetSlide + 1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        jumpToSlide(useShow.getState().targetSlide - 1)
      } else if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) document.exitFullscreen()
        else document.documentElement.requestFullscreen()
      } else if (e.key === 't' || e.key === 'T') {
        useShow.getState().pressTimer()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('wheel', syncTarget)
      window.removeEventListener('touchmove', syncTarget)
    }
  }, [])

  // le HUD n'apparaît qu'une fois la séquence d'ouverture terminée
  if (!started || intro !== 'done') return null

  return (
    <>
      <div className="progress-bar" style={{ width: `${((currentSlide + 1) / TOTAL_SLIDES) * 100}%` }} />
      <div className="slide-counter" aria-live="polite">
        <b>{currentSlide + 1}</b> / {TOTAL_SLIDES}
      </div>
      <div className="nav-arrows">
        <button aria-label="Slide précédent" disabled={currentSlide === 0} onClick={() => jumpToSlide(currentSlide - 1)}>
          ←
        </button>
        <button
          aria-label="Slide suivant"
          disabled={currentSlide === TOTAL_SLIDES - 1}
          onClick={() => jumpToSlide(currentSlide + 1)}>
          →
        </button>
      </div>
      <div className="keys-hint">←/→ NAVIGUER · T MINUTEUR · F PLEIN ÉCRAN</div>
    </>
  )
}
