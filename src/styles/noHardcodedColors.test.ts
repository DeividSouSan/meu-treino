import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

/**
 * Guarda contra cores literais em componentes.
 *
 * Cores devem vir de tokens definidos em `src/index.css`, para que o tema
 * claro e o escuro continuem funcionando juntos. A única exceção é o
 * ThemeProvider, que precisa atualizar a meta tag theme-color do navegador.
 */
const SRC_DIR = resolve(process.cwd(), 'src');
const CSS_TOKENS_FILE = join(SRC_DIR, 'index.css');
const ALLOWED_FILES = new Set([join(SRC_DIR, 'hooks/theme/ThemeProvider.tsx')]);
const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);

    if (statSync(fullPath).isDirectory()) {
      return listSourceFiles(fullPath);
    }

    const isSourceFile = /\.(ts|tsx|css)$/.test(entry);
    const isTestFile = /\.test\.(ts|tsx)$/.test(entry);

    return isSourceFile && !isTestFile ? [fullPath] : [];
  });
}

describe('cores literais em componentes', () => {
  it('usa apenas tokens de tema fora do index.css', () => {
    const violations = listSourceFiles(SRC_DIR)
      .filter((file) => file !== CSS_TOKENS_FILE && !ALLOWED_FILES.has(file))
      .flatMap((file) =>
        readFileSync(file, 'utf8')
          .split('\n')
          .flatMap((line, index) =>
            COLOR_LITERAL.test(line)
              ? [`${relative(SRC_DIR, file)}:${index + 1}: ${line.trim()}`]
              : [],
          ),
      );

    expect(violations).toEqual([]);
  });
});
