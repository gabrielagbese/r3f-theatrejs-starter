import { resolve } from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Vite Configuration for R3F + Theatre.js Starter
 * 
 * Features:
 * - React plugin for JSX support
 * - Tailwind CSS v4 plugin for styling
 * - Path alias @ -> ./src for clean imports
 * - Theatre.js optimization for faster dev server startup
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  // Pre-bundle Theatre.js packages for faster dev server startup
  optimizeDeps: {
    include: ['@theatre/core', '@theatre/studio', '@theatre/r3f'],
  },
})
