import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExerciseNavigation } from './useExerciseNavigation';
import type { WorkoutExercise } from '../types/workout';

function criarExercicio(id: string, name: string): WorkoutExercise {
  return { id, name, weightInKg: 0, notes: '', sets: [] };
}

const exercicios = [
  criarExercicio('ex-1', 'Supino'),
  criarExercicio('ex-2', 'Crucifixo'),
  criarExercicio('ex-3', 'Tríceps Testa'),
];

function renderNavigation(selectedId: string | null = null) {
  const onSelectExercise = vi.fn();
  const utils = renderHook(
    ({ selected }: { selected: string | null }) =>
      useExerciseNavigation(exercicios, selected, onSelectExercise),
    { initialProps: { selected: selectedId } },
  );

  return { ...utils, onSelectExercise };
}

describe('useExerciseNavigation', () => {
  it('retorna o exercício selecionado e o índice atual', () => {
    const { result } = renderNavigation('ex-2');

    expect(result.current.selectedExercise?.name).toBe('Crucifixo');
    expect(result.current.currentExerciseIndex).toBe(1);
  });

  it('retorna seleção nula e índice -1 quando nenhum exercício está selecionado', () => {
    const { result } = renderNavigation(null);

    expect(result.current.selectedExercise).toBeNull();
    expect(result.current.currentExerciseIndex).toBe(-1);
    expect(result.current.hasPrevious).toBe(false);
  });

  it('indica anterior/próximo conforme a posição na lista', () => {
    const { result, rerender } = renderNavigation('ex-1');

    expect(result.current.hasPrevious).toBe(false);
    expect(result.current.hasNext).toBe(true);

    rerender({ selected: 'ex-3' });

    expect(result.current.hasPrevious).toBe(true);
    expect(result.current.hasNext).toBe(false);
  });

  it('navega para o exercício anterior quando existe', () => {
    const { result, onSelectExercise } = renderNavigation('ex-2');

    act(() => result.current.navigatePrevious());

    expect(onSelectExercise).toHaveBeenCalledWith('ex-1');
  });

  it('navega para o próximo exercício quando existe', () => {
    const { result, onSelectExercise } = renderNavigation('ex-2');

    act(() => result.current.navigateNext());

    expect(onSelectExercise).toHaveBeenCalledWith('ex-3');
  });

  it('não navega além dos limites da lista', () => {
    const { result, onSelectExercise, rerender } = renderNavigation('ex-1');

    act(() => result.current.navigatePrevious());
    expect(onSelectExercise).not.toHaveBeenCalled();

    rerender({ selected: 'ex-3' });

    act(() => result.current.navigateNext());
    expect(onSelectExercise).not.toHaveBeenCalled();
  });

  it('seleciona um exercício pelo id', () => {
    const { result, onSelectExercise } = renderNavigation();

    act(() => result.current.selectExercise('ex-2'));

    expect(onSelectExercise).toHaveBeenCalledWith('ex-2');
  });

  it('volta para a lista enviando id vazio', () => {
    const { result, onSelectExercise } = renderNavigation('ex-2');

    act(() => result.current.goBackToList());

    expect(onSelectExercise).toHaveBeenCalledWith('');
  });
});
