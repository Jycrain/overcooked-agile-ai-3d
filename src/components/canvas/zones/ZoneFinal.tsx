import { Edges, Float, Sparkles, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { SLIDE_SPACING, TOTAL_SLIDES } from '../../../content/slides.fr'
import { useShow } from '../../../store'
import { SlideFade } from '../SlideFade'
import { starGeometry } from './ZoneLevels'

/** Le Scrum Guide : un beau livre relié — couvertures dorées sur tranche
    ivoire, marque-page, titre composé proprement, poussière d'or autour */
function ScrumGuideBook(props: { position: [number, number, number] }) {
  const book = useRef<THREE.Group>(null!)

  useFrame((state) => {
    book.current.rotation.y = -0.35 + Math.sin(state.clock.elapsedTime * 0.4) * 0.18
  })

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.5}>
      <group position={props.position}>
        <group ref={book} rotation={[0.04, -0.35, 0]}>
          {/* tranche de pages ivoire, prise entre les couvertures */}
          <mesh>
            <boxGeometry args={[1.42, 1.92, 0.16]} />
            <meshStandardMaterial color="#f1e8d2" roughness={0.85} />
          </mesh>
          {/* couvertures avant / arrière */}
          {[0.12, -0.12].map((cover) => (
            <mesh key={cover} position={[-0.03, 0, cover]}>
              <boxGeometry args={[1.56, 2.04, 0.06]} />
              <meshStandardMaterial color="#1a1000" metalness={0.45} roughness={0.35} />
              <Edges scale={1.01} color="#ffd700" />
            </mesh>
          ))}
          {/* dos relié */}
          <mesh position={[-0.79, 0, 0]}>
            <boxGeometry args={[0.07, 2.04, 0.3]} />
            <meshStandardMaterial color="#241600" metalness={0.45} roughness={0.35} />
          </mesh>
          {/* marque-page doré qui dépasse */}
          <mesh position={[0.42, -1.1, 0]} rotation={[0, 0, 0.06]}>
            <boxGeometry args={[0.12, 0.34, 0.02]} />
            <meshStandardMaterial color="#ffd700" emissive="#c98a1b" emissiveIntensity={0.9} toneMapped={false} />
          </mesh>
          {/* face avant : titre composé, filet, références */}
          <group position={[-0.03, 0, 0.155]}>
            <Text position={[0, 0.66, 0]} fontSize={0.12} color="#f1e8d2" anchorX="center" letterSpacing={0.42}>
              THE
            </Text>
            <Text position={[0, 0.38, 0]} fontSize={0.27} color="#ffd700" anchorX="center" letterSpacing={0.1}>
              SCRUM
            </Text>
            <Text position={[0, 0.08, 0]} fontSize={0.27} color="#ffd700" anchorX="center" letterSpacing={0.1}>
              GUIDE
            </Text>
            <mesh position={[0, -0.18, 0]}>
              <boxGeometry args={[1.05, 0.012, 0.005]} />
              <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.9} toneMapped={false} />
            </mesh>
            <Text position={[0, -0.4, 0]} fontSize={0.12} color="#ffffff" anchorX="center">
              13 pages
            </Text>
            <Text position={[0, -0.64, 0]} fontSize={0.09} color="#bfae8a" anchorX="center" letterSpacing={0.06}>
              scrumguides.org
            </Text>
          </group>
        </group>
        {/* poussière dorée en suspension */}
        <Sparkles count={20} scale={[2.6, 3, 1.6]} size={2.4} speed={0.3} opacity={0.65} color="#ffd700" />
      </group>
    </Float>
  )
}

const BURST_COUNT = 420
const dummy = new THREE.Object3D()
const color = new THREE.Color()
const PALETTE = ['#ff6b1a', '#ffd700', '#00e5ff', '#32ff7e', '#ff2d55']

/* ───────────────────────── Bouquet final automatique ─────────────────────────
   Un unique buffer de points découpé en salves : à l'arrivée sur le dernier
   slide, une salve part toutes les ~1,1 s d'une position aléatoire. */
const SALVOS = 6
const SALVO_SIZE = 200
const FW_COUNT = SALVOS * SALVO_SIZE
const SALVO_LIFE = 2.3

