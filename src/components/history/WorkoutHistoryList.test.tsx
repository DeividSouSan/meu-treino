import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkoutHistoryList } from './WorkoutHistoryList';
import type { WorkoutSession } from '../../types/workout';

function criarSessao(id: string, name: string): WorkoutSession {
  return {
    id,
    date: '2026-08-15T10:00:00.000Z',
    durationInSeconds: 3600,
    name,
    cues: [],
    exercises: [],
    isTemplate: false,
    status: 'completed',
  };
}

const formatWorkoutDate = () => '15/08/2026, 10:00';
const formatWorkoutDuration = () => '60 min';

describe('WorkoutHistoryList', () => {
  it('exibe o estado vazio e dispara a criação do primeiro treino', () => {
    const onCreateFirstWorkout = vi.fn();

    render(
      <WorkoutHistoryList
        sessions={[]}
        onSessionTap={vi.fn()}
        onSessionLongPress={vi.fn()}
        formatWorkoutDate={formatWorkoutDate}
        formatWorkoutDuration={formatWorkoutDuration}
        onCreateFirstWorkout={onCreateFirstWorkout}
      />,
    );

    expect(screen.getByText('Nenhum treino registrado')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Criar primeiro treino' }));

    expect(onCreateFirstWorkout).toHaveBeenCalledTimes(1);
  });

  it('renderiza todas as sessões e repassa o toque para o item correto', () => {
    const sessoes = [criarSessao('s1', 'Treino A'), criarSessao('s2', 'Treino B')];
    const onSessionTap = vi.fn();

    render(
      <WorkoutHistoryList
        sessions={sessoes}
        onSessionTap={onSessionTap}
        onSessionLongPress={vi.fn()}
        formatWorkoutDate={formatWorkoutDate}
        formatWorkoutDuration={formatWorkoutDuration}
        onCreateFirstWorkout={vi.fn()}
      />,
    );

    expect(screen.getByText('Treino A')).toBeInTheDocument();
    expect(screen.getByText('Treino B')).toBeInTheDocument();
    expect(screen.queryByText('Nenhum treino registrado')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Treino B'));

    expect(onSessionTap).toHaveBeenCalledWith(sessoes[1]);
  });

  it('repassa o toque longo com o id da sessão', () => {
    const onSessionLongPress = vi.fn();
    const sessoes = [criarSessao('s1', 'Treino A')];

    render(
      <WorkoutHistoryList
        sessions={sessoes}
        onSessionTap={vi.fn()}
        onSessionLongPress={onSessionLongPress}
        formatWorkoutDate={formatWorkoutDate}
        formatWorkoutDuration={formatWorkoutDuration}
        onCreateFirstWorkout={vi.fn()}
      />,
    );

    fireEvent.contextMenu(screen.getByText('Treino A'));

    expect(onSessionLongPress).toHaveBeenCalledWith('s1');
  });
});
