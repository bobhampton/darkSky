import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { PAGE_ROUTES } from './src/seo/routes'
import { pageFileName, renderPageHtml, renderSitemap } from './src/seo/staticPages'

/**
 * Writes a static HTML file per public route and generates sitemap.xml.
 * Without this, GitHub Pages answers /faq etc. with 404.html (HTTP 404).
 */
function staticPages(): Plugin {
  let outDir = 'dist'

  return {
    name: 'darksky-static-pages',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const indexHtml = fs.readFileSync(path.join(outDir, 'index.html'), 'utf-8')

      for (const route of PAGE_ROUTES) {
        if (route.path === '/') continue
        fs.writeFileSync(path.join(outDir, pageFileName(route.path)), renderPageHtml(indexHtml, route))
      }

      const lastmod = new Date().toISOString().slice(0, 10)
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), renderSitemap(PAGE_ROUTES, lastmod))
    },
  }
}

const VENDOR_CHUNKS: Record<string, string[]> = {
  astronomy: ['astronomy-engine'],
  charts: ['chart.js', '@kurkle/color', 'react-chartjs-2'],
  luxon: ['luxon'],
  'react-vendor': ['react', 'react-dom', 'scheduler', 'react-router', 'react-router-dom'],
  leaflet: ['leaflet', 'react-leaflet', '@react-leaflet/core'],
}

/**
 * Assigns vendor modules to chunks by package name. Matching every file in a package
 * (not just its entry) keeps internals like react/jsx-runtime out of lazy chunks,
 * which would otherwise force the entry to preload them.
 */
function vendorChunk(id: string): string | undefined {
  const modulePath = id.split('node_modules/').pop()
  if (modulePath === id || !modulePath) return undefined

  const segments = modulePath.split('/')
  const packageName = segments[0].startsWith('@') ? `${segments[0]}/${segments[1]}` : segments[0]
  return Object.keys(VENDOR_CHUNKS).find((chunk) => VENDOR_CHUNKS[chunk].includes(packageName))
}

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), staticPages()],
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
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: vendorChunk,
        // Add hashed filenames for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Increase the size warning limit for initial chunk
    assetsInlineLimit: 4096, // inline assets smaller than 4kb
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@vite/client', '@vite/env'],
  },
})
