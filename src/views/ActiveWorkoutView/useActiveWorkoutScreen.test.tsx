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

  it('saveOrFinish deve chamar finishActiveWorkout se a sessão não for edição', () => {
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

    expect(result.current.screen.isEditing).toBe(false);

    act(() => {
      result.current.screen.saveOrFinish();
    });

    // Se encerrou, activeSession fica nula
    expect(result.current.session.activeSession).toBeNull();
  });

  it('saveOrFinish deve chamar saveEditedWorkout se a sessão for edição', () => {
    const { result } = renderHook(
      () => ({
        screen: useActiveWorkoutScreen(),
        session: useSession(),
      }),
      { wrapper: createWrapper() }
    );

    act(() => {
      // Começamos uma sessão nova apenas para ter uma mockada
      result.current.session.startNewWorkout(null);
    });
    const mockSession = result.current.session.activeSession!;

    act(() => {
      // Ao editar, activeSession vira null e editingSession recebe a mockSession
      result.current.session.startEditingWorkout(mockSession);
    });

    expect(result.current.screen.isEditing).toBe(true);

    act(() => {
      result.current.screen.saveOrFinish();
    });

    // Se salvou edição, editingSession fica nula
    expect(result.current.session.editingSession).toBeNull();
  });

  it('cancel deve chamar cancelActiveWorkout', () => {
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

    expect(result.current.session.activeSession).not.toBeNull();

    act(() => {
      result.current.screen.cancel();
    });

    expect(result.current.session.activeSession).toBeNull();
  });

  it('ignora saveOrFinish quando não há sessão', () => {
    const { result } = renderHook(() => useActiveWorkoutScreen(), {
      wrapper: createWrapper(),
    });

    act(() => {
      expect(() => result.current.saveOrFinish()).not.toThrow();
    });
  });

  describe('mutações de sessão', () => {
    it('adiciona e remove cues corretamente', () => {
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
        result.current.screen.addCue('Lembrete 1');
      });
      expect(result.current.screen.session?.cues).toContain('Lembrete 1');

      act(() => {
        result.current.screen.removeCue(0);
      });
      expect(result.current.screen.session?.cues).not.toContain('Lembrete 1');
    });

    it('ignora addCue e removeCue quando não há sessão', () => {
      const { result } = renderHook(() => useActiveWorkoutScreen(), {
        wrapper: createWrapper(),
      });

      act(() => {
        expect(() => result.current.addCue('Teste')).not.toThrow();
        expect(() => result.current.removeCue(0)).not.toThrow();
      });
    });

    it('adiciona, atualiza e remove exercícios', () => {
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
        result.current.screen.addExercise('Supino');
      });

      expect(result.current.screen.session?.exercises.length).toBe(1);
      const exercise = result.current.screen.session?.exercises[0]!;
      expect(exercise.name).toBe('Supino');

      act(() => {
        result.current.screen.updateExercise({ ...exercise, name: 'Supino Inclinado' });
      });
      expect(result.current.screen.session?.exercises[0].name).toBe('Supino Inclinado');

      act(() => {
        result.current.screen.deleteExercise(exercise.id);
      });
      expect(result.current.screen.session?.exercises.length).toBe(0);
    });

    it('ignora adicionar exercício se o nome for vazio', () => {
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
        result.current.screen.addExercise('   ');
      });

      expect(result.current.screen.session?.exercises.length).toBe(0);
    });

    it('ignora mutações de exercício se não houver sessão', () => {
      const { result } = renderHook(() => useActiveWorkoutScreen(), {
        wrapper: createWrapper(),
      });

      act(() => {
        expect(() => result.current.addExercise('Supino')).not.toThrow();
        expect(() => result.current.updateExercise({ id: '1', name: 'Supino', weightInKg: 0, notes: '', sets: [] })).not.toThrow();
        expect(() => result.current.deleteExercise('1')).not.toThrow();
      });
    });
  });
});
