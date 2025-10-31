import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

<<<<<<< HEAD
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env,
  },
=======
// 👇 GitHubリポジトリ名をここに書く！
export default defineConfig({
  plugins: [react()],
>>>>>>> 1e98cb38 (add Bolt project files)
  base: '/advent-calendar/',
})
