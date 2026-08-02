import { useState, useEffect } from 'react';
import type { WorkoutSession, WorkoutExercise } from '../types/workout';
import {
  getWorkoutHistory,
  getWorkoutTemplates,
  getActiveWorkoutSession,
  saveWorkoutSession,
  saveActiveWorkoutSession,
  saveWorkoutTemplate,
  deleteWorkoutSession,
  deleteWorkoutTemplate,
} from '../services/storageService';

/**
 * Interface de retorno do hook customizado useWorkout.
 */
export interface UseWorkoutResult {
  currentView: 'history' | 'active_workout';
  workoutHistory: WorkoutSession[];
  workoutTemplates: WorkoutSession[];
  activeSession: WorkoutSession | null;
  editingSession: WorkoutSession | null;
  navigateToHistory: () => void;
  startNewWorkout: (templateSession?: WorkoutSession | null) => void;
  startEditingWorkout: (workoutSession: WorkoutSession) => void;
  cancelActiveWorkout: () => void;
  updateActiveSession: (updatedSession: WorkoutSession) => void;
  updateEditingSession: (updatedSession: WorkoutSession) => void;
  finishActiveWorkout: (templateName?: string) => void;
  saveEditedWorkout: () => void;
  deleteSession: (sessionId: string) => void;
  deleteTemplate: (templateId: string) => void;
  reloadAllData: () => void;
}

/**
 * Hook customizado para gerenciar o estado global de treinos, templates e navegação.
 */
export function useWorkout(): UseWorkoutResult {
  const [currentView, setCurrentView] = useState<'history' | 'active_workout'>('history');
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutSession[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);

  useEffect(() => {
    setWorkoutHistory(getWorkoutHistory());
    setWorkoutTemplates(getWorkoutTemplates());
    setActiveSession(getActiveWorkoutSession());
  }, []);

  const reloadAllData = () => {
    setWorkoutHistory(getWorkoutHistory());
    setWorkoutTemplates(getWorkoutTemplates());
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

  const finishActiveWorkout = (templateName?: string) => {
    if (!activeSession) {
      return;
    }

    const completedSession: WorkoutSession = {
      ...activeSession,
      status: 'completed',
    };

    saveWorkoutSession(completedSession);
    saveActiveWorkoutSession(null);
    setActiveSession(null);

    if (templateName && templateName.trim() !== '') {
      const newTemplateSession: WorkoutSession = {
        ...completedSession,
        id: crypto.randomUUID(),
        name: templateName,
        isTemplate: true,
        status: 'completed',
      };
      saveWorkoutTemplate(newTemplateSession);
    }

    setWorkoutHistory(getWorkoutHistory());
    setWorkoutTemplates(getWorkoutTemplates());
    setCurrentView('history');
  };

  const saveEditedWorkout = () => {
    if (!editingSession) {
      return;
    }

    saveWorkoutSession(editingSession);
    setEditingSession(null);
    setWorkoutHistory(getWorkoutHistory());
    setCurrentView('history');
  };

  const deleteSession = (sessionId: string) => {
    deleteWorkoutSession(sessionId);
    setWorkoutHistory(getWorkoutHistory());
  };

  const deleteTemplate = (templateId: string) => {
    deleteWorkoutTemplate(templateId);
    setWorkoutTemplates(getWorkoutTemplates());
  };

  return {
    currentView,
    workoutHistory,
    workoutTemplates,
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
    deleteTemplate,
    reloadAllData,
  };
}
