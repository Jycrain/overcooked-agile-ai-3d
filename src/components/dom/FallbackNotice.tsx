export function FallbackNotice() {
  return (
    <div className="fallback-notice">
      <h1>react-three-fiber</h1>
      <p>Votre navigateur ne prend pas en charge WebGL — l’expérience 3D ne peut pas démarrer.</p>
      <a href="https://github.com/pmndrs/react-three-fiber">github.com/pmndrs/react-three-fiber</a>
    </div>
  )
}

export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}
