import { useState, useCallback, useEffect } from 'react';
import type { WorkoutExercise, ExerciseSet, AdvancedTechnique } from '../types/workout';

export interface UseExerciseFormReturn {
  exercise: WorkoutExercise;
  repetitionsInput: string;
  weightInput: string;
  restInput: string;
  selectedTechniques: AdvancedTechnique[];
  setRepetitionsInput: (value: string) => void;
  setWeightInput: (value: string) => void;
  setRestInput: (value: string) => void;
  setSelectedTechniques: (techniques: AdvancedTechnique[]) => void;
  handleUpdateName: (event: React.ChangeEvent<HTMLInputElement>) => WorkoutExercise;
  handleUpdateNotes: (event: React.ChangeEvent<HTMLInputElement>) => WorkoutExercise;
  handleUpdateReferenceWeight: (event: React.ChangeEvent<HTMLInputElement>) => WorkoutExercise;
  handleToggleTechnique: (technique: AdvancedTechnique) => void;
  handleAddSet: () => { newSet: ExerciseSet; rest: number };
  handleDeleteSet: (setIndexToDelete: number) => ExerciseSet | null;
  handleQuickAdjustReps: (delta: number) => void;
  handleCopyLastSetReps: () => void;
  resetForm: () => void;
}

export function useExerciseForm(initialExercise: WorkoutExercise): UseExerciseFormReturn {
  const [exercise, setExercise] = useState<WorkoutExercise>(initialExercise);
  const [repetitionsInput, setRepetitionsInput] = useState<string>('');
  const [weightInput, setWeightInput] = useState<string>(
    initialExercise.weightInKg > 0 ? String(initialExercise.weightInKg) : ''
  );
  const [restInput, setRestInput] = useState<string>('120');
  const [selectedTechniques, setSelectedTechniques] = useState<AdvancedTechnique[]>([]);

  useEffect(() => {
    setExercise(initialExercise);
  }, [initialExercise.id]);

  const handleUpdateName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...exercise, name: event.target.value };
    setExercise(updated);
    return updated;
  }, [exercise]);

  const handleUpdateNotes = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...exercise, notes: event.target.value };
    setExercise(updated);
    return updated;
  }, [exercise]);

  const handleUpdateReferenceWeight = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const numericWeight = parseFloat(event.target.value) || 0;
    const updated = { ...exercise, weightInKg: numericWeight };
    setWeightInput(event.target.value);
    return updated;
  }, [exercise]);

  const handleToggleTechnique = useCallback((technique: AdvancedTechnique) => {
    setSelectedTechniques((previousTechniques) => {
      const isAlreadySelected = previousTechniques.includes(technique);
      if (isAlreadySelected) {
        return previousTechniques.filter((tech) => tech !== technique);
      } else {
        return [...previousTechniques, technique];
      }
    });
  }, []);

  const handleAddSet = useCallback(() => {
    const repetitions = parseInt(repetitionsInput, 10);
    const weight = parseFloat(weightInput) || 0;
    const rest = parseInt(restInput, 10) || 0;

    if (isNaN(repetitions) || repetitions <= 0) {
      alert('Por favor, informe um número válido de repetições.');
      return { newSet: null as any, rest: 0 };
    }

    // Se for FS (Feeder Set), o descanso é sempre 60s
    const effectiveRest = selectedTechniques.includes('FS') ? 60 : rest;

    const newSet: ExerciseSet = {
      weightInKg: weight,
      repetitions: repetitions,
      restTimeInSeconds: effectiveRest,
      advancedTechniques: [...selectedTechniques],
    };

    const updatedExercise = {
      ...exercise,
      sets: [...exercise.sets, newSet],
    };
    setExercise(updatedExercise);

    setRepetitionsInput('');
    setSelectedTechniques([]);
    return { newSet, rest: effectiveRest };
  }, [repetitionsInput, weightInput, restInput, selectedTechniques, exercise]);

  const handleDeleteSet = useCallback((setIndexToDelete: number): ExerciseSet | null => {
    const deletedSet = exercise.sets[setIndexToDelete] || null;
    const updatedSets = exercise.sets.filter((_, index) => index !== setIndexToDelete);
    const updatedExercise = { ...exercise, sets: updatedSets };
    setExercise(updatedExercise);
    return deletedSet;
  }, [exercise]);

  const handleQuickAdjustReps = useCallback((delta: number) => {
    const currentReps = parseInt(repetitionsInput, 10) || 0;
    const newReps = Math.max(0, currentReps + delta);
    setRepetitionsInput(String(newReps));
  }, [repetitionsInput]);

  const handleCopyLastSetReps = useCallback(() => {
    if (exercise.sets.length > 0) {
      const lastSet = exercise.sets[exercise.sets.length - 1];
      setRepetitionsInput(String(lastSet.repetitions));
    }
  }, [exercise]);

  const resetForm = useCallback(() => {
    setRepetitionsInput('');
    setWeightInput(initialExercise.weightInKg > 0 ? String(initialExercise.weightInKg) : '');
    setRestInput('120');
    setSelectedTechniques([]);
  }, [initialExercise.weightInKg]);

  return {
    exercise,
    repetitionsInput,
    weightInput,
    restInput,
    selectedTechniques,
    setRepetitionsInput,
    setWeightInput,
    setRestInput,
    setSelectedTechniques,
    handleUpdateName,
    handleUpdateNotes,
    handleUpdateReferenceWeight,
    handleToggleTechnique,
    handleAddSet,
    handleDeleteSet,
    handleQuickAdjustReps,
    handleCopyLastSetReps,
    resetForm,
  };
}