import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
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
