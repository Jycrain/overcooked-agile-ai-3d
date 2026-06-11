import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { useShow } from '../../store'

export function Effects() {
  const quality = useShow((s) => s.quality)

  return (
    <EffectComposer multisampling={quality === 'high' ? 4 : 0}>
      <Bloom mipmapBlur intensity={quality === 'high' ? 0.9 : 0.5} luminanceThreshold={0.85} luminanceSmoothing={0.2} />
      <Vignette eskil={false} offset={0.18} darkness={0.85} />
      <Noise opacity={quality === 'high' ? 0.045 : 0} />
    </EffectComposer>
  )
}
