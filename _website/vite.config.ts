import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
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
        background_color: '#F8F6F0',
        display: 'standalone',
        icons: [
          {
            src: 'https://cdn.iconscout.com/icon/free/png-256/free-box-186-431526.png', // Temporary SVG path for demo
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: 'https://cdn.iconscout.com/icon/free/png-512/free-box-186-431526.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          }
        ]
      }
    })
  ],
  server: {
    port: 8888,
    strictPort: true,
  },
})
