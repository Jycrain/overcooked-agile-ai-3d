import { useShow } from '../../store'

/**
 * Flash plein écran déclenché à la déflagration de l'ouverture.
 * Re-monté à chaque incrément de introFlash (clé), l'animation CSS fait le reste.
 */
export function IntroFlash() {
  const introFlash = useShow((s) => s.introFlash)
  if (introFlash === 0) return null
  return <div key={introFlash} className="intro-flash" aria-hidden />
}
