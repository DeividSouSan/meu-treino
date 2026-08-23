import { useMemo, useCallback } from 'react';
import type { WorkoutExercise } from '../types/workout';

export interface UseExerciseNavigationResult {
  selectedExercise: WorkoutExercise | null;
  selectedExerciseId: string | null;
  currentExerciseIndex: number;
  hasPrevious: boolean;
  hasNext: boolean;

  selectExercise: (exerciseId: string) => void;
  goBackToList: () => void;
  navigatePrevious: () => void;
  navigateNext: () => void;
}

export function useExerciseNavigation(
  exercises: WorkoutExercise[],
  selectedExerciseId: string | null,
  onSelectExercise: (exerciseId: string) => void,
): UseExerciseNavigationResult {
  const selectedExercise = exercises.find((exercise) => exercise.id === selectedExerciseId) || null;
  const currentExerciseIndex = exercises.findIndex(
    (exercise) => exercise.id === selectedExerciseId,
  );

  const selectExercise = useCallback(
    (exerciseId: string) => {
      onSelectExercise(exerciseId);
    },
    [onSelectExercise],
  );

  const goBackToList = useCallback(() => {
    onSelectExercise('');
  }, [onSelectExercise]);

  const navigatePrevious = useCallback(() => {
    if (currentExerciseIndex > 0) {
      const previousExercise = exercises[currentExerciseIndex - 1];
      onSelectExercise(previousExercise.id);
    }
  }, [currentExerciseIndex, exercises, onSelectExercise]);

  const navigateNext = useCallback(() => {
    if (currentExerciseIndex < exercises.length - 1) {
      const nextExercise = exercises[currentExerciseIndex + 1];
      onSelectExercise(nextExercise.id);
    }
  }, [currentExerciseIndex, exercises, onSelectExercise]);

  return useMemo(
    () => ({
      selectedExercise,
      selectedExerciseId,
      currentExerciseIndex: currentExerciseIndex ?? -1,
      hasPrevious: currentExerciseIndex > 0,
      hasNext: currentExerciseIndex < exercises.length - 1,
      selectExercise,
      goBackToList,
      navigatePrevious,
      navigateNext,
    }),
    [
      selectedExercise,
      selectedExerciseId,
      currentExerciseIndex,
      exercises.length,
      selectExercise,
      goBackToList,
      navigatePrevious,
      navigateNext,
    ],
  );
}
