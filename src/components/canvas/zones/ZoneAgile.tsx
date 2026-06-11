import { Edges, Float, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { SLIDE_SPACING } from '../../../content/slides.fr'
import { SlideFade } from '../SlideFade'

/** Cycle empirique TRY → FAIL → LEARN → REPEAT en orbite continue */
function EmpiricalCycle(props: { position: [number, number, number] }) {
  const group = useRef<THREE.Group>(null!)
  const steps = ['TRY', 'FAIL', 'LEARN', 'REPEAT']
  const colors = ['#00e5ff', '#ff2d55', '#ffd700', '#32ff7e']

  useFrame((_, delta) => {
    group.current.rotation.y += delta * 0.35
  })

  return (
    <group position={props.position}>
      <group ref={group}>
        {steps.map((step, i) => {
          const angle = (i / steps.length) * Math.PI * 2
          return (
            <group key={step} position={[Math.cos(angle) * 2.1, 0, Math.sin(angle) * 2.1]}>
              <Text fontSize={0.42} color={colors[i]} anchorX="center" anchorY="middle" rotation={[0, -angle + Math.PI / 2, 0]}>
                {step}
              </Text>
            </group>
          )
        })}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.1, 0.015, 12, 128]} />
          <meshStandardMaterial color="#ff6b1a" emissive="#ff6b1a" emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      </group>
      <mesh>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial color="#ff6b1a" emissive="#ff4500" emissiveIntensity={1.6} toneMapped={false} flatShading />
      </mesh>
    </group>
  )
}

/** Les trois panneaux de la brigade Scrum : PO (bleu), SM (rose), Team (vert) */
function Brigade(props: { position: [number, number, number] }) {
  const roles = [
    { label: 'PRODUCT OWNER', sub: 'WHAT & WHY', color: '#60a5fa', x: -2.4 },
    { label: 'SCRUM MASTER', sub: 'COACH', color: '#ec4899', x: 0 },
    { label: 'DELIVERY TEAM', sub: 'HOW', color: '#32ff7e', x: 2.4 },
  ]

  return (
    <group position={props.position}>
      {roles.map((role, i) => (
        <Float key={role.label} speed={1.3 + i * 0.2} rotationIntensity={0.12} floatIntensity={0.4}>
          <group position={[role.x, 0, i === 1 ? -0.6 : 0]}>
            <mesh>
              <boxGeometry args={[1.9, 2.5, 0.12]} />
              <meshStandardMaterial color={role.color} transparent opacity={0.16} metalness={0.3} roughness={0.2} />
              <Edges scale={1.01} color={role.color} />
            </mesh>
            <Text position={[0, 0.45, 0.1]} fontSize={0.22} color={role.color} anchorX="center" maxWidth={1.7} textAlign="center">
              {role.label}
            </Text>
            <Text position={[0, -0.15, 0.1]} fontSize={0.14} color="#ffffff" anchorX="center" letterSpacing={0.2}>
              {role.sub}
            </Text>
          </group>
        </Float>
      ))}
    </group>
  )
}

/** Tickets de commande dorés dérivant — le backlog priorisé */
function OrderTickets(props: { position: [number, number, number] }) {
  const group = useRef<THREE.Group>(null!)

  useFrame((state, delta) => {
    group.current.rotation.y += delta * 0.12
    group.current.children.forEach((child, i) => {
      child.position.y = Math.sin(state.clock.elapsedTime * 0.8 + i * 1.3) * 0.4
    })
  })

  return (
    <group position={props.position} ref={group}>
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const r = 2 + (i % 3) * 0.7
        return (
          <mesh key={i} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]} rotation={[0, -angle, 0.06]}>
            <boxGeometry args={[0.7, 0.95, 0.02]} />
            <meshStandardMaterial
              color="#ffd700"
              emissive="#c98a1b"
              emissiveIntensity={i === 0 ? 1.4 : 0.3}
              transparent
              opacity={0.92}
            />
          </mesh>
        )
      })}
    </group>
  )
}

/**
 * Zone Agilité (slides 7 à 13) : cycle empirique, brigade Scrum,
 * tickets de backlog — un décor par grappe de slides.
 */
export function ZoneAgile() {
  const z = (slideOffset: number) => -slideOffset * SLIDE_SPACING

  return (
    <group>
      {/* slides 7-8 — back to work / approche empirique (carte à droite → décor à gauche) */}
      <SlideFade from={6} to={7}>
        <group position={[-3.2, 0.9, z(1)]} scale={0.8}>
          <EmpiricalCycle position={[0, 0, 0]} />
        </group>
      </SlideFade>
      {/* slide 9 — la brigade (carte à gauche → décor décalé à droite) */}
      <SlideFade from={8}>
        <group position={[4.2, 0.8, z(2)]} scale={0.62}>
          <Brigade position={[0, 0, 0]} />
        </group>
      </SlideFade>
      {/* slides 10-11 — backlog + user story (cartes alternées → anneau décalé à gauche) */}
      <SlideFade from={9} to={10}>
        <group position={[-2.2, 0.9, z(3.5)]} scale={0.8}>
          <OrderTickets position={[0, 0, 0]} />
        </group>
      </SlideFade>
      {/* slides 12-13 — mappings : duo de tores entrelacés Overcooked/Scrum */}
      <SlideFade from={11} to={12}>
        <group position={[-2.6, 0.9, z(5.5)]} scale={0.8}>
        <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.4}>
          <mesh rotation={[0.6, 0, 0]}>
            <torusGeometry args={[1.3, 0.07, 16, 96]} />
            <meshStandardMaterial color="#ff6b1a" emissive="#ff6b1a" emissiveIntensity={1.3} toneMapped={false} />
          </mesh>
          <mesh rotation={[0.6, Math.PI / 2, 0]} position={[0.9, 0, 0]}>
            <torusGeometry args={[1.3, 0.07, 16, 96]} />
            <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.3} toneMapped={false} />
          </mesh>
        </Float>
        </group>
      </SlideFade>
    </group>
  )
}
