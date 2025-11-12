import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // ローカル開発時は base: '/'、本番ビルド時は base: '/advent-calendar/'
  const base = command === 'serve' ? '/' : '/advent-calendar/'
  
  return {
    plugins: [react()],
    base,
    define: {
      'process.env': process.env,
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // ソースマップは本番では無効化（オプション）
      sourcemap: mode === 'development',
    },
  }
})
