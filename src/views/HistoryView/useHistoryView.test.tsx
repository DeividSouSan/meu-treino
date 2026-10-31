import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useHistoryView } from './useHistoryView';
import {
  NavigationProvider,
  SessionProvider,
  HistoryProvider,
  useNavigation,
  useSession,
} from '../../hooks';
import type { WorkoutSession } from '../../types/workout';
import * as storageService from '../../services/storageService';
import * as backupService from '../../services/backupService';

/**
 * A exportação individual dispara download real no navegador.
 * Mockamos apenas essa função para verificar a chamada sem efeitos colaterais.
 */
vi.mock('../../services/backupService', async (importOriginal) => {
  const moduloReal = await importOriginal<typeof import('../../services/backupService')>();
  return {
    ...moduloReal,
    exportSingleWorkoutSession: vi.fn(),
  };
});

const exportSingleWorkoutSessionMock = vi.mocked(backupService.exportSingleWorkoutSession);

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

function criarSessao(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return { ...mockSession, ...overrides };
}

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

function renderHistory() {
  return renderHook(() => useHistoryView(), { wrapper: createWrapper() });
}

describe('useHistoryView — carregamento', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('inicia com histórico vazio quando não há treinos no LocalStorage', () => {
    const { result } = renderHistory();

    expect(result.current.workoutHistory).toEqual([]);
    expect(result.current.activeSession).toBeNull();
  });

  it('carrega o histórico existente do LocalStorage', () => {
    storageService.saveWorkoutSession(mockSession);

    const { result } = renderHistory();

    expect(result.current.workoutHistory.length).toBe(1);
    expect(result.current.workoutHistory[0].name).toBe('Treino A - Peito');
  });
});

describe('useHistoryView — navegação e sessão', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('ao tocar em uma sessão, inicia edição e navega para a tela de treino', () => {
    storageService.saveWorkoutSession(mockSession);

    const { result } = renderHook(
      () => ({ history: useHistoryView(), nav: useNavigation(), session: useSession() }),
      { wrapper: createWrapper() },
    );

    act(() => result.current.history.handleSessionTap(mockSession));

    expect(result.current.nav.currentView).toBe('active_workout');
    expect(result.current.session.editingSession?.id).toBe(mockSession.id);
    expect(result.current.session.activeSession).toBeNull();
  });

  it('ao retomar treino ativo, navega para a tela de treino', () => {
    const { result } = renderHook(() => ({ history: useHistoryView(), nav: useNavigation() }), {
      wrapper: createWrapper(),
    });

    act(() => result.current.history.resumeActiveWorkout());

    expect(result.current.nav.currentView).toBe('active_workout');
  });

  it('cria um treino livre e navega quando não há treino em andamento', () => {
    const { result } = renderHook(
      () => ({ history: useHistoryView(), nav: useNavigation(), session: useSession() }),
      { wrapper: createWrapper() },
    );

    act(() => result.current.history.handleCreateNewWorkout());

    expect(result.current.history.confirmNewWorkout).toBe(false);
    expect(result.current.nav.currentView).toBe('active_workout');
    expect(result.current.session.activeSession?.name).toBe('Treino Livre');
  });
});

describe('useHistoryView — confirmação ao criar treino com outro em andamento', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('pede confirmação e não descarta o treino ativo automaticamente', () => {
    const { result } = renderHook(
      () => ({ history: useHistoryView(), nav: useNavigation(), session: useSession() }),
      { wrapper: createWrapper() },
    );

    act(() => result.current.session.startNewWorkout(null));
    const sessaoEmAndamento = result.current.session.activeSession;

    act(() => result.current.history.handleCreateNewWorkout());

    expect(result.current.history.confirmNewWorkout).toBe(true);
    expect(result.current.nav.currentView).toBe('history');
    expect(result.current.session.activeSession?.id).toBe(sessaoEmAndamento?.id);
  });

  it('confirma a criação descartando o treino anterior e navegando', () => {
    const { result } = renderHook(
      () => ({ history: useHistoryView(), nav: useNavigation(), session: useSession() }),
      { wrapper: createWrapper() },
    );

    act(() => result.current.session.startNewWorkout(null));
    const sessaoAnterior = result.current.session.activeSession;

    act(() => result.current.history.handleCreateNewWorkout());
    act(() => result.current.history.confirmCreateNewWorkout());

    expect(result.current.history.confirmNewWorkout).toBe(false);
    expect(result.current.nav.currentView).toBe('active_workout');
    expect(result.current.session.activeSession?.id).not.toBe(sessaoAnterior?.id);
  });

  it('cancelar mantém o treino em andamento e fecha o diálogo', () => {
    const { result } = renderHook(
      () => ({ history: useHistoryView(), nav: useNavigation(), session: useSession() }),
      { wrapper: createWrapper() },
    );

    act(() => result.current.session.startNewWorkout(null));
    const sessaoEmAndamento = result.current.session.activeSession;

    act(() => result.current.history.handleCreateNewWorkout());
    act(() => result.current.history.cancelCreateNewWorkout());

    expect(result.current.history.confirmNewWorkout).toBe(false);
    expect(result.current.nav.currentView).toBe('history');
    expect(result.current.session.activeSession?.id).toBe(sessaoEmAndamento?.id);
  });
});

