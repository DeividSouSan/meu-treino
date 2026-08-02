import React, { useState } from 'react';
import type { WorkoutExercise, ExerciseSet, AdvancedTechnique } from '../types/workout';

/**
 * Interface de propriedades para o componente ExerciseCard.
 */
export interface ExerciseCardProps {
  exercise: WorkoutExercise;
  onUpdate: (updatedExercise: WorkoutExercise) => void;
  onDelete: () => void;
  onSetAdded: (restTimeInSeconds: number) => void;
}

/**
 * Componente que renderiza um card de exercício com gerenciamento de séries e notas.
 */
export function ExerciseCard({
  exercise,
  onUpdate,
  onDelete,
  onSetAdded,
}: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  
  const [repetitionsInput, setRepetitionsInput] = useState<string>('');
  const [weightInput, setWeightInput] = useState<string>(
    exercise.weightInKg > 0 ? String(exercise.weightInKg) : ''
  );
  const [restInput, setRestInput] = useState<string>('120');
  const [selectedTechniques, setSelectedTechniques] = useState<AdvancedTechnique[]>([]);

  const handleToggleExpand = () => {
    setIsExpanded((previousState) => !previousState);
  };

  const handleUpdateName = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...exercise,
      name: event.target.value,
    });
  };

  const handleUpdateNotes = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...exercise,
      notes: event.target.value,
    });
  };

  const handleUpdateReferenceWeight = (event: React.ChangeEvent<HTMLInputElement>) => {
    const numericWeight = parseFloat(event.target.value) || 0;
    onUpdate({
      ...exercise,
      weightInKg: numericWeight,
    });
    setWeightInput(event.target.value);
  };

  const handleToggleTechnique = (technique: AdvancedTechnique) => {
    setSelectedTechniques((previousTechniques) => {
      const isAlreadySelected = previousTechniques.includes(technique);
      if (isAlreadySelected) {
        return previousTechniques.filter((tech) => tech !== technique);
      } else {
        return [...previousTechniques, technique];
      }
    });
  };

  const handleAddSet = (event: React.FormEvent) => {
    event.preventDefault();
    
    const repetitions = parseInt(repetitionsInput, 10);
    const weight = parseFloat(weightInput) || 0;
    const rest = parseInt(restInput, 10) || 0;

    if (isNaN(repetitions) || repetitions <= 0) {
      alert('Por favor, informe um número válido de repetições.');
      return;
    }

    const newSet: ExerciseSet = {
      weightInKg: weight,
      repetitions: repetitions,
      restTimeInSeconds: rest,
      advancedTechniques: [...selectedTechniques],
    };

    onUpdate({
      ...exercise,
      sets: [...exercise.sets, newSet],
    });

    setRepetitionsInput('');
    setSelectedTechniques([]);
    onSetAdded(rest);
  };

  const handleDeleteSet = (setIndexToDelete: number) => {
    const updatedSets = exercise.sets.filter((_, index) => {
      return index !== setIndexToDelete;
    });
    onUpdate({
      ...exercise,
      sets: updatedSets,
    });
  };

  const handleQuickAdjustReps = (delta: number) => {
    const currentReps = parseInt(repetitionsInput, 10) || 0;
    const newReps = Math.max(0, currentReps + delta);
    setRepetitionsInput(String(newReps));
  };

  const handleCopyLastSetReps = () => {
    if (exercise.sets.length > 0) {
      const lastSet = exercise.sets[exercise.sets.length - 1];
      setRepetitionsInput(String(lastSet.repetitions));
    }
  };

  return (
    <div className="card">
      <div
        onClick={handleToggleExpand}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          paddingBottom: isExpanded ? 'var(--spacing-sm)' : '0',
          borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.1rem' }}>{exercise.name || 'Sem nome'}</h2>
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>
            {exercise.sets.length} {exercise.sets.length === 1 ? 'série' : 'séries'}
            {exercise.sets.length > 0 && ` (última: ${exercise.sets[exercise.sets.length - 1].weightInKg}kg)`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
          <button
            className="danger small"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            Excluir Ex.
          </button>
          <span style={{ fontSize: '1.2rem', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
            ▼
          </span>
        </div>
      </div>

      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
          <div>
            <label>Nome do Exercício</label>
            <input
              type="text"
              value={exercise.name}
              onChange={handleUpdateName}
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
                onChange={handleUpdateReferenceWeight}
                placeholder="Ex: 30"
              />
            </div>
            <div style={{ flex: 2 }}>
              <label>Notas do Exercício</label>
              <input
                type="text"
                value={exercise.notes}
                onChange={handleUpdateNotes}
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
                        onClick={() => handleDeleteSet(index)}
                      >
                        Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <form onSubmit={handleAddSet} style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)' }}>
              <button
                type="button"
                className="small"
                style={{ flex: 1 }}
                onClick={handleCopyLastSetReps}
                disabled={exercise.sets.length === 0}
              >
                Mesmas reps
              </button>
              <button
                type="button"
                className="small"
                style={{ flex: 1 }}
                onClick={() => handleQuickAdjustReps(-1)}
              >
                -1 rep
              </button>
              <button
                type="button"
                className="small"
                style={{ flex: 1 }}
                onClick={() => handleQuickAdjustReps(1)}
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
                  onChange={(event) => setRepetitionsInput(event.target.value)}
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
                  onChange={(event) => setWeightInput(event.target.value)}
                  placeholder="kg"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem' }}>Descanso (s)</label>
                <input
                  type="number"
                  value={restInput}
                  onChange={(event) => setRestInput(event.target.value)}
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
      )}
    </div>
  );
}
