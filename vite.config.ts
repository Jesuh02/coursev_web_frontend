import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [vue(), cloudflare()],
  define: {
    // Fallback para cuando las variables de entorno no están disponibles en el build
    'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(
      process.env.VITE_GOOGLE_CLIENT_ID ||
      '650106105156-2pc3eojksd6ino17oghdouncb25ub75h.apps.googleusercontent.com'
    ),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/dev-proxy/qa': {
        target: 'https://mcp-backenddeploy-production-4ed0.up.railway.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dev-proxy\/qa/, ''),
      },
      '/dev-proxy/incat': {
        target: 'https://mcp-backenddeploy-production.up.railway.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dev-proxy\/incat/, ''),
      },
    },
  },
})