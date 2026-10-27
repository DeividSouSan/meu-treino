import { useCallback, useEffect, useState } from 'react';
import type { WorkoutSession } from '../../types/workout';
import { useHistory, useSession, useNavigation } from '../../hooks';
import { useHistoryFormatters } from '../../hooks/useHistoryFormatters';
import { exportSingleWorkoutSession } from '../../services/backupService';
import { getLastBackupWorkoutCount } from '../../services/storageService';

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
   * Sessão selecionada pelo toque longo para exibir o menu de ações.
   */
  selectedSessionForActions: WorkoutSession | null;
  /**
   * Estado de visibilidade do modal de Configurações & Backup.
   */
  isSettingsOpen: boolean;
  /**
   * Estado de visibilidade do alerta vermelho (treinos não salvos) de Configurações & Backup.
   */
  hasUnsavedSessions: boolean;
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
   * Toque longo em uma sessão do histórico: abre o menu de ações.
   */
  handleSessionLongPress: (sessionId: string) => void;
  /**
   * Fecha o menu de ações do treino selecionado.
   */
  closeActionMenu: () => void;
  /**
   * Edita a sessão selecionada no menu de ações.
   */
  handleEditFromActionMenu: () => void;
  /**
   * Exporta a sessão selecionada no menu de ações como arquivo JSON individual.
   */
  handleExportFromActionMenu: () => void;
  /**
   * Abre a confirmação de exclusão para a sessão selecionada no menu de ações.
   */
  handleDeleteFromActionMenu: () => void;
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
   * Disparado após uma exportação de backup.
   */
  handleExportSuccess: () => void;
  /**
   * Estado de visibilidade do diálogo de confirmação para criar um novo
   * treino quando já existe um treino em andamento.
   */
  confirmNewWorkout: boolean;
  /**
   * Confirma a criação de um novo treino, descartando o treino em andamento.
   */
  confirmCreateNewWorkout: () => void;
  /**
   * Cancela a criação de um novo treino, mantendo o treino em andamento.
   */
  cancelCreateNewWorkout: () => void;
  /**
   * Cria um novo treino em branco ("Treino Livre"). Se já houver um treino em
   * andamento, abre o diálogo de confirmação antes de descartá-lo.
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
  const [confirmNewWorkout, setConfirmNewWorkout] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [hasUnsavedSessions, setHasUnsavedSessions] = useState<boolean>(false);
  const [selectedSessionForActions, setSelectedSessionForActions] = useState<WorkoutSession | null>(
    null,
  );
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

  const handleSessionTap = useCallback(
    (session: WorkoutSession) => {
      startEditingWorkout(session);
      navigateToActiveWorkout();
    },
    [startEditingWorkout, navigateToActiveWorkout],
  );

  /**
   * Toque longo: em vez de abrir diretamente a confirmação de exclusão,
   * abre o menu de ações do treino selecionado.
   */
  const handleSessionLongPress = useCallback(
    (sessionId: string) => {
      const session = workoutHistory.find((s) => s.id === sessionId) || null;
      setSelectedSessionForActions(session);
    },
    [workoutHistory],
  );

  const closeActionMenu = useCallback(() => {
    setSelectedSessionForActions(null);
  }, []);

  const handleEditFromActionMenu = useCallback(() => {
    if (selectedSessionForActions) {
      handleSessionTap(selectedSessionForActions);
      setSelectedSessionForActions(null);
    }
  }, [selectedSessionForActions, handleSessionTap]);

  const handleExportFromActionMenu = useCallback(() => {
    if (selectedSessionForActions) {
      exportSingleWorkoutSession(selectedSessionForActions);
      setSelectedSessionForActions(null);
    }
  }, [selectedSessionForActions]);

  const handleDeleteFromActionMenu = useCallback(() => {
    if (selectedSessionForActions) {
      setSessionToDeleteId(selectedSessionForActions.id);
      setSelectedSessionForActions(null);
    }
  }, [selectedSessionForActions]);

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

  const handleExportSuccess = useCallback(() => {
    setHasUnsavedSessions(false);
  }, []);

  const handleCreateNewWorkout = useCallback(() => {
    if (activeSession) {
      setConfirmNewWorkout(true);
      return;
    }
    startNewWorkout(null);
    navigateToActiveWorkout();
  }, [activeSession, startNewWorkout, navigateToActiveWorkout]);

  const confirmCreateNewWorkout = useCallback(() => {
    setConfirmNewWorkout(false);
    startNewWorkout(null);
    navigateToActiveWorkout();
  }, [startNewWorkout, navigateToActiveWorkout]);

  const cancelCreateNewWorkout = useCallback(() => {
    setConfirmNewWorkout(false);
  }, []);

  useEffect(() => {
    const savedWorkoutsCount = getLastBackupWorkoutCount();

    if (savedWorkoutsCount < workoutHistory.length) setHasUnsavedSessions(true);
    else setHasUnsavedSessions(false);
  }, [workoutHistory]);

  return {
    workoutHistory,
    activeSession,
    sessionToDeleteId,
    selectedSessionForActions,
    isSettingsOpen,
    hasUnsavedSessions,
    openSettings,
    closeSettings,
    resumeActiveWorkout: navigateToActiveWorkout,
    handleSessionTap,
    handleSessionLongPress,
    closeActionMenu,
    handleEditFromActionMenu,
    handleExportFromActionMenu,
    handleDeleteFromActionMenu,
    confirmDeleteSession,
    cancelDeleteSession,
    handleImportSuccess,
    handleExportSuccess,
    handleCreateNewWorkout,
    confirmNewWorkout,
    confirmCreateNewWorkout,
    cancelCreateNewWorkout,
    formatWorkoutDate,
    formatWorkoutDuration,
  };
}
