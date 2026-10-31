import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RestTimer } from './RestTimer';
import type { UseStopwatchResult } from '../../hooks/useStopwatch';
import { hapticService } from '../../services/hapticService';

vi.mock('../../services/hapticService', () => ({
  hapticService: {
    lightTap: vi.fn(),
    success: vi.fn(),
    timerFinished: vi.fn(),
  },
}));

const timerFinishedMock = vi.mocked(hapticService.timerFinished);
const lightTapMock = vi.mocked(hapticService.lightTap);

function criarStopwatch(overrides: Partial<UseStopwatchResult> = {}): UseStopwatchResult {
  return {
    seconds: 45,
    isRunning: true,
    start: vi.fn(),
    pause: vi.fn(),
    reset: vi.fn(),
    setSeconds: vi.fn(),
    ...overrides,
  };
}

describe('RestTimer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exibe o tempo atual e o alvo no formato mm:ss', () => {
    render(<RestTimer stopwatch={criarStopwatch({ seconds: 45 })} targetSeconds={60} />);

    expect(screen.getByText('Descanso')).toBeInTheDocument();
    expect(screen.getByText('0:45')).toBeInTheDocument();
    expect(screen.getByText('/1:00')).toBeInTheDocument();
  });

  it('formata tempos acima de um minuto com dois dígitos nos segundos', () => {
    render(<RestTimer stopwatch={criarStopwatch({ seconds: 125 })} targetSeconds={180} />);

    expect(screen.getByText('2:05')).toBeInTheDocument();
    expect(screen.getByText('/3:00')).toBeInTheDocument();
  });

  it('zera o cronômetro e dá feedback tátil ao clicar em resetar', () => {
    const reset = vi.fn();
    render(<RestTimer stopwatch={criarStopwatch({ reset })} targetSeconds={60} />);

    fireEvent.click(screen.getByLabelText('Resetar cronômetro de descanso'));

    expect(lightTapMock).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('dispara o aviso tátil uma única vez ao atingir o tempo alvo', () => {
    const { rerender } = render(
      <RestTimer stopwatch={criarStopwatch({ seconds: 59 })} targetSeconds={60} />,
    );

    expect(timerFinishedMock).not.toHaveBeenCalled();

    rerender(<RestTimer stopwatch={criarStopwatch({ seconds: 60 })} targetSeconds={60} />);
    expect(timerFinishedMock).toHaveBeenCalledTimes(1);

    rerender(<RestTimer stopwatch={criarStopwatch({ seconds: 61 })} targetSeconds={60} />);
    expect(timerFinishedMock).toHaveBeenCalledTimes(1);
  });

  it('rearma o aviso tátil depois que o cronômetro volta a zero', () => {
    const { rerender } = render(
      <RestTimer stopwatch={criarStopwatch({ seconds: 60 })} targetSeconds={60} />,
    );
    expect(timerFinishedMock).toHaveBeenCalledTimes(1);

    rerender(<RestTimer stopwatch={criarStopwatch({ seconds: 0 })} targetSeconds={60} />);
    rerender(<RestTimer stopwatch={criarStopwatch({ seconds: 60 })} targetSeconds={60} />);

    expect(timerFinishedMock).toHaveBeenCalledTimes(2);
  });

  it('não dispara o aviso tátil quando não há tempo alvo definido', () => {
    const { rerender } = render(
      <RestTimer stopwatch={criarStopwatch({ seconds: 0 })} targetSeconds={0} />,
    );

    rerender(<RestTimer stopwatch={criarStopwatch({ seconds: 30 })} targetSeconds={0} />);

    expect(timerFinishedMock).not.toHaveBeenCalled();
  });
});
