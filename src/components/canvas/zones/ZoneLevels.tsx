import { Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { SLIDE_SPACING } from '../../../content/slides.fr'
import { SlideFade } from '../SlideFade'

/** Oignon stylisé : sphère aplatie dorée + tige — héros du niveau 1-1 */
function Onion(props: { position: [number, number, number] }) {
  const group = useRef<THREE.Group>(null!)

  useFrame((state, delta) => {
    group.current.rotation.y += delta * 0.5
    group.current.position.y = props.position[1] + Math.sin(state.clock.elapsedTime * 1.4) * 0.15
  })

  return (
    <group ref={group} position={props.position}>
      <mesh scale={[1, 0.85, 1]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#ffd166" emissive="#c98a1b" emissiveIntensity={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.72, 0]} rotation={[0, 0, 0.18]}>
        <coneGeometry args={[0.1, 0.5, 12]} />
        <meshStandardMaterial color="#32ff7e" emissive="#1a8c45" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

/**
 * Minuteur de cuisine 3D : cadran complet (cylindre) cerclé d'un anneau néon
 * entier, bouton-poussoir au sommet et aiguille qui tourne — formes pleines,
 * sans glyphe texte.
 */
function KitchenTimer(props: { position: [number, number, number]; color: string }) {
  const hand = useRef<THREE.Group>(null!)
  const ring = useRef<THREE.Mesh>(null!)

  useFrame((state, delta) => {
    hand.current.rotation.z -= delta * 0.8
    const mat = ring.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 1.3 + Math.sin(state.clock.elapsedTime * 3) * 0.4
  })

  return (
    <Float speed={1.4} rotationIntensity={0.12} floatIntensity={0.4}>
      <group position={props.position}>
        {/* cadran */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.85, 0.85, 0.3, 48]} />
          <meshStandardMaterial color="#160a10" metalness={0.5} roughness={0.35} />
        </mesh>
        {/* anneau néon COMPLET autour du cadran */}
        <mesh ref={ring}>
          <torusGeometry args={[0.95, 0.06, 16, 96]} />
          <meshStandardMaterial color={props.color} emissive={props.color} emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
        {/* aiguille : pivote autour du centre du cadran */}
        <group ref={hand} position={[0, 0, 0.18]}>
          <mesh position={[0, 0.28, 0]}>
            <boxGeometry args={[0.07, 0.56, 0.04]} />
            <meshStandardMaterial color="#ffffff" emissive={props.color} emissiveIntensity={1} toneMapped={false} />
          </mesh>
        </group>
        {/* axe central */}
        <mesh position={[0, 0, 0.2]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color={props.color} emissive={props.color} emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
        {/* bouton-poussoir au sommet */}
        <mesh position={[0, 1.12, 0]}>
          <cylinderGeometry args={[0.14, 0.18, 0.22, 24]} />
          <meshStandardMaterial color={props.color} emissive={props.color} emissiveIntensity={0.9} toneMapped={false} />
        </mesh>
      </group>
    </Float>
  )
}

/** Géométrie d'étoile à 5 branches extrudée — partagée (score + pluie du final) */
export const starGeometry = (() => {
  const shape = new THREE.Shape()
  const outer = 0.32
  const inner = 0.13
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  shape.closePath()
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 })
  geometry.center()
  return geometry
})()

/** Étoiles de score 3D (formes extrudées) tournoyant au-dessus des slides résultat */
function StarBurst(props: { position: [number, number, number]; count: number }) {
  const group = useRef<THREE.Group>(null!)

  useFrame((_, delta) => {
    group.current.rotation.y += delta * 0.6
  })

  const angles = useMemo(() => Array.from({ length: props.count }, (_, i) => (i / props.count) * Math.PI * 2), [props.count])

  return (
    <group ref={group} position={props.position}>
      {angles.map((angle, i) => (
        <mesh
          key={i}
          geometry={starGeometry}
          position={[Math.cos(angle) * 1.6, Math.sin(i * 2.1) * 0.25, Math.sin(angle) * 1.6]}
          rotation={[0, -angle + Math.PI / 2, 0]}
          scale={1.4}>
          <meshStandardMaterial color="#ffd700" emissive="#ffb700" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Zone des niveaux Overcooked (slides 3 à 6) : oignon du niveau 1-1,
 * minuteurs de cuisine, étoiles de score — un décor par slide le long du rail.
 */
export function ZoneLevels() {
  const z = (slideOffset: number) => -slideOffset * SLIDE_SPACING

  return (
    <group>
      {/* slide 3 — Soupe à l'oignon (le contenu DOM est centré : décor sur les côtés) */}
      <SlideFade from={2}>
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <Onion position={[-3.2, 0.9, z(0)]} />
        </Float>
        <KitchenTimer position={[3.2, 1.1, z(0) - 1]} color="#32ff7e" />
      </SlideFade>

      {/* slide 4 — Good game : 3 étoiles bien au-dessus de la carte, en retrait */}
      <SlideFade from={3}>
        <StarBurst position={[0, 4.4, z(1) - 3]} count={3} />
      </SlideFade>

      {/* slide 5 — Better team : la carte texte occupe la gauche, les deux
          postes de cuisine « avant/après » s'alignent donc à droite, chrono
          au-dessus pour que tout reste dégagé */}
      <SlideFade from={4}>
        <group position={[0, 0.4, z(2)]}>
          {/* trois îlots bien séparés en diagonale : chrono haut-centre-droit,
              poste « après » à droite, poste « avant » en bas au centre */}
          <mesh position={[2.2, -2.7, 1.0]}>
            <boxGeometry args={[1.3, 0.7, 1.3]} />
            <meshStandardMaterial color="#3a1505" roughness={0.6} />
          </mesh>
          <mesh position={[4.4, -0.2, -1]}>
            <boxGeometry args={[1.4, 0.7, 1.4]} />
            <meshStandardMaterial color="#0c4a3e" emissive="#32ff7e" emissiveIntensity={0.25} roughness={0.4} />
          </mesh>
          <KitchenTimer position={[2.4, 2.5, -1]} color="#ffd700" />
        </group>
      </SlideFade>

      {/* slide 6 — Yeah : 4 étoiles */}
      <SlideFade from={5}>
        <StarBurst position={[0, 4.4, z(3) - 3]} count={4} />
      </SlideFade>
    </group>
  )
}
