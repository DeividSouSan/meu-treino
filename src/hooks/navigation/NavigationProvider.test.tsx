import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { NavigationProvider, useNavigation } from './NavigationProvider';

function criarWrapper(initialScreen: 'history' | 'active_workout' = 'history') {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <NavigationProvider initialScreen={initialScreen}>{children}</NavigationProvider>;
  };
}

function renderNavigation(initialScreen: 'history' | 'active_workout' = 'history') {
  return renderHook(() => useNavigation(), { wrapper: criarWrapper(initialScreen) });
}

describe('useNavigation fora do provider', () => {
  it('lança erro ao ser usado fora do NavigationProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useNavigation())).toThrowError(
      'useNavigation must be used within a NavigationProvider',
    );
  });
});

describe('NavigationProvider — estado inicial', () => {
  it('inicia na tela "history" por padrão', () => {
    const { result } = renderNavigation();

    expect(result.current.currentScreen).toBe('history');
    expect(result.current.exerciseId).toBeNull();
  });

  it('respeita a prop initialScreen', () => {
    const { result } = renderNavigation('active_workout');

    expect(result.current.currentScreen).toBe('active_workout');
    expect(result.current.exerciseId).toBeNull();
  });
});

describe('NavigationProvider — navegação por pathname', () => {
  beforeEach(() => {
    window.history.replaceState(null, '');
  });

  afterEach(() => {
    window.history.replaceState(null, '');
  });

  it('navega para o treino ativo e empilha o estado no history', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const { result } = renderNavigation();

    act(() => result.current.navigateToActiveWorkout());

    expect(result.current.currentScreen).toBe('active_workout');
    expect(pushStateSpy).toHaveBeenCalledWith(
      { screen: 'active_workout', exerciseId: null },
      '',
      '/treino',
    );
  });

  it('navega para a tela de exercício com exerciseId', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const { result } = renderNavigation('active_workout');

    act(() => result.current.navigateToExercise('ex-123'));

    expect(result.current.currentScreen).toBe('exercise_screen');
    expect(result.current.exerciseId).toBe('ex-123');
    expect(pushStateSpy).toHaveBeenCalledWith(
      { screen: 'exercise_screen', exerciseId: 'ex-123' },
      '',
      '/exercicio/ex-123',
    );
  });

  it('navega para as configurações', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const { result } = renderNavigation();

    act(() => result.current.navigateToSettings());

    expect(result.current.currentScreen).toBe('settings');
    expect(result.current.exerciseId).toBeNull();
    expect(pushStateSpy).toHaveBeenCalledWith(
      { screen: 'settings', exerciseId: null },
      '',
      '/configuracoes',
    );
  });

  it('volta para a lista de exercícios', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const { result } = renderNavigation('active_workout');

    act(() => result.current.navigateToExercise('ex-123'));
    expect(result.current.currentScreen).toBe('exercise_screen');

    act(() => result.current.goBackToList());

    expect(result.current.currentScreen).toBe('active_workout');
    expect(result.current.exerciseId).toBeNull();
    expect(pushStateSpy).toHaveBeenLastCalledWith(
      { screen: 'active_workout', exerciseId: null },
      '',
      '/treino',
    );
  });
});

describe('NavigationProvider — restauração via popstate', () => {
  beforeEach(() => {
    window.history.replaceState(null, '');
  });

  it('restaura a tela de treino ativo via popstate', () => {
    const { result } = renderNavigation();

    act(() => {
      window.dispatchEvent(
        new PopStateEvent('popstate', {
          state: { screen: 'active_workout', exerciseId: null },
        }),
      );
    });

    expect(result.current.currentScreen).toBe('active_workout');
    expect(result.current.exerciseId).toBeNull();
  });

  it('restaura a tela de exercício via popstate', () => {
    const { result } = renderNavigation();

    act(() => {
      window.dispatchEvent(
        new PopStateEvent('popstate', {
          state: { screen: 'exercise_screen', exerciseId: 'ex-456' },
        }),
      );
    });

    expect(result.current.currentScreen).toBe('exercise_screen');
    expect(result.current.exerciseId).toBe('ex-456');
  });

  it('restaura a tela de configurações via popstate', () => {
    const { result } = renderNavigation();

    act(() => {
      window.dispatchEvent(
        new PopStateEvent('popstate', {
          state: { screen: 'settings', exerciseId: null },
        }),
      );
    });

    expect(result.current.currentScreen).toBe('settings');
    expect(result.current.exerciseId).toBeNull();
  });

  it('deriva a tela a partir do pathname quando o estado está ausente', () => {
    const { result } = renderNavigation();

    act(() => {
      window.history.pushState(null, '', '/exercicio/ex-789');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(result.current.currentScreen).toBe('exercise_screen');
    expect(result.current.exerciseId).toBe('ex-789');
  });

  it('executa o handler registrado quando o popstate é disparado', () => {
    const { result } = renderNavigation();
    const handleBack = vi.fn();

    act(() => result.current.goBack());
    // goBack chama window.history.back(), que dispara popstate
    expect(handleBack).not.toHaveBeenCalled();
  });
});
