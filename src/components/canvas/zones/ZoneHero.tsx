import { Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { SLIDE_SPACING } from '../../../content/slides.fr'
import { SlideFade } from '../SlideFade'

/**
 * Toque de chef modelée : bandeau cylindrique cerclé d'un liseré doré,
 * bouffant en grappe de sphères — lisible au premier regard, rotation lente.
 */
function NeonToque() {
  const group = useRef<THREE.Group>(null!)
  const PUFFS = 6

  useFrame((state, delta) => {
    group.current.rotation.y += delta * 0.35
    group.current.position.y = 3.3 + Math.sin(state.clock.elapsedTime * 1.2) * 0.12
  })

  return (
    <group ref={group} position={[0, 3.3, -3]} scale={1.25} rotation={[0.12, 0, -0.06]}>
      {/* bandeau */}
      <mesh>
        <cylinderGeometry args={[0.52, 0.56, 0.5, 40]} />
        <meshStandardMaterial color="#f4ede2" emissive="#ff9a4d" emissiveIntensity={0.12} roughness={0.55} />
      </mesh>
      {/* liserés dorés haut et bas du bandeau */}
      <mesh position={[0, -0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.56, 0.035, 12, 48]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffb700" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.53, 0.022, 12, 48]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffb700" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      {/* bouffant : couronne de sphères + dôme central */}
      {Array.from({ length: PUFFS }, (_, i) => {
        const a = (i / PUFFS) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.38, 0.52, Math.sin(a) * 0.38]} scale={[1, 0.92, 1]}>
            <sphereGeometry args={[0.3, 20, 20]} />
            <meshStandardMaterial color="#fbf6ec" emissive="#ff9a4d" emissiveIntensity={0.1} roughness={0.5} />
          </mesh>
        )
      })}
      <mesh position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.4, 24, 24]} />
        <meshStandardMaterial color="#fffaf2" emissive="#ff9a4d" emissiveIntensity={0.12} roughness={0.45} />
      </mesh>
    </group>
  )
}

/** Manette de jeu stylisée : corps, poignées, boutons colorés, croix directionnelle */
function Gamepad() {
  const group = useRef<THREE.Group>(null!)

  useFrame((state, delta) => {
    group.current.rotation.y += delta * 0.3
    group.current.rotation.x = 0.35 + Math.sin(state.clock.elapsedTime * 0.9) * 0.08
  })

  const BUTTONS: { pos: [number, number]; color: string }[] = [
    { pos: [0.42, 0.1], color: '#32ff7e' },
    { pos: [0.58, 0], color: '#ff2d55' },
    { pos: [0.42, -0.1], color: '#00e5ff' },
    { pos: [0.26, 0], color: '#ffd700' },
  ]

  return (
    <group ref={group} rotation={[0.35, 0, 0]}>
      {/* corps */}
      <mesh>
        <boxGeometry args={[1.5, 0.16, 0.6]} />
        <meshStandardMaterial color="#23232c" roughness={0.45} metalness={0.3} />
      </mesh>
      {/* poignées */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.62, -0.05, 0.32]} rotation={[0.5, 0, side * -0.25]}>
          <capsuleGeometry args={[0.16, 0.34, 6, 14]} />
          <meshStandardMaterial color="#1b1b22" roughness={0.5} metalness={0.25} />
        </mesh>
      ))}
      {/* boutons façade */}
      {BUTTONS.map((button, i) => (
        <mesh key={i} position={[button.pos[0], 0.1, button.pos[1]]}>
          <cylinderGeometry args={[0.055, 0.055, 0.05, 14]} />
          <meshStandardMaterial color={button.color} emissive={button.color} emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      ))}
      {/* croix directionnelle */}
      <mesh position={[-0.42, 0.1, 0]}>
        <boxGeometry args={[0.26, 0.05, 0.09]} />
        <meshStandardMaterial color="#3a3a46" roughness={0.4} />
      </mesh>
      <mesh position={[-0.42, 0.1, 0]}>
        <boxGeometry args={[0.09, 0.05, 0.26]} />
        <meshStandardMaterial color="#3a3a46" roughness={0.4} />
      </mesh>
    </group>
  )
}

