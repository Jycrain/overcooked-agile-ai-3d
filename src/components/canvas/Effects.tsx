import { Bloom, EffectComposer, Glitch, Noise, Sepia, Vignette } from '@react-three/postprocessing'
import { useFrame } from '@react-three/fiber'
import { GlitchMode, type BloomEffect, type GlitchEffect, type SepiaEffect } from 'postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { SLIDE_SPACING } from '../../content/slides.fr'
import { prefersReducedMotion, useShow } from '../../store'

/** Centres des bascules d'acte, en « slides » (0-based) :
    cuisine → IA entre i=12 et i=13 ; IA → Scrum Guide entre i=19 et i=20 */
const BREAK_AI_P = 12.55
const BREAK_GUIDE_P = 19.5

/** Cloche lissée autour d'un centre — 0 aux stations, 1 au cœur du passage */
const bell = (p: number, center: number, width: number) => {
  const t = Math.max(0, 1 - Math.abs((p - center) / width))
  return t * t * (3 - 2 * t)
}

export function Effects() {
  const quality = useShow((s) => s.quality)
  const bloom = useRef<BloomEffect>(null!)
  const glitch = useRef<GlitchEffect>(null!)
  const sepia = useRef<SepiaEffect>(null!)
  // offset partagé avec l'effet : muté chaque frame, jamais re-créé
  const aberration = useMemo(() => new THREE.Vector2(0, 0), [])
  const baseIntensity = quality === 'high' ? 0.9 : 0.5

  // Deux disruptions d'acte pilotées par la position caméra — zéro coût aux
  // stations, désactivées si l'utilisateur préfère le mouvement réduit :
  // 13 → 14 « Cyberpunk » : glitch + aberration chromatique + bloom ;
  // 20 → 21 « enluminure » : virage sépia doré + embrasement de bloom.
  useFrame(({ camera }) => {
    if (prefersReducedMotion) return
    const p = (9 - camera.position.z) / SLIDE_SPACING
    const kAI = bell(p, BREAK_AI_P, 0.5)
    const kGold = bell(p, BREAK_GUIDE_P, 0.5)
    if (glitch.current) {
      glitch.current.mode = kAI > 0.45 ? GlitchMode.CONSTANT_WILD : kAI > 0.05 ? GlitchMode.CONSTANT_MILD : GlitchMode.DISABLED
      glitch.current.minStrength = 0.1 + kAI * 0.25
      glitch.current.maxStrength = 0.2 + kAI * 0.55
    }
    aberration.set(kAI * 0.006 + kGold * 0.002, kAI * 0.0025 + kGold * 0.0008)
    if (sepia.current) sepia.current.blendMode.opacity.value = kGold * 0.6
    if (bloom.current) bloom.current.intensity = baseIntensity + kAI * 1.3 + kGold * 1.6
  })

  if (prefersReducedMotion) {
    return (
      <EffectComposer multisampling={quality === 'high' ? 4 : 0}>
        <Bloom mipmapBlur intensity={baseIntensity} luminanceThreshold={0.85} luminanceSmoothing={0.2} />
        <Vignette eskil={false} offset={0.18} darkness={0.85} />
        <Noise opacity={quality === 'high' ? 0.045 : 0} />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer multisampling={quality === 'high' ? 4 : 0}>
      <Bloom ref={bloom} mipmapBlur intensity={baseIntensity} luminanceThreshold={0.85} luminanceSmoothing={0.2} />
      <Glitch ref={glitch} mode={GlitchMode.DISABLED} ratio={0.85} chromaticAberrationOffset={aberration} />
      <Sepia ref={sepia} opacity={0} />
      <Vignette eskil={false} offset={0.18} darkness={0.85} />
      <Noise opacity={quality === 'high' ? 0.045 : 0} />
    </EffectComposer>
  )
}
