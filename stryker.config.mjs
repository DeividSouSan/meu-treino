/**
 * Configuração do Stryker Mutator (v10).
 *
 * IMPORTANTE: o Stryker só reconhece automaticamente arquivos com os nomes
 * `stryker.conf.{json,js,mjs,cjs}` ou `stryker.config.{json,js,mjs,cjs}`.
 * O antigo `stryker-config.ts` era ignorado e o `defineConfig` importado de
 * `@stryker-mutator/api` não existe na v10. Este arquivo exporta um objeto
 * plano, que é o formato suportado.
 */
export default {
  packageManager: 'npm',
  testRunner: 'vitest',

  // `typescript-checker` é um *checker*, não um mutator.
  checkers: ['typescript'],

  // Analisa cobertura por teste para rodar apenas os testes que cobrem cada mutante.
  coverageAnalysis: 'perTest',

  // Escopo enxuto para manter o mutation testing viável.
  mutate: [
    'src/services/**/*.ts',
    'src/hooks/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/hooks/**/index.ts',
    '!src/hooks/**/*Context.tsx',
  ],

  reporters: ['clear-text', 'html'],

  thresholds: {
    high: 80,
    low: 60,
    break: null,
  },

  timeoutMS: 60_000,

  vitest: {
    configFile: './vite.config.ts',
  },
};
