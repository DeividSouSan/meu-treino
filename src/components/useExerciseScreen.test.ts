import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ChangeEvent } from 'react';
import type { WorkoutExercise, AdvancedTechnique } from '../types/workout';
import { useExerciseScreen } from './useExerciseScreen';

/**
 * O hook useExerciseScreen depende de useStopwatch (que por sua vez usa
 * setInterval e performance.now). Para isolar os testes da lógica de
 * temporização, damos mock em useStopwatch, devolvendo um objeto onde
 * `reset` é uma espia que podemos assertar que foi chamada ao registrar
 * uma série (momento em que o cronômetro de descanso deve reiniciar).
 */
const espioncarDoStopwatch = vi.hoisted(() => ({
  reset: vi.fn(),
}));

vi.mock('../hooks/useStopwatch', () => ({
  useStopwatch: () => ({
    seconds: 0,
    isRunning: false,
    start: vi.fn(),
    pause: vi.fn(),
    reset: espioncarDoStopwatch.reset,
    setSeconds: vi.fn(),
  }),
}));

function exercicioInicial(parciais: Partial<WorkoutExercise> = {}): WorkoutExercise {
  return {
    id: 'exercicio-1',
    name: 'Supino',
    weightInKg: 0,
    notes: '',
    sets: [],
    ...parciais,
  };
}

function eventoComValor(valor: string): ChangeEvent<HTMLInputElement> {
  return { target: { value: valor } } as ChangeEvent<HTMLInputElement>;
}

beforeEach(() => {
  espioncarDoStopwatch.reset.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useExerciseScreen — estado inicial', () => {
  it('inicia com lista de séries vazia, inputs zerados e técnicas vazias', () => {
    const { result } = renderHook(() =>
      useExerciseScreen({
        initialExercise: exercicioInicial({ weightInKg: 70 }),
        onUpdateExercise: vi.fn(),
      }),
    );

    expect(result.current.exercise.sets).toEqual([]);
    expect(result.current.repetitionsInput).toBe('');
    expect(result.current.weightInput).toBe('70'); // carga de referência preseed
    expect(result.current.restInput).toBe('120');
    expect(result.current.selectedTechniques).toEqual([]);
  });
});

