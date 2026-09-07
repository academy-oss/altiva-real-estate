import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_SITE_BASE || (process.env.GITHUB_ACTIONS ? '/altiva-real-estate/' : '/'),
  plugins: [react()],
})
