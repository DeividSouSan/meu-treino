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

    render(<LastWorkoutSets exerciseName="Agachamento" equipmentType="dumbell" />);
    expect(screen.getByText('Nenhum registro anterior para este exercício.')).toBeInTheDocument();
  });

  it('renders sets from last completed workout for matching exercise and equipment', () => {
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
              {
                repetitions: 8,
                weightInKg: 110,
                restTimeInSeconds: 60,
                advancedTechniques: ['DS'],
              },
            ],
          },
        ],
      },
    ];

    mockUseHistory.mockReturnValue({ workoutHistory: mockSessions });

    render(<LastWorkoutSets exerciseName="Agachamento" equipmentType="barbell" />);

    expect(screen.getByText('Último Treino: Agachamento & barbell')).toBeInTheDocument();
    expect(screen.getByText(/10\s*reps/)).toBeInTheDocument(); // Reps
    expect(screen.getByText(/@\s*100kg/)).toBeInTheDocument(); // Weight
    expect(screen.getAllByText(/60s/).length).toBeGreaterThanOrEqual(2); // Rest
    expect(screen.getByText(/DS/)).toBeInTheDocument(); // Advanced Technique
  });

  it('renders empty state message when exercise matches but doesnt match equipment', () => {
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

    render(<LastWorkoutSets exerciseName="Agachamento" equipmentType="dumbell" />);

    expect(screen.getByText('Último Treino: Agachamento & dumbell')).toBeInTheDocument();
    expect(screen.getByText('Nenhum registro anterior para este exercício.')).toBeInTheDocument();
  });
});
