import type { WorkoutSession } from '../types/workout';
import {
  getWorkoutHistory,
  saveWorkoutSession,
  saveLastBackupWorkoutCount,
} from './storageService';

/**
 * Estrutura do arquivo de backup completo exportado pelo aplicativo.
 */
export interface BackupData {
  /**
   * Identificador de versão do schema do banco de dados.
   */
  version: number;
  /**
   * Tipo do backup — facilita a distinção no importador.
   */
  type?: 'full_history' | 'single_workout';
  /**
   * Histórico de sessões de treinos finalizados (backup completo).
   */
  history?: WorkoutSession[];
  /**
   * Sessão individual (backup de treino único).
   */
  session?: WorkoutSession;
}

/**
 * Resultado estruturado de uma importação de backup.
 */
export interface ImportResult {
  /**
   * Verdadeiro quando pelo menos uma sessão válida foi importada ou o formato era correto.
   */
  success: boolean;
  /**
   * Quantidade de sessões efetivamente importadas.
   */
  count: number;
  /**
   * Nome do treino importado (disponível quando apenas um treino foi importado).
   */
  sessionName?: string;
}

/**
 * Gera um arquivo JSON contendo todos os dados do aplicativo e inicia o download no navegador.
 */
export function exportWorkoutBackup(): void {
  const history = getWorkoutHistory();
  const backupData: BackupData = {
    version: 1,
    type: 'full_history',
    history: history,
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

  saveLastBackupWorkoutCount(history.length);
}

/**
 * Gera um arquivo JSON contendo uma única sessão de treino e inicia o download no navegador.
 */
export function exportSingleWorkoutSession(session: WorkoutSession): void {
  const backupData: BackupData = {
    version: 1,
    type: 'single_workout',
    session: session,
  };

  const sanitizedName = session.name
    .toLowerCase()
    .replace(/[^a-z0-9áàâãéèêíïóôõúüçñ]+/gi, '_')
    .replace(/^_|_$/g, '');

  const dateSlice = new Date(session.date).toISOString().slice(0, 10);
  const fileName = `meu_treino_${sanitizedName}_${dateSlice}.json`;

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const downloadUrl = URL.createObjectURL(blob);

  const anchorElement = document.createElement('a');
  anchorElement.href = downloadUrl;
  anchorElement.download = fileName;

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
 * Importa dados de um arquivo de backup JSON, validando sua estrutura
 * e **mesclando** as sessões ao histórico existente no LocalStorage.
 *
 * Aceita os seguintes formatos:
 *   1. Backup completo: `{ history: [...] }` ou `{ type: 'full_history', history: [...] }`
 *   2. Treino individual: `{ type: 'single_workout', session: {...} }` ou `{ session: {...} }`
 *   3. Sessão avulsa direta: objeto com `id`, `date`, `name`, etc.
 *   4. Array de sessões: `[{...}, {...}]`
 *
 * A mesclagem é feita via `saveWorkoutSession`, que atualiza se o ID já existe
 * ou adiciona se é novo — sem apagar nenhuma sessão preexistente.
 */
export function importWorkoutBackup(jsonString: string): ImportResult {
  try {
    const parsedData = JSON.parse(jsonString);

    if (!parsedData || typeof parsedData !== 'object') {
      return { success: false, count: 0 };
    }

    // Formato 4: Array direto de sessões
    if (Array.isArray(parsedData)) {
      const validSessions = parsedData.filter(isValidWorkoutSession);
      validSessions.forEach((session) => saveWorkoutSession(session));
      return {
        success: true,
        count: validSessions.length,
        sessionName: validSessions.length === 1 ? validSessions[0].name : undefined,
      };
    }

    // Formato 2: Treino individual { session: {...} }
    if (parsedData.session && isValidWorkoutSession(parsedData.session)) {
      saveWorkoutSession(parsedData.session);
      return {
        success: true,
        count: 1,
        sessionName: parsedData.session.name,
      };
    }

    // Formato 1: Backup completo { history: [...] }
    if (Array.isArray(parsedData.history)) {
      const validSessions = parsedData.history.filter(isValidWorkoutSession);
      validSessions.forEach((session: WorkoutSession) => saveWorkoutSession(session));
      saveLastBackupWorkoutCount(getWorkoutHistory().length);
      return {
        success: true,
        count: validSessions.length,
        sessionName: validSessions.length === 1 ? validSessions[0].name : undefined,
      };
    }

    // Formato 3: Sessão avulsa direta (objeto raiz é a própria sessão)
    if (isValidWorkoutSession(parsedData)) {
      saveWorkoutSession(parsedData);
      return {
        success: true,
        count: 1,
        sessionName: parsedData.name,
      };
    }

    return { success: false, count: 0 };
  } catch {
    return { success: false, count: 0 };
  }
}
