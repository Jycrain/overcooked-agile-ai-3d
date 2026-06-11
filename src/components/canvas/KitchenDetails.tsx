import { Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type ReactElement } from 'react'
import * as THREE from 'three'
import { slideZ } from '../../content/slides.fr'
import { SlideFade } from './SlideFade'

/**
 * Accessoires de cuisine procéduraux pour l'acte Overcooked × Agilité
 * (slides 1 à 13) : marmite fumante, poêle, pile d'assiettes, cloche de
 * service, cuillère en bois. Chaque slide reçoit un ou deux props placés à
 * la main pour ne pas gêner cartes et décors, sous rideau SlideFade.
 */

const STEAM_COUNT = 26

/** Filet de vapeur qui s'élève en serpentant */
function Steam({ height = 1.6 }: { height?: number }) {
  const points = useRef<THREE.Points>(null!)
  const seeds = useMemo(() => Float32Array.from({ length: STEAM_COUNT }, () => Math.random()), [])
  const positions = useMemo(() => {
    const arr = new Float32Array(STEAM_COUNT * 3)
    for (let i = 0; i < STEAM_COUNT; i++) arr[i * 3 + 1] = Math.random() * height
    return arr
  }, [height])

  useFrame((state, delta) => {
    const pos = points.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < STEAM_COUNT; i++) {
      pos[i * 3 + 1] += delta * (0.25 + seeds[i] * 0.3)
      if (pos[i * 3 + 1] > height) pos[i * 3 + 1] = 0
      const y = pos[i * 3 + 1]
      pos[i * 3] = Math.sin(y * 4 + seeds[i] * 9 + state.clock.elapsedTime * 0.8) * 0.09 * (0.4 + y / height)
      pos[i * 3 + 2] = Math.cos(y * 3.2 + seeds[i] * 7) * 0.06
    }
    points.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.09} color="#cfd8e6" transparent opacity={0.4} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

/** Marmite à soupe : corps, rebord, anses, soupe émissive et vapeur */
function SoupPot() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.45, 0.42, 0.5, 28]} />
        <meshStandardMaterial color="#8c2f1b" roughness={0.45} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.035, 10, 36]} />
        <meshStandardMaterial color="#b8472a" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* soupe qui mijote */}
      <mesh position={[0, 0.235, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 28]} />
        <meshStandardMaterial color="#ffaa33" emissive="#ff7b1a" emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      {/* anses */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.47, 0.05, 0]} rotation={[0, 0, (side * Math.PI) / 2]}>
          <torusGeometry args={[0.09, 0.025, 8, 20, Math.PI]} />
          <meshStandardMaterial color="#3a2018" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      <group position={[0, 0.3, 0]}>
        <Steam />
      </group>
    </group>
  )
}