describe('useExerciseScreen — handleAddSet', () => {
  it('registra uma série com peso, repetições e descanso informados', () => {
    const notificarAlteracao = vi.fn();
    const { result } = renderHook(() =>
      useExerciseScreen({
        initialExercise: exercicioInicial({ weightInKg: 70 }),
        onUpdateExercise: notificarAlteracao,
      }),
    );

    act(() => {
      result.current.setRepetitionsInput('12');
      result.current.setWeightInput('75');
    });
    act(() => result.current.handleAddSet());

    expect(notificarAlteracao).toHaveBeenCalledTimes(1);
    const exercicioAtualizado = notificarAlteracao.mock.calls[0][0] as WorkoutExercise;
    expect(exercicioAtualizado.sets).toHaveLength(1);
    expect(exercicioAtualizado.sets[0]).toMatchObject({
      weightInKg: 75,
      repetitions: 12,
      restTimeInSeconds: 120,
      advancedTechniques: [],
    });

    // Inputs are preserved after registering the series
    expect(result.current.repetitionsInput).toBe('12');
    expect(result.current.weightInput).toBe('75');
    expect(result.current.restInput).toBe('120');
    expect(result.current.selectedTechniques).toEqual([]);

    // O cronômetro de descanso foi reiniciado (feature: timer inicia ao registrar)
    expect(espioncarDoStopwatch.reset).toHaveBeenCalled();
  });

  it('usa descanso fixo de 60 segundos quando a técnica FS (Feeder Set) está ativa', () => {
    const notificarAlteracao = vi.fn();
    const { result } = renderHook(() =>
      useExerciseScreen({
        initialExercise: exercicioInicial(),
        onUpdateExercise: notificarAlteracao,
      }),
    );

    act(() => {
      result.current.setRepetitionsInput('10');
      result.current.setWeightInput('60');
      result.current.setRestInput('180');
      result.current.handleToggleTechnique('FS');
    });
    act(() => result.current.handleAddSet());

    const exercicioAtualizado = notificarAlteracao.mock.calls[0][0] as WorkoutExercise;
    expect(exercicioAtualizado.sets[0].restTimeInSeconds).toBe(60);
    expect(exercicioAtualizado.sets[0].advancedTechniques).toContain('FS');
  });

  it('não registra série e define validationError quando as repetições são inválidas', () => {
    const notificarAlteracao = vi.fn();
    const { result } = renderHook(() =>
      useExerciseScreen({
        initialExercise: exercicioInicial(),
        onUpdateExercise: notificarAlteracao,
      }),
    );

    act(() => result.current.setRepetitionsInput('0'));
    act(() => result.current.handleAddSet());

    expect(notificarAlteracao).not.toHaveBeenCalled();
    expect(result.current.validationError).toBe(
      'Por favor, informe um número válido de repetições (maior que zero).',
    );
    expect(result.current.exercise.sets).toHaveLength(0);

    act(() => result.current.clearValidationError());
    expect(result.current.validationError).toBeNull();
  });

  it('não registra série e define validationError quando as repetições são negativas', () => {
    const notificarAlteracao = vi.fn();
    const { result } = renderHook(() =>
      useExerciseScreen({
        initialExercise: exercicioInicial(),
        onUpdateExercise: notificarAlteracao,
      }),
    );

    act(() => result.current.setRepetitionsInput('-5'));
    act(() => result.current.handleAddSet());

    expect(notificarAlteracao).not.toHaveBeenCalled();
    expect(result.current.validationError).toBe(
      'Por favor, informe um número válido de repetições (maior que zero).',
    );
    expect(result.current.exercise.sets).toHaveLength(0);
  });
});

describe('useExerciseScreen — manipulação de séries', () => {
  it('remove uma série existente pelo índice', () => {
    const notificarAlteracao = vi.fn();
    const { result } = renderHook(() =>
      useExerciseScreen({
        initialExercise: exercicioInicial(),
        onUpdateExercise: notificarAlteracao,
      }),
    );

    act(() => result.current.setRepetitionsInput('10'));
    act(() => result.current.handleAddSet());
    act(() => result.current.setRepetitionsInput('8'));
    act(() => result.current.handleAddSet());

    act(() => result.current.handleDeleteSet(0));

    const exercicioAtualizado = notificarAlteracao.mock.calls[
      notificarAlteracao.mock.calls.length - 1
    ][0] as WorkoutExercise;
    expect(exercicioAtualizado.sets).toHaveLength(1);
    expect(exercicioAtualizado.sets[0].repetitions).toBe(8);
  });

  it('atualiza uma série pelo índice mantendo as demais inalteradas', () => {
    const notificarAlteracao = vi.fn();
    const { result } = renderHook(() =>
      useExerciseScreen({
        initialExercise: exercicioInicial(),
        onUpdateExercise: notificarAlteracao,
      }),
    );

    act(() => result.current.setRepetitionsInput('10'));
    act(() => result.current.handleAddSet());
    act(() => result.current.setRepetitionsInput('12'));
    act(() => result.current.handleAddSet());

    const novaSet = {
      weightInKg: 99,
      repetitions: 15,
      restTimeInSeconds: 45,
      advancedTechniques: [] as AdvancedTechnique[],
    };
    act(() => result.current.handleUpdateSet(0, novaSet));

    const exercicioAtualizado = notificarAlteracao.mock.calls[
      notificarAlteracao.mock.calls.length - 1
    ][0] as WorkoutExercise;
    expect(exercicioAtualizado.sets[0]).toEqual(novaSet);
    expect(exercicioAtualizado.sets[1].repetitions).toBe(12);
  });
});

