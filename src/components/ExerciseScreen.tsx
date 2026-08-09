import { useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { WorkoutExercise, AdvancedTechnique } from '../types/workout';
import { useExerciseForm } from '../hooks/useExerciseForm';
import type { UseStopwatchResult } from '../hooks/useStopwatch';
import { RestTimer } from './RestTimer';
import { ArrowLeft, ChevronLeft, ChevronRight, Trash2, X, Copy, Minus, Plus } from 'lucide-react';

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
        <button className="small" onClick={onBack} title="Voltar para lista">
          <ArrowLeft size={16} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </button>
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
            <button
              className="small"
              onClick={onNavigatePrevious}
              disabled={!hasPrevious}
              style={{ opacity: hasPrevious ? 1 : 0.5 }}
              title="Exercício anterior"
            >
              <ChevronLeft size={16} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </button>
            <button
              className="small"
              onClick={onNavigateNext}
              disabled={!hasNext}
              style={{ opacity: hasNext ? 1 : 0.5 }}
              title="Próximo exercício"
            >
              <ChevronRight size={16} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </button>
        </div>
        <button className="danger small" onClick={onDelete} title="Excluir exercício">
          <Trash2 size={16} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <div>
          <label>Nome do Exercício</label>
          <input
            type="text"
            value={exercise.name}
            onChange={handleNameChange}
            placeholder="Ex: Supino Reto"
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <div style={{ flex: 1 }}>
            <label>Carga (kg)</label>
            <input
              type="number"
              step="any"
              value={weightInput}
              onChange={handleWeightChange}
              placeholder="Ex: 30"
            />
          </div>
          <div style={{ flex: 2 }}>
            <label>Notas</label>
            <input
              type="text"
              value={exercise.notes}
              onChange={handleNotesChange}
              placeholder="Ex: Pegada aberta"
            />
          </div>
        </div>

        <div>
          <label style={{ marginBottom: 'var(--spacing-xs)' }}>Séries</label>
          {exercise.sets.length === 0 ? (
            <p className="text-secondary" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
              Nenhuma série registrada
            </p>
          ) : (
            <ol style={{ paddingLeft: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              {exercise.sets.map((set, index) => (
                <li key={index} style={{ fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      <strong>{set.repetitions} reps</strong> @ {set.weightInKg}kg 
                      {set.restTimeInSeconds > 0 && ` - ${set.restTimeInSeconds}s`}
                      {set.advancedTechniques.length > 0 && (
                        <span style={{ marginLeft: 'var(--spacing-sm)' }}>
                          {set.advancedTechniques.map((tech) => (
                            <span
                              key={tech}
                              className="badge completed"
                              style={{
                                fontSize: '0.7rem',
                                padding: '2px 4px',
                                marginRight: '2px',
                                backgroundColor: 'var(--accent-light)',
                                color: 'var(--accent-color)',
                                borderColor: 'var(--accent-color)',
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                      <button
                        className="text text-danger"
                        style={{ padding: '2px 6px', fontSize: '0.8rem' }}
                        onClick={() => handleDeleteSetClick(index)}
                        title="Excluir série"
                      >
                        <X size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                      </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <form onSubmit={handleFormSubmit} style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)' }}>
              <button
                type="button"
                className="small"
                style={{ flex: 1 }}
                onClick={handleCopyLastSet}
                disabled={exercise.sets.length === 0}
                title="Copiar reps da última série"
              >
                <Copy size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </button>
              <button
                type="button"
                className="small"
                style={{ flex: 1 }}
                onClick={() => handleQuickAdjust(-1)}
                title="Diminuir 1 repetição"
              >
                <Minus size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </button>
              <button
                type="button"
                className="small"
                style={{ flex: 1 }}
                onClick={() => handleQuickAdjust(1)}
                title="Aumentar 1 repetição"
              >
                <Plus size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </button>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-xs)', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem' }}>Reps</label>
              <input
                type="number"
                value={repetitionsInput}
                onChange={(e) => setRepetitionsInput(e.target.value)}
                placeholder="Reps"
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem' }}>Carga</label>
              <input
                type="number"
                step="any"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="kg"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem' }}>Descanso</label>
              <input
                type="number"
                value={restInput}
                onChange={(e) => setRestInput(e.target.value)}
                placeholder="s"
              />
            </div>
            <button
              type="submit"
              className="primary"
              style={{
                height: '42px',
                width: '42px',
                padding: '0',
                borderRadius: 'var(--border-radius)',
              }}
              title="Adicionar série"
            >
              +
            </button>
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
