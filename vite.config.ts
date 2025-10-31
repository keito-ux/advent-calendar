import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 👇 GitHub Pages用のベースパスを指定
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env,
  },
  base: '/advent-calendar/',
})
