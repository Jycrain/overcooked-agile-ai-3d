import { useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { TOTAL_SLIDES } from '../../content/slides.fr'
import { useShow } from '../../store'
import { cameraCurve, lookCurve } from './layout'

const position = new THREE.Vector3()
const target = new THREE.Vector3()

/** Caméra sur rail pilotée par le scroll + parallaxe pointeur (mutation en useFrame) */
export function CameraRig() {
  const scroll = useScroll()
  const lastSlide = useRef(0)

  useFrame((state) => {
    // pendant la séquence d'ouverture, IntroSequence pilote la caméra
    if (useShow.getState().intro !== 'done') return

    const t = THREE.MathUtils.clamp(scroll.offset, 0, 1)

    cameraCurve.getPoint(t, position)
    lookCurve.getPoint(Math.min(t + 0.018, 1), target)

    position.x += state.pointer.x * 0.5
    position.y += state.pointer.y * 0.3

    state.camera.position.copy(position)
    state.camera.lookAt(target)

    const active = Math.round(t * (TOTAL_SLIDES - 1))
    if (active !== lastSlide.current) {
      lastSlide.current = active
      useShow.getState().setCurrentSlide(active)
    }
  })

  return null
}
