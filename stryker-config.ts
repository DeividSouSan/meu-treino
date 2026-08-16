import { configDefaults, defineConfig } from '@stryker-mutator/api';

export default defineConfig({
  // Configuración general
  packageManager: 'npm',

  // Directorio raíz del proyecto
  testRunner: 'vitest',

  // Patrones para ignorar (no mutar archivos de configuración, etc.)
  skip: [
    // Ignorar tests y setup files
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/vitest-setup.ts',
    '**/node_modules',
    '**/.git',
  ],

  // Mutadores a usar
  mutator: ['typescript-checker', 'javascript'],

  // Reporters para mostrar resultados
  reporters: ['console', 'html'],

  // Configuración de cobertura
  coverageAnalysis: 'off', // Stryker maneja su propia cobertura

  // Configuración específica de vitest-runner
  vitest: {
    configFile: './vite.config.ts',
    // Puedes pasar configuración adicional de vitest aquí
  },

  // Configuración de TypeScript checker
  typescriptChecker: {
    // Puedes configurar opciones adicionales aquí
  },

  // Tiempo de espera en segundos para los tests
  timeout: 60,

  // Umbrales de mutación (opcional)
  // Si el score es menor a esto, el fallo será reportado
  mutationScoreThresholds: {
    global: 80, // Requerir al menos 80% de score de mutación
  },
});
