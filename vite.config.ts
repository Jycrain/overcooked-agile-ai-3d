import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  plugins: [react()],
  // host: true → accessible depuis le réseau local (présentation sur un autre écran)
  server: { host: true },
  preview: { host: true },
  build: {
    // three (~700 ko) et r3f (~640 ko) sont des vendors stables et déjà découpés :
    // au-delà de 750 ko, le warning redevient pertinent
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        // vendors séparés du code applicatif : le navigateur les met en cache
        // une bonne fois — seules les retouches de slides invalident le petit chunk
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing', 'postprocessing'],
        },
      },
    },
  },
})
