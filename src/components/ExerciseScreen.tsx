import { useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { WorkoutExercise, AdvancedTechnique } from '../types/workout';
import { useExerciseForm } from '../hooks/useExerciseForm';

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
        <button className="small" onClick={onBack}>
          ← Voltar
        </button>
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
          <button
            className="small"
            onClick={onNavigatePrevious}
            disabled={!hasPrevious}
            style={{ opacity: hasPrevious ? 1 : 0.5 }}
          >
            ← Ant.
          </button>
          <button
            className="small"
            onClick={onNavigateNext}
            disabled={!hasNext}
            style={{ opacity: hasNext ? 1 : 0.5 }}
          >
            Próx. →
          </button>
        </div>
        <button className="danger small" onClick={onDelete}>
          Excluir Ex.
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
            <label>Carga Geral (kg)</label>
            <input
              type="number"
              step="any"
              value={weightInput}
              onChange={handleWeightChange}
              placeholder="Ex: 30"
            />
          </div>
          <div style={{ flex: 2 }}>
            <label>Notas do Exercício</label>
            <input
              type="text"
              value={exercise.notes}
              onChange={handleNotesChange}
              placeholder="Ex: Pegada aberta, descer até o peito"
            />
          </div>
        </div>

        <div>
          <label style={{ marginBottom: 'var(--spacing-xs)' }}>Séries Registradas</label>
          {exercise.sets.length === 0 ? (
            <p className="text-secondary" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
              Nenhuma série registrada ainda. Adicione abaixo.
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
                    >
                      Excluir
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
            >
              Mesmas reps
            </button>
            <button
              type="button"
              className="small"
              style={{ flex: 1 }}
              onClick={() => handleQuickAdjust(-1)}
            >
              -1 rep
            </button>
            <button
              type="button"
              className="small"
              style={{ flex: 1 }}
              onClick={() => handleQuickAdjust(1)}
            >
              +1 rep
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
              <label style={{ fontSize: '0.75rem' }}>Carga (kg)</label>
              <input
                type="number"
                step="any"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="kg"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem' }}>Descanso (s)</label>
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
            >
              +
            </button>
          </div>

          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            <label style={{ fontSize: '0.75rem', marginBottom: 'var(--spacing-xs)' }}>Técnicas Avançadas</label>
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
    </div>
  );
}