import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // The lazily loaded 3D stage bundles three.js + drei (~1.1 MB, ~310 kB gzip).
    chunkSizeWarningLimit: 1200,
  },
})
