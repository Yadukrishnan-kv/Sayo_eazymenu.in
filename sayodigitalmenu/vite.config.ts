import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/** In dev, serve admin/index.html for /admin and /admin/* so the admin app loads instead of the main app. */
function adminEntryPlugin() {
  return {
    name: 'admin-entry',
    configureServer(server) {
      const middleware = (req: any, res: any, next: () => void) => {
        const pathname = req.url?.split('?')[0] ?? ''
        const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/')
        const isFile = pathname.includes('.')
        if (isAdminPath && !isFile) {
          const q = req.url?.includes('?') ? '?' + req.url.slice(req.url.indexOf('?') + 1) : ''
          req.url = '/admin/index.html' + q
        }
        next()
      }
      // Run before Vite's HTML fallback so /admin/* gets admin/index.html
      server.middlewares.stack.unshift({ route: '', handle: middleware })
    },
  }
}

export default defineConfig({
  plugins: [adminEntryPlugin(), react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        admin: path.resolve(__dirname, 'admin/index.html'),
      },
    },
  },
})
