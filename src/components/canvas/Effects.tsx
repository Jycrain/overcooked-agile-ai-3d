import { EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { useFrame } from '@react-three/fiber'
import { BloomEffect, GlitchEffect, GlitchMode, PixelationEffect, SepiaEffect } from 'postprocessing'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { SLIDE_SPACING } from '../../content/slides.fr'
import { finaleState, prefersReducedMotion, useShow } from '../../store'

/** Centres des bascules d'acte, en « slides » (0-based) :
    intro → jeu entre i=1 et i=2 ; cuisine → IA entre i=12 et i=13 ;
    IA → Scrum Guide entre i=19 et i=20 */
const BREAK_GAME_P = 1.5
const BREAK_AI_P = 12.55
const BREAK_GUIDE_P = 19.5

/** Cloche lissée autour d'un centre — 0 aux stations, 1 au cœur du passage */
const bell = (p: number, center: number, width: number) => {
  const t = Math.max(0, 1 - Math.abs((p - center) / width))
  return t * t * (3 - 2 * t)
}

/**
 * Les effets animés (bloom, glitch, pixelisation, sépia) sont des instances
 * possédées en propre et montées via <primitive>. SURTOUT PAS de ref passée
 * aux wrappers de @react-three/postprocessing : leur useMemo fait
 * JSON.stringify(props) et, en React 19, une ref est une prop ordinaire —
 * au re-render (bascule de quality par le PerformanceMonitor), ref.current
 * contient l'effet live, circulaire via sa caméra → TypeError → React
 * démonte tout le canvas (écran noir constaté sur le slide final).
 */
export function Effects() {
  const quality = useShow((s) => s.quality)
  // offset partagé avec le glitch : muté chaque frame, jamais re-créé
  const aberration = useMemo(() => new THREE.Vector2(0, 0), [])

  const bloom = useMemo(
    () => new BloomEffect({ mipmapBlur: true, intensity: 0.9, luminanceThreshold: 0.85, luminanceSmoothing: 0.2 }),
    [],
  )
  const glitch = useMemo(() => {
    const effect = new GlitchEffect({ ratio: 0.85, chromaticAberrationOffset: aberration })
    effect.mode = GlitchMode.DISABLED
    return effect
  }, [aberration])
  const pixelation = useMemo(() => new PixelationEffect(0), [])
  const sepia = useMemo(() => {
    const effect = new SepiaEffect()
    effect.blendMode.opacity.value = 0
    return effect
  }, [])

  useEffect(
    () => () => {
      bloom.dispose()
      glitch.dispose()
      pixelation.dispose()
      sepia.dispose()
    },
    [bloom, glitch, pixelation, sepia],
  )

  // Trois disruptions d'acte (position caméra) + l'apothéose du bouquet final
  // (temps de la chorégraphie via finaleState) — zéro coût aux stations,
  // désactivées si l'utilisateur préfère le mouvement réduit.
  useFrame(({ camera }) => {
    const baseIntensity = useShow.getState().quality === 'high' ? 0.9 : 0.5
    if (prefersReducedMotion) {
      bloom.intensity = baseIntensity
      return
    }
    const p = (9 - camera.position.z) / SLIDE_SPACING
    const kGame = bell(p, BREAK_GAME_P, 0.45)
    const kAI = bell(p, BREAK_AI_P, 0.5)
    const kGold = bell(p, BREAK_GUIDE_P, 0.5)
    const kFinale = finaleState.surge

    glitch.mode = kAI > 0.45 ? GlitchMode.CONSTANT_WILD : kAI > 0.05 ? GlitchMode.CONSTANT_MILD : GlitchMode.DISABLED
    glitch.minStrength = 0.1 + kAI * 0.25
    glitch.maxStrength = 0.2 + kAI * 0.55

    // granularité toujours paire (le setter arrondit) ; 0 = effet inactif
    const granularity = Math.round(kGame * 7) * 2
    if (pixelation.granularity !== granularity) pixelation.granularity = granularity

    aberration.set(kAI * 0.006 + kGold * 0.002 + kGame * 0.0015 + kFinale * 0.0012, kAI * 0.0025 + kGold * 0.0008)
    sepia.blendMode.opacity.value = Math.max(kGold * 0.6, kFinale * 0.3)
    bloom.intensity = baseIntensity + kAI * 1.3 + kGold * 1.6 + kGame * 0.8 + kFinale * 1.5
  })

  if (prefersReducedMotion) {
    return (
      <EffectComposer multisampling={quality === 'high' ? 4 : 0}>
        <primitive object={bloom} />
        <Vignette eskil={false} offset={0.18} darkness={0.85} />
        <Noise opacity={quality === 'high' ? 0.045 : 0} />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer multisampling={quality === 'high' ? 4 : 0}>
      <primitive object={bloom} />
      <primitive object={glitch} />
      <primitive object={pixelation} />
      <primitive object={sepia} />
      <Vignette eskil={false} offset={0.18} darkness={0.85} />
      <Noise opacity={quality === 'high' ? 0.045 : 0} />
    </EffectComposer>
  )
}
