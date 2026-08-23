import { createContext } from 'react';
import type { WorkoutSession } from '../../types/workout';

export interface UseSessionReturn {
  activeSession: WorkoutSession | null;
  editingSession: WorkoutSession | null;
  startNewWorkout: (templateSession?: WorkoutSession | null) => void;
  startEditingWorkout: (workoutSession: WorkoutSession) => void;
  cancelActiveWorkout: () => void;
  updateActiveSession: (updatedSession: WorkoutSession) => void;
  updateEditingSession: (updatedSession: WorkoutSession) => void;
  finishActiveWorkout: (sessionToComplete?: WorkoutSession) => void;
  saveEditedWorkout: (sessionToSave?: WorkoutSession) => void;
}

export const SessionContext = createContext<UseSessionReturn | null>(null);
