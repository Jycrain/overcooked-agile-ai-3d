import { Edges, Float, Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { SLIDE_SPACING, TOTAL_SLIDES } from '../../../content/slides.fr'
import { finaleState, prefersReducedMotion, useShow } from '../../../store'
import { glowTexture, IntroGalaxy, mulberry32, type GalaxyProps } from '../IntroSequence'
import { SlideFade } from '../SlideFade'
import { Text } from '../Text3D'
import { starGeometry } from './ZoneLevels'

/** Jalons de la chorégraphie du bouquet final (secondes depuis l'arrivée) :
    cosmos 0→4, constellation 4→9, apothéose 9→15, puis ambiance continue */
const P_COSMOS = 4
const P_CONSTEL = 9
const P_APOTHEOSE = 15

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

/* ───────────────────── Pyrotechnie premium du bouquet final ─────────────────────
   Un unique buffer de points découpé en salves typées : pivoine (sphère vive),
   saule doré (traînées freinées qui retombent), palmier (gerbe ascendante).
   Cadence déluge pendant l'apothéose, détendue ensuite ; chaque clic tire un
   doublé saule + pivoine sans jamais interrompre la chorégraphie. Le ralenti
   suspendu (finaleState.timeScale) fige les particules en plein vol. */
const SALVOS = 8
const SALVO_SIZE = 240
const FW_COUNT = SALVOS * SALVO_SIZE

type FwType = 'peony' | 'willow' | 'palm'
const FW_SEQUENCE: FwType[] = ['peony', 'willow', 'palm', 'peony', 'willow', 'peony', 'palm', 'willow']
const FW_PHYSICS: Record<FwType, { drag: number; gravity: number; life: number; min: number; max: number; cone: number }> = {
  peony: { drag: 0.4, gravity: 2.2, life: 2.3, min: 1.8, max: 6, cone: Math.PI },
  willow: { drag: 1.5, gravity: 0.85, life: 3.4, min: 2.2, max: 5.6, cone: Math.PI },
  palm: { drag: 0.7, gravity: 2.6, life: 2.6, min: 4, max: 7.5, cone: 0.75 },
}
const WILLOW_COLORS = ['#ffd700', '#fff6e0', '#c98a1b']
const PALM_COLORS = ['#ffd700', '#ff6b1a']

function FireworksShow() {
  const points = useRef<THREE.Points>(null!)
  const data = useMemo(() => {
    const positions = new Float32Array(FW_COUNT * 3).fill(-999)
    const velocities = new Float32Array(FW_COUNT * 3)
    const colors = new Float32Array(FW_COUNT * 3)
    const age = new Float32Array(SALVOS).fill(-1)
    const types: FwType[] = Array.from({ length: SALVOS }, () => 'peony')
    return { positions, velocities, colors, age, types }
  }, [])
  const timer = useRef(0.9)
  const next = useRef(0)
  const doubleAt = useRef(-1)

  const launch = (type?: FwType, origin?: [number, number, number]) => {
    const salvo = next.current % SALVOS
    next.current++
    const fwType = type ?? FW_SEQUENCE[salvo]
    const physics = FW_PHYSICS[fwType]
    data.age[salvo] = 0
    data.types[salvo] = fwType
    const ox = origin?.[0] ?? (Math.random() - 0.5) * 9
    const oy = origin?.[1] ?? 1.2 + Math.random() * 3
    const oz = origin?.[2] ?? -2 - Math.random() * 3
    const paletteOf = fwType === 'willow' ? WILLOW_COLORS : fwType === 'palm' ? PALM_COLORS : null
    const c1 = new THREE.Color(paletteOf ? paletteOf[0] : PALETTE[Math.floor(Math.random() * PALETTE.length)])
    const c2 = new THREE.Color(paletteOf ? paletteOf[1 % paletteOf.length] : PALETTE[Math.floor(Math.random() * PALETTE.length)])
    for (let j = 0; j < SALVO_SIZE; j++) {
      const i = salvo * SALVO_SIZE + j
      data.positions[i * 3] = ox
      data.positions[i * 3 + 1] = oy
      data.positions[i * 3 + 2] = oz
      const theta = Math.random() * Math.PI * 2
      // cone < π : gerbe ascendante (palmier) ; sinon sphère complète
      const phi = Math.acos(1 - Math.random() * (1 - Math.cos(physics.cone)))
      const speed = physics.min + Math.random() * (physics.max - physics.min)
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

  // clic du présentateur : doublé premium (saule, puis pivoine en écho)
  useEffect(() => {
    const onDown = () => {
      if (useShow.getState().currentSlide !== TOTAL_SLIDES - 1) return
      launch('willow')
      doubleAt.current = 0.32
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((_, delta) => {
    const onFinalSlide = useShow.getState().currentSlide === TOTAL_SLIDES - 1
    const dt = delta * finaleState.timeScale

    if (onFinalSlide) {
      // cadence déluge pendant l'apothéose, détendue en ambiance
      const tau = finaleState.tau
      const interval = tau >= P_CONSTEL && tau < P_APOTHEOSE ? 0.55 : 1.6
      timer.current += delta
      if (timer.current > interval) {
        timer.current = 0
        launch()
      }
      if (doubleAt.current >= 0) {
        doubleAt.current -= delta
        if (doubleAt.current < 0) launch('peony')
      }
    }

    let anyAlive = false
    for (let s = 0; s < SALVOS; s++) {
      if (data.age[s] < 0) continue
      const physics = FW_PHYSICS[data.types[s]]
      data.age[s] += dt
      if (data.age[s] > physics.life) {
        data.age[s] = -1
        for (let j = 0; j < SALVO_SIZE; j++) data.positions[(s * SALVO_SIZE + j) * 3 + 1] = -999
        continue
      }
      anyAlive = true
      const keep = Math.max(0, 1 - physics.drag * dt)
      for (let j = 0; j < SALVO_SIZE; j++) {
        const i = s * SALVO_SIZE + j
        data.velocities[i * 3] *= keep
        data.velocities[i * 3 + 1] = data.velocities[i * 3 + 1] * keep - physics.gravity * dt
        data.velocities[i * 3 + 2] *= keep
        data.positions[i * 3] += data.velocities[i * 3] * dt
        data.positions[i * 3 + 1] += data.velocities[i * 3 + 1] * dt
        data.positions[i * 3 + 2] += data.velocities[i * 3 + 2] * dt
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
      <pointsMaterial
        vertexColors
        map={glowTexture}
        size={0.11}
        transparent
        opacity={0.95}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/** Pluie d'étoiles dorées qui descend doucement derrière le « MERCI » */
const RAIN_COUNT = 42

function StarRain() {
  const mesh = useRef<THREE.InstancedMesh>(null!)
  const seeds = useMemo(
    () =>
      Array.from({ length: RAIN_COUNT }, (_, i) => ({
        // bandes latérales : le centre du cadre appartient à la constellation SFEIR
        x: (i % 2 ? 1 : -1) * (2.8 + Math.random() * 4.2),
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

/* ───────────────────── le bouquet final chorégraphié ─────────────────────
   À l'arrivée sur le slide 22 : 1. les trois galaxies de l'intro reviennent
   envelopper la scène (la boucle narrative se referme) — 2. les étoiles
   convergent et dessinent SFEIR en constellation — 3. apothéose : flash,
   surge post-processing, ralenti suspendu, pyrotechnie premium et défilé
   des objets-clés du voyage en orbite. Puis ambiance féérique continue.
   Piloté par finaleState (canal hors React), rejoué à chaque retour. */

/** Chef d'orchestre : avance tau, écrit surge et timeScale, tire le flash */
function GrandFinale() {
  const group = useRef<THREE.Group>(null!)
  const light = useRef<THREE.PointLight>(null!)
  const flashed = useRef(false)

  useFrame((_, delta) => {
    const onFinal = useShow.getState().currentSlide === TOTAL_SLIDES - 1
    if (!onFinal) {
      finaleState.tau = -1
      finaleState.surge = 0
      finaleState.timeScale = 1
      flashed.current = false
      group.current.visible = false
      return
    }
    group.current.visible = true
    // reduced motion : pas de chorégraphie, on arrive directement à l'ambiance
    if (finaleState.tau < 0) finaleState.tau = prefersReducedMotion ? P_APOTHEOSE : 0
    else finaleState.tau += delta
    const tau = finaleState.tau

    if (!prefersReducedMotion) {
      // surge : monte à l'apothéose, retombe avant l'ambiance
      finaleState.surge =
        THREE.MathUtils.smoothstep(tau, P_CONSTEL, P_CONSTEL + 1.3) * (1 - THREE.MathUtils.smoothstep(tau, 13.6, P_APOTHEOSE))
      // ralenti suspendu au sommet de l'apothéose
      const dip = Math.max(0, 1 - Math.abs((tau - 12.2) / 1.1))
      finaleState.timeScale = 1 - 0.85 * dip * dip * (3 - 2 * dip)
      if (!flashed.current && tau >= P_CONSTEL) {
        flashed.current = true
        useShow.getState().flashIntro()
      }
    }
    light.current.intensity = 6 + finaleState.surge * 26 + Math.sin(tau * 2.2) * 2
  })

  return (
    <group ref={group} visible={false}>
      <pointLight ref={light} position={[0, 2.1, 1]} intensity={6} color="#ffd700" />
      <FinaleCosmos />
      <SfeirConstellation />
      <ActsParade />
    </group>
  )
}

/* ───── phase 1 : le cosmos de l'intro revient envelopper la scène ───── */

const FINALE_GALAXIES: GalaxyProps[] = [
  { accent: '#ff6b1a', position: [-16, 9, -26], rotation: [-0.6, 0.4, 0.2], seed: 101 },
  { accent: '#00e5ff', position: [17, 11, -30], rotation: [0.55, -0.3, -0.2], seed: 202 },
  { accent: '#ffd700', position: [0, 16, -38], rotation: [-0.4, 0.1, 0.5], seed: 303 },
]

// échelles contenues : 6 voiles additifs plein cadre à DPR 2, c'est la
// première facture de fillrate du slide final
const FINALE_NEBULAE = [
  { color: '#7b4dff', position: [-13, 6, -20] as const, scale: 19 },
  { color: '#ff2d8a', position: [12, 5, -24] as const, scale: 16 },
  { color: '#2bb8ff', position: [6, 12, -28] as const, scale: 21 },
  { color: '#ffb347', position: [-7, 13, -30] as const, scale: 18 },
  { color: '#19e3c2', position: [0, 4, -18] as const, scale: 13 },
  { color: '#4d6bff', position: [-2, 18, -34] as const, scale: 24 },
]

function FinaleCosmos() {
  const galaxies = useRef<THREE.Group>(null!)
  const nebulaMats = useMemo(
    () =>
      FINALE_NEBULAE.map(
        (nebula) =>
          new THREE.SpriteMaterial({
            map: glowTexture,
            color: nebula.color,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
      ),
    [],
  )

  useFrame((_, delta) => {
    const tau = finaleState.tau
    const k = tau < 0 ? 0 : THREE.MathUtils.smoothstep(tau, 0, P_COSMOS)
    galaxies.current.scale.setScalar(Math.max(0.001, k))
    galaxies.current.rotation.y += delta * 0.01 * finaleState.timeScale
    // en qualité dégradée (PerformanceMonitor), les voiles s'estompent :
    // c'est le premier poste de fillrate du final
    const nebulaBase = useShow.getState().quality === 'high' ? 0.06 : 0.03
    nebulaMats.forEach((mat, i) => {
      mat.opacity = tau < 0 ? 0 : nebulaBase * THREE.MathUtils.smoothstep(tau, 0.4 + i * 0.3, 3.2 + i * 0.3)
    })
  })

  return (
    <group>
      <group ref={galaxies} scale={0.001}>
        {FINALE_GALAXIES.map((galaxy) => (
          <IntroGalaxy key={galaxy.seed} {...galaxy} />
        ))}
      </group>
      {FINALE_NEBULAE.map((nebula, i) => (
        <sprite key={i} position={nebula.position as unknown as THREE.Vector3} scale={[nebula.scale, nebula.scale, 1]} material={nebulaMats[i]} />
      ))}
    </group>
  )
}

/* ───── phase 2 : les étoiles convergent et dessinent SFEIR ───── */

const CONSTEL_COUNT = 520

/** Échantillonne « SFEIR » dessiné sur un canvas → cibles 3D des étoiles */
function sampleSfeirTargets() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.font = 'bold 104px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'
  ctx.fillText('SFEIR', 256, 64)
  const data = ctx.getImageData(0, 0, 512, 128).data
  const pixels: [number, number][] = []
  for (let y = 0; y < 128; y += 2)
    for (let x = 0; x < 512; x += 2) if (data[(y * 512 + x) * 4 + 3] > 128) pixels.push([x, y])
  const rand = mulberry32(4242)
  const targets = new Float32Array(CONSTEL_COUNT * 3)
  for (let i = 0; i < CONSTEL_COUNT; i++) {
    const [px, py] = pixels[Math.floor(rand() * pixels.length)]
    targets[i * 3] = ((px - 256) / 256) * 4.6 + (rand() - 0.5) * 0.05
    targets[i * 3 + 1] = ((64 - py) / 64) * 1.15 + 1.75
    targets[i * 3 + 2] = 2.5 + (rand() - 0.5) * 0.2
  }
  return targets
}

function SfeirConstellation() {
  const points = useRef<THREE.Points>(null!)
  const data = useMemo(() => {
    const rand = mulberry32(7777)
    const targets = sampleSfeirTargets()
    const starts = new Float32Array(CONSTEL_COUNT * 3)
    const positions = new Float32Array(CONSTEL_COUNT * 3)
    const baseColors = new Float32Array(CONSTEL_COUNT * 3)
    const colors = new Float32Array(CONSTEL_COUNT * 3)
    const delays = new Float32Array(CONSTEL_COUNT)
    const gold = new THREE.Color('#ffd700')
    const white = new THREE.Color('#fff6e0')
    const tint = new THREE.Color()
    for (let i = 0; i < CONSTEL_COUNT; i++) {
      const theta = rand() * Math.PI * 2
      const phi = Math.acos(2 * rand() - 1)
      const radius = 7 + rand() * 6
      starts[i * 3] = Math.sin(phi) * Math.cos(theta) * radius
      starts[i * 3 + 1] = 1.75 + Math.cos(phi) * radius * 0.6
      starts[i * 3 + 2] = 1.5 + Math.sin(phi) * Math.sin(theta) * radius * 0.5
      tint.copy(gold).lerp(white, rand() * 0.7)
      baseColors.set([tint.r, tint.g, tint.b], i * 3)
      delays[i] = rand() * 2.2
    }
    positions.set(starts)
    colors.set(baseColors)
    return { targets, starts, positions, baseColors, colors, delays }
  }, [])

  useFrame((state) => {
    const tau = finaleState.tau
    const mat = points.current.material as THREE.PointsMaterial
    mat.opacity = tau < 0 ? 0 : THREE.MathUtils.smoothstep(tau, P_COSMOS, P_COSMOS + 1)
    if (tau < 0) return
    const now = state.clock.elapsedTime
    const formedAll = tau > P_CONSTEL
    for (let i = 0; i < CONSTEL_COUNT; i++) {
      const raw = (tau - P_COSMOS - data.delays[i]) / 2.4
      const t = Math.min(1, Math.max(0, raw))
      const k = t * t * (3 - 2 * t)
      positionsLerp(data.positions, data.starts, data.targets, i, k)
      // scintillement une fois l'étoile posée
      const twinkle = k >= 1 ? 0.72 + 0.28 * Math.sin(now * 2.6 + i * 1.7) : 1
      data.colors[i * 3] = data.baseColors[i * 3] * twinkle
      data.colors[i * 3 + 1] = data.baseColors[i * 3 + 1] * twinkle
      data.colors[i * 3 + 2] = data.baseColors[i * 3 + 2] * twinkle
    }
    points.current.geometry.attributes.position.needsUpdate = true
    if (formedAll || tau > P_COSMOS) points.current.geometry.attributes.color.needsUpdate = true
  })

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        map={glowTexture}
        size={0.3}
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function positionsLerp(out: Float32Array, from: Float32Array, to: Float32Array, i: number, k: number) {
  out[i * 3] = from[i * 3] + (to[i * 3] - from[i * 3]) * k
  out[i * 3 + 1] = from[i * 3 + 1] + (to[i * 3 + 1] - from[i * 3 + 1]) * k
  out[i * 3 + 2] = from[i * 3 + 2] + (to[i * 3 + 2] - from[i * 3 + 2]) * k
}

/* ───── phase 3 : le défilé des actes en orbite autour de la constellation ───── */

const PARADE_RADIUS = 5.6

/** Réplique miniature d'un objet-clé du voyage */
function ParadeItem({ kind }: { kind: number }) {
  const networkLinks = useMemo(
    () =>
      kind === 3
        ? new Float32Array([
            -0.22, 0.1, 0, 0, 0.22, 0, -0.22, 0.1, 0, 0, -0.02, 0, -0.22, -0.22, 0, 0, 0.22, 0, -0.22, -0.22, 0, 0, -0.02, 0, 0, 0.22, 0,
            0.24, 0, 0, 0, -0.02, 0, 0.24, 0, 0,
          ])
        : null,
    [kind],
  )

  if (kind === 0) {
    // la toque du hero
    return (
      <group>
        <mesh>
          <cylinderGeometry args={[0.16, 0.18, 0.2, 16]} />
          <meshStandardMaterial color="#f4ede2" emissive="#ff9a4d" emissiveIntensity={0.2} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.14, 14, 14]} />
          <meshStandardMaterial color="#fffaf2" emissive="#ff9a4d" emissiveIntensity={0.2} roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.17, 0.02, 8, 24]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffb700" emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      </group>
    )
  }
  if (kind === 1) {
    // le kanban de l'acte agilité
    return (
      <mesh>
        <boxGeometry args={[0.52, 0.4, 0.04]} />
        <meshStandardMaterial color="#141019" transparent opacity={0.7} />
        <Edges scale={1.02} color="#ffd700" />
      </mesh>
    )
  }
  if (kind === 2) {
    // les maillons Overcooked ↔ Scrum
    return (
      <group>
        <mesh position={[-0.09, 0, 0.04]} rotation={[0, -0.18, 0]}>
          <torusGeometry args={[0.16, 0.035, 10, 32]} />
          <meshStandardMaterial color="#ff6b1a" emissive="#ff6b1a" emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
        <mesh position={[0.09, 0, -0.04]} rotation={[0, 0.18, 0]}>
          <torusGeometry args={[0.16, 0.035, 10, 32]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      </group>
    )
  }
  if (kind === 3) {
    // le réseau de neurones
    return (
      <group>
        {[
          [-0.22, 0.1],
          [-0.22, -0.22],
          [0, 0.22],
          [0, -0.02],
          [0.24, 0],
        ].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0]}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshStandardMaterial color="#9be9ff" emissive="#00e5ff" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
        ))}
        {networkLinks && (
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[networkLinks, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color="#00e5ff" transparent opacity={0.5} />
          </lineSegments>
        )}
      </group>
    )
  }
  // le Scrum Guide
  return (
    <mesh rotation={[0, -0.3, 0]}>
      <boxGeometry args={[0.28, 0.38, 0.06]} />
      <meshStandardMaterial color="#1a1000" metalness={0.4} roughness={0.4} />
      <Edges scale={1.02} color="#ffd700" />
    </mesh>
  )
}

function ActsParade() {
  const orbit = useRef<THREE.Group>(null!)
  const items = useRef<(THREE.Group | null)[]>([])

  useFrame((_, delta) => {
    const tau = finaleState.tau
    orbit.current.rotation.y += delta * 0.28 * finaleState.timeScale
    items.current.forEach((item, i) => {
      if (!item) return
      const k = tau < 0 ? 0 : THREE.MathUtils.smoothstep(tau, P_CONSTEL + i * 0.3, P_CONSTEL + 1.4 + i * 0.3)
      item.scale.setScalar(Math.max(0.001, k))
    })
  })

  return (
    <group position={[0, 1.95, 0]}>
      <group ref={orbit}>
        {Array.from({ length: 5 }, (_, i) => {
          const angle = (i / 5) * Math.PI * 2
          return (
            <group
              key={i}
              ref={(el) => {
                items.current[i] = el
              }}
              position={[Math.cos(angle) * PARADE_RADIUS, Math.sin(i * 1.3) * 0.3, Math.sin(angle) * PARADE_RADIUS]}
              scale={0.001}>
              <ParadeItem kind={i} />
            </group>
          )
        })}
      </group>
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
    // le confetti vit dans le même temps que la pyrotechnie (ralenti suspendu)
    const dt = delta * finaleState.timeScale
    life.current += dt
    if (life.current > 4.5) {
      life.current = -1
      return
    }
    for (let i = 0; i < BURST_COUNT; i++) {
      velocities[i * 3 + 1] -= 4.5 * dt
      positions[i * 3] += velocities[i * 3] * dt
      positions[i * 3 + 1] += velocities[i * 3 + 1] * dt
      positions[i * 3 + 2] += velocities[i * 3 + 2] * dt
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

/* ───────────────── Passage doré : disruption d'acte 20 → 21 ─────────────────
   Le pendant « enluminure » de la transition Cyberpunk : un tourbillon de
   pages de parchemin et deux portails-halos dorés traversés plein cadre.
   Piloté par la position caméra (hors SlideFade) — n'existe QU'ENTRE les
   slides 20 et 21, invisible aux stations. */

const PAGE_COUNT = 44
const GOLDEN_ANGLE = 2.39996

function GoldenPassage() {
  const root = useRef<THREE.Group>(null!)
  const pages = useRef<THREE.InstancedMesh>(null!)
  const halo = useRef<THREE.Group>(null!)
  const pageMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f1e8d2',
        emissive: new THREE.Color('#c98a1b'),
        emissiveIntensity: 0.55,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      }),
    [],
  )
  const ringMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffd700',
        emissive: new THREE.Color('#ffd700'),
        emissiveIntensity: 1.7,
        toneMapped: false,
        transparent: true,
        opacity: 0,
      }),
    [],
  )
  const glowMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ffd700',
        transparent: true,
        opacity: 0,
        toneMapped: false,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  )
  // distribution déterministe en angle d'or le long du couloir caméra
  const seeds = useMemo(
    () =>
      Array.from({ length: PAGE_COUNT }, (_, i) => ({
        theta: i * GOLDEN_ANGLE,
        radius: 2.3 + (i % 5) * 0.45,
        z: -11 + (i * 22) / PAGE_COUNT,
        speed: 0.22 + (i % 3) * 0.11,
        spin: (i % 7) * 0.9,
        scale: 0.55 + ((i * 37) % 10) / 18,
      })),
    [],
  )

  useFrame(({ camera, clock }) => {
    const p = (9 - camera.position.z) / SLIDE_SPACING
    const t = Math.max(0, 1 - Math.abs((p - 19.5) / 0.5))
    const k = t * t * (3 - 2 * t)
    root.current.visible = k > 0.02
    pageMat.opacity = 0.95 * k
    ringMat.opacity = 0.95 * k
    glowMat.opacity = 0.14 * k
    if (!root.current.visible) return
    const now = clock.elapsedTime
    for (let i = 0; i < PAGE_COUNT; i++) {
      const seed = seeds[i]
      const theta = seed.theta + now * seed.speed
      dummy.position.set(Math.cos(theta) * seed.radius, Math.sin(theta) * seed.radius, seed.z)
      dummy.rotation.set(now * 0.8 + seed.spin, theta + Math.PI / 2, 0.35)
      dummy.scale.setScalar(seed.scale)
      dummy.updateMatrix()
      pages.current.setMatrixAt(i, dummy.matrix)
    }
    pages.current.instanceMatrix.needsUpdate = true
    halo.current.rotation.z = now * 0.3
  })

  // axe du couloir : milieu du rail 20 → 21 (x ≈ 1, y ≈ 1,5, z local +22)
  return (
    <group ref={root} position={[1, 1.5, 22]} visible={false}>
      <instancedMesh ref={pages} args={[undefined, undefined, PAGE_COUNT]} material={pageMat} frustumCulled={false}>
        <planeGeometry args={[0.62, 0.85]} />
      </instancedMesh>
      {/* portail-halo principal, traversé au cœur de la transition */}
      <group ref={halo} position={[0, 0, -1.3]}>
        <mesh material={ringMat}>
          <torusGeometry args={[3.1, 0.1, 12, 96]} />
        </mesh>
        <mesh material={glowMat}>
          <circleGeometry args={[3, 48]} />
        </mesh>
      </group>
      {/* second halo plus loin, dans l'axe d'arrivée vers le Guide */}
      <mesh material={ringMat} position={[-0.5, 0.05, -6.5]} scale={0.62}>
        <torusGeometry args={[3.1, 0.1, 12, 96]} />
      </mesh>
      <Sparkles count={30} scale={[6, 6, 14]} size={3} speed={0.4} opacity={0.8} color="#ffd700" />
    </group>
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
      {/* disruption dorée de la bascule d'acte 20 → 21 — hors SlideFade,
          son opacité est pilotée par la position caméra */}
      <GoldenPassage />
      {/* carte du Scrum Guide à gauche → livre à droite, dégagé de la carte */}
      <SlideFade from={TOTAL_SLIDES - 2}>
        <ScrumGuideBook position={[3.3, 0.9, z(0)]} />
      </SlideFade>
      <group position={[0, 0.8, z(1)]}>
        {/* le « MERCI À TOUS » est porté par l'overlay ; la 3D orchestre le
            bouquet final chorégraphié : cosmos → constellation SFEIR →
            apothéose (pyrotechnie, défilé, surge, ralenti) → ambiance.
            GrandFinale vit HORS SlideFade : sa visibilité suit le slide. */}
        <GrandFinale />
        <SlideFade from={TOTAL_SLIDES - 1}>
          <FireworksShow />
          <StarRain />
        </SlideFade>
        <Confetti position={[0, 0, 0]} />
      </group>
    </group>
  )
}
