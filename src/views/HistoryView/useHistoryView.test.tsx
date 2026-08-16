import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useHistoryView } from './useHistoryView';
import { NavigationProvider, SessionProvider, HistoryProvider, useNavigation } from '../../hooks';
import type { WorkoutSession } from '../../types/workout';
import * as storageService from '../../services/storageService';

const mockSession: WorkoutSession = {
  id: 'sessao-1',
  date: '2026-08-15T10:00:00.000Z',
  durationInSeconds: 3600,
  name: 'Treino A - Peito',
  cues: ['Manter escápulas retraídas'],
  exercises: [
    {
      id: 'ex-1',
      name: 'Supino Reto',
      weightInKg: 80,
      notes: '4 séries',
      sets: [
        {
          repetitions: 10,
          weightInKg: 80,
          restTimeInSeconds: 120,
          advancedTechniques: [],
        },
      ],
    },
  ],
  isTemplate: false,
  status: 'completed',
};

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

describe('useHistoryView', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('inicia com histórico vazio quando não há treinos no LocalStorage', () => {
    const { result } = renderHook(() => useHistoryView(), {
      wrapper: createWrapper(),
    });

    expect(result.current.workoutHistory).toEqual([]);
    expect(result.current.activeSession).toBeNull();
  });

  it('carrega o histórico existente do LocalStorage', () => {
    storageService.saveWorkoutSession(mockSession);

    const { result } = renderHook(() => useHistoryView(), {
      wrapper: createWrapper(),
    });

    expect(result.current.workoutHistory.length).toBe(1);
    expect(result.current.workoutHistory[0].name).toBe('Treino A - Peito');
  });

  it('ao tocar em uma sessão do histórico, inicia edição e navega para tela de treino', () => {
    storageService.saveWorkoutSession(mockSession);

    const { result } = renderHook(
      () => ({
        history: useHistoryView(),
        nav: useNavigation(),
      }),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.history.handleSessionTap(mockSession);
    });

    expect(result.current.nav.currentView).toBe('active_workout');
  });

  it('ao criar novo treino, inicia treino livre e navega para tela de treino', () => {
    const { result } = renderHook(
      () => ({
        history: useHistoryView(),
        nav: useNavigation(),
      }),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.history.handleCreateNewWorkout();
    });

    expect(result.current.nav.currentView).toBe('active_workout');
  });

  it('ao retomar treino ativo, navega para tela de treino', () => {
    const { result } = renderHook(
      () => ({
        history: useHistoryView(),
        nav: useNavigation(),
      }),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.history.resumeActiveWorkout();
    });

    expect(result.current.nav.currentView).toBe('active_workout');
  });

  it('ao fazer long press, abre o menu de ações selecionando a sessão', () => {
    storageService.saveWorkoutSession(mockSession);

    const { result } = renderHook(() => useHistoryView(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleSessionLongPress(mockSession.id);
    });

    expect(result.current.selectedSessionForActions?.id).toBe(mockSession.id);
  });

  it('ao confirmar exclusão pelo menu de ações, remove a sessão do histórico', () => {
    storageService.saveWorkoutSession(mockSession);

    const { result } = renderHook(() => useHistoryView(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleSessionLongPress(mockSession.id);
    });
    
    act(() => {
      result.current.handleDeleteFromActionMenu();
    });

    expect(result.current.sessionToDeleteId).toBe(mockSession.id);
    expect(result.current.selectedSessionForActions).toBeNull();

    act(() => {
      result.current.confirmDeleteSession();
    });

    expect(result.current.sessionToDeleteId).toBeNull();
    expect(result.current.workoutHistory).toEqual([]);
  });

  it('ao cancelar exclusão, mantém a sessão no histórico', () => {
    storageService.saveWorkoutSession(mockSession);

    const { result } = renderHook(() => useHistoryView(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleSessionLongPress(mockSession.id);
    });

    act(() => {
      result.current.handleDeleteFromActionMenu();
    });

    act(() => {
      result.current.cancelDeleteSession();
    });

    expect(result.current.sessionToDeleteId).toBeNull();
    expect(result.current.workoutHistory.length).toBe(1);
  });

  it('ao importar backup com sucesso, recarrega os dados e navega para histórico', () => {
    const { result } = renderHook(() => useHistoryView(), {
      wrapper: createWrapper(),
    });

    storageService.saveWorkoutSession(mockSession);

    act(() => {
      result.current.handleImportSuccess();
    });

    expect(result.current.workoutHistory.length).toBe(1);
  });

  it('controla a abertura e fechamento do modal de configurações', () => {
    const { result } = renderHook(() => useHistoryView(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isSettingsOpen).toBe(false);

    act(() => {
      result.current.openSettings();
    });
    expect(result.current.isSettingsOpen).toBe(true);

    act(() => {
      result.current.closeSettings();
    });
    expect(result.current.isSettingsOpen).toBe(false);
  });
});

