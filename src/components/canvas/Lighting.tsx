import { Environment, Lightformer } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useMemo } from 'react'

/** Studio nocturne procédural aux couleurs de la cuisine : orange, or, cyan */
export function Lighting() {
  const gl = useThree((state) => state.gl)

  // En rendu logiciel (SwiftShader, llvmpipe… : VM, CI, navigateurs sans GPU),
  // le PMREM de <Environment> produit des NaN → tous les meshes standard
  // deviennent noirs. On le détecte et on bascule sur des lumières classiques
  // qui approchent le même studio orange/or/cyan.
  const softwareRenderer = useMemo(() => {
    const ctx = gl.getContext()
    const info = ctx.getExtension('WEBGL_debug_renderer_info')
    const renderer = info ? String(ctx.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
    return /swiftshader|software|llvmpipe/i.test(renderer)
  }, [gl])

  if (softwareRenderer) {
    return (
      <>
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 3, 1]} intensity={1.6} color="#ff6b1a" />
        <directionalLight position={[-5, 2, -1]} intensity={1} color="#ffd700" />
        <directionalLight position={[0, 6, 0]} intensity={0.8} color="#00e5ff" />
      </>
    )
  }

  return (
    <>
      <ambientLight intensity={0.3} />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#070103']} />
        <Lightformer form="rect" intensity={4} color="#ff6b1a" position={[5, 3, 1]} scale={[4, 8, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={2.5} color="#ffd700" position={[-5, 2, -1]} scale={[4, 8, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={2} color="#00e5ff" position={[0, 6, 0]} scale={6} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1} color="#3a1505" position={[0, -4, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 10, 1]} />
      </Environment>
    </>
  )
}
