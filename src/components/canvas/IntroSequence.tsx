import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useShow } from '../../store'

/** Durée du voyage galactique (secondes) — skippable au clic après un court délai */
const DIVE_DURATION = 8.0
/** Avancement auquel la supernova d'arrivée se déclenche */
const BURST_AT = 0.9
const BURST_COUNT = 2200
const BURST_CENTER = new THREE.Vector3(0, 1, -2)

/** PRNG mulberry32 — décors galactiques reproductibles d'un rendu à l'autre */
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

/** Sprite de halo doux (dégradé radial) partagé par nébuleuses, cœurs et comètes */
const glowTexture = (() => {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.35, 'rgba(255,255,255,0.45)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(canvas)
})()

/* ───────────────────────── le rail du voyage ─────────────────────────
   Slalom fluide : la caméra serpente du cosmos lointain jusqu'à la station
   du slide 1 en frôlant les trois galaxies des actes. */
const divePath = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(-34, 66, 232),
    new THREE.Vector3(-10, 54, 196),
    new THREE.Vector3(14, 40, 152),
    new THREE.Vector3(10, 26, 108),
    new THREE.Vector3(-6, 17, 76),
    new THREE.Vector3(-2, 6, 34),
    new THREE.Vector3(0, 1, 9),
  ],
  false,
  'catmullrom',
  0.4,
)

const LOOK_TARGET = new THREE.Vector3(0, 0.7, 0)
const cameraPos = new THREE.Vector3()
const lookAhead = new THREE.Vector3()

/** smootherstep : départ lent, cœur rapide, atterrissage amorti */
const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
/** dérivée de smootherstep — pilote l'intensité des traînées d'hyperespace */
const smootherSpeed = (t: number) => 30 * t * t * (t - 1) * (t - 1)

const PALETTE = [
  new THREE.Color('#ff6b1a'),
  new THREE.Color('#ffd700'),
  new THREE.Color('#ffffff'),
  new THREE.Color('#ff2d55'),
  new THREE.Color('#00e5ff'),
  new THREE.Color('#32ff7e'),
]

/* ───────────────────────── les trois galaxies des actes ───────────────────────── */

const GALAXIES = [
  // l'acte cuisine (orange), l'acte IA (cyan), l'acte Scrum Guide (or)
  { accent: '#ff6b1a', position: [-20, 50, 182] as const, rotation: [-0.5, 0, 0.3] as const, seed: 101 },
  { accent: '#00e5ff', position: [18, 31, 122] as const, rotation: [0.7, 0.2, -0.25] as const, seed: 202 },
  { accent: '#ffd700', position: [-14, 13, 64] as const, rotation: [-0.35, 0.1, 0.45] as const, seed: 303 },
]

const GALAXY_STARS = 900
const GALAXY_ARMS = 3

/** Galaxie spirale en nuage de points : cœur blanc-chaud, bras teintés d'accent */
function IntroGalaxy({ accent, position, rotation, seed }: (typeof GALAXIES)[number]) {
  const spin = useRef<THREE.Group>(null!)

  const { positions, colors } = useMemo(() => {
    const rand = mulberry32(seed)
    const positions = new Float32Array(GALAXY_STARS * 3)
    const colors = new Float32Array(GALAXY_STARS * 3)
    const inner = new THREE.Color('#fff6e8')
    const edge = new THREE.Color(accent)
    const tint = new THREE.Color()
    for (let i = 0; i < GALAXY_STARS; i++) {
      const radius = Math.pow(rand(), 0.6) * 11
      const angle = ((i % GALAXY_ARMS) / GALAXY_ARMS) * Math.PI * 2 + radius * 0.42 + (rand() - 0.5) * 0.5
      positions[i * 3] = Math.cos(angle) * radius + (rand() - 0.5) * 0.7
      positions[i * 3 + 1] = (rand() - 0.5) * Math.max(0.3, 1.6 - radius * 0.09)
      positions[i * 3 + 2] = Math.sin(angle) * radius + (rand() - 0.5) * 0.7
      tint.copy(inner).lerp(edge, Math.min(1, radius / 9))
      colors[i * 3] = tint.r
      colors[i * 3 + 1] = tint.g
      colors[i * 3 + 2] = tint.b
    }
    return { positions, colors }
  }, [accent, seed])

  useFrame((_, delta) => {
    spin.current.rotation.y += delta * 0.05
  })

  return (
    <group position={position as unknown as THREE.Vector3} rotation={rotation as unknown as THREE.Euler}>
      <group ref={spin}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[colors, 3]} />
          </bufferGeometry>
          {/* map ronde : sans elle, les étoiles frôlées de près sont des carrés */}
          <pointsMaterial
            vertexColors
            map={glowTexture}
            size={0.3}
            transparent
            opacity={0.95}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
      {/* cœur lumineux + halo large */}
      <sprite scale={[7, 7, 1]}>
        <spriteMaterial map={glowTexture} color="#fff3da" transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite scale={[24, 24, 1]}>
        <spriteMaterial map={glowTexture} color={accent} transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  )
}

