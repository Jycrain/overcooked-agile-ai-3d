import * as THREE from 'three'
import { slides, slideZ, TOTAL_SLIDES } from '../../content/slides.fr'

/**
 * Rail caméra : serpentin doux le long des 22 slides.
 * Les slides « vitrine » (anchor: 'bottom', premier et dernier) sont abordés
 * pile dans l'axe, sans écart latéral, pour un cadrage parfaitement centré.
 */
export const cameraCurve = new THREE.CatmullRomCurve3(
  Array.from({ length: TOTAL_SLIDES }, (_, i) => {
    const centered = i === 0 || i === TOTAL_SLIDES - 1 || slides[i].anchor === 'bottom'
    const lateral = centered ? 0 : Math.sin(i * 1.1) * 2.4
    const height = centered ? 1 : 1 + Math.sin(i * 0.7) * 0.6
    return new THREE.Vector3(lateral, height, slideZ(i) + 9)
  }),
  false,
  'catmullrom',
  0.3,
)

/** Points visés : le centre de chaque slide */
export const lookCurve = new THREE.CatmullRomCurve3(
  Array.from({ length: TOTAL_SLIDES }, (_, i) => new THREE.Vector3(0, 0.7, slideZ(i))),
  false,
  'catmullrom',
  0.3,
)
