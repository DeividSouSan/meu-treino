import { useState, useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { WorkoutExercise, ExerciseSet } from '../types/workout';
import { useExerciseForm } from '../hooks/useExerciseForm';
import { useStopwatch } from '../hooks/useStopwatch';
import { RestTimer } from './RestTimer';
import { MtButton, MtEmptyState, MtField, MtLastWorkoutSets } from './ui';
import { ExerciseSetItem } from './ExerciseSetItem';
import { ExerciseTechniquePills } from './ExerciseTechniquePills';
import { ArrowLeft, ChevronLeft, ChevronRight, Trash2, Copy, Minus, Plus } from 'lucide-react';

export interface ExerciseScreenProps {
  exercise: WorkoutExercise;
  onUpdateExercise: (updatedExercise: WorkoutExercise) => void;
  onDeleteExercise: () => void;
  onSetAdded: (restTimeInSeconds: number) => void;
  onBack: () => void;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export function ExerciseScreen({
  exercise,
  onUpdateExercise,
  onDeleteExercise,
  onSetAdded,
  onBack,
  onNavigatePrevious,
  onNavigateNext,
  hasPrevious,
  hasNext,
}: ExerciseScreenProps) {
  const localRestStopwatch = useStopwatch(0, false);
  const {
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
  } = useExerciseForm(exercise);

  const [localExercise, setLocalExercise] = useState<WorkoutExercise>(exercise);

  // Sync with parent exercise prop changes
  if (exercise.id !== localExercise.id || exercise.sets.length !== localExercise.sets.length) {
    setLocalExercise(exercise);
  }

  const handleNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const updated = handleUpdateName(event);
    setLocalExercise(updated);
  }, [handleUpdateName]);

  const handleNotesChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const updated = handleUpdateNotes(event);
    setLocalExercise(updated);
  }, [handleUpdateNotes]);

  const handleWeightChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const updated = handleUpdateReferenceWeight(event);
    setLocalExercise(updated);
  }, [handleUpdateReferenceWeight]);

  const handleFormSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();
    const result = handleAddSet();
    if (result.newSet) {
      const updated = {
        ...localExercise,
        sets: [...localExercise.sets, result.newSet],
      };
      setLocalExercise(updated);
      onUpdateExercise(updated);
      onSetAdded(result.rest);
      setRepetitionsInput('');
      setSelectedTechniques([]);
      // Reset rest stopwatch when new set is added
      localRestStopwatch.reset();
    }
  }, [handleAddSet, localExercise, onUpdateExercise, onSetAdded, setRepetitionsInput, setSelectedTechniques, localRestStopwatch]);

  const handleDeleteSetClick = useCallback((setIndexToDelete: number) => {
    const deletedSet = handleDeleteSet(setIndexToDelete);
    if (deletedSet) {
      const updated = {
        ...localExercise,
        sets: localExercise.sets.filter((_, index) => index !== setIndexToDelete),
      };
      setLocalExercise(updated);
      onUpdateExercise(updated);
    }
  }, [handleDeleteSet, localExercise, onUpdateExercise]);

  // Atualiza uma série existente sem resetar o cronômetro.
  // O cronômetro (localRestStopwatch) continua com o tempo acumulado.
  const handleUpdateSet = useCallback((setIndex: number, updatedSet: ExerciseSet) => {
    const updatedExercise = {
      ...localExercise,
      sets: localExercise.sets.map((s, i) => (i === setIndex ? updatedSet : s)),
    };
    setLocalExercise(updatedExercise);
    onUpdateExercise(updatedExercise);
  }, [localExercise, onUpdateExercise]);

  const handleQuickAdjust = useCallback((delta: number) => {
    handleQuickAdjustReps(delta);
  }, [handleQuickAdjustReps]);

  const handleCopyLastSet = useCallback(() => {
    handleCopyLastSetReps();
  }, [handleCopyLastSetReps]);

  return (
    <div className="card" style={{ padding: 'var(--spacing-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <MtButton size="small" onClick={onBack} title="Voltar para lista">
          <ArrowLeft size={16} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </MtButton>
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
            <MtButton
              size="small"
              onClick={onNavigatePrevious}
              disabled={!hasPrevious}
              title="Exercício anterior"
            >
              <ChevronLeft size={16} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </MtButton>
            <MtButton
              size="small"
              onClick={onNavigateNext}
              disabled={!hasNext}
              title="Próximo exercício"
            >
              <ChevronRight size={16} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </MtButton>
        </div>
        <MtButton variant="danger" size="small" onClick={onDeleteExercise} title="Excluir exercício">
          <Trash2 size={16} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </MtButton>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <MtField
          label="Nome do Exercício"
          value={localExercise.name}
          onChange={handleNameChange}
          placeholder="Ex: Supino Reto"
        />

        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <MtField
            label="Carga (kg)"
            value={weightInput}
            onChange={handleWeightChange}
            placeholder="Ex: 30"
            type="number"
            step="any"
            style={{ flex: 1 }}
          />
          <MtField
            label="Notas"
            value={localExercise.notes}
            onChange={handleNotesChange}
            placeholder="Ex: Pegada aberta"
            style={{ flex: 2 }}
          />
        </div>

        {/* Visualização rápida das séries do último treino deste exercício */}
        <MtLastWorkoutSets exerciseName={localExercise.name} />

        <div>
          <label style={{ marginBottom: 'var(--spacing-xs)' }}>Séries</label>
          {localExercise.sets.length === 0 ? (
            <MtEmptyState
              size="small"
              title="Nenhuma série registrada"
            />
          ) : (
            <ol style={{ paddingLeft: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              {localExercise.sets.map((set, index) => (
                <ExerciseSetItem
                  key={index}
                  set={set}
                  index={index}
                  onDelete={handleDeleteSetClick}
                  onUpdate={handleUpdateSet}
                />
              ))}
            </ol>
          )}
        </div>

        <form onSubmit={handleFormSubmit} style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)' }}>
            <MtButton
              type="button"
              size="small"
              style={{ flex: 1 }}
              onClick={handleCopyLastSet}
              disabled={localExercise.sets.length === 0}
              title="Copiar reps da última série"
            >
              <Copy size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </MtButton>
            <MtButton
              type="button"
              size="small"
              style={{ flex: 1 }}
              onClick={() => handleQuickAdjust(-1)}
              title="Diminuir 1 repetição"
            >
              <Minus size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </MtButton>
            <MtButton
              type="button"
              size="small"
              style={{ flex: 1 }}
              onClick={() => handleQuickAdjust(1)}
              title="Aumentar 1 repetição"
            >
              <Plus size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </MtButton>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-xs)', alignItems: 'flex-end' }}>
            <MtField
              label="Reps"
              labelStyle={{ fontSize: '0.75rem' }}
              value={repetitionsInput}
              onChange={(event) => setRepetitionsInput(event.target.value)}
              type="number"
              placeholder="Reps"
              required
              style={{ flex: 1 }}
            />
            <MtField
              label="Carga"
              labelStyle={{ fontSize: '0.75rem' }}
              value={weightInput}
              onChange={(event) => setWeightInput(event.target.value)}
              type="number"
              step="any"
              placeholder="kg"
              style={{ flex: 1 }}
            />
            <MtField
              label="Descanso"
              labelStyle={{ fontSize: '0.75rem' }}
              value={restInput}
              onChange={(event) => setRestInput(event.target.value)}
              type="number"
              placeholder="s"
              style={{ flex: 1 }}
            />
            <MtButton
              type="submit"
              variant="primary"
              style={{
                height: '42px',
                width: '42px',
                padding: '0',
                borderRadius: 'var(--border-radius)',
              }}
              title="Adicionar série"
            >
              <Plus size={16} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </MtButton>
          </div>

          <ExerciseTechniquePills
            label="Técnicas"
            selectedTechniques={selectedTechniques}
            onToggle={handleToggleTechnique}
          />
        </form>
      </div>

      <RestTimer
        stopwatch={localRestStopwatch}
        targetSeconds={localExercise.sets.length > 0 ? localExercise.sets[localExercise.sets.length - 1].restTimeInSeconds : 0}
      />
    </div>
  );
}