describe('useExerciseScreen — edição de campos do exercício', () => {
  it('atualiza o nome do exercício ao editar o campo', () => {
    const notificarAlteracao = vi.fn();
    const { result } = renderHook(() =>
      useExerciseScreen({
        initialExercise: exercicioInicial({ name: 'Supino' }),
        onUpdateExercise: notificarAlteracao,
      }),
    );

    act(() => result.current.handleUpdateName(eventoComValor('Agachamento')));

    expect(notificarAlteracao).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Agachamento' }),
    );
    expect(result.current.exercise.name).toBe('Agachamento');
  });

  it('atualiza as observações do exercício', () => {
    const notificarAlteracao = vi.fn();
    const { result } = renderHook(() =>
      useExerciseScreen({
        initialExercise: exercicioInicial({ notes: '' }),
        onUpdateExercise: notificarAlteracao,
      }),
    );

    act(() => result.current.handleUpdateNotes(eventoComValor('Controlar a descida')));

    expect(notificarAlteracao).toHaveBeenCalledWith(
      expect.objectContaining({ notes: 'Controlar a descida' }),
    );
  });

  it('atualiza a carga de referência e mantém o input de carga em sincronia', () => {
    const notificarAlteracao = vi.fn();
    const { result } = renderHook(() =>
      useExerciseScreen({
        initialExercise: exercicioInicial({ weightInKg: 0 }),
        onUpdateExercise: notificarAlteracao,
      }),
    );

    act(() => result.current.handleUpdateReferenceWeight(eventoComValor('82.5')));

    expect(notificarAlteracao).toHaveBeenCalledWith(expect.objectContaining({ weightInKg: 82.5 }));
    expect(result.current.weightInput).toBe('82.5');
  });
});

describe('useExerciseScreen — técnicas avançadas', () => {
  it('liga e desliga uma técnica avançada ao clicar repetidamente', () => {
    const { result } = renderHook(() =>
      useExerciseScreen({ initialExercise: exercicioInicial(), onUpdateExercise: vi.fn() }),
    );

    act(() => result.current.handleToggleTechnique('RP'));
    expect(result.current.selectedTechniques).toEqual(['RP']);

    act(() => result.current.handleToggleTechnique('RP'));
    expect(result.current.selectedTechniques).toEqual([]);
  });

  it('permite selecionar múltiplas técnicas ao mesmo tempo', () => {
    const { result } = renderHook(() =>
      useExerciseScreen({ initialExercise: exercicioInicial(), onUpdateExercise: vi.fn() }),
    );

    act(() => result.current.handleToggleTechnique('RP'));
    act(() => result.current.handleToggleTechnique('DS'));

    expect(result.current.selectedTechniques.sort()).toEqual(['DS', 'RP']);
  });
});

describe('useExerciseScreen — ajustes rápidos de repetições', () => {
  it('incrementa e decrementa as repetições do input com o delta informado', () => {
    const { result } = renderHook(() =>
      useExerciseScreen({ initialExercise: exercicioInicial(), onUpdateExercise: vi.fn() }),
    );

    act(() => result.current.setRepetitionsInput('10'));
    act(() => result.current.handleQuickAdjustReps(2));
    expect(result.current.repetitionsInput).toBe('12');

    act(() => result.current.handleQuickAdjustReps(-5));
    expect(result.current.repetitionsInput).toBe('7');
  });

  it('nunca deixa o input de repetições ficar negativo', () => {
    const { result } = renderHook(() =>
      useExerciseScreen({ initialExercise: exercicioInicial(), onUpdateExercise: vi.fn() }),
    );

    act(() => result.current.setRepetitionsInput('3'));
    act(() => result.current.handleQuickAdjustReps(-10));
    expect(result.current.repetitionsInput).toBe('0');
  });
});