describe('useHistoryView — menu de ações', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('seleciona a sessão pelo toque longo e ignora ids desconhecidos', () => {
    storageService.saveWorkoutSession(mockSession);
    const { result } = renderHistory();

    act(() => result.current.handleSessionLongPress(mockSession.id));

    expect(result.current.selectedSessionForActions?.id).toBe(mockSession.id);

    act(() => result.current.handleSessionLongPress('id-inexistente'));

    expect(result.current.selectedSessionForActions).toBeNull();
  });

  it('fecha o menu de ações sem alterar a sessão', () => {
    storageService.saveWorkoutSession(mockSession);
    const { result } = renderHistory();

    act(() => result.current.handleSessionLongPress(mockSession.id));
    act(() => result.current.closeActionMenu());

    expect(result.current.selectedSessionForActions).toBeNull();
    expect(result.current.workoutHistory).toHaveLength(1);
  });

  it('ao confirmar exclusão pelo menu, remove a sessão do histórico', () => {
    storageService.saveWorkoutSession(mockSession);
    const { result } = renderHistory();

    act(() => result.current.handleSessionLongPress(mockSession.id));
    act(() => result.current.handleDeleteFromActionMenu());

    expect(result.current.sessionToDeleteId).toBe(mockSession.id);
    expect(result.current.selectedSessionForActions).toBeNull();

    act(() => result.current.confirmDeleteSession());

    expect(result.current.sessionToDeleteId).toBeNull();
    expect(result.current.workoutHistory).toEqual([]);
  });

  it('ao cancelar a exclusão, mantém a sessão no histórico', () => {
    storageService.saveWorkoutSession(mockSession);
    const { result } = renderHistory();

    act(() => result.current.handleSessionLongPress(mockSession.id));
    act(() => result.current.handleDeleteFromActionMenu());
    act(() => result.current.cancelDeleteSession());

    expect(result.current.sessionToDeleteId).toBeNull();
    expect(result.current.workoutHistory).toHaveLength(1);
  });

  it('ignora confirmar exclusão quando nenhuma sessão foi selecionada', () => {
    storageService.saveWorkoutSession(mockSession);
    const { result } = renderHistory();

    act(() => result.current.confirmDeleteSession());

    expect(result.current.sessionToDeleteId).toBeNull();
    expect(result.current.workoutHistory).toHaveLength(1);
  });

  it('ao selecionar editar no menu, edita a sessão e fecha o menu', () => {
    storageService.saveWorkoutSession(mockSession);
    const { result } = renderHook(
      () => ({ history: useHistoryView(), nav: useNavigation(), session: useSession() }),
      { wrapper: createWrapper() },
    );

    act(() => result.current.history.handleSessionLongPress(mockSession.id));
    act(() => result.current.history.handleEditFromActionMenu());

    expect(result.current.history.selectedSessionForActions).toBeNull();
    expect(result.current.nav.currentView).toBe('active_workout');
    expect(result.current.session.editingSession?.id).toBe(mockSession.id);
  });

  it('ao exportar pelo menu, chama o serviço e fecha o menu', () => {
    storageService.saveWorkoutSession(mockSession);
    const { result } = renderHistory();

    act(() => result.current.handleSessionLongPress(mockSession.id));
    act(() => result.current.handleExportFromActionMenu());

    expect(exportSingleWorkoutSessionMock).toHaveBeenCalledWith(mockSession);
    expect(result.current.selectedSessionForActions).toBeNull();
  });
});

describe('useHistoryView — backup e configurações', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('recarrega os dados, fecha as configurações e navega ao histórico após importar', () => {
    const { result } = renderHook(() => ({ history: useHistoryView(), nav: useNavigation() }), {
      wrapper: createWrapper(),
    });

    act(() => result.current.history.openSettings());
    expect(result.current.history.isSettingsOpen).toBe(true);

    // Sessão importada "por fora" do React.
    storageService.saveWorkoutSession(mockSession);

    act(() => result.current.history.handleImportSuccess());

    expect(result.current.history.workoutHistory).toHaveLength(1);
    expect(result.current.history.isSettingsOpen).toBe(false);
    expect(result.current.nav.currentView).toBe('history');
  });

  it('controla a abertura e o fechamento do modal de configurações', () => {
    const { result } = renderHistory();

    expect(result.current.isSettingsOpen).toBe(false);

    act(() => result.current.openSettings());
    expect(result.current.isSettingsOpen).toBe(true);

    act(() => result.current.closeSettings());
    expect(result.current.isSettingsOpen).toBe(false);
  });

  it('sinaliza treinos não salvos quando o histórico tem mais treinos que o último backup', () => {
    storageService.saveWorkoutSession(criarSessao({ id: 'a' }));
    storageService.saveWorkoutSession(criarSessao({ id: 'b' }));
    storageService.saveLastBackupWorkoutCount(0);

    const { result } = renderHistory();

    expect(result.current.hasUnsavedSessions).toBe(true);
  });

  it('não sinaliza treinos não salvos quando todos estão no último backup', () => {
    storageService.saveWorkoutSession(criarSessao({ id: 'a' }));
    storageService.saveLastBackupWorkoutCount(1);

    const { result } = renderHistory();

    expect(result.current.hasUnsavedSessions).toBe(false);
  });

  it('limpa o aviso de treinos não salvos após exportar o backup', () => {
    storageService.saveWorkoutSession(criarSessao({ id: 'a' }));
    storageService.saveLastBackupWorkoutCount(0);

    const { result } = renderHistory();
    expect(result.current.hasUnsavedSessions).toBe(true);

    act(() => result.current.handleExportSuccess());

    expect(result.current.hasUnsavedSessions).toBe(false);
  });
});
