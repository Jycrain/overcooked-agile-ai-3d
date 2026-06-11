import { Environment, Lightformer } from '@react-three/drei'

/** Studio nocturne procédural aux couleurs de la cuisine : orange, or, cyan */
export function Lighting() {
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
