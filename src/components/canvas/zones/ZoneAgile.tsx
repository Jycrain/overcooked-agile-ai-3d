import { Billboard, Edges, Float, useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { SLIDE_SPACING } from '../../../content/slides.fr'
import { SlideFade } from '../SlideFade'
import { Text } from '../Text3D'
import { starGeometry } from './ZoneLevels'

/** Cycle empirique TRY → FAIL → LEARN → REPEAT en orbite continue */
function EmpiricalCycle(props: { position: [number, number, number] }) {
  const group = useRef<THREE.Group>(null!)
  const steps = ['TRY', 'FAIL', 'LEARN', 'REPEAT']
  const colors = ['#00e5ff', '#ff2d55', '#ffd700', '#32ff7e']

  useFrame((_, delta) => {
    group.current.rotation.y += delta * 0.35
  })

  return (
    <group position={props.position}>
      <group ref={group}>
        {steps.map((step, i) => {
          const angle = (i / steps.length) * Math.PI * 2
          return (
            <group key={step} position={[Math.cos(angle) * 2.1, 0, Math.sin(angle) * 2.1]}>
              {/* Billboard : les labels restent face caméra malgré la rotation
                  du groupe — sinon ceux du fond s'affichent en miroir */}
              <Billboard>
                <Text fontSize={0.42} color={colors[i]} anchorX="center" anchorY="middle">
                  {step}
                </Text>
              </Billboard>
            </group>
          )
        })}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.1, 0.015, 12, 128]} />
          <meshStandardMaterial color="#ff6b1a" emissive="#ff6b1a" emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      </group>
      <mesh>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial color="#ff6b1a" emissive="#ff4500" emissiveIntensity={1.6} toneMapped={false} flatShading />
      </mesh>
    </group>
  )
}

/** Les trois panneaux de la brigade Scrum : PO (bleu), SM (rose), Team (vert) */
function Brigade(props: { position: [number, number, number] }) {
  const roles = [
    { label: 'PRODUCT OWNER', sub: 'WHAT & WHY', color: '#60a5fa', x: -2.4 },
    { label: 'SCRUM MASTER', sub: 'COACH', color: '#ec4899', x: 0 },
    { label: 'DELIVERY TEAM', sub: 'HOW', color: '#32ff7e', x: 2.4 },
  ]

  return (
    <group position={props.position}>
      {roles.map((role, i) => (
        <Float key={role.label} speed={1.3 + i * 0.2} rotationIntensity={0.12} floatIntensity={0.4}>
          <group position={[role.x, 0, i === 1 ? -0.6 : 0]}>
            <mesh>
              <boxGeometry args={[1.9, 2.5, 0.12]} />
              <meshStandardMaterial color={role.color} transparent opacity={0.16} metalness={0.3} roughness={0.2} />
              <Edges scale={1.01} color={role.color} />
            </mesh>
            <Text position={[0, 0.45, 0.1]} fontSize={0.22} color={role.color} anchorX="center" maxWidth={1.7} textAlign="center">
              {role.label}
            </Text>
            <Text position={[0, -0.15, 0.1]} fontSize={0.14} color="#ffffff" anchorX="center" letterSpacing={0.2}>
              {role.sub}
            </Text>
          </group>
        </Float>
      ))}
    </group>
  )
}

/** Un ticket de commande : face papier, pastille, lignes — comme la file
    de commandes du jeu. Le ticket prioritaire porte une étoile dorée. */
function BacklogTicket({ priority = false }: { priority?: boolean }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.7, 0.95, 0.03]} />
        <meshStandardMaterial color="#efe7d8" roughness={0.6} />
        <Edges scale={1.01} color="#ffd700" />
      </mesh>
      <mesh position={[0, 0.18, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.02, 18]} />
        <meshStandardMaterial color="#ff8c42" emissive="#ff8c42" emissiveIntensity={priority ? 1.2 : 0.7} toneMapped={false} />
      </mesh>
      {[-0.12, -0.28].map((y) => (
        <mesh key={y} position={[0, y, 0.025]}>
          <boxGeometry args={[0.42, 0.04, 0.01]} />
          <meshStandardMaterial color="#9a9285" />
        </mesh>
      ))}
      {priority && (
        <mesh geometry={starGeometry} position={[0, 0.78, 0]} scale={0.55}>
          <meshStandardMaterial color="#ffd700" emissive="#ffb700" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}

/** Tickets de commande dérivant en anneau — le backlog priorisé */
function OrderTickets(props: { position: [number, number, number] }) {
  const group = useRef<THREE.Group>(null!)

  useFrame((state, delta) => {
    group.current.rotation.y += delta * 0.12
    group.current.children.forEach((child, i) => {
      child.position.y = Math.sin(state.clock.elapsedTime * 0.8 + i * 1.3) * 0.4
    })
  })

  return (
    <group position={props.position} ref={group}>
      {/* le useFrame mute children[i].position.y : chaque ticket reste un
          enfant direct du groupe (l'étoile vit DANS le ticket prioritaire) */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const r = 2 + (i % 3) * 0.7
        return (
          <group key={i} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]} rotation={[0, -angle, 0.06]}>
            <BacklogTicket priority={i === 0} />
          </group>
        )
      })}
    </group>
  )
}

