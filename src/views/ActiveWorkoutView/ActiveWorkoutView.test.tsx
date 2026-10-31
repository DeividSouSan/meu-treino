import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ActiveWorkoutView } from './ActiveWorkoutView';
import { NavigationProvider, HistoryProvider, useNavigation } from '../../hooks';
import type { WorkoutSession, WorkoutExercise } from '../../types/workout';
import type { UseActiveWorkoutScreenResult } from './useActiveWorkoutScreen';

/**
 * A View é apresentacional: mockamos o container para controlar a sessão
 * exibida e espionar as ações delegadas, sem depender de hidratação do
 * LocalStorage. O useExerciseNavigation continua real.
 */
const estadoDoHook = vi.hoisted(() => ({ useActiveWorkoutScreen: vi.fn() }));

vi.mock('./useActiveWorkoutScreen', () => ({
  useActiveWorkoutScreen: estadoDoHook.useActiveWorkoutScreen,
}));

const sessao: WorkoutSession = {
  id: 'ativa',
  date: '2026-08-15T10:00:00.000Z',
  durationInSeconds: 0,
  name: 'Treino Livre',
  cues: ['Aquecer bem'],
  exercises: [
    { id: 'ex-1', name: 'Supino', weightInKg: 40, notes: '', sets: [] },
    { id: 'ex-2', name: 'Agachamento', weightInKg: 60, notes: '', sets: [] },
  ],
  isTemplate: false,
  status: 'in_progress',
};

interface AcoesEspiadas {
  addCue: ReturnType<typeof vi.fn<(cue: string) => void>>;
  removeCue: ReturnType<typeof vi.fn<(cueIndex: number) => void>>;
  addExercise: ReturnType<typeof vi.fn<(exerciseName: string) => void>>;
  updateExercise: ReturnType<typeof vi.fn<(updatedExercise: WorkoutExercise) => void>>;
  deleteExercise: ReturnType<typeof vi.fn<(exerciseId: string) => void>>;
  saveOrFinish: ReturnType<typeof vi.fn<() => void>>;
  cancel: ReturnType<typeof vi.fn<() => void>>;
  renameSession: ReturnType<typeof vi.fn<(newName: string) => void>>;
}

function configurarHook(): AcoesEspiadas {
  const acoes: AcoesEspiadas = {
    addCue: vi.fn<(cue: string) => void>(),
    removeCue: vi.fn<(cueIndex: number) => void>(),
    addExercise: vi.fn<(exerciseName: string) => void>(),
    updateExercise: vi.fn<(updatedExercise: WorkoutExercise) => void>(),
    deleteExercise: vi.fn<(exerciseId: string) => void>(),
    saveOrFinish: vi.fn<() => void>(),
    cancel: vi.fn<() => void>(),
    renameSession: vi.fn<(newName: string) => void>(),
  };

  const resultado: UseActiveWorkoutScreenResult = {
    session: sessao,
    isEditing: false,
    durationStopwatch: {
      seconds: 0,
      isRunning: true,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
      setSeconds: vi.fn(),
    },
    workoutHistory: [],
    ...acoes,
  };

  estadoDoHook.useActiveWorkoutScreen.mockReturnValue(resultado);
  return acoes;
}

function ViewProbe() {
  const { currentView } = useNavigation();
  return <span data-testid="view-atual">{currentView}</span>;
}

function renderView() {
  return render(
    <NavigationProvider initialView="active_workout">
      <HistoryProvider>
        <ActiveWorkoutView />
        <ViewProbe />
      </HistoryProvider>
    </NavigationProvider>,
  );
}

