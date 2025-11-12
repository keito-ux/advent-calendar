import { defineConfig, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'http'

type NextFunction = () => void

export default defineConfig(({ command, mode }) => {
  const base = command === 'serve' ? '/' : '/advent-calendar/'
  const isProduction = mode === 'production'

  return {
    plugins: [
      react(),
      {
        name: 'csp-headers',
        configureServer(server: ViteDevServer) {
          server.middlewares.use((_req: IncomingMessage, res: ServerResponse, next: NextFunction) => {
            res.setHeader(
              'Content-Security-Policy',
              [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' blob: data: https://cxhpdgmlnfumkxwsyopq.supabase.co https://raw.githack.com https://raw.githubusercontent.com https://pmndrs.github.io https://*.supabase.co https://*.githubusercontent.com",
                "font-src 'self'",
                "connect-src 'self' ws://localhost:* wss://localhost:* blob: data: https://cxhpdgmlnfumkxwsyopq.supabase.co https://raw.githack.com https://raw.githubusercontent.com https://pmndrs.github.io https://*.supabase.co https://*.githubusercontent.com",
                "worker-src 'self' blob:",
                "object-src 'none'",
                "base-uri 'self'"
              ].join('; ')
            )
            next()
          })
        }
      }
    ],
    base,
    define: { 'process.env': process.env },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isProduction,
      rollupOptions: { output: { inlineDynamicImports: false } }
    }
  }
})

