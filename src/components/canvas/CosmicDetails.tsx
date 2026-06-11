import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { slides, slideZ, type Accent } from '../../content/slides.fr'
import { SlideFade } from './SlideFade'

/**
 * Micro-décors cosmiques : chaque slide reçoit deux petits props (planète
 * miniature, anneau orbital, constellation, astéroïdes, croissant de lune,
 * étincelles…) placés sur les bords du cadre, aux couleurs d'accent du slide.
 * Déterministe (PRNG seedé par l'index), léger (géométries minuscules), et
 * sans conflit : chaque prop vit sous son SlideFade, loin des cartes texte.
 */

const ACCENT_COLOR: Record<Accent, string> = {
  orange: '#ff6b1a',
  gold: '#ffd700',
  cyan: '#00e5ff',
  green: '#32ff7e',
  white: '#9db8ff',
}

/** PRNG mulberry32 — picks reproductibles d'un rendu à l'autre */
function mulberry32(seed: number) {
  let a = seed + 0x6d2b79f5
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ───────────────────────── la bibliothèque de props ───────────────────────── */

function MiniPlanet({ color, seed }: { color: string; seed: number }) {
  const group = useRef<THREE.Group>(null!)
  useFrame((_, delta) => {
    group.current.rotation.y += delta * 0.2
  })
  return (
    <group ref={group} rotation={[0.4 + seed * 0.5, 0, -0.3]}>
      <mesh>
        <sphereGeometry args={[0.34, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} flatShading roughness={0.6} />
      </mesh>
      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[0.58, 0.022, 8, 48]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} toneMapped={false} transparent opacity={0.75} />
      </mesh>
    </group>
  )
}

function OrbitRing({ color, seed }: { color: string; seed: number }) {
  const ring = useRef<THREE.Group>(null!)
  const moon = useRef<THREE.Mesh>(null!)
  useFrame((state, delta) => {
    ring.current.rotation.z += delta * 0.15
    const a = state.clock.elapsedTime * (0.5 + seed * 0.4)
    moon.current.position.set(Math.cos(a) * 0.85, Math.sin(a) * 0.85, 0)
  })
  return (
    <group ref={ring} rotation={[seed, 0.3, 0]}>
      <mesh>
        <torusGeometry args={[0.85, 0.012, 8, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} toneMapped={false} transparent opacity={0.5} />
      </mesh>
      <mesh ref={moon}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
    </group>
  )
}

function AsteroidCluster({ color, seed }: { color: string; seed: number }) {
  const group = useRef<THREE.Group>(null!)
  const rocks = useMemo(() => {
    const rand = mulberry32(seed * 997)
    return Array.from({ length: 3 }, () => ({
      pos: [rand() * 1.6 - 0.8, rand() * 1.4 - 0.7, rand() * 0.8 - 0.4] as [number, number, number],
      scale: 0.09 + rand() * 0.12,
      speed: 0.3 + rand() * 0.5,
    }))
  }, [seed])
  useFrame((state, delta) => {
    group.current.rotation.z += delta * 0.05
    group.current.children.forEach((rock, i) => {
      rock.rotation.x += delta * rocks[i].speed
      rock.rotation.y += delta * rocks[i].speed * 0.7
      rock.position.y = rocks[i].pos[1] + Math.sin(state.clock.elapsedTime * 0.6 + i * 2) * 0.12
    })
  })
  return (
    <group ref={group}>
      {rocks.map((rock, i) => (
        <mesh key={i} position={rock.pos} scale={rock.scale}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#5a4a44" emissive={color} emissiveIntensity={0.18} flatShading roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function Constellation({ color, seed }: { color: string; seed: number }) {
  const group = useRef<THREE.Group>(null!)
  const { starPositions, linePositions } = useMemo(() => {
    const rand = mulberry32(seed * 7919)
    const count = 5 + Math.floor(rand() * 3)
    const pts: THREE.Vector3[] = []
    for (let i = 0; i < count; i++) {
      pts.push(new THREE.Vector3(rand() * 2.4 - 1.2, rand() * 2 - 1, rand() * 0.6 - 0.3))
    }
    const starPositions = new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z]))
    const segs: number[] = []
    for (let i = 0; i < pts.length - 1; i++) segs.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z)
    return { starPositions, linePositions: new Float32Array(segs) }
  }, [seed])
  useFrame((state) => {
    group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.25 + seed) * 0.08
  })
  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.09} color={color} transparent opacity={0.9} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.22} />
      </lineSegments>
    </group>
  )
}

