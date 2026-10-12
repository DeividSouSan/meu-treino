import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseSearch } from './ExerciseSearch';

describe('ExerciseSearch', () => {
  it('renders search input and title', () => {
    render(<ExerciseSearch onAddExercise={vi.fn()} getSuggestions={vi.fn().mockReturnValue([])} />);

    expect(screen.getByText('Adicionar Exercício')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Buscar ou digitar nome do exercício...'),
    ).toBeInTheDocument();
  });

  it('calls onAddExercise when add button is clicked', () => {
    const handleAdd = vi.fn();
    render(
      <ExerciseSearch onAddExercise={handleAdd} getSuggestions={vi.fn().mockReturnValue([])} />,
    );

    const input = screen.getByPlaceholderText('Buscar ou digitar nome do exercício...');
    fireEvent.change(input, { target: { value: 'Remada Curvada' } });

    const addBtn = screen.getByRole('button');
    fireEvent.click(addBtn);

    expect(handleAdd).toHaveBeenCalledWith('Remada Curvada');
  });
});
