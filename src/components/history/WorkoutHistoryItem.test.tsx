import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { WorkoutHistoryItem } from './WorkoutHistoryItem';
import type { WorkoutSession } from '../../types/workout';

const sessao: WorkoutSession = {
  id: 'sessao-1',
  date: '2026-08-15T10:00:00.000Z',
  durationInSeconds: 3600,
  name: 'Treino A - Peito',
  cues: [],
  exercises: [],
  isTemplate: false,
  status: 'completed',
};

function renderItem(overrides: Partial<ComponentProps<typeof WorkoutHistoryItem>> = {}) {
  const onTap = vi.fn();
  const onLongPress = vi.fn();
  const utils = render(
    <WorkoutHistoryItem
      session={sessao}
      onTap={onTap}
      onLongPress={onLongPress}
      formatWorkoutDate={() => '15/08/2026, 10:00'}
      formatWorkoutDuration={() => '60 min'}
      {...overrides}
    />,
  );

  const item = utils.container.firstChild as HTMLElement;
  return { ...utils, item, onTap, onLongPress };
}

describe('WorkoutHistoryItem', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('exibe nome, duração e data formatados', () => {
    renderItem();

    expect(screen.getByText('Treino A - Peito')).toBeInTheDocument();
    expect(screen.getByText('60 min')).toBeInTheDocument();
    expect(screen.getByText('15/08/2026, 10:00')).toBeInTheDocument();
  });

  it('chama onTap com a sessão ao tocar no item', () => {
    const { item, onTap } = renderItem();

    fireEvent.click(item);

    expect(onTap).toHaveBeenCalledWith(sessao);
  });

  it('chama onLongPress ao manter o toque por 600ms', () => {
    vi.useFakeTimers();
    const { item, onLongPress } = renderItem();

    fireEvent.touchStart(item);

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(onLongPress).toHaveBeenCalledWith('sessao-1');
  });

  it('não dispara o toque longo se o dedo sair antes de 600ms', () => {
    vi.useFakeTimers();
    const { item, onLongPress } = renderItem();

    fireEvent.touchStart(item);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.touchEnd(item);
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('não dispara o toque longo se o dedo se mover antes de 600ms', () => {
    vi.useFakeTimers();
    const { item, onLongPress } = renderItem();

    fireEvent.touchStart(item);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    fireEvent.touchMove(item);
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('abre o menu de ações pelo clique com botão direito (contextmenu)', () => {
    const { item, onLongPress } = renderItem();

    fireEvent.contextMenu(item);

    expect(onLongPress).toHaveBeenCalledWith('sessao-1');
  });
});
