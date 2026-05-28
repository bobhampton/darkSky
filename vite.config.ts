import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          'astronomy': ['astronomy-engine'],
          'charts': ['chart.js', 'react-chartjs-2'],
          'luxon': ['luxon'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
        // Add hashed filenames for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
})
