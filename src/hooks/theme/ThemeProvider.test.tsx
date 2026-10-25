import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { ThemeProvider, useTheme, type Theme } from './ThemeProvider';

describe('useTheme hook edge cases', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('data-theme');

    // Mock padrão de matchMedia (prefere claro) para o ambiente jsdom
    const defaultMatchMedia = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      media: '',
      onchange: null,
    };
    vi.stubGlobal('matchMedia', (query: string) => {
      if (query === '(prefers-color-scheme: dark)') {
        return { ...defaultMatchMedia, matches: false };
      }
      return defaultMatchMedia;
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );

  it('lança erro ao ser usado fora do ThemeProvider', () => {
    const consoleError = console.error;
    console.error = () => {};

    expect(() => renderHook(() => useTheme())).toThrowError(
      'useTheme must be used within a ThemeProvider',
    );

    console.error = consoleError;
  });

  it('inicia com tema padrão "system" e resolvedTheme "light" (sem preferência escura)', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('light');
  });

  it('define o tema e persiste no localStorage', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
    expect(localStorage.getItem('meu_treino_theme')).toBe('dark');
  });

  it('alterna entre temas claro e escuro', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('dark');
    });
    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');

    act(() => {
      result.current.setTheme('light');
    });
    expect(result.current.theme).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');
    expect(localStorage.getItem('meu_treino_theme')).toBe('light');
  });

  it('carrega o tema salvo no localStorage ao inicializar', () => {
    localStorage.setItem('meu_treino_theme', 'dark');

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('ignora valor inválido salvo no localStorage', () => {
    localStorage.setItem('meu_treino_theme', 'invalido');

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('light');
  });

  it('retorna resolvedTheme "dark" quando tema é system e SO prefere escuro', () => {
    const addEventListenerMock = vi.fn();
    const removeEventListenerMock = vi.fn();
    const matchesDark = {
      matches: true,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
      media: '',
      onchange: null,
    };
    const matchesLight = {
      matches: false,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
      media: '',
      onchange: null,
    };

    vi.stubGlobal('matchMedia', (query: string) => {
      if (query === '(prefers-color-scheme: dark)') {
        return matchesDark;
      }
      return matchesLight;
    });

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('retorna resolvedTheme "light" quando tema é system e SO prefere claro', () => {
    const matchesDark = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      media: '',
      onchange: null,
    };
    const matchesLight = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      media: '',
      onchange: null,
    };

    vi.stubGlobal('matchMedia', (query: string) => {
      if (query === '(prefers-color-scheme: dark)') {
        return matchesDark;
      }
      return matchesLight;
    });

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('light');
  });

  it('aplica data-theme no elemento html ao mudar o tema', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    act(() => {
      result.current.setTheme('light');
    });

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('atualiza a meta tag theme-color de acordo com o tema', () => {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);

    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(meta.getAttribute('content')).toBe('#1a1a1a');

    act(() => {
      result.current.setTheme('light');
    });

    expect(meta.getAttribute('content')).toBe('#ffffff');

    document.head.removeChild(meta);
  });

  it('aceita todos os valores válidos de Theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    const valores: Theme[] = ['light', 'dark', 'system'];

    valores.forEach((valor) => {
      act(() => {
        result.current.setTheme(valor);
      });
      expect(result.current.theme).toBe(valor);
    });
  });
});
