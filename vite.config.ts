import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Meu Treino',
        short_name: 'Meu Treino',
        description: 'Aplicativo pessoal e minimalista para rastreamento de musculação.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  test: {
    // Ambiente jsdom simula o DOM do navegador para testes de componentes React.
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/vitest-setup.ts'],
    // Arquivos de teste seguem o padrão *.test.tsx/ts
    include: ['src/**/*.test.{ts,tsx}'],
    // Coleta cobertura de código para identificar lacunas.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  }
})

