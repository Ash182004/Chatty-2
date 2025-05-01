import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss' // Updated import

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Now using the correct Tailwind plugin
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: '../dist', // Adjust based on your project structure
    emptyOutDir: true,
  },
  optimizeDeps: {
    include: ['@vitejs/plugin-react', 'tailwindcss'],
  }
})
