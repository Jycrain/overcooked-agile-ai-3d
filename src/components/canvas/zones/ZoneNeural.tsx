import { useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useShow } from '../../../store'
import { Text } from '../Text3D'

/**
 * Le réseau de neurones du slide 19, porté du canvas 2D vers la 3D :
 * 5 couches (Vision produit → Refinement → Développement → Test & QA →
 * Valeur livrée) + le Scrum Master en « régularisation » au-dessus.
 * Cycle animé : forward pass (cyan), flash de loss (rouge), backprop (rouge).
 * Survol d'un neurone → tooltip expliquant la métaphore.
 */

interface LayerDef {
  name: string
  role: string
  detail: string
  color: string
  x: number
  nodes: number
}

const LAYERS: LayerDef[] = [
  {
    name: 'VISION PRODUIT',
    role: 'Product Owner — Input Layer',
    detail: 'Comme les neurones d’entrée reçoivent les données brutes, le PO injecte la vision produit dans le réseau.',
    color: '#60a5fa',
    x: -6,
    nodes: 1,
  },
  {
    name: 'REFINEMENT',
    role: 'Backlog Refinement — Feature Extraction',
    detail: 'Décompose la vision en fonctionnalités actionnables, comme les premières couches extraient les features.',
    color: '#ff6b1a',
    x: -3,
    nodes: 3,
  },
  {
    name: 'DÉVELOPPEMENT',
    role: 'Dev Team — Hidden Layers',
    detail: 'Le cœur du réseau : le plus de capacité de traitement, là où la transformation s’opère.',
    color: '#32ff7e',
    x: 0,
    nodes: 5,
  },
  {
    name: 'TEST & QA',
    role: 'Test & Quality Assurance — Validation Layer',
    detail: 'Vérifie que la transformation est correcte avant de livrer la sortie.',
    // cyan de l'acte IA : l'or reste réservé à la valeur livrée (étoiles de score)
    color: '#00e5ff',
    x: 3,
    nodes: 2,
  },
  {
    name: 'VALEUR LIVRÉE',
    role: 'Sprint Increment — Output Layer',
    detail: 'Le résultat final : la valeur livrée à l’utilisateur.',
    color: '#ffd700',
    x: 6,
    nodes: 1,
  },
]

const SM_NODE = {
  name: 'SCRUM MASTER',
  role: 'Régularisation — Dropout / L2',
  detail: 'Flotte au-dessus du réseau et régule les connexions parasites pour éviter l’overfitting du process.',
  color: '#ec4899',
}

/** Position verticale du Scrum Master (régularisation), au-dessus du réseau */
const SM_Y = 3.4

// couleurs des phases pré-parsées (color.set(string) re-parse l'hexa chaque frame)
const FORWARD = new THREE.Color('#00e5ff')
const BACKPROP = new THREE.Color('#ff2d55')

function nodePositions(layer: LayerDef): THREE.Vector3[] {
  return Array.from({ length: layer.nodes }, (_, i) => {
    const y = (i - (layer.nodes - 1) / 2) * 1.35
    return new THREE.Vector3(layer.x, y, 0)
  })
}

function Neuron({
  position,
  color,
  name,
  role,
  detail,
  pulse,
}: {
  position: THREE.Vector3
  color: string
  name: string
  role: string
  detail: string
  pulse: React.MutableRefObject<number>
}) {
  const mesh = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  // la popup est un élément DOM fixe (NeuronTip) piloté par le store :
  // un <Html> de drei serait décalé par le scroll de ScrollControls
  useEffect(() => {
    const { setHoveredNeuron } = useShow.getState()
    if (hovered) setHoveredNeuron({ name, role, detail, color })
    return () => {
      if (useShow.getState().hoveredNeuron?.name === name) setHoveredNeuron(null)
    }
  }, [hovered, name, role, detail, color])

  useFrame((state) => {
    // réseau fondu (SlideFade parent coupe visible) : rien à animer
    for (let o: THREE.Object3D | null = mesh.current; o; o = o.parent) if (!o.visible) return
    const mat = mesh.current.material as THREE.MeshStandardMaterial
    const wave = Math.max(0, 1 - Math.abs(state.clock.elapsedTime * 4 - pulse.current - position.x - 6) * 0.5)
    mat.emissiveIntensity = (hovered ? 2.4 : 0.9) + wave * 1.6
    mesh.current.scale.setScalar(hovered ? 1.25 : 1 + wave * 0.15)
  })

  return (
    <group position={position}>
      <mesh
        ref={mesh}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}>
        <sphereGeometry args={[0.34, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      {/* halo de surbrillance derrière le neurone survolé */}
      {hovered && (
        <mesh scale={1.7}>
          <sphereGeometry args={[0.34, 12, 12]} />
          <meshBasicMaterial color={color} transparent opacity={0.18} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}

export function ZoneNeural(props: { position: [number, number, number] }) {
  const pulse = useRef(0)

  const { linePositions, allNodes } = useMemo(() => {
    const layers = LAYERS.map(nodePositions)
    const pts: number[] = []
    for (let l = 0; l < layers.length - 1; l++) {
      for (const a of layers[l]) {
        for (const b of layers[l + 1]) {
          pts.push(a.x, a.y, a.z, b.x, b.y, b.z)
        }
      }
    }
    // connexions du Scrum Master vers la couche Développement
    const sm = new THREE.Vector3(0, SM_Y, 0)
    for (const b of layers[2]) pts.push(sm.x, sm.y, sm.z, b.x, b.y, b.z)
    return { linePositions: new Float32Array(pts), allNodes: layers }
  }, [])

  const lines = useRef<THREE.LineSegments>(null!)

  useFrame((state, delta) => {
    pulse.current += delta
    // réseau fondu (SlideFade parent coupe visible) : rien à animer
    for (let o: THREE.Object3D | null = lines.current; o; o = o.parent) if (!o.visible) return
    const mat = lines.current.material as THREE.LineBasicMaterial
    const phase = (state.clock.elapsedTime % 12) / 12
    // forward (cyan) → loss (rouge) → backprop (rouge décroissant)
    if (phase < 0.5) mat.color.copy(FORWARD)
    else mat.color.copy(BACKPROP)
    mat.opacity = 0.16 + Math.sin(state.clock.elapsedTime * 2.5) * 0.07
  })

  return (
    <group position={props.position} scale={0.58}>
      <lineSegments ref={lines}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#00e5ff" transparent opacity={0.2} />
      </lineSegments>

      {LAYERS.map((layer, l) => (
        <group key={layer.name}>
          {allNodes[l].map((pos, i) => (
            <Neuron key={i} position={pos} color={layer.color} name={layer.name} role={layer.role} detail={layer.detail} pulse={pulse} />
          ))}
          <Text position={[layer.x, -3.5, 0]} fontSize={0.32} color={layer.color} anchorX="center" letterSpacing={0.1}>
            {layer.name}
          </Text>
        </group>
      ))}

      {/* Scrum Master — régularisation, au-dessus du réseau */}
      <Neuron position={new THREE.Vector3(0, SM_Y, 0)} color={SM_NODE.color} name={SM_NODE.name} role={SM_NODE.role} detail={SM_NODE.detail} pulse={pulse} />
      <Text position={[0, SM_Y + 0.75, 0]} fontSize={0.32} color={SM_NODE.color} anchorX="center" letterSpacing={0.1}>
        SCRUM MASTER (RÉGULARISATION)
      </Text>
    </group>
  )
}
