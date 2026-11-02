import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

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
        lang: 'pt-BR',
        description: 'Aplicativo pessoal e minimalista para rastreamento de musculação.',
        // theme_color é usado pelo Android para colorir a barra de navegação/gestos
        // quando o app está instalado como PWA. Como o app suporta modo escuro e
        // o manifest é estático (não reage ao prefers-color-scheme), usamos a cor
        // neutra escura que não causa contraste com nenhum dos dois temas.
        // A meta tag theme-color no HTML assume o controle em tempo de execução.
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
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
      // Inclui arquivos que ainda não foram importados por nenhum teste.
      // Sem isso a cobertura reportada fica artificialmente alta.
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/vitest-setup.ts',
        'src/types/**',
        'src/main.tsx',
      ],
      // Calibrado logo abaixo da cobertura real da suíte (ver Fase 1.2).
      thresholds: {
        statements: 92,
        branches: 85,
        functions: 90,
        lines: 93,
      },
    },
  },
});
