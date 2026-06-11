import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { SLIDE_SPACING } from '../../content/slides.fr'

/** Demi-fenêtre de pleine visibilité autour du slide (en slides) */
const HOLD = 0.4
/** Largeur du fondu au-delà de la fenêtre (en slides) */
const FALLOFF = 0.45

/**
 * Rideau de transition : le décor enfant n'est visible qu'au voisinage de
 * SES slides [from..to]. L'opacité de tous ses matériaux suit la position de
 * la caméra (fondu entrée/sortie + léger zoom), si bien qu'entre deux slides
 * on ne voit que le fond étoilé — aucun décor voisin ne s'enchevêtre.
 */
export function SlideFade({ from, to = from, children }: { from: number; to?: number; children: ReactNode }) {
  const group = useRef<THREE.Group>(null!)
  const mats = useRef<{ mat: THREE.Material; base: number }[]>([])
  const lastFade = useRef(-1)

  // collecte des matériaux (dédupliqués) et de leur opacité de base
  useLayoutEffect(() => {
    const seen = new Set<THREE.Material>()
    const collected: { mat: THREE.Material; base: number }[] = []
    const collect = () => {
      group.current.traverse((obj) => {
        const material = (obj as THREE.Mesh).material
        if (!material) return
        for (const mat of Array.isArray(material) ? material : [material]) {
          if (seen.has(mat)) continue
          seen.add(mat)
          collected.push({ mat, base: mat.transparent ? mat.opacity : 1 })
          mat.transparent = true
        }
      })
      mats.current = collected
    }
    collect()
    // les matériaux de <Text> (troika) arrivent un peu après le mount
    const retry = setTimeout(collect, 800)
    return () => clearTimeout(retry)
  }, [])

  useFrame(({ camera }) => {
    // position de la caméra exprimée en « slides » (station i ⇔ z = -26i + 9)
    const p = (9 - camera.position.z) / SLIDE_SPACING
    const lo = from - HOLD
    const hi = to + HOLD
    let fade = 1
    if (p < lo) fade = 1 - Math.min(1, (lo - p) / FALLOFF)
    else if (p > hi) fade = 1 - Math.min(1, (p - hi) / FALLOFF)
    fade = fade * fade * (3 - 2 * fade) // smoothstep

    group.current.visible = fade > 0.02
    if (Math.abs(fade - lastFade.current) < 0.01) return
    lastFade.current = fade

    for (const { mat, base } of mats.current) mat.opacity = base * fade
    const s = 0.85 + 0.15 * fade
    group.current.scale.setScalar(s)
  })

  return <group ref={group}>{children}</group>
}
