import { useEffect, useRef } from 'react'
import { useShow } from '../../store'

/**
 * Popup d'information des neurones (slide « Le réseau, en 3D ») :
 * panneau DOM fixe qui suit le curseur — catégorie du neurone, rôle
 * réseau de neurones, et description de la métaphore Scrum.
 */
export function NeuronTip() {
  const info = useShow((s) => s.hoveredNeuron)
  const currentSlide = useShow((s) => s.currentSlide)
  const setHoveredNeuron = useShow((s) => s.setHoveredNeuron)
  const box = useRef<HTMLDivElement>(null)
  const cursor = useRef({ x: 0, y: 0 })

  const place = () => {
    if (!box.current) return
    const w = 270
    const x = Math.min(cursor.current.x + 18, window.innerWidth - w - 12)
    const y = Math.max(cursor.current.y - 16, 12)
    box.current.style.transform = `translate(${x}px, ${y}px) translateY(-100%)`
  }

  // suit le curseur sans re-render (mutation directe du transform)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      cursor.current = { x: e.clientX, y: e.clientY }
      place()
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // au montage de la popup (souris immobile au moment du hover), se placer
  // immédiatement sur la dernière position connue du curseur
  useEffect(() => {
    if (info) place()
  }, [info])

  // si on quitte le slide pendant un survol, la popup ne doit pas rester
  useEffect(() => {
    if (info) setHoveredNeuron(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide])

  if (!info) return null

  return (
    <div
      ref={box}
      className="neuron-tip"
      style={{ borderColor: info.color, boxShadow: `0 0 28px ${info.color}66` }}
      role="tooltip">
      <div className="neuron-tip-name" style={{ color: info.color }}>
        {info.name}
      </div>
      <div className="neuron-tip-role" style={{ borderColor: `${info.color}88`, background: `${info.color}1a` }}>
        {info.role}
      </div>
      <div className="neuron-tip-detail">{info.detail}</div>
    </div>
  )
}
