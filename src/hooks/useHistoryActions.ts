import { useCallback } from 'react';
import type { WorkoutSession } from '../types/workout';

export interface UseHistoryActionsResult {
  handleSessionTap: (session: WorkoutSession) => void;
  handleSessionLongPress: (sessionId: string) => void;
  handleImportSuccess: () => void;
  handleCreateNewWorkout: () => void;
}

export function useHistoryActions({
  startEditingWorkout,
  deleteSession,
  onResumeActiveWorkout,
  startNewWorkout,
}: {
  startEditingWorkout: (workoutSession: WorkoutSession) => void;
  deleteSession: (sessionId: string) => void;
  onResumeActiveWorkout: () => void;
  startNewWorkout: (templateSession?: WorkoutSession | null) => void;
}): UseHistoryActionsResult {
  const handleSessionTap = useCallback((session: WorkoutSession) => {
    startEditingWorkout(session);
  }, [startEditingWorkout]);

  const handleSessionLongPress = useCallback((sessionId: string) => {
    const userConfirmed = window.confirm('Deseja realmente excluir este treino do histórico?');
    if (userConfirmed) {
      deleteSession(sessionId);
    }
  }, [deleteSession]);

  const handleImportSuccess = useCallback(() => {
    onResumeActiveWorkout();
  }, [onResumeActiveWorkout]);

  const handleCreateNewWorkout = useCallback(() => {
    startNewWorkout(null);
  }, [startNewWorkout]);

  return {
    handleSessionTap,
    handleSessionLongPress,
    handleImportSuccess,
    handleCreateNewWorkout,
  };
}