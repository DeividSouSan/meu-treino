import { createContext } from 'react';
import type { WorkoutSession } from '../../types/workout';

export interface UseHistoryReturn {
  workoutHistory: WorkoutSession[];
  deleteSession: (sessionId: string) => void;
  reloadAllData: () => void;
}

export const HistoryContext = createContext<UseHistoryReturn | null>(null);
