import { createContext } from 'react';
import type { WorkoutSession } from '../../types/workout';
import type { UseStopwatchResult } from '../../hooks/useStopwatch';

export interface UseSessionReturn {
  activeSession: WorkoutSession | null;
  editingSession: WorkoutSession | null;
  /** Cronômetro de duração da sessão ativa (roda entre troca de views). */
  durationStopwatch: UseStopwatchResult;
  startNewWorkout: (templateSession?: WorkoutSession | null) => void;
  startEditingWorkout: (workoutSession: WorkoutSession) => void;
  cancelActiveWorkout: () => void;
  updateActiveSession: (updatedSession: WorkoutSession) => void;
  updateEditingSession: (updatedSession: WorkoutSession) => void;
  finishActiveWorkout: (sessionToComplete?: WorkoutSession) => void;
  saveEditedWorkout: (sessionToSave?: WorkoutSession) => void;
}

export const SessionContext = createContext<UseSessionReturn | null>(null);
