import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
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
  build: {
    // Nunca generar source maps en producción — evita que el código sea legible
    //  en DevTools
    sourcemap: false,
    // Terser: minificación agresiva — ofusca nombres de variables, clases y propiedades
    minify: 'terser',
    terserOptions: {
      compress: {
        // Elimina todos los console.* en producción
        drop_console: true,
        drop_debugger: true,
        // Colapsa variables y reduce ramificaciones
        passes: 3,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      },
      mangle: {
        // Ofusca nombres de propiedades de módulos
        toplevel: true,
      },
      format: {
        // Elimina todos los comentarios del bundle
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        // Nombres de chunk sin información semántica
        chunkFileNames: 'assets/[hash].js',
        entryFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]',
        // Separar vendors del código de la app
        manualChunks(id) {
          if (id.includes('node_modules')) return 'v'
        },
      },
    },
  },
})
