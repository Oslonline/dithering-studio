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
  optimizeDeps: {
    exclude: ['src/workers/dither.worker.ts']
  }
})