function FireworksShow() {
  const points = useRef<THREE.Points>(null!)
  const data = useMemo(() => {
    const positions = new Float32Array(FW_COUNT * 3).fill(-999)
    const velocities = new Float32Array(FW_COUNT * 3)
    const colors = new Float32Array(FW_COUNT * 3)
    const birth = new Float32Array(SALVOS).fill(-1)
    return { positions, velocities, colors, birth }
  }, [])
  const timer = useRef(0.9)
  const next = useRef(0)

  const launch = (salvo: number, now: number) => {
    data.birth[salvo] = now
    const ox = (Math.random() - 0.5) * 9
    const oy = 1.2 + Math.random() * 3
    const oz = -2 - Math.random() * 3
    // chaque salve est bicolore, tirée de la palette de la présentation
    const c1 = new THREE.Color(PALETTE[Math.floor(Math.random() * PALETTE.length)])
    const c2 = new THREE.Color(PALETTE[Math.floor(Math.random() * PALETTE.length)])
    for (let j = 0; j < SALVO_SIZE; j++) {
      const i = salvo * SALVO_SIZE + j
      data.positions[i * 3] = ox
      data.positions[i * 3 + 1] = oy
      data.positions[i * 3 + 2] = oz
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const speed = 1.8 + Math.random() * 4.2
      data.velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed
      data.velocities[i * 3 + 1] = Math.cos(phi) * speed
      data.velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed
      const c = j % 2 === 0 ? c1 : c2
      data.colors[i * 3] = c.r
      data.colors[i * 3 + 1] = c.g
      data.colors[i * 3 + 2] = c.b
    }
    points.current.geometry.attributes.color.needsUpdate = true
  }

  useFrame((state, delta) => {
    const onFinalSlide = useShow.getState().currentSlide === TOTAL_SLIDES - 1
    const now = state.clock.elapsedTime

    if (onFinalSlide) {
      timer.current += delta
      if (timer.current > 1.1) {
        timer.current = 0
        launch(next.current % SALVOS, now)
        next.current++
      }
    }

    let anyAlive = false
    for (let s = 0; s < SALVOS; s++) {
      if (data.birth[s] < 0) continue
      const age = now - data.birth[s]
      if (age > SALVO_LIFE) {
        data.birth[s] = -1
        for (let j = 0; j < SALVO_SIZE; j++) data.positions[(s * SALVO_SIZE + j) * 3 + 1] = -999
        continue
      }
      anyAlive = true
      for (let j = 0; j < SALVO_SIZE; j++) {
        const i = s * SALVO_SIZE + j
        data.velocities[i * 3 + 1] -= 2.2 * delta
        data.positions[i * 3] += data.velocities[i * 3] * delta
        data.positions[i * 3 + 1] += data.velocities[i * 3 + 1] * delta
        data.positions[i * 3 + 2] += data.velocities[i * 3 + 2] * delta
      }
    }
    if (anyAlive || onFinalSlide) points.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial vertexColors size={0.09} transparent opacity={0.95} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

/** Pluie d'étoiles dorées qui descend doucement derrière le « MERCI » */
const RAIN_COUNT = 42

function StarRain() {
  const mesh = useRef<THREE.InstancedMesh>(null!)
  const seeds = useMemo(
    () =>
      Array.from({ length: RAIN_COUNT }, () => ({
        x: (Math.random() - 0.5) * 14,
        y: Math.random() * 10 - 2,
        z: -2 - Math.random() * 5,
        speed: 0.35 + Math.random() * 0.7,
        spin: Math.random() * Math.PI * 2,
        scale: 0.35 + Math.random() * 0.5,
      })),
    [],
  )

  useFrame((state) => {
    const now = state.clock.elapsedTime
    for (let i = 0; i < RAIN_COUNT; i++) {
      const seed = seeds[i]
      const y = ((seed.y - now * seed.speed) % 10 + 10) % 10 - 2
      dummy.position.set(seed.x + Math.sin(now * 0.5 + i) * 0.4, y, seed.z)
      dummy.rotation.set(0, now * 0.8 + seed.spin, 0.2)
      dummy.scale.setScalar(seed.scale)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[starGeometry, undefined, RAIN_COUNT]} frustumCulled={false}>
      <meshStandardMaterial color="#ffd700" emissive="#ffb700" emissiveIntensity={1.1} toneMapped={false} />
    </instancedMesh>
  )
}

/** Le logo SFEIR s'embrase : pulsation d'échelle + halo lumineux croissant */
function SfeirBlaze() {
  const group = useRef<THREE.Group>(null!)
  const light = useRef<THREE.PointLight>(null!)

  useFrame((state) => {
    const pulse = Math.sin(state.clock.elapsedTime * 2.2)
    group.current.scale.setScalar(1 + pulse * 0.045)
    light.current.intensity = 14 + pulse * 9
  })

  return (
    <group ref={group}>
      <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.5}>
        <Text
          position={[0, 2.6, -1]}
          fontSize={0.7}
          color="#ff6b1a"
          anchorX="center"
          letterSpacing={0.3}
          outlineWidth={0.008}
          outlineBlur={0.14}
          outlineColor="#ffd700">
          SFEIR
        </Text>
      </Float>
      <pointLight ref={light} position={[0, 2.6, 0.5]} intensity={14} color="#ffd700" />
    </group>
  )
}

/** Feu d'artifice final — célébration du « MERCI À TOUS » (dernier slide) */
function Confetti(props: { position: [number, number, number] }) {
  const mesh = useRef<THREE.InstancedMesh>(null!)
  const velocities = useMemo(() => new Float32Array(BURST_COUNT * 3), [])
  const positions = useMemo(() => new Float32Array(BURST_COUNT * 3), [])
  const life = useRef(-1)

  useLayoutEffect(() => {
    for (let i = 0; i < BURST_COUNT; i++) {
      color.set(PALETTE[i % PALETTE.length])
      mesh.current.setColorAt(i, color)
      dummy.position.set(0, -999, 0)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    }
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
    mesh.current.instanceMatrix.needsUpdate = true
  }, [])

  useEffect(() => {
    const onDown = () => {
      if (useShow.getState().currentSlide !== TOTAL_SLIDES - 1) return
      for (let i = 0; i < BURST_COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 0.5
        positions[i * 3 + 1] = 0.4
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const speed = 3.5 + Math.random() * 5.5
        velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed
        velocities[i * 3 + 1] = Math.abs(Math.cos(phi)) * speed + 2.5
        velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed
      }
      life.current = 0
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [positions, velocities])

  useFrame((state, delta) => {
    if (life.current < 0) return
    life.current += delta
    if (life.current > 4.5) {
      life.current = -1
      return
    }
    for (let i = 0; i < BURST_COUNT; i++) {
      velocities[i * 3 + 1] -= 4.5 * delta
      positions[i * 3] += velocities[i * 3] * delta
      positions[i * 3 + 1] += velocities[i * 3 + 1] * delta
      positions[i * 3 + 2] += velocities[i * 3 + 2] * delta
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
      dummy.rotation.set(state.clock.elapsedTime * 3 + i, state.clock.elapsedTime * 2, i)
      dummy.scale.setScalar(Math.max(0, 1 - life.current / 4.5) * 0.85)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, BURST_COUNT]} frustumCulled={false} position={props.position}>
      <tetrahedronGeometry args={[0.06]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}

/**
 * Zone finale (slides 21-22) : le Scrum Guide doré, puis le grand merci
 * SFEIR avec feu d'artifice au clic.
 */
export function ZoneFinal() {
  const z = (slideOffset: number) => -slideOffset * SLIDE_SPACING

  return (
    <group>
      {/* carte du Scrum Guide à gauche → livre à droite, dégagé de la carte */}
      <SlideFade from={TOTAL_SLIDES - 2}>
        <ScrumGuideBook position={[3.3, 0.9, z(0)]} />
      </SlideFade>
      <group position={[0, 0.8, z(1)]}>
        {/* le « MERCI À TOUS » est porté par l'overlay ; la 3D orchestre le bouquet final :
            SFEIR embrasé, salves automatiques, pluie d'étoiles — le clic relance des bursts */}
        <SlideFade from={TOTAL_SLIDES - 1}>
          <SfeirBlaze />
          <FireworksShow />
          <StarRain />
        </SlideFade>
        <Confetti position={[0, 0, 0]} />
      </group>
    </group>
  )
}
