import { useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { WorkoutSession } from '../../types/workout';
import {
  getWorkoutHistory,
  deleteWorkoutSession,
} from '../../services/storageService';
import { HistoryContext } from './HistoryContext';

export interface HistoryProviderProps {
  children: ReactNode;
}

export function HistoryProvider({ children }: HistoryProviderProps) {
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    setWorkoutHistory(getWorkoutHistory());
  }, []);

  const reloadAllData = useCallback(() => {
    setWorkoutHistory(getWorkoutHistory());
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    deleteWorkoutSession(sessionId);
    setWorkoutHistory(getWorkoutHistory());
  }, []);

  const value = {
    workoutHistory,
    deleteSession,
    reloadAllData,
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}