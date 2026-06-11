import { useFrame } from '@react-three/fiber'
import { useRef, type ReactNode } from 'react'
import * as THREE from 'three'

/**
 * docs/advanced/pitfalls.mdx : « toggle visibility instead of mounting » —
 * chaque chapitre reste monté mais n'est visible (ni rendu) que lorsque la
 * caméra s'en approche.
 */
export function ChapterGroup({ z, range = 55, children }: { z: number; range?: number; children: ReactNode }) {
  const group = useRef<THREE.Group>(null!)

  useFrame(({ camera }) => {
    group.current.visible = Math.abs(camera.position.z - z) < range
  })

  return (
    <group ref={group} position={[0, 0, z]}>
      {children}
    </group>
  )
}
