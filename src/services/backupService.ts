import type { WorkoutSession } from '../types/workout';
import { getWorkoutHistory, getWorkoutTemplates, saveWorkoutSession, saveWorkoutTemplate } from './storageService';

/**
 * Estrutura do arquivo de backup exportado pelo aplicativo.
 */
export interface BackupData {
  /**
   * Identificador de versão do schema do banco de dados.
   */
  version: number;
  /**
   * Histórico de sessões de treinos finalizados.
   */
  history: WorkoutSession[];
  /**
   * Modelos de templates de treino configurados.
   */
  templates: WorkoutSession[];
}

/**
 * Gera um arquivo JSON contendo todos os dados do aplicativo e inicia o download no navegador.
 */
export function exportWorkoutBackup(): void {
  const backupData: BackupData = {
    version: 1,
    history: getWorkoutHistory(),
    templates: getWorkoutTemplates(),
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const downloadUrl = URL.createObjectURL(blob);
  
  const anchorElement = document.createElement('a');
  anchorElement.href = downloadUrl;
  anchorElement.download = `meu_treino_backup_${new Date().toISOString().slice(0, 10)}.json`;
  
  document.body.appendChild(anchorElement);
  anchorElement.click();
  
  document.body.removeChild(anchorElement);
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Valida a estrutura de dados de uma sessão de treino importada.
 */
function isValidWorkoutSession(session: any): session is WorkoutSession {
  return (
    session &&
    typeof session.id === 'string' &&
    typeof session.date === 'string' &&
    typeof session.durationInSeconds === 'number' &&
    typeof session.name === 'string' &&
    Array.isArray(session.cues) &&
    Array.isArray(session.exercises)
  );
}

/**
 * Importa dados de um arquivo de backup JSON, validando sua estrutura e atualizando o LocalStorage.
 */
export function importWorkoutBackup(jsonString: string): boolean {
  try {
    const parsedData = JSON.parse(jsonString);

    if (!parsedData || typeof parsedData !== 'object') {
      return false;
    }

    const hasValidHistory = Array.isArray(parsedData.history);
    const hasValidTemplates = Array.isArray(parsedData.templates);

    if (!hasValidHistory || !hasValidTemplates) {
      return false;
    }

    const validatedHistory = (parsedData.history as any[]).filter((session) => {
      return isValidWorkoutSession(session);
    });

    const validatedTemplates = (parsedData.templates as any[]).filter((template) => {
      return isValidWorkoutSession(template);
    });

    validatedHistory.forEach((session) => {
      saveWorkoutSession(session);
    });

    validatedTemplates.forEach((template) => {
      saveWorkoutTemplate(template);
    });

    return true;
  } catch (error) {
    return false;
  }
}
