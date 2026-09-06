import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseTechniquePills } from './ExerciseTechniquePills';

describe('ExerciseTechniquePills', () => {
  it('renders all technique pills (FS, RP, DS, ISO)', () => {
    render(<ExerciseTechniquePills selectedTechniques={[]} onToggle={vi.fn()} />);

    expect(screen.getByText('FS')).toBeInTheDocument();
    expect(screen.getByText('RP')).toBeInTheDocument();
    expect(screen.getByText('DS')).toBeInTheDocument();
    expect(screen.getByText('ISO')).toBeInTheDocument();
  });

  it('renders optional label when provided', () => {
    render(
      <ExerciseTechniquePills
        selectedTechniques={[]}
        onToggle={vi.fn()}
        label="Técnicas Avançadas"
      />,
    );

    expect(screen.getByText('Técnicas Avançadas')).toBeInTheDocument();
  });

  it('calls onToggle when a pill is clicked', () => {
    const handleToggle = vi.fn();
    render(<ExerciseTechniquePills selectedTechniques={['RP']} onToggle={handleToggle} />);

    fireEvent.click(screen.getByText('DS'));
    expect(handleToggle).toHaveBeenCalledWith('DS');
  });
});