function Crescent({ color, seed }: { color: string; seed: number }) {
  const group = useRef<THREE.Group>(null!)
  useFrame((state) => {
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.4 + seed * 6) * 0.18
    group.current.rotation.z = -0.4 + Math.sin(state.clock.elapsedTime * 0.2) * 0.05
  })
  return (
    <group ref={group}>
      {/* croissant : la sphère sombre masque une partie de la sphère claire */}
      <mesh>
        <sphereGeometry args={[0.3, 20, 20]} />
        <meshStandardMaterial color="#fff4d6" emissive={color} emissiveIntensity={0.5} roughness={0.7} />
      </mesh>
      <mesh position={[0.13, 0.08, 0.06]}>
        <sphereGeometry args={[0.28, 20, 20]} />
        <meshBasicMaterial color="#0a0205" />
      </mesh>
    </group>
  )
}

function Shimmer({ color }: { color: string }) {
  return <Sparkles count={14} scale={[2.4, 2.4, 1]} size={2.2} speed={0.25} opacity={0.7} color={color} />
}

/** Étoile filante : un trait qui traverse périodiquement le coin du cadre */
function ShootingStar({ color, seed }: { color: string; seed: number }) {
  const mesh = useRef<THREE.Mesh>(null!)
  const period = 5.5 + seed * 4
  useFrame((state) => {
    const t = ((state.clock.elapsedTime + seed * 7) % period) / period
    if (t < 0.12) {
      const k = t / 0.12
      mesh.current.visible = true
      mesh.current.position.set(-2.2 + k * 4.4, 1.4 - k * 2.2, 0)
      ;(mesh.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(k * Math.PI) * 0.9
    } else {
      mesh.current.visible = false
    }
  })
  return (
    <mesh ref={mesh} rotation={[0, 0, -0.46]} visible={false}>
      <planeGeometry args={[0.9, 0.022]} />
      <meshBasicMaterial color={color} transparent opacity={0} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  )
}

/* ───────────────────────── assemblage par slide ───────────────────────── */

const PROPS = [MiniPlanet, OrbitRing, AsteroidCluster, Constellation, Crescent, Shimmer] as const

export function CosmicDetails() {
  const decors = useMemo(
    () =>
      slides.map((slide, i) => {
        const rand = mulberry32(i * 1013 + 77)
        const color = ACCENT_COLOR[slide.accent]
        // deux props distincts, un de chaque côté du cadre.
        // Le prop HAUT va du côté opposé à la carte texte (le titre occupe le
        // haut du côté de la carte) ; le prop BAS, discret, va sous la carte.
        const cardOnRight = slide.align === 'center' ? false : slide.align === 'right' || i % 2 === 1
        const highSide = cardOnRight ? -1 : 1
        const first = Math.floor(rand() * PROPS.length)
        const second = (first + 1 + Math.floor(rand() * (PROPS.length - 1))) % PROPS.length
        const left = {
          Prop: PROPS[first],
          pos: [highSide * (5.6 + rand() * 1.4), 2.4 + rand() * 2, -(3 + rand() * 3)] as [number, number, number],
          seed: rand(),
        }
        const right = {
          Prop: PROPS[second],
          pos: [-highSide * (5.6 + rand() * 1.4), -0.4 - rand() * 1.4, -(4 + rand() * 3)] as [number, number, number],
          seed: rand(),
        }
        // une étoile filante un slide sur trois, en haut du cadre
        const shooting = i % 3 === 1 ? { pos: [rand() * 4 - 2, 4.6, -6] as [number, number, number], seed: rand() } : null
        return { color, left, right, shooting, z: slideZ(i), index: i }
      }),
    [],
  )

  return (
    <>
      {decors.map(({ color, left, right, shooting, z, index }) => (
        <SlideFade key={index} from={index}>
          <group position={[0, 0, z]}>
            <group position={left.pos}>
              <left.Prop color={color} seed={left.seed} />
            </group>
            <group position={right.pos}>
              <right.Prop color={color} seed={right.seed} />
            </group>
            {shooting && (
              <group position={shooting.pos}>
                <ShootingStar color={color} seed={shooting.seed} />
              </group>
            )}
          </group>
        </SlideFade>
      ))}
    </>
  )
}
