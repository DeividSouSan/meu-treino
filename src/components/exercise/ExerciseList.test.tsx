import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseList } from './ExerciseList';
import type { WorkoutExercise } from '../../types/workout';

describe('ExerciseList', () => {
  const mockExercises: WorkoutExercise[] = [
    {
      id: 'ex-1',
      name: 'Supino Reto',
      weightInKg: 80,
      notes: '',
      sets: [{ repetitions: 10, weightInKg: 80, restTimeInSeconds: 60, advancedTechniques: [] }],
      loadType: 'total',
      equipmentType: 'barbell',
    },
    {
      id: 'ex-2',
      name: 'Crucifixo Inclinado',
      weightInKg: 20,
      notes: '',
      sets: [],
      loadType: 'each_side',
      equipmentType: 'dumbbell',
    },
  ];

  it('renders list of exercises with last set summary', () => {
    render(
      <ExerciseList
        exercises={mockExercises}
        selectedExerciseId={null}
        onSelectExercise={vi.fn()}
      />,
    );

    expect(screen.getByText('Supino Reto')).toBeInTheDocument();
    expect(screen.getByText('10 reps @ 80kg')).toBeInTheDocument();
    expect(screen.getByText('Crucifixo Inclinado')).toBeInTheDocument();
    expect(screen.getByText('Sem séries')).toBeInTheDocument();
  });

  it('calls onSelectExercise when an exercise card is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <ExerciseList
        exercises={mockExercises}
        selectedExerciseId={null}
        onSelectExercise={handleSelect}
      />,
    );

    fireEvent.click(screen.getByText('Supino Reto'));
    expect(handleSelect).toHaveBeenCalledWith('ex-1');
  });
});
