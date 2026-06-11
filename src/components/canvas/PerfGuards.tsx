import { AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from '@react-three/drei'
import { useShow } from '../../store'

/**
 * docs/advanced/scaling-performance.mdx : régression de qualité automatique.
 * PerformanceMonitor bascule le store en 'low' si le framerate plonge,
 * AdaptiveDpr/AdaptiveEvents réduisent la résolution et les events en mouvement.
 */
export function PerfGuards() {
  const setQuality = useShow((s) => s.setQuality)

  return (
    <>
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      <PerformanceMonitor onDecline={() => setQuality('low')} onIncline={() => setQuality('high')} />
    </>
  )
}
