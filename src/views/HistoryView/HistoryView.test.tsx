import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HistoryView } from './HistoryView';
import { NavigationProvider, SessionProvider, HistoryProvider, ThemeProvider } from '../../hooks';
import type { WorkoutSession } from '../../types/workout';
import { saveWorkoutSession } from '../../services/storageService';

const sessaoConcluida: WorkoutSession = {
  id: 'sessao-1',
  date: '2026-08-15T10:00:00.000Z',
  durationInSeconds: 3600,
  name: 'Treino A - Peito',
  cues: [],
  exercises: [],
  isTemplate: false,
  status: 'completed',
};

function renderHistoryView() {
  return render(
    <ThemeProvider>
      <NavigationProvider>
        <SessionProvider>
          <HistoryProvider>
            <HistoryView />
          </HistoryProvider>
        </SessionProvider>
      </NavigationProvider>
    </ThemeProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('HistoryView — lista e estado vazio', () => {
  it('exibe o estado vazio e o botão de criar primeiro treino', () => {
    renderHistoryView();

    expect(screen.getByText('Nenhum treino registrado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar primeiro treino' })).toBeInTheDocument();
  });

  it('lista os treinos concluídos com data e duração formatadas', () => {
    saveWorkoutSession(sessaoConcluida);
    renderHistoryView();

    expect(screen.getByText('Treino A - Peito')).toBeInTheDocument();
    expect(screen.getByText('60 min')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Histórico' })).toBeInTheDocument();
  });
});
