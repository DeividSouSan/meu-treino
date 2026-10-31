import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActiveWorkoutCard } from './ActiveWorkoutCard';
import type { WorkoutSession } from '../../types/workout';

function criarSessao(name: string): WorkoutSession {
  return {
    id: 'ativa',
    date: '2026-08-15T10:00:00.000Z',
    durationInSeconds: 900,
    name,
    cues: [],
    exercises: [],
    isTemplate: false,
    status: 'in_progress',
  };
}

describe('ActiveWorkoutCard', () => {
  it('exibe o nome da sessão e a data de início', () => {
    render(
      <ActiveWorkoutCard
        activeSession={criarSessao('Peito e Tríceps')}
        onResume={vi.fn()}
        formatWorkoutDate={() => '15/08/2026, 10:00'}
      />,
    );

    expect(screen.getByText('Peito e Tríceps')).toBeInTheDocument();
    expect(screen.getByText('Iniciado em 15/08/2026, 10:00')).toBeInTheDocument();
  });

  it('usa o rótulo padrão quando a sessão se chama "Treino Livre"', () => {
    render(
      <ActiveWorkoutCard
        activeSession={criarSessao('Treino Livre')}
        onResume={vi.fn()}
        formatWorkoutDate={() => '15/08/2026, 10:00'}
      />,
    );

    expect(screen.getByText('Treino em Andamento', { selector: 'strong' })).toBeInTheDocument();
  });

  it('retoma o treino ao clicar no card', () => {
    const onResume = vi.fn();
    render(
      <ActiveWorkoutCard
        activeSession={criarSessao('Peito')}
        onResume={onResume}
        formatWorkoutDate={() => '15/08/2026, 10:00'}
      />,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it('retoma o treino com Enter e com Espaço', () => {
    const onResume = vi.fn();
    render(
      <ActiveWorkoutCard
        activeSession={criarSessao('Peito')}
        onResume={onResume}
        formatWorkoutDate={() => '15/08/2026, 10:00'}
      />,
    );

    const card = screen.getByRole('button');

    fireEvent.keyDown(card, { key: 'Enter' });
    fireEvent.keyDown(card, { key: ' ' });

    expect(onResume).toHaveBeenCalledTimes(2);
  });

  it('ignora outras teclas', () => {
    const onResume = vi.fn();
    render(
      <ActiveWorkoutCard
        activeSession={criarSessao('Peito')}
        onResume={onResume}
        formatWorkoutDate={() => '15/08/2026, 10:00'}
      />,
    );

    fireEvent.keyDown(screen.getByRole('button'), { key: 'Tab' });

    expect(onResume).not.toHaveBeenCalled();
  });
});