/* ───────────────────────── nébuleuses traversées ───────────────────────── */

const NEBULAE = [
  { color: '#7b4dff', position: [-16, 58, 210] as const, scale: 42 },
  { color: '#ff2d8a', position: [8, 46, 170] as const, scale: 34 },
  { color: '#2bb8ff', position: [22, 34, 138] as const, scale: 38 },
  { color: '#19e3c2', position: [2, 28, 116] as const, scale: 30 },
  { color: '#ffb347', position: [-10, 18, 86] as const, scale: 36 },
  { color: '#9dff5a', position: [8, 22, 98] as const, scale: 26 },
  { color: '#ff6b1a', position: [-4, 9, 50] as const, scale: 30 },
  { color: '#4d6bff', position: [-22, 42, 162] as const, scale: 44 },
]

/* ───────────────────────── comètes traversières ───────────────────────── */

const COMETS = [
  { color: '#9be9ff', from: [-46, 64, 208] as const, dir: [1, -0.15, -0.25] as const, speed: 24 },
  { color: '#ffd700', from: [40, 48, 168] as const, dir: [-1, -0.1, -0.2] as const, speed: 28 },
  { color: '#ff2d55', from: [-38, 20, 100] as const, dir: [1, 0.18, -0.15] as const, speed: 30 },
  { color: '#32ff7e', from: [34, 36, 140] as const, dir: [-1, -0.25, -0.3] as const, speed: 22 },
  { color: '#ffffff', from: [-30, 4, 56] as const, dir: [1, 0.3, -0.1] as const, speed: 26 },
]

