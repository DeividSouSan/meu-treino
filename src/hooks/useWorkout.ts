import { useState, useEffect } from 'react';
import type { WorkoutSession, WorkoutExercise } from '../types/workout';
import {
  getWorkoutHistory,
  getActiveWorkoutSession,
  saveWorkoutSession,
  saveActiveWorkoutSession,
  deleteWorkoutSession,
} from '../services/storageService';

/**
 * Interface de retorno do hook customizado useWorkout.
 */
export interface UseWorkoutResult {
  currentView: 'history' | 'active_workout';
  workoutHistory: WorkoutSession[];
  activeSession: WorkoutSession | null;
  editingSession: WorkoutSession | null;
  navigateToHistory: () => void;
  startNewWorkout: (templateSession?: WorkoutSession | null) => void;
  startEditingWorkout: (workoutSession: WorkoutSession) => void;
  cancelActiveWorkout: () => void;
  updateActiveSession: (updatedSession: WorkoutSession) => void;
  updateEditingSession: (updatedSession: WorkoutSession) => void;
  finishActiveWorkout: (sessionToComplete?: WorkoutSession) => void;
  saveEditedWorkout: (sessionToSave?: WorkoutSession) => void;
  deleteSession: (sessionId: string) => void;
  reloadAllData: () => void;
}

/**
 * Hook customizado para gerenciar o estado global de treinos, templates e navegação.
 */
export function useWorkout(): UseWorkoutResult {
  const [currentView, setCurrentView] = useState<'history' | 'active_workout'>('history');
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);

  useEffect(() => {
    setWorkoutHistory(getWorkoutHistory());
    setActiveSession(getActiveWorkoutSession());
  }, []);

  const reloadAllData = () => {
    setWorkoutHistory(getWorkoutHistory());
    setActiveSession(getActiveWorkoutSession());
  };

  const navigateToHistory = () => {
    setCurrentView('history');
    setEditingSession(null);
  };

  const startNewWorkout = (templateSession?: WorkoutSession | null) => {
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
    setCurrentView('active_workout');
    setEditingSession(null);
  };

  const startEditingWorkout = (workoutSession: WorkoutSession) => {
    setEditingSession(workoutSession);
    setCurrentView('active_workout');
    setActiveSession(null);
  };

  const cancelActiveWorkout = () => {
    setActiveSession(null);
    saveActiveWorkoutSession(null);
    setCurrentView('history');
  };

  const updateActiveSession = (updatedSession: WorkoutSession) => {
    setActiveSession(updatedSession);
    saveActiveWorkoutSession(updatedSession);
  };

  const updateEditingSession = (updatedSession: WorkoutSession) => {
    setEditingSession(updatedSession);
  };

  const finishActiveWorkout = (sessionToComplete?: WorkoutSession) => {
    // Usa a sessão informada quando disponível (já com a duração atualizada
    // pelo cronômetro), evitando ler o estado que ainda não foi atualizado.
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

    setWorkoutHistory(getWorkoutHistory());
    setCurrentView('history');
  };

  const saveEditedWorkout = (sessionToSave?: WorkoutSession) => {
    // Usa a sessão informada quando disponível (já com a duração atualizada),
    // evitando ler o estado que ainda não foi atualizado.
    const sessionToPersist = sessionToSave ?? editingSession;
    if (!sessionToPersist) {
      return;
    }

    saveWorkoutSession(sessionToPersist);
    setEditingSession(null);
    setWorkoutHistory(getWorkoutHistory());
    setCurrentView('history');
  };

  const deleteSession = (sessionId: string) => {
    deleteWorkoutSession(sessionId);
    setWorkoutHistory(getWorkoutHistory());
  };

  return {
    currentView,
    workoutHistory,
    activeSession,
    editingSession,
    navigateToHistory,
    startNewWorkout,
    startEditingWorkout,
    cancelActiveWorkout,
    updateActiveSession,
    updateEditingSession,
    finishActiveWorkout,
    saveEditedWorkout,
    deleteSession,
    reloadAllData,
  };
}
