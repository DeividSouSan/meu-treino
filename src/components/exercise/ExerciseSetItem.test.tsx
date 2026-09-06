import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseSetItem } from './ExerciseSetItem';
import type { ExerciseSet } from '../../types/workout';

describe('ExerciseSetItem', () => {
  const mockSet: ExerciseSet = {
    repetitions: 12,
    weightInKg: 60,
    restTimeInSeconds: 60,
    advancedTechniques: ['RP'],
  };

  it('renders normal set display with reps, weight, and techniques', () => {
    render(<ExerciseSetItem set={mockSet} index={0} onDelete={vi.fn()} onUpdate={vi.fn()} />);

    expect(screen.getByText(/12\s*reps/)).toBeInTheDocument();
    expect(screen.getByText('RP')).toBeInTheDocument();
    expect(screen.getByLabelText('Editar série #1')).toBeInTheDocument();
  });

  it('enters edit mode when edit button is clicked and saves changes', () => {
    const handleUpdate = vi.fn();
    render(<ExerciseSetItem set={mockSet} index={0} onDelete={vi.fn()} onUpdate={handleUpdate} />);

    const editBtn = screen.getByLabelText('Editar série #1');
    fireEvent.click(editBtn);

    const saveBtn = screen.getByTitle('Salvar edição');
    expect(saveBtn).toBeInTheDocument();
    fireEvent.click(saveBtn);

    expect(handleUpdate).toHaveBeenCalledWith(0, mockSet);
  });
});
