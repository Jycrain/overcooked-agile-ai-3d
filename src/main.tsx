import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/fonts.css'
import './styles/global.css'

type RootContainer = HTMLElement & { __appRoot?: ReturnType<typeof createRoot> }

const container = document.getElementById('root')! as RootContainer

// En dev, le client Vite peut réévaluer ce module DANS LA MÊME PAGE (re-import
// estampillé ?t=… après un full-reload de l'optimiseur). Sans garde, chaque
// réévaluation crée une nouvelle racine React par-dessus l'ancienne : l'app
// orpheline continue de tourner (canvas WebGL détaché, listeners et useFrame
// dupliqués) jusqu'à l'écran noir. On mémorise la racine sur le conteneur :
// la réévaluation réutilise la même et re-render proprement.
container.__appRoot ??= createRoot(container)
container.__appRoot.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