function Comet({ color, from, dir }: { color: string; from: readonly number[]; dir: readonly number[] }) {
  const orient = useMemo(() => {
    const q = new THREE.Quaternion()
    const direction = new THREE.Vector3(...(dir as [number, number, number])).normalize()
    // la traîne (plan étiré sur x) s'aligne sur la direction du vol
    q.setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction)
    return q
  }, [dir])

  return (
    <group position={from as unknown as THREE.Vector3} quaternion={orient}>
      <sprite scale={[2.2, 2.2, 1]}>
        <spriteMaterial map={glowTexture} color="#ffffff" transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <mesh position={[-4.5, 0, 0]}>
        <planeGeometry args={[9, 1.4]} />
        <meshBasicMaterial map={glowTexture} color={color} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/* ───────────────────────── traînées d'hyperespace ───────────────────────── */

const STREAK_COUNT = 200
const STREAK_CYCLE = 60

function makeStreaks() {
  const rand = mulberry32(777)
  const positions = new Float32Array(STREAK_COUNT * 6)
  const colors = new Float32Array(STREAK_COUNT * 6)
  const tint = new THREE.Color()
  for (let i = 0; i < STREAK_COUNT; i++) {
    const angle = rand() * Math.PI * 2
    const radius = 2 + rand() * 5.5
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    const z = rand() * STREAK_CYCLE - STREAK_CYCLE / 2
    const length = 3 + rand() * 4
    positions.set([x, y, z, x, y, z + length], i * 6)
    tint.copy(PALETTE[i % PALETTE.length]).lerp(new THREE.Color('#ffffff'), 0.35)
    colors.set([tint.r, tint.g, tint.b, tint.r, tint.g, tint.b], i * 6)
  }
  return { positions, colors }
}

/**
 * Ouverture du bal : après « Entrer en cuisine », la caméra slalome de
 * galaxie en galaxie (orange → cyan → or, une par acte), au milieu des
 * nébuleuses, comètes et traînées d'hyperespace, puis l'arrivée déclenche
 * la supernova — onde de choc, flash DOM et burst de particules.
 * Un clic (après le départ) saute directement à la supernova.
 */
export function IntroSequence() {
  const intro = useShow((s) => s.intro)
  const t = useRef(0)
  const burstFired = useRef(false)
  const burstAge = useRef(-1)
  const points = useRef<THREE.Points>(null!)
  const ring = useRef<THREE.Mesh>(null!)
  const scenery = useRef<THREE.Group>(null!)
  const streakRig = useRef<THREE.Group>(null!)
  const streakScroll = useRef<THREE.Group>(null!)

  const burst = useMemo(() => {
    const positions = new Float32Array(BURST_COUNT * 3)
    const velocities = new Float32Array(BURST_COUNT * 3)
    const colors = new Float32Array(BURST_COUNT * 3)
    return { positions, velocities, colors }
  }, [])

  // géométrie et matériau PARTAGÉS par les deux tuiles de traînées
  // (une seule opacité à piloter, un seul buffer)
  const streakGeometry = useMemo(() => {
    const { positions, colors } = makeStreaks()
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geometry
  }, [])
  const streakMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )

  // skip au clic / clavier (ignoré pendant le tout début)
  useEffect(() => {
    if (intro !== 'playing') return
    const skip = () => {
      if (t.current > 0.05 && t.current < BURST_AT) t.current = BURST_AT
    }
    window.addEventListener('pointerdown', skip)
    window.addEventListener('keydown', skip)
    return () => {
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [intro])

  const fireBurst = () => {
    burstFired.current = true
    burstAge.current = 0
    for (let i = 0; i < BURST_COUNT; i++) {
      // coordonnées locales : le groupe <points> est déjà placé sur BURST_CENTER
      burst.positions[i * 3] = 0
      burst.positions[i * 3 + 1] = 0
      burst.positions[i * 3 + 2] = 0
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const speed = 2.5 + Math.random() * 9
      burst.velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed
      burst.velocities[i * 3 + 1] = Math.cos(phi) * speed
      burst.velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed
      const color = PALETTE[i % PALETTE.length]
      burst.colors[i * 3] = color.r
      burst.colors[i * 3 + 1] = color.g
      burst.colors[i * 3 + 2] = color.b
    }
    points.current.geometry.attributes.position.needsUpdate = true
    points.current.geometry.attributes.color.needsUpdate = true
    points.current.visible = true
    ring.current.visible = true
    ring.current.scale.setScalar(0.1)
    useShow.getState().flashIntro()
  }

  useFrame((state, delta) => {
    const playing = useShow.getState().intro === 'playing'
    // le décor galactique ne vit que pendant le voyage
    scenery.current.visible = playing
    streakRig.current.visible = playing

    // ---- voyage caméra
    if (playing) {
      t.current += delta / DIVE_DURATION
      if (!burstFired.current && t.current >= BURST_AT) fireBurst()
      const k = smoother(Math.min(t.current, 1))
      divePath.getPoint(k, cameraPos)
      state.camera.position.copy(cameraPos)
      // regard : vers l'avant du rail, puis fondu vers la cible du slide 1
      divePath.getPoint(Math.min(k + 0.07, 1), lookAhead)
      const arrive = THREE.MathUtils.smoothstep(t.current, 0.78, 0.96)
      lookAhead.lerp(LOOK_TARGET, arrive)
      state.camera.lookAt(lookAhead)
      // léger roulis dans les virages du slalom
      state.camera.rotateZ(Math.sin(k * Math.PI * 2.2) * 0.07 * (1 - arrive))

      // traînées d'hyperespace : suivent la caméra, défilent avec la vitesse
      streakRig.current.position.copy(cameraPos)
      streakRig.current.quaternion.copy(state.camera.quaternion)
      streakScroll.current.position.z = (k * 220) % STREAK_CYCLE
      streakMaterial.opacity = (smootherSpeed(Math.min(t.current, 1)) / 1.875) * 0.8 * (1 - arrive)

      if (t.current >= 1) useShow.getState().finishIntro()
    }

    // ---- vie de la supernova (continue après la fin du voyage)
    if (burstAge.current >= 0) {
      burstAge.current += delta
      const age = burstAge.current
      if (age > 2) {
        burstAge.current = -1
        points.current.visible = false
        ring.current.visible = false
        return
      }
      const pos = burst.positions
      const vel = burst.velocities
      for (let i = 0; i < BURST_COUNT; i++) {
        vel[i * 3 + 1] -= 2.6 * delta
        pos[i * 3] += vel[i * 3] * delta
        pos[i * 3 + 1] += vel[i * 3 + 1] * delta
        pos[i * 3 + 2] += vel[i * 3 + 2] * delta
      }
      points.current.geometry.attributes.position.needsUpdate = true
      const fade = Math.max(0, 1 - age / 2)
      ;(points.current.material as THREE.PointsMaterial).opacity = fade
      // onde de choc : expansion rapide + fondu
      const ringT = Math.min(1, age / 0.9)
      ring.current.scale.setScalar(0.1 + ringT * 22)
      ;(ring.current.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - ringT)
      ring.current.quaternion.copy(state.camera.quaternion)
    }
  })

  return (
    <group>
      {/* décor du voyage : galaxies, nébuleuses, comètes — masqué hors intro */}
      <group ref={scenery} visible={false}>
        {GALAXIES.map((galaxy) => (
          <IntroGalaxy key={galaxy.seed} {...galaxy} />
        ))}
        {NEBULAE.map((nebula, i) => (
          <sprite key={i} position={nebula.position as unknown as THREE.Vector3} scale={[nebula.scale, nebula.scale, 1]}>
            <spriteMaterial map={glowTexture} color={nebula.color} transparent opacity={0.085} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        ))}
        {COMETS.map((comet, i) => (
          <CometRunner key={i} {...comet} t={t} />
        ))}
      </group>

      {/* traînées d'hyperespace : deux tuiles (géométrie et matériau partagés)
          pour un défilement sans couture */}
      <group ref={streakRig} visible={false}>
        <group ref={streakScroll}>
          <lineSegments geometry={streakGeometry} material={streakMaterial} />
          <lineSegments geometry={streakGeometry} material={streakMaterial} position={[0, 0, -STREAK_CYCLE]} />
        </group>
      </group>

      {/* supernova d'arrivée */}
      <points ref={points} visible={false} position={BURST_CENTER} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[burst.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[burst.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          map={glowTexture}
          size={0.14}
          transparent
          opacity={1}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh ref={ring} visible={false} position={BURST_CENTER}>
        <ringGeometry args={[0.92, 1, 64]} />
        <meshBasicMaterial color="#ffd700" transparent opacity={0.9} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

/** Une comète animée : avance le long de sa direction au fil du voyage */
function CometRunner({ color, from, dir, speed, t }: (typeof COMETS)[number] & { t: { current: number } }) {
  const group = useRef<THREE.Group>(null!)

  useFrame(() => {
    const elapsed = (t.current ?? 0) * DIVE_DURATION
    group.current.position.set(
      from[0] + dir[0] * speed * elapsed,
      from[1] + dir[1] * speed * elapsed,
      from[2] + dir[2] * speed * elapsed,
    )
  })

  return (
    <group ref={group}>
      <Comet color={color} from={[0, 0, 0]} dir={dir} />
    </group>
  )
}
