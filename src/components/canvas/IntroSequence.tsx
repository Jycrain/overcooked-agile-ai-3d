import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useShow } from '../../store'

/** Durée de la plongée (secondes) — skippable au clic après un court délai */
const DIVE_DURATION = 3.0
/** Avancement auquel la déflagration se déclenche */
const BURST_AT = 0.86
const BURST_COUNT = 1500
const BURST_CENTER = new THREE.Vector3(0, 1, -2)

/** Rail de la plongée : au-dessus du champ d'étoiles → station du slide 1.
    Léger déport latéral pour que les étoiles défilent en travers du cadre. */
const divePath = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(-9, 44, 104),
    new THREE.Vector3(6, 24, 62),
    new THREE.Vector3(-2.5, 7, 24),
    new THREE.Vector3(0, 1, 9),
  ],
  false,
  'catmullrom',
  0.4,
)

const LOOK_TARGET = new THREE.Vector3(0, 0.7, 0)
const cameraPos = new THREE.Vector3()

/** smootherstep : départ lent, cœur rapide, atterrissage amorti */
const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)

const PALETTE = [new THREE.Color('#ff6b1a'), new THREE.Color('#ffd700'), new THREE.Color('#ffffff'), new THREE.Color('#ff2d55')]

/**
 * Ouverture du bal : après « Entrer en cuisine », la caméra plonge depuis le
 * cosmos vers la cuisine et l'arrivée déclenche une déflagration — onde de
 * choc, flash DOM et burst de particules. Un clic (après 0,35 s) saute
 * directement à la déflagration.
 */
export function IntroSequence() {
  const intro = useShow((s) => s.intro)
  const t = useRef(0)
  const burstFired = useRef(false)
  const burstAge = useRef(-1)
  const points = useRef<THREE.Points>(null!)
  const ring = useRef<THREE.Mesh>(null!)

  const burst = useMemo(() => {
    const positions = new Float32Array(BURST_COUNT * 3)
    const velocities = new Float32Array(BURST_COUNT * 3)
    const colors = new Float32Array(BURST_COUNT * 3)
    return { positions, velocities, colors }
  }, [])

  // skip au clic / clavier (ignoré pendant les 0,35 premières secondes)
  useEffect(() => {
    if (intro !== 'playing') return
    const skip = () => {
      if (t.current > 0.12 && t.current < BURST_AT) t.current = BURST_AT
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
    // ---- plongée caméra
    if (useShow.getState().intro === 'playing') {
      t.current += delta / DIVE_DURATION
      if (!burstFired.current && t.current >= BURST_AT) fireBurst()
      const k = smoother(Math.min(t.current, 1))
      divePath.getPoint(k, cameraPos)
      state.camera.position.copy(cameraPos)
      state.camera.lookAt(LOOK_TARGET)
      if (t.current >= 1) useShow.getState().finishIntro()
    }

    // ---- vie de la déflagration (continue après la fin de la plongée)
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
      <points ref={points} visible={false} position={BURST_CENTER} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[burst.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[burst.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          size={0.12}
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
