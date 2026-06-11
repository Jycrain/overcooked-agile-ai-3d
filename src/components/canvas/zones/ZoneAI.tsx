import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { SLIDE_SPACING } from '../../../content/slides.fr'
import { SlideFade } from '../SlideFade'

/** Sol-circuit cyan : une grille luminescente qui pulse */
function CircuitFloor(props: { position: [number, number, number] }) {
  const grid = useRef<THREE.GridHelper>(null!)

  useFrame((state) => {
    const mat = grid.current.material as THREE.Material & { opacity: number }
    mat.opacity = 0.18 + Math.sin(state.clock.elapsedTime * 1.5) * 0.08
  })

  return (
    <gridHelper
      ref={grid}
      args={[60, 40, '#00e5ff', '#0a3a44']}
      position={props.position}
      material-transparent={true}
      material-opacity={0.2}
    />
  )
}

/** Pluie de données : points cyan descendant lentement */
function DataRain(props: { position: [number, number, number] }) {
  const points = useRef<THREE.Points>(null!)
  const COUNT = 700
  const data = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 26
      positions[i * 3 + 1] = Math.random() * 12 - 3
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50
    }
    return positions
  }, [])

  useFrame((_, delta) => {
    const pos = points.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 1] -= delta * (0.5 + (i % 5) * 0.2)
      if (pos[i * 3 + 1] < -3) pos[i * 3 + 1] = 9
    }
    points.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={points} position={props.position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#00e5ff" transparent opacity={0.7} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

/** Cœur IA : icosaèdre wireframe + noyau pulsant */
function AICore(props: { position: [number, number, number] }) {
  const outer = useRef<THREE.Mesh>(null!)
  const inner = useRef<THREE.Mesh>(null!)

  useFrame((state, delta) => {
    outer.current.rotation.y += delta * 0.3
    outer.current.rotation.x += delta * 0.12
    inner.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2.4) * 0.12)
  })

  return (
    <group position={props.position}>
      <mesh ref={outer}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshStandardMaterial color="#00e5ff" wireframe emissive="#00e5ff" emissiveIntensity={1.1} toneMapped={false} />
      </mesh>
      <mesh ref={inner}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial color="#ffffff" emissive="#00b8d4" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
    </group>
  )
}

/**
 * Zone IA (slides 14 à 17) : bascule d'ambiance — grille-circuit,
 * pluie de données, cœur IA wireframe.
 */
export function ZoneAI() {
  const z = (slideOffset: number) => -slideOffset * SLIDE_SPACING

  return (
    <group>
      {/* ambiance d'acte : grille-circuit + pluie de données sur les slides 14-17 */}
      <SlideFade from={13} to={16}>
        <CircuitFloor position={[0, -2.2, z(1.5)]} />
        <DataRain position={[0, 0, z(1.5)]} />
      </SlideFade>
      {/* la carte du slide 14 est centrée : le cœur IA plane au-dessus d'elle */}
      <SlideFade from={13}>
        <AICore position={[0, 3.2, z(0) - 2]} />
      </SlideFade>
      {/* slide 15 : satellites-outils en orbite, sur le côté droit (carte à gauche).
          Placé PILE sur le slide 15 — pas entre deux slides, sinon la caméra
          finit par le traverser en plein écran au slide suivant. */}
      <SlideFade from={14}>
        <group position={[2.9, 1, z(1)]} scale={0.85}>
          <OrbitTools />
        </group>
      </SlideFade>
    </group>
  )
}

/** Quatre satellites (Code, Planning, Collab, Testing) en orbite */
export function OrbitTools() {
  const group = useRef<THREE.Group>(null!)
  const labels = ['CODE', 'PLANNING', 'COLLAB', 'TESTING']

  useFrame((_, delta) => {
    group.current.rotation.y += delta * 0.4
  })

  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.4, 24, 24]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      <group ref={group}>
        {labels.map((label, i) => {
          const angle = (i / labels.length) * Math.PI * 2
          return (
            <group key={label} position={[Math.cos(angle) * 2, Math.sin(i * 1.7) * 0.3, Math.sin(angle) * 2]}>
              <mesh>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="#0a3a44" emissive="#00e5ff" emissiveIntensity={0.5} metalness={0.5} roughness={0.3} />
              </mesh>
              <Text position={[0, 0.55, 0]} fontSize={0.16} color="#00e5ff" anchorX="center" letterSpacing={0.12}>
                {label}
              </Text>
            </group>
          )
        })}
      </group>
    </group>
  )
}
