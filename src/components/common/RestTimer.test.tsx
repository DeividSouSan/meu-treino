import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RestTimer } from './RestTimer';
import type { UseStopwatchResult } from '../../hooks/useStopwatch';

describe('RestTimer', () => {
  const mockStopwatch: UseStopwatchResult = {
    seconds: 45,
    isRunning: true,
    start: vi.fn(),
    pause: vi.fn(),
    reset: vi.fn(),
    setSeconds: vi.fn(),
  };

  it('renders rest timer display formatted as mm:ss', () => {
    render(<RestTimer stopwatch={mockStopwatch} targetSeconds={60} />);

    expect(screen.getByText('Descanso')).toBeInTheDocument();
    expect(screen.getByText('0:45')).toBeInTheDocument();
    expect(screen.getByText(/1:00/)).toBeInTheDocument();
  });

  it('calls reset when reset button is clicked', () => {
    const handleReset = vi.fn();
    const sw = { ...mockStopwatch, reset: handleReset };

    render(<RestTimer stopwatch={sw} targetSeconds={60} />);

    const resetBtn = screen.getByLabelText('Resetar cronômetro de descanso');
    fireEvent.click(resetBtn);

    expect(handleReset).toHaveBeenCalled();
  });
});
