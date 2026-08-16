import { useCallback } from 'react';
import type { WorkoutSession } from '../../types/workout';
import { useHistory, useSession, useNavigation } from '../../hooks';
import { useHistoryFormatters } from '../../hooks/useHistoryFormatters';

export interface UseHistoryViewResult {
  /**
   * Lista de sessões de treino já concluídas (ordem: mais recente primeiro).
   */
  workoutHistory: WorkoutSession[];
  /**
   * Sessão de treino ainda em andamento, se existir uma.
   */
  activeSession: WorkoutSession | null;
  /**
   * Navega para a tela de treino ativo para retomar uma sessão em andamento.
   */
  resumeActiveWorkout: () => void;
  /**
   * Toca uma sessão do histórico para editá-la.
   */
  handleSessionTap: (session: WorkoutSession) => void;
  /**
   * Toque longo em uma sessão do histórico: exclui após confirmação.
   */
  handleSessionLongPress: (sessionId: string) => void;
  /**
   * Disparado após uma importação bem-sucedida de backup: volta para o histórico.
   */
  handleImportSuccess: () => void;
  /**
   * Cria um novo treino em branco ("Treino Livre").
   */
  handleCreateNewWorkout: () => void;
  /**
   * Formata a data de uma sessão para exibição (pt-BR).
   */
  formatWorkoutDate: (dateString: string) => string;
  /**
   * Formata a duração (em segundos) para exibição (ex: "45 min").
   */
  formatWorkoutDuration: (durationInSeconds: number) => string;
}

/**
 * useHistoryView é o CONTÊINER da tela de histórico.
 *
 * Ele consolida a lógica que antes vivia espalhada em useHistoryActions e
 * useHistoryFormatters. É o único ponto que conversa com os contextos de
 * histórico, sessão e navegação para a tela de histórico, expondo uma API
 * declarativa para a View.
 */
export function useHistoryView(): UseHistoryViewResult {
  const { workoutHistory, deleteSession, reloadAllData } = useHistory();
  const { activeSession, startNewWorkout, startEditingWorkout } = useSession();
  const { navigateToHistory, navigateToActiveWorkout } = useNavigation();

  const { formatWorkoutDate, formatWorkoutDuration } = useHistoryFormatters();

  const handleSessionTap = useCallback((session: WorkoutSession) => {
    startEditingWorkout(session);
    navigateToActiveWorkout();
  }, [startEditingWorkout, navigateToActiveWorkout]);

  const handleSessionLongPress = useCallback((sessionId: string) => {
    const userConfirmed = window.confirm(
      'Deseja realmente excluir este treino do histórico?'
    );
    if (userConfirmed) {
      deleteSession(sessionId);
    }
  }, [deleteSession]);

  const handleImportSuccess = useCallback(() => {
    reloadAllData();
    navigateToHistory();
  }, [reloadAllData, navigateToHistory]);

  const handleCreateNewWorkout = useCallback(() => {
    startNewWorkout(null);
    navigateToActiveWorkout();
  }, [startNewWorkout, navigateToActiveWorkout]);

  return {
    workoutHistory,
    activeSession,
    resumeActiveWorkout: navigateToActiveWorkout,
    handleSessionTap,
    handleSessionLongPress,
    handleImportSuccess,
    handleCreateNewWorkout,
    formatWorkoutDate,
    formatWorkoutDuration,
  };
}