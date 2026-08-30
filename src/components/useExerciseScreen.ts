import { useState, useCallback, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import type {
  WorkoutExercise,
  ExerciseSet,
  AdvancedTechnique,
  EquipmentType,
  LoadType,
} from '../types/workout';
import { useStopwatch } from '../hooks/useStopwatch';
import type { UseStopwatchResult } from '../hooks/useStopwatch';
import { hapticService } from '../services/hapticService';
import { getWorkoutHistory } from '../services/storageService';

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
  handleUpdateEquipmentType: (type: EquipmentType) => void;
  handleUpdateLoadType: (type: LoadType) => void;
  handleAddSet: () => void;
  handleDeleteSet: (setIndexToDelete: number) => void;
  handleUpdateSet: (setIndex: number, updatedSet: ExerciseSet) => void;
  handleQuickAdjustReps: (delta: number) => void;
  handleCopyLastSetReps: () => void;
  resetForm: () => void;
  /** Tempo de descanso do último set — meta para o cronômetro de descanso. */
  restTargetSeconds: number;
  restStopwatch: UseStopwatchResult;
  /** Mensagem de erro de validação para exibição em modal. */
  validationError: string | null;
  /** Limpa o erro de validação ao fechar o diálogo. */
  clearValidationError: () => void;
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
    initialExercise.weightInKg > 0 ? String(initialExercise.weightInKg) : '',
  );
  const [restInput, setRestInput] = useState<string>('120');
  const [selectedTechniques, setSelectedTechniques] = useState<AdvancedTechnique[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const restStopwatch = useStopwatch(0, false);

  const clearValidationError = useCallback(() => {
    setValidationError(null);
  }, []);

  const restTargetSeconds =
    exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1].restTimeInSeconds : 0;

  /**
   * Sincroniza a cópia de trabalho quando o exercício externo troca —
   * ou seja, quando o usuário navega para outro exercício. Os inputs de
   * série são reiniciados junto, mantendo o comportamento enxuto.
   * Tenta obter do histórico o equipamento/carga padrão se vierem vazios.
   */
  useEffect(() => {
    const normName = initialExercise.name.trim().toLowerCase();

    // Busca última sessão que teve esse mesmo exercício para herdar o equipamento e carga como padrão
    let defaultEquipment = initialExercise.equipmentType;
    let defaultLoad = initialExercise.loadType;
    if (!defaultEquipment || !defaultLoad) {
      const history = getWorkoutHistory();
      const pastExercise = history
        .flatMap((s) => s.exercises)
        .find((e) => e.name.trim().toLowerCase() === normName);
      if (pastExercise) {
        if (!defaultEquipment) defaultEquipment = pastExercise.equipmentType;
        if (!defaultLoad) defaultLoad = pastExercise.loadType;
      }
    }

    setExercise({
      ...initialExercise,
      equipmentType: defaultEquipment,
      loadType: defaultLoad,
    });
    setRepetitionsInput('');
    setWeightInput(initialExercise.weightInKg > 0 ? String(initialExercise.weightInKg) : '');
    setRestInput('120');
    setSelectedTechniques([]);
    setValidationError(null);
  }, [initialExercise.id, initialExercise.name, initialExercise.weightInKg]);

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
    [onUpdateExercise],
  );

  const handleUpdateName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      updateExercise({ ...exercise, name: event.target.value });
    },
    [exercise, updateExercise],
  );

  const handleUpdateNotes = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      updateExercise({ ...exercise, notes: event.target.value });
    },
    [exercise, updateExercise],
  );

  const handleUpdateReferenceWeight = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const numericWeight = parseFloat(event.target.value) || 0;
      updateExercise({ ...exercise, weightInKg: numericWeight });
      setWeightInput(event.target.value);
    },
    [exercise, updateExercise],
  );

  const handleToggleTechnique = useCallback((technique: AdvancedTechnique) => {
    setSelectedTechniques((previousTechniques) => {
      if (previousTechniques.includes(technique)) {
        return previousTechniques.filter((tech) => tech !== technique);
      }
      return [...previousTechniques, technique];
    });
  }, []);

  const handleUpdateEquipmentType = useCallback(
    (type: EquipmentType) => {
      setExercise((prev) => {
        const updated = { ...prev, equipmentType: type };
        onUpdateExercise(updated);
        return updated;
      });
    },
    [onUpdateExercise],
  );

  const handleUpdateLoadType = useCallback(
    (type: LoadType) => {
      setExercise((prev) => {
        const updated = { ...prev, loadType: type };
        onUpdateExercise(updated);
        return updated;
      });
    },
    [onUpdateExercise],
  );

  const handleAddSet = useCallback(() => {
    const repetitions = parseInt(repetitionsInput, 10);
    const weight = parseFloat(weightInput) || 0;
    const rest = parseInt(restInput, 10) || 0;

    if (isNaN(repetitions) || repetitions <= 0) {
      setValidationError('Por favor, informe um número válido de repetições (maior que zero).');
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
    hapticService.success();
    // Preserve the just-added values as defaults for the next set
    setRepetitionsInput(String(repetitions));
    setWeightInput(String(weight));
    setRestInput(String(effectiveRest));
    setSelectedTechniques([...selectedTechniques]);
    restStopwatch.reset();
  }, [
    repetitionsInput,
    weightInput,
    restInput,
    selectedTechniques,
    exercise,
    updateExercise,
    restStopwatch,
  ]);

  const handleDeleteSet = useCallback(
    (setIndexToDelete: number) => {
      updateExercise({
        ...exercise,
        sets: exercise.sets.filter((_, index) => index !== setIndexToDelete),
      });
    },
    [exercise, updateExercise],
  );

  const handleUpdateSet = useCallback(
    (setIndex: number, updatedSet: ExerciseSet) => {
      updateExercise({
        ...exercise,
        sets: exercise.sets.map((currentSet, index) =>
          index === setIndex ? updatedSet : currentSet,
        ),
      });
    },
    [exercise, updateExercise],
  );

  const handleQuickAdjustReps = useCallback(
    (delta: number) => {
      const currentReps = parseInt(repetitionsInput, 10) || 0;
      const newReps = Math.max(0, currentReps + delta);
      setRepetitionsInput(String(newReps));
    },
    [repetitionsInput],
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
    handleUpdateEquipmentType,
    handleUpdateLoadType,
    handleAddSet,
    handleDeleteSet,
    handleUpdateSet,
    handleQuickAdjustReps,
    handleCopyLastSetReps,
    resetForm,
    restTargetSeconds,
    restStopwatch,
    validationError,
    clearValidationError,
  };
}
