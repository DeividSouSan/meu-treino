import { useCallback, useState } from 'react';
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
   * ID da sessão selecionada para exclusão (abre o diálogo de confirmação).
   */
  sessionToDeleteId: string | null;
  /**
   * Estado de visibilidade do modal de Configurações & Backup.
   */
  isSettingsOpen: boolean;
  /**
   * Abre o modal de Configurações & Backup.
   */
  openSettings: () => void;
  /**
   * Fecha o modal de Configurações & Backup.
   */
  closeSettings: () => void;
  /**
   * Navega para a tela de treino ativo para retomar uma sessão em andamento.
   */
  resumeActiveWorkout: () => void;

  /**
   * Toca uma sessão do histórico para editá-la.
   */
  handleSessionTap: (session: WorkoutSession) => void;
  /**
   * Toque longo em uma sessão do histórico: abre confirmação de exclusão.
   */
  handleSessionLongPress: (sessionId: string) => void;
  /**
   * Executa a exclusão da sessão selecionada após confirmação.
   */
  confirmDeleteSession: () => void;
  /**
   * Cancela a exclusão da sessão selecionada.
   */
  cancelDeleteSession: () => void;
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
  const [sessionToDeleteId, setSessionToDeleteId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const { workoutHistory, deleteSession, reloadAllData } = useHistory();
  const { activeSession, startNewWorkout, startEditingWorkout } = useSession();
  const { navigateToHistory, navigateToActiveWorkout } = useNavigation();

  const { formatWorkoutDate, formatWorkoutDuration } = useHistoryFormatters();

  const openSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const handleSessionTap = useCallback((session: WorkoutSession) => {
    startEditingWorkout(session);
    navigateToActiveWorkout();
  }, [startEditingWorkout, navigateToActiveWorkout]);

  const handleSessionLongPress = useCallback((sessionId: string) => {
    setSessionToDeleteId(sessionId);
  }, []);

  const confirmDeleteSession = useCallback(() => {
    if (sessionToDeleteId) {
      deleteSession(sessionToDeleteId);
      setSessionToDeleteId(null);
    }
  }, [deleteSession, sessionToDeleteId]);

  const cancelDeleteSession = useCallback(() => {
    setSessionToDeleteId(null);
  }, []);

  const handleImportSuccess = useCallback(() => {
    reloadAllData();
    setIsSettingsOpen(false);
    navigateToHistory();
  }, [reloadAllData, navigateToHistory]);

  const handleCreateNewWorkout = useCallback(() => {
    startNewWorkout(null);
    navigateToActiveWorkout();
  }, [startNewWorkout, navigateToActiveWorkout]);

  return {
    workoutHistory,
    activeSession,
    sessionToDeleteId,
    isSettingsOpen,
    openSettings,
    closeSettings,
    resumeActiveWorkout: navigateToActiveWorkout,
    handleSessionTap,
    handleSessionLongPress,
    confirmDeleteSession,
    cancelDeleteSession,
    handleImportSuccess,
    handleCreateNewWorkout,
    formatWorkoutDate,
    formatWorkoutDuration,
  };
}