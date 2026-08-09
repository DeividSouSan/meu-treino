import { useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { WorkoutExercise, AdvancedTechnique } from '../types/workout';
import { useExerciseForm } from '../hooks/useExerciseForm';
import type { UseStopwatchResult } from '../hooks/useStopwatch';
import { RestTimer } from './RestTimer';
import { MtButton, MtEmptyState, MtField } from './ui';
import { ExerciseSetItem } from './ExerciseSetItem';
import { ArrowLeft, ChevronLeft, ChevronRight, Trash2, Copy, Minus, Plus } from 'lucide-react';

export interface ExerciseScreenProps {
  exercise: WorkoutExercise;
  onUpdate: (updatedExercise: WorkoutExercise) => void;
  onDelete: () => void;
  onSetAdded: (restTimeInSeconds: number) => void;
  onBack: () => void;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  restStopwatch: UseStopwatchResult;
}

export function ExerciseScreen({
  exercise,
  onUpdate,
  onDelete,
  onSetAdded,
  onBack,
  onNavigatePrevious,
  onNavigateNext,
  hasPrevious,
  hasNext,
  restStopwatch,
}: ExerciseScreenProps) {
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

  const handleNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const updated = handleUpdateName(event);
    onUpdate(updated);
  }, [handleUpdateName, onUpdate]);

  const handleNotesChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const updated = handleUpdateNotes(event);
    onUpdate(updated);
  }, [handleUpdateNotes, onUpdate]);

  const handleWeightChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const updated = handleUpdateReferenceWeight(event);
    onUpdate(updated);
  }, [handleUpdateReferenceWeight, onUpdate]);

  const handleFormSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();
    const result = handleAddSet();
    if (result.newSet) {
      onUpdate({
        ...exercise,
        sets: [...exercise.sets, result.newSet],
      });
      onSetAdded(result.rest);
      setRepetitionsInput('');
      setSelectedTechniques([]);
    }
  }, [handleAddSet, exercise, onUpdate, onSetAdded, setRepetitionsInput, setSelectedTechniques]);

  const handleDeleteSetClick = useCallback((setIndexToDelete: number) => {
    const deletedSet = handleDeleteSet(setIndexToDelete);
    if (deletedSet) {
      onUpdate({
        ...exercise,
        sets: exercise.sets.filter((_, index) => index !== setIndexToDelete),
      });
    }
  }, [handleDeleteSet, exercise, onUpdate]);

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
        <MtButton variant="danger" size="small" onClick={onDelete} title="Excluir exercício">
          <Trash2 size={16} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </MtButton>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <MtField
          label="Nome do Exercício"
          value={exercise.name}
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
            value={exercise.notes}
            onChange={handleNotesChange}
            placeholder="Ex: Pegada aberta"
            style={{ flex: 2 }}
          />
        </div>

        <div>
          <label style={{ marginBottom: 'var(--spacing-xs)' }}>Séries</label>
          {exercise.sets.length === 0 ? (
            <MtEmptyState
              size="small"
              title="Nenhuma série registrada"
            />
          ) : (
            <ol style={{ paddingLeft: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              {exercise.sets.map((set, index) => (
                <ExerciseSetItem
                  key={index}
                  set={set}
                  index={index}
                  onDelete={handleDeleteSetClick}
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
              disabled={exercise.sets.length === 0}
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
              +
            </MtButton>
          </div>

          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            <label style={{ fontSize: '0.75rem', marginBottom: 'var(--spacing-xs)' }}>Técnicas</label>
            <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
              {(['FS', 'RP', 'DS', 'ISO'] as AdvancedTechnique[]).map((technique) => {
                const isActive = selectedTechniques.includes(technique);
                return (
                  <span
                    key={technique}
                    className={`pill ${isActive ? 'active' : ''}`}
                    onClick={() => handleToggleTechnique(technique)}
                  >
                    {technique}
                  </span>
                );
              })}
            </div>
          </div>
        </form>
      </div>

      <RestTimer
        stopwatch={restStopwatch}
        targetSeconds={exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1].restTimeInSeconds : 0}
      />
    </div>
  );
}
