import { useEffect, useState } from 'react'
import { useShow } from '../../store'

/**
 * Score animé porté de la présentation : compte de `from` vers `to`
 * à CHAQUE entrée sur son slide (comme initSlide dans l'original).
 * Étoiles ★ affichées au-dessus.
 */
export function Score({ from, to, stars, slideIndex }: { from: number; to: number; stars: number; slideIndex: number }) {
  const [value, setValue] = useState(from)
  const currentSlide = useShow((s) => s.currentSlide)

  useEffect(() => {
    if (currentSlide !== slideIndex) return
    setValue(from)
    const start = performance.now()
    const duration = 1500
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(from + (to - from) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [currentSlide, slideIndex, from, to])

  return (
    <div className="block-score">
      <div className="stars" aria-label={`${stars} étoiles`}>
        {'⭐'.repeat(stars)}
      </div>
      <div className="pts">{value.toLocaleString('fr-FR')} pts</div>
    </div>
  )
}
