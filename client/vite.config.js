import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@vkontakte/vk-bridge': '@vkontakte/vk-bridge/dist/index.es.js',
    },
  },
  server: {
    port: 5173,
    allowedHosts: true,
    headers: {
      'X-Frame-Options': 'ALLOWALL',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