describe('useExerciseScreen — cópia de repetições da última série', () => {
  it('copia a quantidade de repetições da última série para o input', () => {
    const { result } = renderHook(() =>
      useExerciseScreen({ initialExercise: exercicioInicial(), onUpdateExercise: vi.fn() }),
    );

    act(() => result.current.setRepetitionsInput('15'));
    act(() => result.current.handleAddSet());

    // Usuário muda o input e depois copia a última série (15)
    act(() => result.current.setRepetitionsInput('5'));
    act(() => result.current.handleCopyLastSetReps());

    expect(result.current.repetitionsInput).toBe('15');
  });

  it('não altera o input quando ainda não existem séries', () => {
    const { result } = renderHook(() =>
      useExerciseScreen({ initialExercise: exercicioInicial(), onUpdateExercise: vi.fn() }),
    );

    expect(result.current.repetitionsInput).toBe('');
    act(() => result.current.handleCopyLastSetReps());
    expect(result.current.repetitionsInput).toBe('');
  });
});

describe('useExerciseScreen — resetForm', () => {
  it('limpa todos os inputs e seleciona nenhuma técnica, usando a carga de referência do exercício', () => {
    const { result } = renderHook(() =>
      useExerciseScreen({
        initialExercise: exercicioInicial({ weightInKg: 70 }),
        onUpdateExercise: vi.fn(),
      }),
    );

    act(() => result.current.setRepetitionsInput('20'));
    act(() => result.current.setWeightInput('90'));
    act(() => result.current.setRestInput('200'));
    act(() => result.current.handleToggleTechnique('RP'));

    act(() => result.current.resetForm());

    expect(result.current.repetitionsInput).toBe('');
    expect(result.current.weightInput).toBe('70');
    expect(result.current.restInput).toBe('120');
    expect(result.current.selectedTechniques).toEqual([]);
  });
});

describe('useExerciseScreen — sincronização com exercício externo', () => {
  it('sincroniza a cópia de trabalho quando o id do exercício externo muda', () => {
    const { result, rerender } = renderHook(
      ({ initialExercise }) => useExerciseScreen({ initialExercise, onUpdateExercise: vi.fn() }),
      {
        initialProps: {
          initialExercise: exercicioInicial({ id: 'ex-1', name: 'Supino', notes: 'nota-inicial' }),
        },
      },
    );

    // Edita localmente
    act(() => result.current.handleUpdateName(eventoComValor('Nome Local')));
    expect(result.current.exercise.name).toBe('Nome Local');

    // Rerender com um exercício de OUTRO id → o hook deve sincronizar
    rerender({
      initialExercise: exercicioInicial({ id: 'ex-2', name: 'Agachamento', notes: 'nota-nova' }),
    });

    expect(result.current.exercise.name).toBe('Agachamento');
    expect(result.current.exercise.notes).toBe('nota-nova');
    expect(result.current.repetitionsInput).toBe(''); // inputs reiniciados no sync
  });

  it('NÃO resincroniza quando o id do exercício externo permanece o mesmo', () => {
    const { result, rerender } = renderHook(
      ({ initialExercise }) => useExerciseScreen({ initialExercise, onUpdateExercise: vi.fn() }),
      {
        initialProps: {
          initialExercise: exercicioInicial({ id: 'ex-1', name: 'Supino' }),
        },
      },
    );

    act(() => result.current.handleUpdateName(eventoComValor('Nome Editado')));

    // Rerender com o MESMO id (ex.: mudou apenas as séries) → mantém a edição local
    rerender({
      initialExercise: exercicioInicial({ id: 'ex-1', name: 'Supino', notes: 'nota-atualizada' }),
    });

    expect(result.current.exercise.name).toBe('Nome Editado');
  });

  it('deve atualizar o equipmentType e loadType corretamente', () => {
    const { result } = renderHook(() =>
      useExerciseScreen({
        initialExercise: exercicioInicial({ id: 'ex-1', name: 'Supino' }),
        onUpdateExercise: vi.fn(),
      }),
    );

    act(() => {
      result.current.handleUpdateEquipmentType('dumbbell');
      result.current.handleUpdateLoadType('each_side');
    });

    expect(result.current.exercise.equipmentType).toBe('dumbbell');
    expect(result.current.exercise.loadType).toBe('each_side');
  });
});
