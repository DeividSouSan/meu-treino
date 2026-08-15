import { useState, useCallback, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import type { WorkoutExercise, ExerciseSet, AdvancedTechnique } from '../types/workout';
import { useStopwatch } from '../hooks/useStopwatch';
import type { UseStopwatchResult } from '../hooks/useStopwatch';

export interface UseExerciseScreenProps {
  /**
   * Exercício atualmente em edição. É a fonte de verdade externa: esta tela
   * mantém uma cópia de trabalho interna, mas sempre sincroniza quando o
   * exercício externo troca (ou seja, quando navega para outro exercício).
   */
  initialExercise: WorkoutExercise;
  /**
   * Notifica o pai sempre que o exercício foi modificado (nome, carga, séries…).
   */
  onUpdateExercise: (updatedExercise: WorkoutExercise) => void;
}

export interface UseExerciseScreenResult {
  /** Cópia de trabalho do exercício — única fonte de verdade dentro desta tela. */
  exercise: WorkoutExercise;
  repetitionsInput: string;
  weightInput: string;
  restInput: string;
  selectedTechniques: AdvancedTechnique[];
  setRepetitionsInput: (value: string) => void;
  setWeightInput: (value: string) => void;
  setRestInput: (value: string) => void;
  handleUpdateName: (event: ChangeEvent<HTMLInputElement>) => void;
  handleUpdateNotes: (event: ChangeEvent<HTMLInputElement>) => void;
  handleUpdateReferenceWeight: (event: ChangeEvent<HTMLInputElement>) => void;
  handleToggleTechnique: (technique: AdvancedTechnique) => void;
  handleAddSet: () => void;
  handleDeleteSet: (setIndexToDelete: number) => void;
  handleUpdateSet: (setIndex: number, updatedSet: ExerciseSet) => void;
  handleQuickAdjustReps: (delta: number) => void;
  handleCopyLastSetReps: () => void;
  resetForm: () => void;
  /** Tempo de descanso do último set — meta para o cronômetro de descanso. */
  restTargetSeconds: number;
  restStopwatch: UseStopwatchResult;
}

/**
 * useExerciseScreen é o CONTÊINER da tela de edição de um exercício.
 *
 * Ele consolidou a antiga useExerciseForm e o estado localExercise duplicado
 * do ExerciseScreen em uma ÚNICA fonte de verdade. Gerencia:
 *  - a cópia de trabalho do exercício
 *  - os inputs de reps / carga / descanso / técnicas
 *  - o cronômetro de descanso (resetado a cada série nova)
 *
 * O componente que consome este hook só precisa de exercício (visualização)
 * e de delegar mutações para cima via onUpdateExercise.
 */
export function useExerciseScreen({
  initialExercise,
  onUpdateExercise,
}: UseExerciseScreenProps): UseExerciseScreenResult {
  const [exercise, setExercise] = useState<WorkoutExercise>(initialExercise);
  const [repetitionsInput, setRepetitionsInput] = useState<string>('');
  const [weightInput, setWeightInput] = useState<string>(
    initialExercise.weightInKg > 0 ? String(initialExercise.weightInKg) : ''
  );
  const [restInput, setRestInput] = useState<string>('120');
  const [selectedTechniques, setSelectedTechniques] = useState<AdvancedTechnique[]>([]);

  const restStopwatch = useStopwatch(0, false);

  const restTargetSeconds =
    exercise.sets.length > 0
      ? exercise.sets[exercise.sets.length - 1].restTimeInSeconds
      : 0;

  /**
   * Sincroniza a cópia de trabalho quando o exercício externo troca —
   * ou seja, quando o usuário navega para outro exercício. Os inputs de
   * série são reiniciados junto, mantendo o comportamento enxuto.
   */
  useEffect(() => {
    setExercise(initialExercise);
    setRepetitionsInput('');
    setWeightInput(initialExercise.weightInKg > 0 ? String(initialExercise.weightInKg) : '');
    setRestInput('120');
    setSelectedTechniques([]);
  }, [initialExercise.id]);

  /**
   * Aplica uma modificação ao exercício: atualiza a cópia local e notifica
   * o pai em um único passo. Assim não há dois estados de exercício para
   * synchronizar.
   */
  const updateExercise = useCallback(
    (updatedExercise: WorkoutExercise) => {
      setExercise(updatedExercise);
      onUpdateExercise(updatedExercise);
    },
    [onUpdateExercise]
  );

  const handleUpdateName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      updateExercise({ ...exercise, name: event.target.value });
    },
    [exercise, updateExercise]
  );

  const handleUpdateNotes = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      updateExercise({ ...exercise, notes: event.target.value });
    },
    [exercise, updateExercise]
  );

  const handleUpdateReferenceWeight = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const numericWeight = parseFloat(event.target.value) || 0;
      updateExercise({ ...exercise, weightInKg: numericWeight });
      setWeightInput(event.target.value);
    },
    [exercise, updateExercise]
  );

  const handleToggleTechnique = useCallback((technique: AdvancedTechnique) => {
    setSelectedTechniques((previousTechniques) => {
      if (previousTechniques.includes(technique)) {
        return previousTechniques.filter((tech) => tech !== technique);
      }
      return [...previousTechniques, technique];
    });
  }, []);

  const handleAddSet = useCallback(() => {
    const repetitions = parseInt(repetitionsInput, 10);
    const weight = parseFloat(weightInput) || 0;
    const rest = parseInt(restInput, 10) || 0;

    if (isNaN(repetitions) || repetitions <= 0) {
      alert('Por favor, informe um número válido de repetições.');
      return;
    }

    // Se for FS (Feeder Set), o descanso é sempre 60s.
    const effectiveRest = selectedTechniques.includes('FS') ? 60 : rest;

    const newSet: ExerciseSet = {
      weightInKg: weight,
      repetitions: repetitions,
      restTimeInSeconds: effectiveRest,
      advancedTechniques: [...selectedTechniques],
    };

    updateExercise({ ...exercise, sets: [...exercise.sets, newSet] });
    setRepetitionsInput('');
    setSelectedTechniques([]);
    setRestInput('120');
    restStopwatch.reset();
  }, [repetitionsInput, weightInput, restInput, selectedTechniques, exercise, updateExercise, restStopwatch]);

  const handleDeleteSet = useCallback(
    (setIndexToDelete: number) => {
      updateExercise({
        ...exercise,
        sets: exercise.sets.filter((_, index) => index !== setIndexToDelete),
      });
    },
    [exercise, updateExercise]
  );

  const handleUpdateSet = useCallback(
    (setIndex: number, updatedSet: ExerciseSet) => {
      updateExercise({
        ...exercise,
        sets: exercise.sets.map((currentSet, index) =>
          index === setIndex ? updatedSet : currentSet
        ),
      });
    },
    [exercise, updateExercise]
  );

  const handleQuickAdjustReps = useCallback(
    (delta: number) => {
      const currentReps = parseInt(repetitionsInput, 10) || 0;
      const newReps = Math.max(0, currentReps + delta);
      setRepetitionsInput(String(newReps));
    },
    [repetitionsInput]
  );

  const handleCopyLastSetReps = useCallback(() => {
    if (exercise.sets.length > 0) {
      const lastSet = exercise.sets[exercise.sets.length - 1];
      setRepetitionsInput(String(lastSet.repetitions));
    }
  }, [exercise.sets]);

  const resetForm = useCallback(() => {
    setRepetitionsInput('');
    setWeightInput(exercise.weightInKg > 0 ? String(exercise.weightInKg) : '');
    setRestInput('120');
    setSelectedTechniques([]);
  }, [exercise.weightInKg]);

  return {
    exercise,
    repetitionsInput,
    weightInput,
    restInput,
    selectedTechniques,
    setRepetitionsInput,
    setWeightInput,
    setRestInput,
    handleUpdateName,
    handleUpdateNotes,
    handleUpdateReferenceWeight,
    handleToggleTechnique,
    handleAddSet,
    handleDeleteSet,
    handleUpdateSet,
    handleQuickAdjustReps,
    handleCopyLastSetReps,
    resetForm,
    restTargetSeconds,
    restStopwatch,
  };
}
