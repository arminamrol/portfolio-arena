/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Model files count as assets, so tests can read them through Vite.
  assetsInclude: ['**/*.glb'],
  test: {
    environment: 'jsdom',
  },
})
