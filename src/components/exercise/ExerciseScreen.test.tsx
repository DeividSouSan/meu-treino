import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseScreen } from './ExerciseScreen';
import type { WorkoutExercise } from '../../types/workout';

vi.mock('../../hooks', () => ({
  useHistory: () => ({ workoutHistory: [] }),
}));

vi.mock('../../hooks/useStopwatch', () => ({
  useStopwatch: () => ({
    seconds: 0,
    isRunning: false,
    start: vi.fn(),
    pause: vi.fn(),
    reset: vi.fn(),
    setSeconds: vi.fn(),
  }),
}));

describe('ExerciseScreen', () => {
  const mockExercise: WorkoutExercise = {
    id: 'ex-1',
    name: 'Desenvolvimento',
    weightInKg: 20,
    notes: '',
    sets: [{ repetitions: 10, weightInKg: 20, restTimeInSeconds: 60, advancedTechniques: [] }],
    loadType: 'each_side',
    equipmentType: 'dumbbell',
  };

  const defaultNav = {
    onBack: vi.fn(),
    onNavigatePrevious: vi.fn(),
    onNavigateNext: vi.fn(),
    hasPrevious: false,
    hasNext: true,
  };

  it('renders exercise name and sets', () => {
    render(
      <ExerciseScreen
        exercise={mockExercise}
        onUpdateExercise={vi.fn()}
        onDeleteExercise={vi.fn()}
        exerciseNavigation={defaultNav}
      />,
    );

    expect(screen.getByDisplayValue('Desenvolvimento')).toBeInTheDocument();
    expect(screen.getByText(/10\s*reps/)).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    const handleBack = vi.fn();
    render(
      <ExerciseScreen
        exercise={mockExercise}
        onUpdateExercise={vi.fn()}
        onDeleteExercise={vi.fn()}
        exerciseNavigation={{ ...defaultNav, onBack: handleBack }}
      />,
    );

    const backBtn = screen.getByLabelText('Voltar para a lista de exercícios');
    fireEvent.click(backBtn);

    expect(handleBack).toHaveBeenCalled();
  });
});
