import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { NavigationProvider, useNavigation } from './NavigationProvider';

function criarWrapper(initialView: 'history' | 'active_workout' = 'history') {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <NavigationProvider initialView={initialView}>{children}</NavigationProvider>;
  };
}

function renderNavigation(initialView: 'history' | 'active_workout' = 'history') {
  return renderHook(() => useNavigation(), { wrapper: criarWrapper(initialView) });
}

describe('useNavigation fora do provider', () => {
  it('lança erro ao ser usado fora do NavigationProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useNavigation())).toThrowError(
      'useNavigation must be used within a NavigationProvider',
    );
  });
});

describe('NavigationProvider — navegação entre views', () => {
  beforeEach(() => {
    window.history.replaceState(null, '');
  });

  it('inicia na view "history" por padrão', () => {
    const { result } = renderNavigation();

    expect(result.current.currentView).toBe('history');
  });

  it('respeita a prop initialView', () => {
    const { result } = renderNavigation('active_workout');

    expect(result.current.currentView).toBe('active_workout');
  });

  it('navega para o treino ativo e empilha o estado no histórico do navegador', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const { result } = renderNavigation();

    act(() => result.current.navigateToActiveWorkout());

    expect(result.current.currentView).toBe('active_workout');
    expect(pushStateSpy).toHaveBeenCalledWith({ view: 'active_workout', modals: [] }, '');
  });

  it('volta ao histórico substituindo o estado e limpando os modais', () => {
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    const { result } = renderNavigation('active_workout');

    act(() => result.current.openModal('settings'));
    expect(result.current.isModalOpen('settings')).toBe(true);

    act(() => result.current.navigateToHistory());

    expect(result.current.currentView).toBe('history');
    expect(result.current.isModalOpen('settings')).toBe(false);
    expect(replaceStateSpy).toHaveBeenCalledWith({ view: 'history', modals: [] }, '');
  });
});

describe('NavigationProvider — pilha de modais', () => {
  beforeEach(() => {
    window.history.replaceState(null, '');
  });

  it('abre, empilha e fecha modais', () => {
    const { result } = renderNavigation();

    act(() => result.current.openModal('settings'));
    expect(result.current.isModalOpen('settings')).toBe(true);
    expect(result.current.isModalOpen('exit_warning')).toBe(false);

    act(() => result.current.openModal('exit_warning'));
    expect(result.current.isModalOpen('settings')).toBe(true);
    expect(result.current.isModalOpen('exit_warning')).toBe(true);

    act(() => result.current.closeModal('exit_warning'));
    expect(result.current.isModalOpen('exit_warning')).toBe(false);
    expect(result.current.isModalOpen('settings')).toBe(true);
  });

  it('fecha apenas a última ocorrência quando o mesmo modal está empilhado duas vezes', () => {
    const { result } = renderNavigation();

    act(() => result.current.openModal('settings'));
    act(() => result.current.openModal('settings'));

    act(() => result.current.closeModal('settings'));
    expect(result.current.isModalOpen('settings')).toBe(true);

    act(() => result.current.closeModal('settings'));
    expect(result.current.isModalOpen('settings')).toBe(false);
  });

  it('ignora o fechamento de um modal que não está na pilha', () => {
    const { result } = renderNavigation();

    act(() => result.current.openModal('settings'));

    act(() => result.current.closeModal('exit_warning'));

    expect(result.current.isModalOpen('settings')).toBe(true);
  });

  it('reflete a pilha de modais no histórico do navegador', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    const { result } = renderNavigation('active_workout');

    act(() => result.current.openModal('settings'));
    expect(pushStateSpy).toHaveBeenCalledWith({ view: 'active_workout', modals: ['settings'] }, '');

    act(() => result.current.closeModal('settings'));
    expect(replaceStateSpy).toHaveBeenCalledWith({ view: 'active_workout', modals: [] }, '');
  });
});

describe('NavigationProvider — restauração via popstate', () => {
  beforeEach(() => {
    window.history.replaceState(null, '');
  });

  it('restaura view e pilha de modais a partir do estado do histórico', () => {
    const { result } = renderNavigation();

    act(() => {
      window.dispatchEvent(
        new PopStateEvent('popstate', {
          state: { view: 'active_workout', modals: ['settings', 'exit_warning'] },
        }),
      );
    });

    expect(result.current.currentView).toBe('active_workout');
    expect(result.current.isModalOpen('settings')).toBe(true);
    expect(result.current.isModalOpen('exit_warning')).toBe(true);
  });

  it('ignora estados virtuais de voltar (isVirtualBackState)', () => {
    const { result } = renderNavigation('history');

    act(() => {
      window.dispatchEvent(
        new PopStateEvent('popstate', {
          state: { isVirtualBackState: true, view: 'active_workout', modals: ['settings'] },
        }),
      );
    });

    expect(result.current.currentView).toBe('history');
    expect(result.current.isModalOpen('settings')).toBe(false);
  });
});

describe('NavigationProvider — handler de voltar do hardware', () => {
  beforeEach(() => {
    window.history.replaceState(null, '');
  });

  it('executa o handler registrado quando o popstate é disparado', () => {
    const { result } = renderNavigation();
    const handleBack = vi.fn();

    act(() => result.current.registerBackHandler(handleBack));
    act(() => window.dispatchEvent(new PopStateEvent('popstate')));

    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('para de executar o handler após clearBackHandler', () => {
    const { result } = renderNavigation();
    const handleBack = vi.fn();

    act(() => result.current.registerBackHandler(handleBack));
    act(() => result.current.clearBackHandler());
    act(() => window.dispatchEvent(new PopStateEvent('popstate')));

    expect(handleBack).not.toHaveBeenCalled();
  });
});
