import { Scroll, ScrollControls, Stars, useScroll } from '@react-three/drei'
import { useEffect } from 'react'
import { slideZ, TOTAL_SLIDES } from '../../content/slides.fr'
import { prefersReducedMotion, useShow } from '../../store'
import { Overlay } from '../dom/Overlay'
import { AmbientEmbers } from './AmbientEmbers'
import { CameraRig } from './CameraRig'
import { ChapterGroup } from './ChapterGroup'
import { CosmicDetails } from './CosmicDetails'
import { KitchenDetails } from './KitchenDetails'
import { Effects } from './Effects'
import { IntroSequence } from './IntroSequence'
import { Lighting } from './Lighting'
import { PerfGuards } from './PerfGuards'
import { SlideFade } from './SlideFade'
import { OrbitTools, ZoneAI } from './zones/ZoneAI'
import { ZoneAgile } from './zones/ZoneAgile'
import { ZoneFinal } from './zones/ZoneFinal'
import { ZoneHero } from './zones/ZoneHero'
import { ZoneLevels } from './zones/ZoneLevels'
import { ZoneNeural } from './zones/ZoneNeural'

/** Capture l'élément scrollable de ScrollControls pour la navigation clavier/flèches */
function ScrollElBridge() {
  const scroll = useScroll()
  const setScrollEl = useShow((s) => s.setScrollEl)
  useEffect(() => {
    setScrollEl(scroll.el)
    return () => setScrollEl(null)
  }, [scroll.el, setScrollEl])
  return null
}

export function Experience() {
  return (
    <>
      {/* l'isolation entre slides est assurée par SlideFade ; le brouillard
          tire les lointains vers un prune chaud — gradient de profondeur
          au lieu d'un fondu noir plat */}
      <color attach="background" args={['#0a0205']} />
      <fogExp2 attach="fog" args={['#140309', 0.018]} />
      <Lighting />
      <PerfGuards />
      <Stars radius={170} depth={260} count={3000} factor={5} saturation={0.5} fade speed={0.5} />
      {/* ambiance permanente entre les slides : braises qui suivent la caméra */}
      <AmbientEmbers />
      {/* ouverture du bal : plongée cosmique + déflagration */}
      <IntroSequence />

      <ScrollControls pages={TOTAL_SLIDES} damping={prefersReducedMotion ? 0 : 0.18}>
        <ScrollElBridge />
        <CameraRig />

        {/* micro-décors cosmiques : deux petits props par slide, sur les bords */}
        <CosmicDetails />
        {/* accessoires de cuisine : l'acte Overcooked × Agilité assume sa thématique */}
        <KitchenDetails />

        {/* Acte I — ouverture (slides 1-2) */}
        <ChapterGroup z={slideZ(0)} range={70}>
          <ZoneHero />
        </ChapterGroup>

        {/* Acte II — les niveaux Overcooked (slides 3-6) */}
        <ChapterGroup z={slideZ(3)} range={120}>
          <group position={[0, 0, slideZ(2) - slideZ(3)]}>
            <ZoneLevels />
          </group>
        </ChapterGroup>

        {/* Acte III — agilité (slides 7-13) */}
        <ChapterGroup z={slideZ(9)} range={160}>
          <group position={[0, 0, slideZ(6) - slideZ(9)]}>
            <ZoneAgile />
          </group>
        </ChapterGroup>

        {/* Acte IV — l'IA entre dans la cuisine (slides 14-17) */}
        <ChapterGroup z={slideZ(14)} range={120}>
          <group position={[0, 0, slideZ(13) - slideZ(14)]}>
            <ZoneAI />
          </group>
        </ChapterGroup>

        {/* Le réseau de neurones en 3D (slides 18-19) */}
        <ChapterGroup z={slideZ(18)} range={80}>
          <SlideFade from={17} to={18}>
            <ZoneNeural position={[0, 1.5, 0]} />
          </SlideFade>
        </ChapterGroup>

        {/* Outils IA en orbite (slide 20, carte à droite → décor à gauche).
            Le rail caméra est déporté à +2,1 ici : x = -2,45 et échelle 0,75
            gardent l'orbite entière dans le champ, parallaxe comprise. */}
        <ChapterGroup z={slideZ(19)} range={60}>
          <SlideFade from={19}>
            <group position={[-2.45, 0.9, 0]} scale={0.75}>
              <OrbitTools />
            </group>
          </SlideFade>
        </ChapterGroup>

        {/* Acte V — Scrum Guide + Merci (slides 21-22) */}
        <ChapterGroup z={slideZ(20)} range={110}>
          <ZoneFinal />
        </ChapterGroup>

        <Scroll html>
          <Overlay />
        </Scroll>
      </ScrollControls>

      <Effects />
    </>
  )
}