/** Ticket de commande façon file d'attente du jeu : carte + pastille « plat » */
function OrderTicket({ color, offset }: { color: string; offset: number }) {
  const group = useRef<THREE.Group>(null!)

  useFrame((state) => {
    group.current.position.y = Math.sin(state.clock.elapsedTime * 1.3 + offset * 2.2) * 0.07
    group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.9 + offset) * 0.05
  })

  return (
    <group ref={group}>
      <mesh>
        <boxGeometry args={[0.42, 0.55, 0.03]} />
        <meshStandardMaterial color="#efe7d8" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.08, 0.025]}>
        <cylinderGeometry args={[0.12, 0.12, 0.02, 18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.14, 0.025]}>
        <boxGeometry args={[0.26, 0.035, 0.01]} />
        <meshStandardMaterial color="#9a9285" />
      </mesh>
    </group>
  )
}

/**
 * Vignette « jeu de cuisine » du slide 2 : plan de travail avec planche à
 * découper et légumes taillés, manette flottante au-dessus, file de tickets
 * de commande — le « What is Overcooked ? » incarné.
 */
function GameKitchenVignette() {
  const VEGGIES: { pos: [number, number, number]; color: string }[] = [
    { pos: [-0.16, 0.06, 0.05], color: '#ff8c42' },
    { pos: [-0.04, 0.06, -0.08], color: '#ff8c42' },
    { pos: [0.1, 0.06, 0.08], color: '#32ff7e' },
    { pos: [0.2, 0.06, -0.04], color: '#32ff7e' },
    { pos: [0.02, 0.06, 0.14], color: '#ffd166' },
  ]

  return (
    <group>
      {/* plan de travail damier */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[2.4, 0.8, 1.5]} />
        <meshStandardMaterial color="#5a3a22" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 1.5]} />
        <meshStandardMaterial color="#d9cdb8" roughness={0.5} />
      </mesh>
      {/* planche à découper + légumes taillés */}
      <group position={[-0.55, 0.05, 0.15]} rotation={[0, 0.3, 0]}>
        <mesh>
          <cylinderGeometry args={[0.45, 0.45, 0.06, 24]} />
          <meshStandardMaterial color="#a87848" roughness={0.75} />
        </mesh>
        {VEGGIES.map((veg, i) => (
          <mesh key={i} position={veg.pos} rotation={[0.3 * i, i, 0]}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial color={veg.color} emissive={veg.color} emissiveIntensity={0.35} roughness={0.5} />
          </mesh>
        ))}
      </group>
      {/* petite casserole posée à droite du plan */}
      <group position={[0.75, 0.16, -0.25]} scale={0.42}>
        <mesh>
          <cylinderGeometry args={[0.45, 0.42, 0.5, 24]} />
          <meshStandardMaterial color="#8c2f1b" roughness={0.45} metalness={0.25} />
        </mesh>
        <mesh position={[0, 0.235, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.4, 24]} />
          <meshStandardMaterial color="#ffaa33" emissive="#ff7b1a" emissiveIntensity={0.9} toneMapped={false} />
        </mesh>
      </group>
      {/* manette flottante au-dessus du poste */}
      <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.45}>
        <group position={[0, 1.5, 0.2]} scale={0.9}>
          <Gamepad />
        </group>
      </Float>
      {/* file de commandes au-dessus, comme en haut de l'écran du jeu */}
      <group position={[0, 2.8, -0.3]}>
        {['#ff8c42', '#32ff7e', '#ffd166'].map((color, i) => (
          <group key={i} position={[(i - 1) * 0.55, 0, i * -0.05]} rotation={[0, 0, (i - 1) * 0.06]}>
            <OrderTicket color={color} offset={i} />
          </group>
        ))}
      </group>
      <pointLight position={[0, 2, 2]} intensity={12} color="#ffb780" />
    </group>
  )
}

export function ZoneHero() {
  return (
    <>
      <SlideFade from={0} to={1}>
        {/* le titre est porté par l'overlay DOM ; la 3D fournit la toque (les braises sont globales) */}
        <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.4}>
          <NeonToque />
        </Float>
        <pointLight position={[0, 2, 2]} intensity={30} color="#ff6b1a" />
      </SlideFade>
      {/* slide 2 (carte à droite) : la vignette jeu de cuisine remplit la gauche */}
      <SlideFade from={1}>
        <group position={[-3.1, 0.1, -SLIDE_SPACING]} rotation={[0, 0.35, 0]}>
          <GameKitchenVignette />
        </group>
      </SlideFade>
    </>
  )
}
