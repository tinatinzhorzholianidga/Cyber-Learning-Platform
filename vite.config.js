import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base must match the GitHub Pages project path:
// https://<user>.github.io/Cyber-Learning-Platform/
export default defineConfig({
  base: '/Cyber-Learning-Platform/',
  plugins: [react()],
})
