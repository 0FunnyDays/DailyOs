import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site uses the repository name as the base path.
// Keep dev at `/`, build under `/DailyOs/`.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/DailyOs/' : '/',
  plugins: [react()],
}))
