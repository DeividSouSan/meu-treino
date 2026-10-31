import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useActiveWorkoutScreen } from './useActiveWorkoutScreen';
import { NavigationProvider, SessionProvider, HistoryProvider, useSession } from '../../hooks';
import type { WorkoutSession } from '../../types/workout';
import {
  getActiveWorkoutSession,
  getWorkoutHistory,
  saveWorkoutSession,
} from '../../services/storageService';

/**
 * useActiveWorkoutScreen depende de useStopwatch. Damos mock para isolar
 * os testes da lógica de temporização e controlar a duração "atual".
 */
const relogio = vi.hoisted(() => ({ seconds: 0 }));

vi.mock('../../hooks/useStopwatch', () => ({
  useStopwatch: () => ({
    seconds: relogio.seconds,
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

function renderScreen() {
  return renderHook(
    () => ({
      screen: useActiveWorkoutScreen(),
      session: useSession(),
    }),
    { wrapper: createWrapper() },
  );
}

function criarSessao(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: 'sessao-salva',
    date: '2026-01-01T10:00:00.000Z',
    durationInSeconds: 600,
    name: 'Treino Salvo',
    cues: [],
    exercises: [],
    isTemplate: false,
    status: 'completed',
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
  relogio.seconds = 0;
});

describe('useActiveWorkoutScreen — sem sessão', () => {
  it('expõe a sessão como nula quando não há treino ativo nem em edição', () => {
    const { result } = renderScreen();

    expect(result.current.screen.session).toBeNull();
    expect(result.current.screen.isEditing).toBe(false);
  });

  it('ignora todas as mutações sem sessão, sem criar estado fantasma', () => {
    const { result } = renderScreen();

    act(() => {
      result.current.screen.addCue('Lembrete');
      result.current.screen.removeCue(0);
      result.current.screen.addExercise('Supino');
      result.current.screen.updateExercise({
        id: 'x',
        name: 'Supino',
        weightInKg: 0,
        notes: '',
        sets: [],
      });
      result.current.screen.deleteExercise('x');
      result.current.screen.renameSession('Novo Nome');
      result.current.screen.saveOrFinish();
      result.current.screen.cancel();
    });

    expect(result.current.session.activeSession).toBeNull();
    expect(result.current.session.editingSession).toBeNull();
    expect(getActiveWorkoutSession()).toBeNull();
    expect(getWorkoutHistory()).toEqual([]);
  });
});

describe('useActiveWorkoutScreen — renameSession', () => {
  it('atualiza o nome da sessão ativa removendo espaços das bordas', () => {
    const { result } = renderScreen();

    act(() => result.current.session.startNewWorkout(null));
    act(() => result.current.screen.renameSession('  Peito e Tríceps  '));

    expect(result.current.session.activeSession?.name).toBe('Peito e Tríceps');
  });

  it('ignora nomes vazios ou compostos apenas por espaços', () => {
    const { result } = renderScreen();

    act(() => result.current.session.startNewWorkout(null));

    act(() => result.current.screen.renameSession(''));
    expect(result.current.session.activeSession?.name).toBe('Treino Livre');

    act(() => result.current.screen.renameSession('   '));
    expect(result.current.session.activeSession?.name).toBe('Treino Livre');
  });

  it('permite renomear várias vezes e persiste o último nome', () => {
    const { result } = renderScreen();

    act(() => result.current.session.startNewWorkout(null));
    act(() => result.current.screen.renameSession('Nome Inicial'));
    act(() => result.current.screen.renameSession('Nome Final'));

    expect(result.current.session.activeSession?.name).toBe('Nome Final');
    expect(getActiveWorkoutSession()?.name).toBe('Nome Final');
  });

  it('renomeia a sessão em edição sem tocar na sessão ativa', () => {
    const { result } = renderScreen();

    act(() => result.current.session.startEditingWorkout(criarSessao()));
    act(() => result.current.screen.renameSession('Treino Revisado'));

    expect(result.current.session.editingSession?.name).toBe('Treino Revisado');
    expect(result.current.session.activeSession).toBeNull();
  });
});

describe('useActiveWorkoutScreen — saveOrFinish', () => {
  it('finaliza o treino ativo gravando a duração atual do cronômetro', () => {
    const { result, rerender } = renderScreen();

    act(() => result.current.session.startNewWorkout(null));
    expect(result.current.session.activeSession).not.toBeNull();

    relogio.seconds = 125;
    act(() => rerender());
    act(() => result.current.screen.saveOrFinish());

    expect(result.current.session.activeSession).toBeNull();
    expect(getActiveWorkoutSession()).toBeNull();

    const historico = getWorkoutHistory();
    expect(historico).toHaveLength(1);
    expect(historico[0]).toMatchObject({ status: 'completed', durationInSeconds: 125 });
  });

  it('salva a edição de um treino do histórico com a duração atual do cronômetro', () => {
    const { result, rerender } = renderScreen();

    act(() =>
      result.current.session.startEditingWorkout(
        criarSessao({ id: 'editado', name: 'Treino Editado' }),
      ),
    );
    expect(result.current.screen.isEditing).toBe(true);

    relogio.seconds = 900;
    act(() => rerender());
    act(() => result.current.screen.saveOrFinish());

    expect(result.current.session.editingSession).toBeNull();

    const historico = getWorkoutHistory();
    expect(historico).toHaveLength(1);
    expect(historico[0]).toMatchObject({
      id: 'editado',
      name: 'Treino Editado',
      durationInSeconds: 900,
    });
  });

  it('não persiste nada quando não há sessão', () => {
    const { result } = renderScreen();

    act(() => result.current.screen.saveOrFinish());

    expect(getWorkoutHistory()).toEqual([]);
  });
});

describe('useActiveWorkoutScreen — cancel', () => {
  it('descarta o treino ativo e limpa o armazenamento', () => {
    const { result } = renderScreen();

    act(() => result.current.session.startNewWorkout(null));
    act(() => result.current.screen.cancel());

    expect(result.current.session.activeSession).toBeNull();
    expect(getActiveWorkoutSession()).toBeNull();
  });
});

describe('useActiveWorkoutScreen — cues', () => {
  it('adiciona um lembrete e persiste na sessão ativa', () => {
    const { result } = renderScreen();

    act(() => result.current.session.startNewWorkout(null));
    act(() => result.current.screen.addCue('Aquecer bem'));
    act(() => result.current.screen.addCue('Respirar fundo'));

    expect(result.current.screen.session?.cues).toEqual(['Aquecer bem', 'Respirar fundo']);
    expect(getActiveWorkoutSession()?.cues).toEqual(['Aquecer bem', 'Respirar fundo']);
  });

  it('remove apenas o lembrete do índice informado', () => {
    const { result } = renderScreen();

    act(() => result.current.session.startNewWorkout(null));
    act(() => result.current.screen.addCue('Primeiro'));
    act(() => result.current.screen.addCue('Segundo'));
    act(() => result.current.screen.addCue('Terceiro'));

    act(() => result.current.screen.removeCue(1));

    expect(result.current.screen.session?.cues).toEqual(['Primeiro', 'Terceiro']);
  });
});

describe('useActiveWorkoutScreen — exercícios', () => {
  it('adiciona um exercício com o nome aparado e persiste na sessão', () => {
    const { result } = renderScreen();

    act(() => result.current.session.startNewWorkout(null));
    act(() => result.current.screen.addExercise('  Supino Inclinado  '));

    const exercicios = result.current.screen.session?.exercises ?? [];
    expect(exercicios).toHaveLength(1);
    expect(exercicios[0].name).toBe('Supino Inclinado');
    expect(exercicios[0].sets).toEqual([]);
    expect(getActiveWorkoutSession()?.exercises[0].name).toBe('Supino Inclinado');
  });

  it('ignora exercícios com nome vazio ou só com espaços', () => {
    const { result } = renderScreen();

    act(() => result.current.session.startNewWorkout(null));
    act(() => result.current.screen.addExercise('   '));

    expect(result.current.screen.session?.exercises).toEqual([]);
  });

  it('atualiza apenas o exercício com o id correspondente', () => {
    const { result } = renderScreen();

    act(() => result.current.session.startNewWorkout(null));
    act(() => result.current.screen.addExercise('Supino'));
    act(() => result.current.screen.addExercise('Agachamento'));

    const [supino] = result.current.screen.session?.exercises ?? [];
    act(() => result.current.screen.updateExercise({ ...supino, notes: 'Pegada aberta' }));

    const exercicios = result.current.screen.session?.exercises ?? [];
    expect(exercicios[0].notes).toBe('Pegada aberta');
    expect(exercicios[1].name).toBe('Agachamento');
    expect(exercicios[1].notes).toBe('');
  });

  it('remove apenas o exercício com o id informado', () => {
    const { result } = renderScreen();

    act(() => result.current.session.startNewWorkout(null));
    act(() => result.current.screen.addExercise('Supino'));
    act(() => result.current.screen.addExercise('Agachamento'));

    const [supino] = result.current.screen.session?.exercises ?? [];
    act(() => result.current.screen.deleteExercise(supino.id));

    const exercicios = result.current.screen.session?.exercises ?? [];
    expect(exercicios).toHaveLength(1);
    expect(exercicios[0].name).toBe('Agachamento');
  });

  it('aplica mutações na sessão em edição, não na sessão ativa', () => {
    const { result } = renderScreen();

    act(() => result.current.session.startEditingWorkout(criarSessao()));

    act(() => result.current.screen.addCue('Lembrete de edição'));
    act(() => result.current.screen.addExercise('Remada'));

    expect(result.current.session.editingSession?.cues).toEqual(['Lembrete de edição']);
    expect(result.current.session.editingSession?.exercises[0].name).toBe('Remada');
    expect(result.current.session.activeSession).toBeNull();
  });
});

describe('useActiveWorkoutScreen — histórico', () => {
  it('expõe o histórico carregado pelo HistoryProvider', () => {
    saveWorkoutSession(criarSessao({ id: 'h-1' }));
    saveWorkoutSession(criarSessao({ id: 'h-2' }));

    const { result } = renderScreen();

    expect(result.current.screen.workoutHistory.map((s) => s.id).sort()).toEqual(['h-1', 'h-2']);
  });
});
