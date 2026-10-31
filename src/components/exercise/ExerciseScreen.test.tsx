import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseScreen } from './ExerciseScreen';
import type { WorkoutExercise } from '../../types/workout';

vi.mock('../../hooks', () => ({
  useHistory: () => ({ workoutHistory: [] }),
}));

vi.mock('../../hooks/useStopwatch', () => ({
  useStopwatch: () => ({
    seconds: 0,
    isRunning: false,
    start: vi.fn(),
    pause: vi.fn(),
    reset: vi.fn(),
    setSeconds: vi.fn(),
  }),
}));

const mockExercise: WorkoutExercise = {
  id: 'ex-1',
  name: 'Desenvolvimento',
  weightInKg: 20,
  notes: '',
  sets: [{ repetitions: 10, weightInKg: 20, restTimeInSeconds: 60, advancedTechniques: [] }],
  loadType: 'each_side',
  equipmentType: 'dumbbell',
};

const defaultNav = {
  onBack: vi.fn(),
  onNavigatePrevious: vi.fn(),
  onNavigateNext: vi.fn(),
  hasPrevious: false,
  hasNext: true,
};

function renderScreen(overrides: Partial<React.ComponentProps<typeof ExerciseScreen>> = {}) {
  const onUpdateExercise = vi.fn();
  const utils = render(
    <ExerciseScreen
      exercise={mockExercise}
      onUpdateExercise={onUpdateExercise}
      onDeleteExercise={vi.fn()}
      exerciseNavigation={defaultNav}
      {...overrides}
    />,
  );

  return { ...utils, onUpdateExercise };
}

describe('ExerciseScreen — renderização', () => {
  it('renders exercise name and sets', () => {
    renderScreen();

    expect(screen.getByDisplayValue('Desenvolvimento')).toBeInTheDocument();
    expect(screen.getByText(/10\s*reps/)).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    const handleBack = vi.fn();
    renderScreen({ exerciseNavigation: { ...defaultNav, onBack: handleBack } });

    fireEvent.click(screen.getByLabelText('Voltar para a lista de exercícios'));

    expect(handleBack).toHaveBeenCalled();
  });
});

describe('ExerciseScreen — navegação entre exercícios', () => {
  it('dispara próximo/anterior respeitando os limites', () => {
    const onNavigatePrevious = vi.fn();
    const onNavigateNext = vi.fn();
    renderScreen({
      exerciseNavigation: {
        ...defaultNav,
        onNavigatePrevious,
        onNavigateNext,
        hasPrevious: true,
      },
    });

    fireEvent.click(screen.getByLabelText('Ir para exercício anterior'));
    fireEvent.click(screen.getByLabelText('Ir para próximo exercício'));

    expect(onNavigatePrevious).toHaveBeenCalledTimes(1);
    expect(onNavigateNext).toHaveBeenCalledTimes(1);
  });

  it('desabilita os botões quando não há exercício anterior ou próximo', () => {
    renderScreen({
      exerciseNavigation: { ...defaultNav, hasPrevious: false, hasNext: false },
    });

    expect(screen.getByLabelText('Ir para exercício anterior')).toBeDisabled();
    expect(screen.getByLabelText('Ir para próximo exercício')).toBeDisabled();
  });
});

