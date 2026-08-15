import { useCallback } from 'react';
import type { WorkoutSession } from '../../types/workout';
import { useContextWorkout } from '../../hooks';
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
 * Ele consolidou a lógica que antes vivia espalhada em useHistoryActions e
 * useHistoryFormatters. É o único ponto que conversa com o contexto de treino
 * para a tela de histórico, expondo uma API declarativa para a View.
 */
export function useHistoryView(): UseHistoryViewResult {
  const {
    workoutHistory,
    activeSession,
    startNewWorkout,
    startEditingWorkout,
    deleteSession,
    navigateToHistory,
  } = useContextWorkout();

  const { formatWorkoutDate, formatWorkoutDuration } = useHistoryFormatters();

  const handleSessionTap = useCallback((session: WorkoutSession) => {
    startEditingWorkout(session);
  }, [startEditingWorkout]);

  const handleSessionLongPress = useCallback((sessionId: string) => {
    const userConfirmed = window.confirm(
      'Deseja realmente excluir este treino do histórico?'
    );
    if (userConfirmed) {
      deleteSession(sessionId);
    }
  }, [deleteSession]);

  const handleImportSuccess = useCallback(() => {
    navigateToHistory();
  }, [navigateToHistory]);

  const handleCreateNewWorkout = useCallback(() => {
    startNewWorkout(null);
  }, [startNewWorkout]);

  return {
    workoutHistory,
    activeSession,
    resumeActiveWorkout: navigateToHistory,
    handleSessionTap,
    handleSessionLongPress,
    handleImportSuccess,
    handleCreateNewWorkout,
    formatWorkoutDate,
    formatWorkoutDuration,
  };
}
