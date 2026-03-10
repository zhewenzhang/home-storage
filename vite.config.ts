import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'HomeBox',
        short_name: 'HomeBox',
        description: '智能家庭储物管理系统',
        theme_color: '#3B6D8C',
        background_color: '#F8F9FA',
        display: 'standalone',
        icons: [
          {
            src: 'https://api.iconify.design/lucide:package.svg?color=%233B6D8C',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          }
        ]
      },
      workbox: {
        // Immediately activate new SW without waiting for old tabs to close
        skipWaiting: true,
        clientsClaim: true,
        // Precache HTML (needed for SPA routing) + CSS + static assets, but NOT JS (handled by NetworkFirst below)
        globPatterns: ['**/*.{html,css,ico,png,svg,webp,woff2}'],
        runtimeCaching: [
          {
            // JS chunks: always try network first, fall back to cache only if offline
            urlPattern: /\/assets\/.*\.js$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'js-chunks-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 // 1 day only
              },
              networkTimeoutSeconds: 5,
            }
          },
          {
            // index.html: always try network first
            urlPattern: /\/index\.html$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              networkTimeoutSeconds: 5,
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /.*\.supabase\.co\/storage\/v1\/object\/public\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-ui': ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react'],
          'vendor-db': ['@supabase/supabase-js', 'zustand'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
