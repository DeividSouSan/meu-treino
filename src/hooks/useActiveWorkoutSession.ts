import { useCallback, useMemo } from 'react';
import type { WorkoutSession, WorkoutExercise } from '../types/workout';
import { useStopwatch } from './useStopwatch';

export interface UseActiveWorkoutSessionResult {
  session: WorkoutSession;
  isEditing: boolean;
  durationStopwatch: ReturnType<typeof useStopwatch>;
  
  // Session updates
  updateSession: (updatedSession: WorkoutSession) => void;
  addCue: (cue: string) => void;
  removeCue: (cueIndex: number) => void;
  addExercise: (exerciseName: string) => void;
  updateExercise: (updatedExercise: WorkoutExercise) => void;
  deleteExercise: (exerciseId: string) => void;
  
  // Actions
  onCancel: () => void;
  onSaveOrFinish: () => void;
}

export function useActiveWorkoutSession({
  activeSession,
  editingSession,
  onUpdateActiveSession,
  onUpdateEditingSession,
  onFinishActiveWorkout,
  onSaveEditedWorkout,
  onCancelActiveWorkout,
}: {
  activeSession: WorkoutSession | null;
  editingSession: WorkoutSession | null;
  onUpdateActiveSession: (workoutSession: WorkoutSession) => void;
  onUpdateEditingSession: (workoutSession: WorkoutSession) => void;
  onFinishActiveWorkout: () => void;
  onSaveEditedWorkout: () => void;
  onCancelActiveWorkout: () => void;
}): UseActiveWorkoutSessionResult {
  const currentSession = editingSession || activeSession;
  const isEditing = editingSession !== null;

  const sessionStopwatch = useStopwatch(
    currentSession ? currentSession.durationInSeconds : 0,
    !isEditing && currentSession?.status === 'in_progress'
  );

  const updateSession = useCallback((updatedSession: WorkoutSession) => {
    if (isEditing) {
      onUpdateEditingSession(updatedSession);
    } else {
      onUpdateActiveSession(updatedSession);
    }
  }, [isEditing, onUpdateActiveSession, onUpdateEditingSession]);

  const addCue = useCallback((cue: string) => {
    if (!currentSession) return;
    const updatedCues = [...currentSession.cues, cue];
    updateSession({ ...currentSession, cues: updatedCues });
  }, [currentSession, updateSession]);

  const removeCue = useCallback((cueIndex: number) => {
    if (!currentSession) return;
    const updatedCues = currentSession.cues.filter((_, index) => index !== cueIndex);
    updateSession({ ...currentSession, cues: updatedCues });
  }, [currentSession, updateSession]);

  const addExercise = useCallback((exerciseName: string) => {
    if (!currentSession) return;
    const trimmedName = exerciseName.trim();
    if (trimmedName === '') return;

    const newExercise: WorkoutExercise = {
      id: crypto.randomUUID(),
      name: trimmedName,
      weightInKg: 0,
      notes: '',
      sets: [],
    };

    updateSession({ ...currentSession, exercises: [...currentSession.exercises, newExercise] });
  }, [currentSession, updateSession]);

  const updateExercise = useCallback((updatedExercise: WorkoutExercise) => {
    if (!currentSession) return;
    const updatedExercises = currentSession.exercises.map((exercise) =>
      exercise.id === updatedExercise.id ? updatedExercise : exercise
    );
    updateSession({ ...currentSession, exercises: updatedExercises });
  }, [currentSession, updateSession]);

  const deleteExercise = useCallback((exerciseId: string) => {
    if (!currentSession) return;
    const userConfirmed = window.confirm('Deseja realmente remover este exercício do treino?');
    if (!userConfirmed) return;

    updateSession({
      ...currentSession,
      exercises: currentSession.exercises.filter((exercise) => exercise.id !== exerciseId),
    });
  }, [currentSession, updateSession]);

  const saveOrFinish = useCallback(() => {
    if (!currentSession) return;
    const finalSession = { ...currentSession, durationInSeconds: sessionStopwatch.seconds };
    updateSession(finalSession);

    if (isEditing) {
      onSaveEditedWorkout();
    } else {
      onFinishActiveWorkout();
    }
  }, [currentSession, sessionStopwatch.seconds, isEditing, updateSession, onSaveEditedWorkout, onFinishActiveWorkout]);

  return useMemo(() => ({
    session: currentSession!,
    isEditing,
    durationStopwatch: sessionStopwatch,
    updateSession,
    addCue,
    removeCue,
    addExercise,
    updateExercise,
    deleteExercise,
    onCancel: onCancelActiveWorkout,
    onSaveOrFinish: saveOrFinish,
  }), [currentSession, isEditing, sessionStopwatch, updateSession, addCue, removeCue, addExercise, updateExercise, deleteExercise, onCancelActiveWorkout, saveOrFinish]);
}