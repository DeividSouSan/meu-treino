import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LastWorkoutSets } from './LastWorkoutSets';
import type { WorkoutSession } from '../../types/workout';

const mockUseHistory = vi.fn();

vi.mock('../../hooks', () => ({
  useHistory: () => mockUseHistory(),
}));

describe('LastWorkoutSets', () => {
  it('renders empty state message when no history matches exercise name', () => {
    mockUseHistory.mockReturnValue({ workoutHistory: [] });

    render(<LastWorkoutSets exerciseName="Agachamento" />);
    expect(screen.getByText('Nenhum registro anterior para este exercício.')).toBeInTheDocument();
  });

  it('renders sets from last completed workout for matching exercise', () => {
    const mockSessions: WorkoutSession[] = [
      {
        id: 'sess-1',
        name: 'Treino A',
        date: '2026-09-01T10:00:00.000Z',
        durationInSeconds: 3600,
        status: 'completed',
        cues: [],
        isTemplate: false,
        exercises: [
          {
            id: 'ex-1',
            name: 'Agachamento',
            weightInKg: 100,
            notes: '',
            loadType: 'total',
            equipmentType: 'barbell',
            sets: [
              { repetitions: 10, weightInKg: 100, restTimeInSeconds: 60, advancedTechniques: [] },
              { repetitions: 8, weightInKg: 110, restTimeInSeconds: 60, advancedTechniques: [] },
            ],
          },
        ],
      },
    ];

    mockUseHistory.mockReturnValue({ workoutHistory: mockSessions });

    render(<LastWorkoutSets exerciseName="Agachamento" />);

    expect(screen.getByText('Último Treino')).toBeInTheDocument();
    expect(screen.getByText(/10\s*reps/)).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });
});
