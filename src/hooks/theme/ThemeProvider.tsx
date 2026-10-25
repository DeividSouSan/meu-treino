import { useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme, type ThemeContextType } from './ThemeContext';

export type { Theme, ThemeContextType } from './ThemeContext';

const THEME_STORAGE_KEY = 'meu_treino_theme';

export interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Resolve o tema efetivo ('light' | 'dark') a partir do tema configurado,
 * respeitando a preferência do sistema quando o tema é 'system'.
 */
function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') {
    return theme;
  }
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Aplica o tema resolvido como atributo data-theme no elemento <html> e
 * atualiza a meta tag theme-color do HTML para integração com PWA/navegador.
 */
function applyTheme(resolvedTheme: 'light' | 'dark'): void {
  document.documentElement.setAttribute('data-theme', resolvedTheme);

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', resolvedTheme === 'dark' ? '#1a1a1a' : '#ffffff');
  }
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('system');

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
      setThemeState(storedTheme);
    }
  }, []);

  const resolvedTheme = resolveTheme(theme);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (theme !== 'system') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      applyTheme(resolveTheme(theme));
    };

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
