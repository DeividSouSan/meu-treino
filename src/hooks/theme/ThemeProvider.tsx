import { useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme, type ThemeContextType } from './ThemeContext';

export type { Theme, ThemeContextType } from './ThemeContext';

/**
 * Chave compartilhada com o script inline de `index.html`, que aplica o tema
 * antes do primeiro paint para evitar flash de tela clara. Mantenha as duas
 * referências em sincronia.
 */
const THEME_STORAGE_KEY = 'meu_treino_theme';

/**
 * Cores usadas na meta tag theme-color do navegador/PWA. Mantenha em sincronia
 * com o script inline de `index.html`.
 */
const THEME_COLOR_META = {
  light: '#ffffff',
  dark: '#1a1a1a',
} as const;

export interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Lê o tema salvo de forma síncrona, para que o primeiro render já use a
 * preferência do usuário em vez de aplicar 'system' e depois corrigir.
 */
function getStoredTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
    return storedTheme;
  }

  return 'system';
}

/**
 * Consulta a preferência de tema escuro do sistema operacional.
 */
function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Resolve o tema efetivo ('light' | 'dark') a partir do tema configurado,
 * respeitando a preferência do sistema quando o tema é 'system'.
 */
function resolveTheme(theme: Theme, systemPrefersDark: boolean): 'light' | 'dark' {
  if (theme !== 'system') {
    return theme;
  }

  return systemPrefersDark ? 'dark' : 'light';
}

/**
 * Aplica o tema resolvido como atributo data-theme no elemento <html> e
 * atualiza a meta tag theme-color do HTML para integração com PWA/navegador.
 */
function applyTheme(resolvedTheme: 'light' | 'dark'): void {
  document.documentElement.setAttribute('data-theme', resolvedTheme);

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', THEME_COLOR_META[resolvedTheme]);
  }
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(getSystemPrefersDark);

  const resolvedTheme = resolveTheme(theme, systemPrefersDark);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (theme !== 'system') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches);
    };

    setSystemPrefersDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }, []);

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
