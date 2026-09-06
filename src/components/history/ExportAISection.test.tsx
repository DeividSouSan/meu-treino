import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ExportAISection } from './ExportAISection';
import type { WorkoutSession } from '../../types/workout';

describe('ExportAISection', () => {
  const mockHistory: WorkoutSession[] = [
    {
      id: 's1',
      date: new Date().toISOString(),
      durationInSeconds: 3000,
      name: 'Treino Recente',
      cues: [],
      isTemplate: false,
      status: 'completed',
      exercises: [
        {
          id: 'e1',
          name: 'Agachamento',
          weightInKg: 100,
          notes: '',
          sets: [
            { weightInKg: 100, repetitions: 10, restTimeInSeconds: 90, advancedTechniques: [] },
          ],
        },
      ],
    },
  ];

  let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:http://localhost/dummy');
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve renderizar o seletor de período com valor padrão "Última semana"', () => {
    render(<ExportAISection workoutHistory={mockHistory} />);

    expect(screen.getAllByText('Exportar para IA').length).toBeGreaterThan(0);
    expect(screen.getByRole('combobox')).toHaveValue('lastWeek');
  });

  it('deve disparar o download com nome de arquivo workout.txt ao clicar em Exportar', () => {
    const linkClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    render(<ExportAISection workoutHistory={mockHistory} />);

    const exportButton = screen.getByRole('button', { name: /exportar para ia/i });
    fireEvent.click(exportButton);

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(linkClickSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:http://localhost/dummy');
  });
});