/** Tableau kanban : trois colonnes TODO / DOING / DONE et leurs post-its */
function KanbanBoard(props: { position: [number, number, number] }) {
  const columns = [
    { label: 'TODO', color: '#ff6b1a', cards: 3 },
    { label: 'DOING', color: '#ffd700', cards: 2 },
    { label: 'DONE', color: '#32ff7e', cards: 4 },
  ]

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.35}>
      <group position={props.position} rotation={[0, -0.35, 0]}>
        <mesh>
          <boxGeometry args={[3.3, 2.6, 0.08]} />
          <meshStandardMaterial color="#141019" transparent opacity={0.55} metalness={0.3} roughness={0.4} />
          <Edges scale={1.005} color="#ff6b1a" />
        </mesh>
        {/* séparateurs de colonnes */}
        {[-0.525, 0.525].map((x) => (
          <mesh key={x} position={[x, -0.12, 0.05]}>
            <boxGeometry args={[0.012, 2.1, 0.01]} />
            <meshStandardMaterial color="#ff6b1a" emissive="#ff6b1a" emissiveIntensity={0.6} toneMapped={false} transparent opacity={0.5} />
          </mesh>
        ))}
        {columns.map((col, i) => (
          <group key={col.label} position={[(i - 1) * 1.05, 0, 0.06]}>
            <Text position={[0, 1.02, 0]} fontSize={0.17} color={col.color} anchorX="center" letterSpacing={0.12}>
              {col.label}
            </Text>
            {Array.from({ length: col.cards }, (_, j) => (
              <mesh key={j} position={[0, 0.55 - j * 0.52, 0]} rotation={[0, 0, (i + j) % 2 === 0 ? 0.03 : -0.04]}>
                <boxGeometry args={[0.8, 0.38, 0.03]} />
                <meshStandardMaterial color={col.color} emissive={col.color} emissiveIntensity={0.35} transparent opacity={0.85} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </Float>
  )
}

/** Le ticket User Story doré — la commande la plus précieuse du backlog.
    Au survol, il se présente face caméra et s'embrase légèrement. */
function UserStoryTicket(props: { position: [number, number, number] }) {
  const halo = useRef<THREE.Mesh>(null!)
  const card = useRef<THREE.Group>(null!)
  const glow = useRef(0)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  const lines = ['En tant que [rôle]', 'Je veux [objectif]', 'Afin de [valeur]']

  useFrame((state, delta) => {
    glow.current = THREE.MathUtils.damp(glow.current, hovered ? 1 : 0, 5, delta)
    card.current.rotation.y = THREE.MathUtils.damp(card.current.rotation.y, hovered ? 0 : -0.3, 5, delta)
    // l'échelle porte le pulse ET la surbrillance — l'opacity appartient au SlideFade
    halo.current.scale.setScalar((1 + Math.sin(state.clock.elapsedTime * 1.8) * 0.06) * (1 + glow.current * 0.35))
  })

  return (
    <Float speed={1.4} rotationIntensity={0.18} floatIntensity={0.45}>
      <group ref={card} position={props.position} rotation={[0, -0.3, 0.02]}>
        {/* halo doré derrière le ticket */}
        <mesh ref={halo} position={[0, 0, -0.06]}>
          <planeGeometry args={[1.9, 2.5]} />
          <meshBasicMaterial color="#ffd700" transparent opacity={0.08} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh
          onPointerOver={(event) => {
            event.stopPropagation()
            setHovered(true)
          }}
          onPointerOut={() => setHovered(false)}>
          <boxGeometry args={[1.7, 2.3, 0.05]} />
          <meshStandardMaterial color="#2a1d00" metalness={0.45} roughness={0.3} />
          <Edges scale={1.01} color="#ffd700" />
        </mesh>
        {/* ligne de perforation du ticket */}
        <mesh position={[0, 0.74, 0.035]}>
          <boxGeometry args={[1.5, 0.012, 0.01]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.8} toneMapped={false} transparent opacity={0.6} />
        </mesh>
        <Text position={[0, 0.92, 0.04]} fontSize={0.165} color="#ffd700" anchorX="center" letterSpacing={0.14}>
          USER STORY
        </Text>
        {lines.map((line, i) => (
          <Text key={line} position={[-0.7, 0.45 - i * 0.42, 0.04]} fontSize={0.15} color="#ffffff" anchorX="left">
            {line}
          </Text>
        ))}
        <Text position={[0, -0.95, 0.04]} fontSize={0.13} color="#32ff7e" anchorX="center" letterSpacing={0.08}>
          DoD · SPRINT GOAL · 3 ÉTOILES
        </Text>
      </group>
    </Float>
  )
}

/** Maillons enchaînés Overcooked ↔ Scrum, cœur battant à leur intersection */
function ScrumLinks(props: { position: [number, number, number] }) {
  const group = useRef<THREE.Group>(null!)
  const heart = useRef<THREE.Group>(null!)

  useFrame((state) => {
    // oscillation (pas de tour complet) : l'anneau orange reste toujours
    // au-dessus du label OVERCOOKED, le cyan au-dessus de SCRUM
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.5
    // battement en deux temps (lub-dub) : deux gaussiennes rapprochées,
    // la seconde plus faible — physiologique, pas métronomique
    const c = (state.clock.elapsedTime * 1.15) % 1
    const lub = Math.exp(-Math.pow((c - 0.1) / 0.045, 2))
    const dub = Math.exp(-Math.pow((c - 0.28) / 0.055, 2)) * 0.5
    heart.current.scale.setScalar(1.2 * (1 + 0.3 * lub + 0.16 * dub))
  })

  return (
    <group position={props.position}>
      <group ref={group}>
        {/* embriquement par projection : décalés en z (jeu 0,12 aux
            croisements visuels), les anneaux se chevauchent sans se toucher */}
        <mesh position={[-0.45, 0, 0.16]} rotation={[0, -0.18, 0]}>
          <torusGeometry args={[0.85, 0.1, 14, 72]} />
          <meshStandardMaterial color="#ff6b1a" emissive="#ff6b1a" emissiveIntensity={1.2} toneMapped={false} metalness={0.3} roughness={0.35} />
        </mesh>
        <mesh position={[0.45, 0, -0.16]} rotation={[0, 0.18, 0]}>
          <torusGeometry args={[0.85, 0.1, 14, 72]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.2} toneMapped={false} metalness={0.3} roughness={0.35} />
        </mesh>
        {/* le cœur commun pulse devant l'embriquement, bien visible */}
        <group ref={heart} position={[0, 0, 0.55]}>
          <mesh position={[-0.09, 0.07, 0]}>
            <sphereGeometry args={[0.16, 14, 14]} />
            <meshStandardMaterial color="#ff2d55" emissive="#ff2d55" emissiveIntensity={1.8} toneMapped={false} />
          </mesh>
          <mesh position={[0.09, 0.07, 0]}>
            <sphereGeometry args={[0.16, 14, 14]} />
            <meshStandardMaterial color="#ff2d55" emissive="#ff2d55" emissiveIntensity={1.8} toneMapped={false} />
          </mesh>
          <mesh position={[0, -0.1, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.21, 0.34, 12]} />
            <meshStandardMaterial color="#ff2d55" emissive="#ff2d55" emissiveIntensity={1.8} toneMapped={false} />
          </mesh>
        </group>
      </group>
      <Text position={[-0.95, -1.45, 0]} fontSize={0.16} color="#ff6b1a" anchorX="center" letterSpacing={0.1}>
        OVERCOOKED
      </Text>
      <Text position={[0.95, -1.45, 0]} fontSize={0.16} color="#00e5ff" anchorX="center" letterSpacing={0.1}>
        SCRUM
      </Text>
    </group>
  )
}

/** Totems des frameworks : une stèle par colonne du tableau comparatif */
function FrameworkTotems(props: { position: [number, number, number] }) {
  const totems = [
    { label: 'SCRUM', color: '#00e5ff', height: 2.2, x: -1.65 },
    { label: 'SAFe', color: '#ffd700', height: 2.8, x: -0.55 },
    { label: 'KANBAN', color: '#32ff7e', height: 1.8, x: 0.55 },
    { label: 'WATERFALL', color: '#ff2d55', height: 1.3, x: 1.65 },
  ]

  return (
    <group position={props.position}>
      {totems.map((totem, i) => (
        <Float key={totem.label} speed={1 + i * 0.15} rotationIntensity={0.06} floatIntensity={0.2}>
          <group position={[totem.x, 0, (i % 2) * -0.5]}>
            {/* stèle : trois segments empilés, de section décroissante */}
            {Array.from({ length: 3 }, (_, j) => (
              <mesh key={j} position={[0, (j + 0.5) * (totem.height / 3), 0]}>
                <boxGeometry args={[0.5 - j * 0.09, totem.height / 3 - 0.06, 0.5 - j * 0.09]} />
                <meshStandardMaterial color="#10131c" emissive={totem.color} emissiveIntensity={0.25 + j * 0.18} metalness={0.4} roughness={0.35} />
                <Edges scale={1.01} color={totem.color} />
              </mesh>
            ))}
            {/* fanal au sommet */}
            <mesh position={[0, totem.height + 0.16, 0]}>
              <octahedronGeometry args={[0.14, 0]} />
              <meshStandardMaterial color={totem.color} emissive={totem.color} emissiveIntensity={1.6} toneMapped={false} />
            </mesh>
            <Text position={[0, totem.height + 0.46, 0]} fontSize={0.16} color={totem.color} anchorX="center" letterSpacing={0.1}>
              {totem.label}
            </Text>
          </group>
        </Float>
      ))}
    </group>
  )
}

/**
 * Zone Agilité (slides 7 à 13) : kanban, cycle empirique, brigade Scrum,
 * tickets de backlog, maillons, totems — un décor par slide, PILE sur son z,
 * toujours du côté opposé à la carte texte.
 */
export function ZoneAgile() {
  const z = (slideOffset: number) => -slideOffset * SLIDE_SPACING

  return (
    <group>
      {/* slide 7 — back to work : le kanban en poste (carte à gauche → décor à droite) */}
      <SlideFade from={6}>
        <KanbanBoard position={[3.7, 0.85, z(0)]} />
      </SlideFade>
      {/* slide 8 — approche empirique (carte à droite → cycle à gauche) */}
      <SlideFade from={7}>
        <group position={[-3.4, 0.9, z(1)]} scale={0.8}>
          <EmpiricalCycle position={[0, 0, 0]} />
        </group>
      </SlideFade>
      {/* slide 9 — la brigade, dégagée à droite de la carte et entière dans
          le champ : à 1440px (aspect 1,6) le lacet caméra vers le centre
          rétrécit le bord droit — x = 3,5 garde le panneau DELIVERY TEAM entier */}
      <SlideFade from={8}>
        <group position={[3.5, 0.9, z(2)]} scale={0.55} rotation={[0, -0.18, 0]}>
          <Brigade position={[0, 0, 0]} />
        </group>
      </SlideFade>
      {/* slide 10 — backlog : l'anneau de tickets, à gauche (carte à droite) */}
      <SlideFade from={9}>
        <group position={[-3.6, 0.9, z(3)]} scale={0.75}>
          <OrderTickets position={[0, 0, 0]} />
        </group>
      </SlideFade>
      {/* slide 11 — la User Story du Sprint 2 : le ticket doré, à droite.
          Le rail caméra est déporté à -2,4 ici : x = 2,2 le garde entier dans le champ. */}
      <SlideFade from={10}>
        <UserStoryTicket position={[2.2, 0.95, z(4)]} />
      </SlideFade>
      {/* slide 12 — mapping : maillons Overcooked ↔ Scrum embriqués, à gauche */}
      <SlideFade from={11}>
        <ScrumLinks position={[-3.6, 1, z(5)]} />
      </SlideFade>
      {/* slide 13 — frameworks : un totem par framework, à droite */}
      <SlideFade from={12}>
        <FrameworkTotems position={[4, -1.2, z(6)]} />
      </SlideFade>
    </group>
  )
}
