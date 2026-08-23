import { useState, useCallback, useMemo } from 'react';
import { exportWorkoutBackup, importWorkoutBackup } from '../../services/backupService';
import type { ImportResult } from '../../services/backupService';
import { getLastBackupWorkoutCount, getWorkoutHistory } from '../../services/storageService';

export interface UseBackupSectionResult {
  /**
   * Quantos treinos novos foram criados desde o último backup.
   */
  workoutsSinceLastBackup: number;
  /**
   * Exporta todo o histórico para um arquivo JSON e inicia o download.
   */
  exportBackup: () => void;
  /**
   * Importa um backup a partir de uma string JSON.
   * Retorna o resultado estruturado com sucesso, contagem e nome da sessão.
   */
  importBackup: (jsonString: string) => ImportResult;
}

/**
 * useBackupSection é o CONTÊINER da seção de backup.
 *
 * Ele é o único responsável por conversar com backupService e
 * storageService (contagem de backups). A View (BackupSection) só
 * orquestra a UI: input de arquivo, FileReader e alertas.
 */
export function useBackupSection(workoutHistoryLength: number): UseBackupSectionResult {
  const [lastBackupWorkoutCount, setLastBackupWorkoutCount] = useState<number>(
    getLastBackupWorkoutCount(),
  );

  const workoutsSinceLastBackup = useMemo(
    () => Math.max(0, workoutHistoryLength - lastBackupWorkoutCount),
    [workoutHistoryLength, lastBackupWorkoutCount],
  );

  const exportBackup = useCallback(() => {
    exportWorkoutBackup();
    setLastBackupWorkoutCount(workoutHistoryLength);
  }, [workoutHistoryLength]);

  const importBackup = useCallback((jsonString: string): ImportResult => {
    const result = importWorkoutBackup(jsonString);
    if (result.success) {
      setLastBackupWorkoutCount(getWorkoutHistory().length);
    }
    return result;
  }, []);

  return {
    workoutsSinceLastBackup,
    exportBackup,
    importBackup,
  };
}
