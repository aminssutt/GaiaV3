import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Bench deployment configuration
// Builds for local server at root path (not /Gaia/)
export default defineConfig({
  plugins: [react()],
  base: '/',  // Root path for bench deployment
  build: {
    outDir: 'dist-bench'
  },
  resolve: {
    alias: {
      three: 'three'
    }
  }
})
