import { useProgress } from '@react-three/drei'
import { useShow } from '../../store'

export function LoadingScreen() {
  const { progress, active } = useProgress()
  const started = useShow((s) => s.started)
  const start = useShow((s) => s.start)
  const ready = !active || progress >= 100

  return (
    <div className="loading-screen" data-hidden={started} aria-hidden={started}>
      <div className="loading-kicker">🍳 SFEIR ONBOARDING</div>
      <div className="loading-title">
        THE AGILE
        <br />
        KITCHEN
      </div>
      <div className="loading-sub">— AI × EXPÉRIENCE 3D</div>
      <div className="loading-bar" role="progressbar" aria-valuenow={Math.round(progress)}>
        <div style={{ width: `${ready ? 100 : progress}%` }} />
      </div>
      <button className="start-button" onClick={start} disabled={!ready} autoFocus>
        {ready ? 'ENTRER EN CUISINE' : 'CHARGEMENT…'}
      </button>
    </div>
  )
}
