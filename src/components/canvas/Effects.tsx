import { Bloom, EffectComposer, Glitch, Noise, Vignette } from '@react-three/postprocessing'
import { useFrame } from '@react-three/fiber'
import { GlitchMode, type BloomEffect, type GlitchEffect } from 'postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { SLIDE_SPACING } from '../../content/slides.fr'
import { prefersReducedMotion, useShow } from '../../store'

/** Centre de la bascule d'acte cuisine → IA, en « slides » : entre le
    slide 13 (frameworks, i=12) et le section break IA (i=13) */
const BREAK_P = 12.55

export function Effects() {
  const quality = useShow((s) => s.quality)
  const bloom = useRef<BloomEffect>(null!)
  const glitch = useRef<GlitchEffect>(null!)
  // offset partagé avec l'effet : muté chaque frame, jamais re-créé
  const aberration = useMemo(() => new THREE.Vector2(0, 0), [])
  const baseIntensity = quality === 'high' ? 0.9 : 0.5

  // Transition « Cyberpunk » : glitch + aberration chromatique + poussée de
  // bloom, en cloche autour du passage 13 → 14 — zéro coût aux stations
  // (mode DISABLED), désactivée si l'utilisateur préfère le mouvement réduit.
  useFrame(({ camera }) => {
    if (prefersReducedMotion) return
    const p = (9 - camera.position.z) / SLIDE_SPACING
    const t = Math.max(0, 1 - Math.abs((p - BREAK_P) / 0.5))
    const k = t * t * (3 - 2 * t)
    if (glitch.current) {
      glitch.current.mode = k > 0.45 ? GlitchMode.CONSTANT_WILD : k > 0.05 ? GlitchMode.CONSTANT_MILD : GlitchMode.DISABLED
      glitch.current.minStrength = 0.1 + k * 0.25
      glitch.current.maxStrength = 0.2 + k * 0.55
    }
    aberration.set(k * 0.006, k * 0.0025)
    if (bloom.current) bloom.current.intensity = baseIntensity + k * 1.3
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
      <Vignette eskil={false} offset={0.18} darkness={0.85} />
      <Noise opacity={quality === 'high' ? 0.045 : 0} />
    </EffectComposer>
  )
}
