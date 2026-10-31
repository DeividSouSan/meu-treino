import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { SessionProvider, useSession } from './SessionProvider';
import type { WorkoutSession } from '../../types/workout';
import {
  getActiveWorkoutSession,
  getWorkoutHistory,
  saveActiveWorkoutSession,
} from '../../services/storageService';

function criarSessao(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: 'sessao-1',
    date: '2026-01-01T10:00:00.000Z',
    durationInSeconds: 0,
    name: 'Treino Livre',
    cues: [],
    exercises: [],
    isTemplate: false,
    status: 'in_progress',
    ...overrides,
  };
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider>{children}</SessionProvider>
);

function renderSession() {
  return renderHook(() => useSession(), { wrapper });
}

describe('useSession fora do provider', () => {
  it('lança erro ao ser usado fora do SessionProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useSession())).toThrowError(
      'useSession must be used within a SessionProvider',
    );
  });
});

describe('SessionProvider — estado inicial e hidratação', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('inicia sem sessão ativa e sem sessão em edição', () => {
    const { result } = renderSession();

    expect(result.current.activeSession).toBeNull();
    expect(result.current.editingSession).toBeNull();
  });

  it('hidrata a sessão ativa salva no armazenamento', async () => {
    saveActiveWorkoutSession(criarSessao({ id: 'salva', name: 'Treino Salvo' }));

    const { result } = renderSession();

    await waitFor(() => {
      expect(result.current.activeSession?.id).toBe('salva');
    });
    expect(result.current.activeSession?.name).toBe('Treino Salvo');
  });
});

describe('SessionProvider — iniciar treino', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('cria um treino livre vazio e persiste a sessão ativa', () => {
    const { result } = renderSession();

    act(() => result.current.startNewWorkout());

    const sessao = result.current.activeSession;
    expect(sessao).not.toBeNull();
    expect(sessao?.name).toBe('Treino Livre');
    expect(sessao?.status).toBe('in_progress');
    expect(sessao?.exercises).toEqual([]);
    expect(sessao?.cues).toEqual([]);
    expect(getActiveWorkoutSession()?.id).toBe(sessao?.id);
  });

  it('cria um treino a partir de um template copiando nome, cues e exercícios rascunhados', () => {
    const template = criarSessao({
      id: 'template-1',
      name: 'Push',
      isTemplate: true,
      cues: ['Aquecer bem'],
      exercises: [
        {
          id: 'ex-1',
          name: 'Supino',
          weightInKg: 80,
          notes: 'Pegada aberta',
          sets: [
            { repetitions: 10, weightInKg: 80, restTimeInSeconds: 90, advancedTechniques: [] },
          ],
        },
      ],
    });

    const { result } = renderSession();

    act(() => result.current.startNewWorkout(template));

    const sessao = result.current.activeSession;
    expect(sessao?.name).toBe('Push');
    expect(sessao?.cues).toEqual(['Aquecer bem']);
    expect(sessao?.isTemplate).toBe(false);
    expect(sessao?.exercises).toHaveLength(1);
    expect(sessao?.exercises[0]).toMatchObject({
      name: 'Supino',
      weightInKg: 80,
      notes: 'Pegada aberta',
      sets: [],
    });
    expect(sessao?.exercises[0].id).not.toBe('ex-1');
  });

  it('limpa a sessão em edição ao iniciar um treino novo', () => {
    const { result } = renderSession();

    act(() => result.current.startEditingWorkout(criarSessao({ id: 'historico' })));
    expect(result.current.editingSession).not.toBeNull();

    act(() => result.current.startNewWorkout());

    expect(result.current.editingSession).toBeNull();
  });
});