/** Poêle, avec option flammes (pour le TRY → FAIL du chapitre empirique) */
function FryingPan({ flames = false }: { flames?: boolean }) {
  const fire = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (!fire.current) return
    fire.current.children.forEach((flame, i) => {
      const s = 0.8 + Math.sin(state.clock.elapsedTime * 7 + i * 2.4) * 0.25
      flame.scale.set(s, 1.1 + Math.sin(state.clock.elapsedTime * 9 + i) * 0.3, s)
    })
  })

  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.42, 0.38, 0.12, 28]} />
        <meshStandardMaterial color="#2b2b30" roughness={0.35} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.062, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.36, 28]} />
        <meshStandardMaterial color="#15151a" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* manche */}
      <mesh position={[0.62, 0.03, 0]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[0.5, 0.06, 0.09]} />
        <meshStandardMaterial color="#1d1d22" roughness={0.5} metalness={0.5} />
      </mesh>
      {flames && (
        <group ref={fire} position={[0, 0.12, 0]}>
          {[-0.16, 0.02, 0.18].map((x, i) => (
            <mesh key={i} position={[x, 0.12, (i - 1) * 0.08]}>
              <coneGeometry args={[0.09, 0.3, 8]} />
              <meshStandardMaterial
                color={i === 1 ? '#ffd700' : '#ff6b1a'}
                emissive={i === 1 ? '#ffb700' : '#ff4500'}
                emissiveIntensity={2.2}
                toneMapped={false}
                transparent
                opacity={0.9}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

/** Pile d'assiettes légèrement désaxées */
function PlateStack() {
  const offsets = useMemo(() => Array.from({ length: 4 }, (_, i) => ({ x: (i % 2) * 0.03 - 0.015, r: i * 0.4 })), [])
  return (
    <group>
      {offsets.map((offset, i) => (
        <mesh key={i} position={[offset.x, i * 0.085, 0]} rotation={[0, offset.r, 0]}>
          <cylinderGeometry args={[0.38, 0.3, 0.07, 28]} />
          <meshStandardMaterial color="#e8e2d6" roughness={0.35} metalness={0.05} />
        </mesh>
      ))}
    </group>
  )
}

/** Cloche de service dorée — les « commandes » d'Overcooked */
function Cloche() {
  return (
    <group>
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.5, 0.52, 0.06, 32]} />
        <meshStandardMaterial color="#d9cdb8" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.44, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ffd700" emissive="#c98a1b" emissiveIntensity={0.35} roughness={0.25} metalness={0.75} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.07, 14, 14]} />
        <meshStandardMaterial color="#fff1c4" emissive="#ffb700" emissiveIntensity={0.8} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Cuillère en bois */
function WoodenSpoon() {
  return (
    <group rotation={[0, 0, 0.6]}>
      <mesh>
        <cylinderGeometry args={[0.035, 0.045, 0.85, 12]} />
        <meshStandardMaterial color="#9a6b3f" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.5, 0]} scale={[1, 1.35, 0.55]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#a87848" roughness={0.75} />
      </mesh>
    </group>
  )
}

/* ───────────────────────── assemblage par slide ───────────────────────── */

type PropKind = 'pot' | 'pan' | 'panFire' | 'plates' | 'cloche' | 'spoon'

const PROP: Record<PropKind, () => ReactElement> = {
  pot: () => <SoupPot />,
  pan: () => <FryingPan />,
  panFire: () => <FryingPan flames />,
  plates: () => <PlateStack />,
  cloche: () => <Cloche />,
  spoon: () => <WoodenSpoon />,
}

interface Placement {
  slide: number
  kind: PropKind
  pos: [number, number, number]
  scale?: number
  rotY?: number
}

/** Positions réglées à la main, à l'écart des cartes texte et des décors existants */
const PLACEMENTS: Placement[] = [
  // 1 — héro : poêle et cuillère encadrent le titre, en bas du cadre
  { slide: 0, kind: 'pan', pos: [-4.3, -1.1, -2], rotY: 0.6, scale: 1.1 },
  { slide: 0, kind: 'spoon', pos: [4.4, -0.9, -2.5], rotY: -0.4 },
  // 2 — what is Overcooked : la vignette jeu (ZoneHero) occupe la gauche ; assiettes à droite
  { slide: 1, kind: 'plates', pos: [4.3, -1.2, -2.5] },
  // 3 — soupe à l'oignon : la marmite mijote sous l'oignon
  { slide: 2, kind: 'pot', pos: [-4.6, -1.2, -1], scale: 1.15 },
  // 4 — good game : cloche de service + assiettes
  { slide: 3, kind: 'cloche', pos: [-4.2, -1, -2] },
  { slide: 3, kind: 'plates', pos: [4.3, -1.1, -2.5] },
  // 5 — better team : poêle sur le poste « avant », marmite sur le poste « après »
  // (postes alignés à droite, la carte texte occupant la gauche)
  { slide: 4, kind: 'pan', pos: [2.2, -1.92, 1.0], scale: 0.85, rotY: 2.6 },
  { slide: 4, kind: 'pot', pos: [4.4, 0.62, -1], scale: 0.85 },
  // 6 — yeah : cloche levée + cuillère
  { slide: 5, kind: 'cloche', pos: [4.3, -1, -2] },
  { slide: 5, kind: 'spoon', pos: [-4.4, -0.7, -3], rotY: 0.8 },
  // 7 — back to work : ustensiles posés de part et d'autre
  { slide: 6, kind: 'pan', pos: [4.5, -1, -2], rotY: -0.5 },
  { slide: 6, kind: 'spoon', pos: [-4.6, -1.1, -2], rotY: 1.2 },
  // 8 — empirique : la poêle en feu, TRY → FAIL !
  { slide: 7, kind: 'panFire', pos: [4.5, -1.2, -1.5], scale: 1.2, rotY: -0.3 },
  // 9 — brigade : la marmite du service + assiettes prêtes
  { slide: 8, kind: 'plates', pos: [-4.5, -1.1, -2] },
  { slide: 8, kind: 'pot', pos: [-5, 1.8, -4.5], scale: 0.8 },
  // 10 — backlog : la cloche des commandes
  { slide: 9, kind: 'cloche', pos: [-4.6, -1.2, -1.5], scale: 1.1 },
  // 11 — user story : assiettes à dresser
  { slide: 10, kind: 'plates', pos: [4.4, -1.2, -2] },
  { slide: 10, kind: 'spoon', pos: [-4.7, -0.9, -3], rotY: 0.5 },
  // 12 — mapping Overcooked↔Scrum : marmite côté cuisine
  { slide: 11, kind: 'pot', pos: [4.6, -1.2, -2], scale: 0.95 },
  // 13 — frameworks : poêle + cloche, dernière escale cuisine avant l'IA
  { slide: 12, kind: 'pan', pos: [-4.5, -1.1, -2], rotY: 0.4 },
  { slide: 12, kind: 'cloche', pos: [4.5, -1.3, -3], scale: 0.9 },
]

export function KitchenDetails() {
  return (
    <>
      {PLACEMENTS.map((placement, i) => (
        <SlideFade key={i} from={placement.slide}>
          <group position={[0, 0, slideZ(placement.slide)]}>
            <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.25}>
              <group position={placement.pos} scale={placement.scale ?? 1} rotation={[0, placement.rotY ?? 0, 0]}>
                {PROP[placement.kind]()}
              </group>
            </Float>
          </group>
        </SlideFade>
      ))}
    </>
  )
}
