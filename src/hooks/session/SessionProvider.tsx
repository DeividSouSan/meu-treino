import { useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { WorkoutSession, WorkoutExercise } from '../../types/workout';
import {
  getWorkoutHistory,
  getActiveWorkoutSession,
  saveWorkoutSession,
  saveActiveWorkoutSession,
} from '../../services/storageService';
import { SessionContext } from './SessionContext';

export interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);

  useEffect(() => {
    setActiveSession(getActiveWorkoutSession());
  }, []);

  const startNewWorkout = useCallback((templateSession?: WorkoutSession | null) => {
    const newSessionId = crypto.randomUUID();
    const newSessionDate = new Date().toISOString();

    let initialExercises: WorkoutExercise[] = [];
    if (templateSession) {
      initialExercises = templateSession.exercises.map((exercise) => {
        return {
          id: crypto.randomUUID(),
          name: exercise.name,
          weightInKg: exercise.weightInKg,
          notes: exercise.notes,
          sets: [],
        };
      });
    }

    const newWorkoutSession: WorkoutSession = {
      id: newSessionId,
      date: newSessionDate,
      durationInSeconds: 0,
      name: templateSession ? templateSession.name : 'Treino Livre',
      cues: templateSession ? [...templateSession.cues] : [],
      exercises: initialExercises,
      isTemplate: false,
      status: 'in_progress',
    };

    setActiveSession(newWorkoutSession);
    saveActiveWorkoutSession(newWorkoutSession);
    setEditingSession(null);
  }, []);

  const startEditingWorkout = useCallback((workoutSession: WorkoutSession) => {
    setEditingSession(workoutSession);
    setActiveSession(null);
  }, []);

  const cancelActiveWorkout = useCallback(() => {
    setActiveSession(null);
    saveActiveWorkoutSession(null);
  }, []);

  const updateActiveSession = useCallback((updatedSession: WorkoutSession) => {
    setActiveSession(updatedSession);
    saveActiveWorkoutSession(updatedSession);
  }, []);

  const updateEditingSession = useCallback((updatedSession: WorkoutSession) => {
    setEditingSession(updatedSession);
  }, []);

  const finishActiveWorkout = useCallback((sessionToComplete?: WorkoutSession) => {
    const sessionToClose = sessionToComplete ?? activeSession;
    if (!sessionToClose) {
      return;
    }

    const completedSession: WorkoutSession = {
      ...sessionToClose,
      status: 'completed',
    };

    saveWorkoutSession(completedSession);
    saveActiveWorkoutSession(null);
    setActiveSession(null);
  }, [activeSession]);

  const saveEditedWorkout = useCallback((sessionToSave?: WorkoutSession) => {
    const sessionToPersist = sessionToSave ?? editingSession;
    if (!sessionToPersist) {
      return;
    }

    saveWorkoutSession(sessionToPersist);
    setEditingSession(null);
  }, [editingSession]);

  const value = {
    activeSession,
    editingSession,
    startNewWorkout,
    startEditingWorkout,
    cancelActiveWorkout,
    updateActiveSession,
    updateEditingSession,
    finishActiveWorkout,
    saveEditedWorkout,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}