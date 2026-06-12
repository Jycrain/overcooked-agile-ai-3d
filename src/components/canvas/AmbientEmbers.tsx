import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useShow } from '../../store'
import { mulberry32 } from './IntroSequence'

const COUNT = 700

/**
 * Braises d'ambiance permanentes : le champ de particules suit la caméra
 * le long du rail, si bien qu'entre deux slides l'écran n'est jamais vide
 * (étoiles + braises), même quand les décors de slides sont fondus.
 */
export function AmbientEmbers() {
  const points = useRef<THREE.Points>(null!)
  const group = useRef<THREE.Group>(null!)
  const data = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const speeds = new Float32Array(COUNT)
    // braises bicolores : orange → or, piquées d'étincelles roses (1 sur 9) —
    // le champ permanent raconte la palette entière sans une particule de plus
    const rand = mulberry32(4321)
    const colors = new Float32Array(COUNT * 3)
    const braise = new THREE.Color('#ff6b1a')
    const or = new THREE.Color('#ffd700')
    const rose = new THREE.Color('#ff2d55')
    const tint = new THREE.Color()
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 26
      positions[i * 3 + 1] = Math.random() * 13 - 5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 34
      speeds[i] = 0.35 + Math.random() * 1.2
      if (i % 9 === 0) tint.copy(rose)
      else tint.copy(braise).lerp(or, rand() * 0.8)
      colors.set([tint.r, tint.g, tint.b], i * 3)
    }
    return { positions, speeds, colors }
  }, [])

  useFrame(({ camera }, delta) => {
    // pendant la plongée d'ouverture, le champ colle à la caméra (tunnel de
    // braises) ; en croisière, il glisse avec amorti pour éviter l'effet « collé »
    if (useShow.getState().intro === 'playing') {
      group.current.position.set(camera.position.x, camera.position.y - 2, camera.position.z - 12)
    } else {
      group.current.position.x += (0 - group.current.position.x) * Math.min(1, delta * 2)
      group.current.position.y += (0 - group.current.position.y) * Math.min(1, delta * 2)
      group.current.position.z += (camera.position.z - 10 - group.current.position.z) * Math.min(1, delta * 2)
    }

    const pos = points.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 1] += data.speeds[i] * delta
      pos[i * 3] += Math.sin(pos[i * 3 + 1] * 0.8 + i) * delta * 0.25
      if (pos[i * 3 + 1] > 8) pos[i * 3 + 1] = -5
    }
    points.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <group ref={group}>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.055}
          vertexColors
          transparent
          opacity={0.55}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
