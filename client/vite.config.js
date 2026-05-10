import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Improve build performance
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id === 'vendor') {
            return ['react', 'react-dom'];
          }
          if (id === 'clerk') {
            return ['@clerk/clerk-react', '@clerk/react'];
          }
          return undefined;
        }
      }
    }
  },
  optimizeDeps: {
    // Optimize dependencies for better build performance
    include: ['react', 'react-dom', '@clerk/clerk-react']
  },
  server: {
    // Increase timeout for build process
    hmr: {
      timeout: 30000
    }
  },
  define: {
    // Define global constants for build
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
})
