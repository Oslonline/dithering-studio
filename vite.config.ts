import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  worker: {
    format: 'es',
    plugins: () => [react()]
  },
  build: {
    // Keep Rollup chunking strategy default/stable.
    // (Custom manualChunks caused a runtime TDZ error in a vendor chunk on deployment.)
    chunkSizeWarningLimit: 650
  },
  optimizeDeps: {
    exclude: ['src/workers/dither.worker.ts']
  }
})
