import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useActiveWorkoutScreen } from './useActiveWorkoutScreen';
import { NavigationProvider, SessionProvider, HistoryProvider, useSession } from '../../hooks';

/**
 * useActiveWorkoutScreen depende de useStopwatch. Damos mock para isolar
 * os testes da lógica de temporização.
 */
vi.mock('../../hooks/useStopwatch', () => ({
  useStopwatch: () => ({
    seconds: 0,
    isRunning: false,
    start: vi.fn(),
    pause: vi.fn(),
    reset: vi.fn(),
    setSeconds: vi.fn(),
  }),
}));

function createWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <NavigationProvider>
        <SessionProvider>
          <HistoryProvider>{children}</HistoryProvider>
        </SessionProvider>
      </NavigationProvider>
    );
  };
}

describe('useActiveWorkoutScreen — renameSession sem sessão ativa', () => {
  it('expõe renameSession como função no resultado do hook', () => {
    const { result } = renderHook(() => useActiveWorkoutScreen(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.renameSession).toBe('function');
  });

  it('não lança erro ao chamar renameSession sem sessão ativa', () => {
    const { result } = renderHook(() => useActiveWorkoutScreen(), {
      wrapper: createWrapper(),
    });

    act(() => {
      expect(() => result.current.renameSession('Qualquer Nome')).not.toThrow();
    });
  });

  it('não lança erro ao chamar renameSession com string vazia sem sessão ativa', () => {
    const { result } = renderHook(() => useActiveWorkoutScreen(), {
      wrapper: createWrapper(),
    });

    act(() => {
      expect(() => result.current.renameSession('')).not.toThrow();
    });
  });
});

describe('useActiveWorkoutScreen — renameSession com sessão ativa', () => {
  it('atualiza o nome da sessão ativa com um nome válido', () => {
    const { result } = renderHook(
      () => ({
        screen: useActiveWorkoutScreen(),
        session: useSession(),
      }),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.session.startNewWorkout(null);
    });

    expect(result.current.screen.session?.name).toBe('Treino Livre');

    act(() => {
      result.current.screen.renameSession('Peito e Tríceps');
    });

    expect(result.current.screen.session?.name).toBe('Peito e Tríceps');
  });

  it('ignora renameSession quando o novo nome é string vazia', () => {
    const { result } = renderHook(
      () => ({
        screen: useActiveWorkoutScreen(),
        session: useSession(),
      }),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.session.startNewWorkout(null);
    });

    const nomeOriginal = result.current.screen.session?.name;

    act(() => {
      result.current.screen.renameSession('');
    });

    expect(result.current.screen.session?.name).toBe(nomeOriginal);
  });

  it('ignora renameSession quando o novo nome é composto apenas por espaços', () => {
    const { result } = renderHook(
      () => ({
        screen: useActiveWorkoutScreen(),
        session: useSession(),
      }),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.session.startNewWorkout(null);
    });

    const nomeOriginal = result.current.screen.session?.name;

    act(() => {
      result.current.screen.renameSession('   ');
    });

    expect(result.current.screen.session?.name).toBe(nomeOriginal);
  });

  it('salva o nome com trim, removendo espaços das bordas', () => {
    const { result } = renderHook(
      () => ({
        screen: useActiveWorkoutScreen(),
        session: useSession(),
      }),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.session.startNewWorkout(null);
    });

    act(() => {
      result.current.screen.renameSession('  Costas e Bíceps  ');
    });

    expect(result.current.screen.session?.name).toBe('Costas e Bíceps');
  });

  it('permite renomear múltiplas vezes consecutivas', () => {
    const { result } = renderHook(
      () => ({
        screen: useActiveWorkoutScreen(),
        session: useSession(),
      }),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.session.startNewWorkout(null);
    });

    act(() => {
      result.current.screen.renameSession('Nome Inicial');
    });
    expect(result.current.screen.session?.name).toBe('Nome Inicial');

    act(() => {
      result.current.screen.renameSession('Nome Final');
    });
    expect(result.current.screen.session?.name).toBe('Nome Final');
  });
});
