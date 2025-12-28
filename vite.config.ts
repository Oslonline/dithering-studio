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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('/react-dom/') || id.includes('/react/')) return 'vendor-react';
          if (id.includes('/react-router') || id.includes('/@remix-run/router')) return 'vendor-router';
          if (id.includes('/i18next') || id.includes('/react-i18next')) return 'vendor-i18n';
          if (id.includes('/react-helmet-async')) return 'vendor-helmet';
          if (id.includes('/@vercel/analytics')) return 'vendor-analytics';

          return 'vendor';
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['src/workers/dither.worker.ts']
  }
})
