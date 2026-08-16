import type { WorkoutExercise } from '../types/workout';
import { MtCard } from './ui';

export interface ExerciseListProps {
  exercises: WorkoutExercise[];
  selectedExerciseId: string | null;
  onSelectExercise: (exerciseId: string) => void;
}

export function ExerciseList({
  exercises,
  selectedExerciseId,
  onSelectExercise,
}: ExerciseListProps) {
  const getLastSetSummary = (exercise: WorkoutExercise): string => {
    if (exercise.sets.length === 0) {
      return 'Sem séries';
    }
    const lastSet = exercise.sets[exercise.sets.length - 1];
    return `${lastSet.repetitions} reps @ ${lastSet.weightInKg}kg`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
      {exercises.map((exercise) => (
        <MtCard
          key={exercise.id}
          onClick={() => onSelectExercise(exercise.id)}
          role="button"
          style={{
            cursor: 'pointer',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            backgroundColor: selectedExerciseId === exercise.id
              ? 'var(--accent-light)'
              : 'var(--card-background)',
            border: selectedExerciseId === exercise.id
              ? '2px solid var(--accent-color)'
              : '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>{exercise.name || 'Sem nome'}</h3>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                {getLastSetSummary(exercise)}
              </span>
            </div>
            <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              ▶
            </span>
          </div>
        </MtCard>
      ))}
    </div>
  );
}