import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base must match the GitHub Pages project path:
// https://<user>.github.io/IO-for-main-page/
export default defineConfig({
  base: '/IO-for-main-page/',
  plugins: [react()],
})