function pressionarVoltar() {
  act(() => {
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}

describe('ActiveWorkoutView — lista de exercícios', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    configurarHook();
  });

  it('exibe o cabeçalho, os lembretes e os exercícios da sessão', () => {
    renderView();

    expect(screen.getByText('Treino Livre')).toBeInTheDocument();
    expect(screen.getByText('Aquecer bem')).toBeInTheDocument();
    expect(screen.getByText('Supino')).toBeInTheDocument();
    expect(screen.getByText('Agachamento')).toBeInTheDocument();
    expect(screen.getByText('Cues da Sessão (Lembretes)')).toBeInTheDocument();
  });

  it('remove o lembrete pelo índice', () => {
    const acoes = configurarHook();
    renderView();

    fireEvent.click(screen.getAllByTitle('Remover')[0]);

    expect(acoes.removeCue).toHaveBeenCalledWith(0);
  });

  it('adiciona exercício digitado na busca e limpa o campo', () => {
    const acoes = configurarHook();
    renderView();

    const input = screen.getByPlaceholderText('Buscar ou digitar nome do exercício...');
    fireEvent.change(input, { target: { value: 'Remada Curvada' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(acoes.addExercise).toHaveBeenCalledWith('Remada Curvada');
    expect(input).toHaveValue('');
  });

  it('volta ao histórico pelo gesto de voltar quando está na lista', () => {
    renderView();

    expect(screen.getByTestId('view-atual')).toHaveTextContent('active_workout');

    pressionarVoltar();

    expect(screen.getByTestId('view-atual')).toHaveTextContent('history');
  });
});

describe('ActiveWorkoutView — detalhe do exercício', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    configurarHook();
  });

  it('abre a tela do exercício ao tocar no card da lista', () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /Supino/ }));

    expect(screen.getByDisplayValue('Supino')).toBeInTheDocument();
    expect(screen.getByLabelText('Voltar para a lista de exercícios')).toBeInTheDocument();
    expect(screen.queryByText('Cues da Sessão (Lembretes)')).not.toBeInTheDocument();
  });

  it('volta para a lista pelo botão de voltar da tela do exercício', () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /Supino/ }));
    fireEvent.click(screen.getByLabelText('Voltar para a lista de exercícios'));

    expect(screen.getByText('Cues da Sessão (Lembretes)')).toBeInTheDocument();
    expect(screen.getByTestId('view-atual')).toHaveTextContent('active_workout');
  });

  it('volta para a lista pelo gesto de voltar, mantendo-se no treino ativo', () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /Supino/ }));
    pressionarVoltar();

    expect(screen.getByText('Cues da Sessão (Lembretes)')).toBeInTheDocument();
    expect(screen.getByTestId('view-atual')).toHaveTextContent('active_workout');
  });

  it('navega entre exercícios anteriores e próximos', () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /Supino/ }));

    expect(screen.getByLabelText('Ir para exercício anterior')).toBeDisabled();
    expect(screen.getByLabelText('Ir para próximo exercício')).toBeEnabled();

    fireEvent.click(screen.getByLabelText('Ir para próximo exercício'));

    expect(screen.getByDisplayValue('Agachamento')).toBeInTheDocument();
    expect(screen.getByLabelText('Ir para exercício anterior')).toBeEnabled();
    expect(screen.getByLabelText('Ir para próximo exercício')).toBeDisabled();
  });

  it('exclui o exercício após confirmação e volta para a lista', () => {
    const acoes = configurarHook();
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /Supino/ }));
    fireEvent.click(screen.getByLabelText('Excluir exercício atual'));

    expect(screen.getByRole('heading', { name: 'Remover Exercício' })).toBeInTheDocument();
    expect(acoes.deleteExercise).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Remover' }));

    expect(acoes.deleteExercise).toHaveBeenCalledWith('ex-1');
    expect(screen.getByText('Cues da Sessão (Lembretes)')).toBeInTheDocument();
  });
});

describe('ActiveWorkoutView — encerrar e cancelar', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    configurarHook();
  });

  it('encerra o treino após confirmação e navega ao histórico', () => {
    const acoes = configurarHook();
    renderView();

    fireEvent.click(screen.getByLabelText('Encerrar e registrar treino'));

    expect(screen.getByRole('heading', { name: 'Encerrar Treino' })).toBeInTheDocument();
    expect(acoes.saveOrFinish).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Encerrar' }));

    expect(acoes.saveOrFinish).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('view-atual')).toHaveTextContent('history');
  });

  it('cancela o treino após confirmação e navega ao histórico', () => {
    const acoes = configurarHook();
    renderView();

    fireEvent.click(screen.getByLabelText('Cancelar treino ativo'));

    expect(screen.getByRole('heading', { name: 'Cancelar Treino' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar Treino' }));

    expect(acoes.cancel).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('view-atual')).toHaveTextContent('history');
  });
});
