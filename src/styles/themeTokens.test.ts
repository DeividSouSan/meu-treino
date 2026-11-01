import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

/**
 * Contrato dos tokens de tema.
 *
 * Este teste protege duas regressões comuns:
 * 1. usar um `var(--token)` que não existe (erro de digitação ou token removido);
 * 2. adicionar uma cor no tema claro e esquecer o override no tema escuro.
 *
 * Tokens estruturais (espaçamento, raio e tipografia) não precisam de override.
 */
const SRC_DIR = resolve(process.cwd(), 'src');
const CSS_FILE = join(SRC_DIR, 'index.css');

const STRUCTURAL_TOKENS = new Set([
  '--border-radius',
  '--border-radius-sm',
  '--spacing-xs',
  '--spacing-sm',
  '--spacing-md',
  '--spacing-lg',
  '--font-family',
]);

function extractBlock(css: string, selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, 's'));

  if (!match) {
    throw new Error(`Bloco CSS não encontrado: ${selector}`);
  }

  return match[1];
}

function extractDefinitions(block: string): Set<string> {
  return new Set([...block.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1]));
}

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

function extractUsages(content: string): string[] {
  return [...content.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]);
}

const css = readFileSync(CSS_FILE, 'utf8');
const rootBlock = extractBlock(css, ':root');
const darkBlock = extractBlock(css, "[data-theme='dark']");
const rootTokens = extractDefinitions(rootBlock);
const darkTokens = extractDefinitions(darkBlock);
const sourceFiles = listSourceFiles(SRC_DIR).filter((file) => file !== CSS_FILE);

describe('contrato dos tokens de tema', () => {
  it('define no :root todos os tokens usados em src', () => {
    const missingTokens = sourceFiles.flatMap((file) =>
      extractUsages(readFileSync(file, 'utf8'))
        .filter((token) => !rootTokens.has(token))
        .map((token) => `${token} (${relative(SRC_DIR, file)})`),
    );

    expect(missingTokens).toEqual([]);
  });

  it('define no tema escuro todos os tokens de cor do :root', () => {
    const missingOverrides = [...rootTokens].filter(
      (token) => !STRUCTURAL_TOKENS.has(token) && !darkTokens.has(token),
    );

    expect(missingOverrides).toEqual([]);
  });

  it('não define no tema escuro tokens inexistentes no :root', () => {
    const unknownTokens = [...darkTokens].filter((token) => !rootTokens.has(token));

    expect(unknownTokens).toEqual([]);
  });

  it('declara color-scheme coerente nos dois temas', () => {
    expect(rootBlock).toContain('color-scheme: light');
    expect(darkBlock).toContain('color-scheme: dark');
  });
});