describe('ExerciseScreen — edição do exercício', () => {
  it('atualiza o nome do exercício', () => {
    const { onUpdateExercise } = renderScreen();

    fireEvent.change(screen.getByDisplayValue('Desenvolvimento'), {
      target: { value: 'Supino Inclinado' },
    });

    expect(onUpdateExercise).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Supino Inclinado' }),
    );
  });

  it('atualiza as notas do exercício', () => {
    const { onUpdateExercise } = renderScreen();

    fireEvent.change(screen.getByLabelText('Notas'), {
      target: { value: 'Controlar a descida' },
    });

    expect(onUpdateExercise).toHaveBeenCalledWith(
      expect.objectContaining({ notes: 'Controlar a descida' }),
    );
  });

  it('atualiza o equipamento ao tocar nas pills', () => {
    const { onUpdateExercise } = renderScreen();

    fireEvent.click(screen.getByText('Barra'));

    expect(onUpdateExercise).toHaveBeenCalledWith(
      expect.objectContaining({ equipmentType: 'barbell' }),
    );
  });

  it('atualiza o tipo de carga ao tocar nas pills', () => {
    const { onUpdateExercise } = renderScreen();

    fireEvent.click(screen.getByText('Carga Total'));

    expect(onUpdateExercise).toHaveBeenCalledWith(expect.objectContaining({ loadType: 'total' }));
  });
});

describe('ExerciseScreen — remoção do exercício', () => {
  it('exige confirmação antes de remover o exercício', () => {
    const onDeleteExercise = vi.fn();
    renderScreen({ onDeleteExercise });

    fireEvent.click(screen.getByLabelText('Excluir exercício atual'));

    expect(screen.getByRole('heading', { name: 'Remover Exercício' })).toBeInTheDocument();
    expect(onDeleteExercise).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Remover' }));

    expect(onDeleteExercise).toHaveBeenCalledTimes(1);
  });

  it('não remove o exercício quando o usuário cancela', () => {
    const onDeleteExercise = vi.fn();
    renderScreen({ onDeleteExercise });

    fireEvent.click(screen.getByLabelText('Excluir exercício atual'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onDeleteExercise).not.toHaveBeenCalled();
  });
});

describe('ExerciseScreen — registro de séries', () => {
  it('adiciona uma série com reps, carga e descanso informados', () => {
    const { onUpdateExercise } = renderScreen();

    const [repsInput, weightInput, restInput] = screen.getAllByRole('spinbutton');
    fireEvent.change(repsInput, { target: { value: '12' } });
    fireEvent.change(weightInput, { target: { value: '45' } });
    fireEvent.change(restInput, { target: { value: '90' } });

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Série' }));

    const exercicioAtualizado = onUpdateExercise.mock.calls.at(-1)?.[0] as WorkoutExercise;
    expect(exercicioAtualizado.sets).toHaveLength(2);
    expect(exercicioAtualizado.sets[1]).toMatchObject({
      repetitions: 12,
      weightInKg: 45,
      restTimeInSeconds: 90,
    });
  });

  it('não adiciona série e mostra erro quando as repetições são inválidas', () => {
    const { onUpdateExercise } = renderScreen();

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Série' }));

    expect(onUpdateExercise).not.toHaveBeenCalled();
    expect(
      screen.getByText('Por favor, informe um número válido de repetições (maior que zero).'),
    ).toBeInTheDocument();
  });

  it('fecha o diálogo de erro ao clicar em Entendido', () => {
    renderScreen();

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Série' }));
    expect(screen.getByRole('heading', { name: 'Atenção' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));

    expect(screen.queryByRole('heading', { name: 'Atenção' })).not.toBeInTheDocument();
  });

  it('copia as repetições da última série para o formulário', () => {
    renderScreen({
      exercise: {
        ...mockExercise,
        sets: [{ repetitions: 15, weightInKg: 30, restTimeInSeconds: 60, advancedTechniques: [] }],
      },
    });

    const [repsInput] = screen.getAllByRole('spinbutton');
    fireEvent.change(repsInput, { target: { value: '3' } });

    fireEvent.click(screen.getByRole('button', { name: /Copiar Última/i }));

    expect(repsInput).toHaveValue(15);
  });

  it('não exibe o botão de copiar quando ainda não existem séries', () => {
    renderScreen({ exercise: { ...mockExercise, sets: [] } });

    expect(screen.queryByRole('button', { name: /Copiar Última/i })).not.toBeInTheDocument();
    expect(screen.getByText('Nenhuma série registrada ainda')).toBeInTheDocument();
  });
});
