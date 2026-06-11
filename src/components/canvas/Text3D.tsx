import { Text as DreiText } from '@react-three/drei'
import type { ComponentProps } from 'react'
import fontUrl from '../../assets/fonts/space-grotesk-medium.ttf'

/**
 * <Text> 3D avec police auto-hébergée (Space Grotesk Medium, cohérente avec
 * la DA). Sans `font` explicite, troika résoudrait les glyphes via
 * cdn.jsdelivr.net au runtime — hors-ligne, tout le canvas resterait suspendu.
 */
export function Text(props: ComponentProps<typeof DreiText>) {
  return <DreiText font={fontUrl} {...props} />
}
