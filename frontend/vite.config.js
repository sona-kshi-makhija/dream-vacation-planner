import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During local development, requests to /api are forwarded to the
// Express backend so the browser never needs a hardcoded backend URL.
// In production, Nginx does this same job (see nginx/dream-vacation-planner.conf).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist'
  }
});
