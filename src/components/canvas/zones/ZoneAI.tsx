import { Edges, Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { SLIDE_SPACING } from '../../../content/slides.fr'
import { SlideFade } from '../SlideFade'
import { Text } from '../Text3D'

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

/** Les quatre cérémonies Scrum en carrousel autour du cœur de sprint */
function CeremonyOrbit(props: { position: [number, number, number] }) {
  const group = useRef<THREE.Group>(null!)
  const ceremonies = [
    { label: 'PLANNING', color: '#00e5ff' },
    { label: 'DAILY', color: '#ffd700' },
    { label: 'REVIEW', color: '#32ff7e' },
    { label: 'RÉTRO', color: '#ff6b1a' },
  ]

  useFrame((_, delta) => {
    group.current.rotation.y += delta * 0.3
  })

  return (
    <group position={props.position}>
      {/* le sprint au centre */}
      <mesh>
        <icosahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.5} toneMapped={false} flatShading />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.7, 0.012, 8, 96]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.9} toneMapped={false} transparent opacity={0.55} />
      </mesh>
      <group ref={group}>
        {ceremonies.map((ceremony, i) => {
          const angle = (i / ceremonies.length) * Math.PI * 2
          return (
            <group
              key={ceremony.label}
              position={[Math.cos(angle) * 1.7, Math.sin(i * 2.1) * 0.25, Math.sin(angle) * 1.7]}
              rotation={[0, -angle + Math.PI / 2, 0]}>
              <mesh>
                <boxGeometry args={[1, 0.6, 0.06]} />
                <meshStandardMaterial color="#06222a" emissive={ceremony.color} emissiveIntensity={0.3} metalness={0.4} roughness={0.3} transparent opacity={0.92} />
                <Edges scale={1.02} color={ceremony.color} />
              </mesh>
              <Text position={[0, 0, 0.05]} fontSize={0.15} color={ceremony.color} anchorX="center" letterSpacing={0.1}>
                {ceremony.label}
              </Text>
            </group>
          )
        })}
      </group>
    </group>
  )
}

/** La courbe de loss qui décroît epoch après epoch — l'entraînement converge */
function LossCurve(props: { position: [number, number, number] }) {
  const runner = useRef<THREE.Mesh>(null!)
  const { tube, path } = useMemo(() => {
    const pts = Array.from({ length: 24 }, (_, i) => {
      const t = i / 23
      const y = Math.exp(-t * 2.6) * 1.7 - 0.85 + Math.sin(i * 2.2) * 0.05 * Math.exp(-t * 3)
      return new THREE.Vector3(t * 2.6 - 1.3, y, 0)
    })
    const path = new THREE.CatmullRomCurve3(pts)
    return { tube: new THREE.TubeGeometry(path, 48, 0.022, 8), path }
  }, [])

  useFrame((state) => {
    const p = path.getPoint((state.clock.elapsedTime * 0.12) % 1)
    runner.current.position.set(p.x, p.y, 0.02)
  })

  return (
    <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.3}>
      <group position={props.position} rotation={[0, -0.3, 0]}>
        {/* axes : loss en ordonnée, epochs en abscisse */}
        <mesh position={[-1.42, 0.12, 0]}>
          <boxGeometry args={[0.025, 2.3, 0.025]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} toneMapped={false} transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, -1.02, 0]}>
          <boxGeometry args={[2.9, 0.025, 0.025]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} toneMapped={false} transparent opacity={0.7} />
        </mesh>
        {/* graduations d'epochs */}
        {[-0.75, -0.2, 0.35, 0.9].map((x) => (
          <mesh key={x} position={[x, -1.02, 0]}>
            <boxGeometry args={[0.02, 0.09, 0.02]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} toneMapped={false} transparent opacity={0.7} />
          </mesh>
        ))}
        {/* la courbe */}
        <mesh geometry={tube}>
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.3} toneMapped={false} />
        </mesh>
        {/* l'epoch courante glisse le long de la courbe */}
        <mesh ref={runner}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffd700" emissiveIntensity={2.2} toneMapped={false} />
        </mesh>
        <Text position={[-1.42, 1.45, 0]} fontSize={0.16} color="#ffd700" anchorX="center" letterSpacing={0.12}>
          LOSS
        </Text>
        <Text position={[0.9, -1.28, 0]} fontSize={0.13} color="#ffd700" anchorX="center" letterSpacing={0.1}>
          EPOCHS
        </Text>
      </group>
    </Float>
  )
}

/** Avant-goût du grand réseau du slide suivant : trois couches reliées qui pulsent */
function MiniNetwork(props: { position: [number, number, number] }) {
  const nodeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#9be9ff',
        emissive: new THREE.Color('#00e5ff'),
        emissiveIntensity: 1.2,
        toneMapped: false,
      }),
    [],
  )
  const nodeGeom = useMemo(() => new THREE.SphereGeometry(0.11, 12, 12), [])
  const { nodes, links } = useMemo(() => {
    const layers = [3, 4, 2]
    const nodes: THREE.Vector3[] = []
    layers.forEach((count, layer) => {
      for (let i = 0; i < count; i++) nodes.push(new THREE.Vector3((layer - 1) * 1.15, (i - (count - 1) / 2) * 0.7, 0))
    })
    const segs: number[] = []
    let offset = 0
    for (let layer = 0; layer < layers.length - 1; layer++) {
      for (let a = 0; a < layers[layer]; a++)
        for (let b = 0; b < layers[layer + 1]; b++) {
          const pa = nodes[offset + a]
          const pb = nodes[offset + layers[layer] + b]
          segs.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z)
        }
      offset += layers[layer]
    }
    return { nodes, links: new Float32Array(segs) }
  }, [])

  useFrame((state) => {
    nodeMat.emissiveIntensity = 1.1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.5
  })

  return (
    <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.35}>
      <group position={props.position} rotation={[0, 0.3, 0]}>
        {nodes.map((node, i) => (
          <mesh key={i} position={node} geometry={nodeGeom} material={nodeMat} />
        ))}
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[links, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#00e5ff" transparent opacity={0.35} />
        </lineSegments>
      </group>
    </Float>
  )
}

/**
 * Zone IA (slides 14 à 18) : bascule d'ambiance — grille-circuit,
 * pluie de données, cœur IA wireframe, puis un décor par slide
 * (outils, cérémonies, courbe de loss, mini-réseau), chacun PILE
 * sur le z de son slide et du côté opposé à la carte texte.
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
      {/* slide 16 : les cérémonies en carrousel, à gauche (carte à droite) */}
      <SlideFade from={15}>
        <group position={[-3.4, 1, z(2)]} scale={0.85}>
          <CeremonyOrbit position={[0, 0, 0]} />
        </group>
      </SlideFade>
      {/* slide 17 : la courbe de loss converge, à droite (carte à gauche) */}
      <SlideFade from={16}>
        <LossCurve position={[3, 0.8, z(3)]} />
      </SlideFade>
      {/* slide 18 : mini-réseau en avant-goût, à gauche (carte à droite) —
          le grand réseau arrive face caméra au slide 19 */}
      <SlideFade from={17}>
        <MiniNetwork position={[-3.6, 1, z(4)]} />
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
