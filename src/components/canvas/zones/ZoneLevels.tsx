import { Edges, Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { SLIDE_SPACING } from '../../../content/slides.fr'
import { prefersReducedMotion } from '../../../store'
import { SlideFade } from '../SlideFade'
import { Text } from '../Text3D'

const dummy = new THREE.Object3D()
const voxelColor = new THREE.Color()

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

  useFrame((state) => {
    // l'aiguille tic-taque de graduation en graduation (12 pas/tour) avec un
    // micro-rebond easeOutBack — un VRAI minuteur de cuisine
    const t = state.clock.elapsedTime
    if (prefersReducedMotion) {
      hand.current.rotation.z = -t * 0.8
    } else {
      const sec = Math.floor(t)
      const k = Math.min(1, (t - sec) * 6)
      const back = 1 + 2.70158 * Math.pow(k - 1, 3) + 1.70158 * Math.pow(k - 1, 2)
      hand.current.rotation.z = -(sec + back) * (Math.PI / 6)
    }
    const mat = ring.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 1.3 + Math.sin(t * 3) * 0.4
  })

  return (
    <Float speed={1.4} rotationIntensity={0.12} floatIntensity={0.4}>
      <group position={props.position}>
        {/* cadran */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.85, 0.85, 0.3, 48]} />
          <meshStandardMaterial color="#2a1620" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* graduations : 12 index, les quarts plus marqués */}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.sin(a) * 0.7, Math.cos(a) * 0.7, 0.17]} rotation={[0, 0, -a]}>
              <boxGeometry args={[0.035, i % 3 === 0 ? 0.14 : 0.08, 0.025]} />
              <meshStandardMaterial color="#f4ede2" emissive={props.color} emissiveIntensity={0.5} toneMapped={false} />
            </mesh>
          )
        })}
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

/** Géométrie d'étoile à 5 branches extrudée — partagée (score, pluie du final, ticket prioritaire) */
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

/* ─────────────── Micro-disruption arcade : bascule d'acte 2 → 3 ───────────────
   On entre dans le jeu : un essaim de voxels aux couleurs d'Overcooked
   tourbillonne dans le couloir caméra (rotations crantées par quarts de
   tour, esprit 8-bit) pendant que l'image se pixelise (Effects).
   Hors SlideFade — n'existe QU'ENTRE les slides 2 et 3. */

const VOXEL_COUNT = 40
const VOXEL_PALETTE = ['#ff6b1a', '#ffd700', '#32ff7e', '#00e5ff', '#ff2d55']

function VoxelSwarm() {
  const root = useRef<THREE.Group>(null!)
  const mesh = useRef<THREE.InstancedMesh>(null!)
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0 }), [])
  // distribution déterministe en angle d'or le long du couloir
  const seeds = useMemo(
    () =>
      Array.from({ length: VOXEL_COUNT }, (_, i) => ({
        theta: i * 2.39996,
        radius: 1.9 + (i % 4) * 0.55,
        z: -13 + (i * 26) / VOXEL_COUNT,
        speed: 0.3 + (i % 3) * 0.15,
        scale: 0.14 + ((i * 31) % 7) / 40,
      })),
    [],
  )

  useLayoutEffect(() => {
    for (let i = 0; i < VOXEL_COUNT; i++) {
      voxelColor.set(VOXEL_PALETTE[i % VOXEL_PALETTE.length])
      mesh.current.setColorAt(i, voxelColor)
    }
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  }, [])

  useFrame(({ camera, clock }) => {
    const p = (9 - camera.position.z) / SLIDE_SPACING
    const t = Math.max(0, 1 - Math.abs((p - 1.5) / 0.45))
    const k = t * t * (3 - 2 * t)
    root.current.visible = k > 0.02
    mat.opacity = 0.95 * k
    if (!root.current.visible) return
    const now = clock.elapsedTime
    for (let i = 0; i < VOXEL_COUNT; i++) {
      const seed = seeds[i]
      const theta = seed.theta + now * seed.speed
      // rotation crantée par quarts de tour — l'esprit 8-bit
      const step = (Math.floor(now * 2 + i) % 4) * (Math.PI / 2)
      dummy.position.set(Math.cos(theta) * seed.radius, Math.sin(theta) * seed.radius, seed.z)
      dummy.rotation.set(step, step * 0.5, 0)
      dummy.scale.setScalar(seed.scale)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  })

  // axe du couloir : milieu du rail 2 → 3 (x ≈ 2, y ≈ 1,5, z local +22)
  return (
    <group ref={root} position={[2, 1.5, 22]} visible={false}>
      <instancedMesh ref={mesh} args={[undefined, undefined, VOXEL_COUNT]} material={mat} frustumCulled={false}>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
      </instancedMesh>
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
      {/* micro-disruption arcade de la bascule 2 → 3 — hors SlideFade,
          son opacité est pilotée par la position caméra */}
      <VoxelSwarm />
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
          {/* poste « avant » : bois brut, liseré rouge — le chaos individuel.
              y remonté : à -2,7 le poste sortait du cadre par le bas (fov 45) */}
          <mesh position={[2.2, -1.9, 1.0]}>
            <boxGeometry args={[1.3, 0.7, 1.3]} />
            <meshStandardMaterial color="#5a2d12" roughness={0.6} />
            <Edges scale={1.01} color="#ff2d55" />
          </mesh>
          {/* poste « après » : net, liseré vert, plan de travail propre
              (légèrement plus petit et surélevé que la face du box, sinon z-fight) */}
          <mesh position={[4.4, -0.2, -1]}>
            <boxGeometry args={[1.4, 0.7, 1.4]} />
            <meshStandardMaterial color="#14342a" emissive="#32ff7e" emissiveIntensity={0.12} roughness={0.4} />
            <Edges scale={1.01} color="#32ff7e" />
          </mesh>
          <mesh position={[4.4, 0.165, -1]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.32, 1.32]} />
            <meshStandardMaterial color="#d9cdb8" roughness={0.5} />
          </mesh>
          {/* labels plaqués sur les faces avant : le propos se lit sans la carte */}
          <Text position={[2.2, -1.9, 1.66]} fontSize={0.26} color="#ff2d55" anchorX="center" anchorY="middle" letterSpacing={0.12}>
            AVANT
          </Text>
          <Text position={[4.4, -0.2, -0.28]} fontSize={0.26} color="#32ff7e" anchorX="center" anchorY="middle" letterSpacing={0.12}>
            APRÈS
          </Text>
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
