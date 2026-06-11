import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Experience } from './components/canvas/Experience'
import { FallbackNotice, isWebGLAvailable } from './components/dom/FallbackNotice'
import { IntroFlash } from './components/dom/IntroFlash'
import { LoadingScreen } from './components/dom/LoadingScreen'
import { NeuronTip } from './components/dom/NeuronTip'
import { PresentationHud } from './components/dom/PresentationHud'

export default function App() {
  if (!isWebGLAvailable()) return <FallbackNotice />

  return (
    <>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 45, near: 0.1, far: 400, position: [0, 1, 9] }}>
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <LoadingScreen />
      <PresentationHud />
      <NeuronTip />
      <IntroFlash />
    </>
  )
}