describe('SessionProvider — edição de treino do histórico', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('coloca o treino em edição e limpa a sessão ativa', () => {
    const sessao = criarSessao({ id: 'historico', name: 'Treino Antigo', status: 'completed' });
    const { result } = renderSession();

    act(() => result.current.startNewWorkout());
    expect(result.current.activeSession).not.toBeNull();

    act(() => result.current.startEditingWorkout(sessao));

    expect(result.current.editingSession?.id).toBe('historico');
    expect(result.current.activeSession).toBeNull();
  });

  it('atualiza a sessão em edição sem persistir antes de salvar', () => {
    const sessao = criarSessao({ id: 'historico', name: 'Treino Antigo', status: 'completed' });
    const { result } = renderSession();

    act(() => result.current.startEditingWorkout(sessao));
    act(() => result.current.updateEditingSession({ ...sessao, name: 'Nome Editado' }));

    expect(result.current.editingSession?.name).toBe('Nome Editado');
    expect(getWorkoutHistory()).toHaveLength(0);
  });

  it('salva o treino em edição no histórico e limpa a edição', () => {
    const sessao = criarSessao({ id: 'historico', name: 'Treino Antigo', status: 'completed' });
    const { result } = renderSession();

    act(() => result.current.startEditingWorkout(sessao));
    act(() => result.current.updateEditingSession({ ...sessao, name: 'Nome Editado' }));
    act(() => result.current.saveEditedWorkout());

    expect(result.current.editingSession).toBeNull();
    expect(getWorkoutHistory()).toHaveLength(1);
    expect(getWorkoutHistory()[0].name).toBe('Nome Editado');
  });

  it('salva uma sessão informada explicitamente mesmo sem edição em andamento', () => {
    const sessao = criarSessao({ id: 'avulsa', name: 'Treino Avulso', status: 'completed' });
    const { result } = renderSession();

    act(() => result.current.saveEditedWorkout(sessao));

    expect(result.current.editingSession).toBeNull();
    expect(getWorkoutHistory().map((s) => s.id)).toEqual(['avulsa']);
  });

  it('ignora saveEditedWorkout quando não há sessão em edição nem informada', () => {
    const { result } = renderSession();

    act(() => result.current.saveEditedWorkout());

    expect(result.current.editingSession).toBeNull();
    expect(getWorkoutHistory()).toEqual([]);
  });
});

describe('SessionProvider — sessão ativa', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('atualiza e persiste a sessão ativa', () => {
    const { result } = renderSession();

    act(() => result.current.startNewWorkout());
    const sessao = result.current.activeSession!;

    act(() => result.current.updateActiveSession({ ...sessao, name: 'Nome Atualizado' }));

    expect(result.current.activeSession?.name).toBe('Nome Atualizado');
    expect(getActiveWorkoutSession()?.name).toBe('Nome Atualizado');
  });

  it('cancela a sessão ativa removendo do estado e do armazenamento', () => {
    const { result } = renderSession();

    act(() => result.current.startNewWorkout());
    expect(getActiveWorkoutSession()).not.toBeNull();

    act(() => result.current.cancelActiveWorkout());

    expect(result.current.activeSession).toBeNull();
    expect(getActiveWorkoutSession()).toBeNull();
  });

  it('finaliza a sessão ativa gravando no histórico com status concluído', () => {
    const { result } = renderSession();

    act(() => result.current.startNewWorkout());
    const sessao = result.current.activeSession!;

    act(() => result.current.finishActiveWorkout());

    expect(result.current.activeSession).toBeNull();
    expect(getActiveWorkoutSession()).toBeNull();
    expect(getWorkoutHistory()).toHaveLength(1);
    expect(getWorkoutHistory()[0]).toMatchObject({ id: sessao.id, status: 'completed' });
  });

  it('finaliza uma sessão informada explicitamente mesmo sem sessão ativa', () => {
    const { result } = renderSession();
    const sessao = criarSessao({ id: 'finalizada', name: 'Treino Finalizado' });

    act(() => result.current.finishActiveWorkout(sessao));

    expect(result.current.activeSession).toBeNull();
    expect(getWorkoutHistory().map((s) => s.id)).toEqual(['finalizada']);
  });

  it('ignora finishActiveWorkout quando não há sessão ativa nem informada', () => {
    const { result } = renderSession();

    act(() => result.current.finishActiveWorkout());

    expect(result.current.activeSession).toBeNull();
    expect(getWorkoutHistory()).toEqual([]);
  });
});
