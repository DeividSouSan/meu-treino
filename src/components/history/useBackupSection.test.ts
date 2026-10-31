import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBackupSection } from './useBackupSection';
import * as backupService from '../../services/backupService';
import * as storageService from '../../services/storageService';
import type { WorkoutSession } from '../../types/workout';

vi.mock('../../services/backupService', () => ({
  exportWorkoutBackup: vi.fn(),
  importWorkoutBackup: vi.fn(),
}));

vi.mock('../../services/storageService', () => ({
  getLastBackupWorkoutCount: vi.fn(),
  getWorkoutHistory: vi.fn(),
}));

const exportWorkoutBackupMock = vi.mocked(backupService.exportWorkoutBackup);
const importWorkoutBackupMock = vi.mocked(backupService.importWorkoutBackup);
const getLastBackupWorkoutCountMock = vi.mocked(storageService.getLastBackupWorkoutCount);
const getWorkoutHistoryMock = vi.mocked(storageService.getWorkoutHistory);

function criarSessao(id: string): WorkoutSession {
  return {
    id,
    date: '2026-01-01T10:00:00.000Z',
    durationInSeconds: 600,
    name: `Treino ${id}`,
    cues: [],
    exercises: [],
    isTemplate: false,
    status: 'completed',
  };
}

describe('useBackupSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getLastBackupWorkoutCountMock.mockReturnValue(0);
    getWorkoutHistoryMock.mockReturnValue([]);
  });

  it('calcula quantos treinos existem desde o último backup', () => {
    getLastBackupWorkoutCountMock.mockReturnValue(2);

    const { result } = renderHook(() => useBackupSection(5));

    expect(result.current.workoutsSinceLastBackup).toBe(3);
  });

  it('nunca retorna contagem negativa quando o histórico diminui', () => {
    getLastBackupWorkoutCountMock.mockReturnValue(4);

    const { result } = renderHook(() => useBackupSection(1));

    expect(result.current.workoutsSinceLastBackup).toBe(0);
  });

  it('exporta o backup e zera a contagem de treinos pendentes', () => {
    getLastBackupWorkoutCountMock.mockReturnValue(0);
    const { result } = renderHook(() => useBackupSection(3));

    expect(result.current.workoutsSinceLastBackup).toBe(3);

    act(() => result.current.exportBackup());

    expect(exportWorkoutBackupMock).toHaveBeenCalledTimes(1);
    expect(result.current.workoutsSinceLastBackup).toBe(0);
  });

  it('atualiza a contagem após uma importação bem-sucedida', () => {
    importWorkoutBackupMock.mockReturnValue({ success: true, count: 2 });
    getWorkoutHistoryMock.mockReturnValue([criarSessao('a'), criarSessao('b'), criarSessao('c')]);

    const { result } = renderHook(() => useBackupSection(0));

    let resultado: ReturnType<typeof result.current.importBackup> | undefined;
    act(() => {
      resultado = result.current.importBackup('{}');
    });

    expect(resultado).toEqual({ success: true, count: 2 });
    expect(getWorkoutHistoryMock).toHaveBeenCalled();
    expect(result.current.workoutsSinceLastBackup).toBe(0);
  });

  it('não atualiza a contagem quando a importação falha', () => {
    importWorkoutBackupMock.mockReturnValue({ success: false, count: 0 });

    const { result } = renderHook(() => useBackupSection(0));

    act(() => {
      result.current.importBackup('{invalido}');
    });

    expect(getWorkoutHistoryMock).not.toHaveBeenCalled();
  });
});
