import { useEffect, useRef, useState } from 'react'
import { useShow } from '../../store'

const RADIUS = 64
const CIRC = 2 * Math.PI * RADIUS

function format(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

/**
 * Minuteur d'atelier porté de la présentation originale : anneau SVG,
 * START/RESET, touche T (via timerSignal du store), couleur vert → orange → rouge.
 */
export function Timer({ seconds, slideIndex }: { seconds: number; slideIndex: number }) {
  const [left, setLeft] = useState(seconds)
  const [running, setRunning] = useState(false)
  const timerSignal = useShow((s) => s.timerSignal)
  const lastSignal = useRef(timerSignal)

  // comme l'original : repartir après expiration recharge la durée complète
  const toggle = () => {
    setLeft((l) => (l === 0 ? seconds : l))
    setRunning((r) => !r)
  }

  // touche T : ne réagit que si ce minuteur appartient au slide courant
  useEffect(() => {
    if (timerSignal !== lastSignal.current) {
      lastSignal.current = timerSignal
      if (useShow.getState().currentSlide === slideIndex) toggle()
    }
  })

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          setRunning(false)
          return 0
        }
        return l - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  const color = left > 60 ? 'var(--green)' : left > 30 ? 'var(--orange)' : 'var(--red)'
  const progress = left / seconds

  return (
    <div className="block-timer" data-expired={left === 0}>
      <div className="timer-ring" data-critical={running && left <= 30}>
        <svg width="150" height="150" viewBox="0 0 150 150">
          <circle cx="75" cy="75" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
          <circle
            cx="75"
            cy="75"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.5s' }}
          />
        </svg>
        <div className="digits" style={{ color }}>
          {format(left)}
        </div>
      </div>
      <div className="timer-buttons">
        <button onClick={toggle}>{running ? '⏸ PAUSE' : '▶ START'}</button>
        <button
          onClick={() => {
            setRunning(false)
            setLeft(seconds)
          }}>
          ↺ RESET
        </button>
      </div>
    </div>
  )
}
