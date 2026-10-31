import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { HistoryView } from './HistoryView';
import { NavigationProvider, SessionProvider, HistoryProvider, ThemeProvider } from '../../hooks';
import type { WorkoutSession } from '../../types/workout';
import { saveActiveWorkoutSession, saveWorkoutSession } from '../../services/storageService';

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

/**
 * Simula o gesto/botão de voltar do celular: o NavigationProvider escuta
 * `popstate` e encaminha para o handler registrado pela tela atual.
 */
function pressionarVoltar() {
  act(() => {
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('HistoryView — gesto de voltar', () => {
  it('fecha as configurações quando estão abertas', async () => {
    renderHistoryView();

    fireEvent.click(screen.getByLabelText('Configurações e Backup'));

    expect(
      await screen.findByRole('heading', { name: 'Configurações & Backup' }),
    ).toBeInTheDocument();

    pressionarVoltar();

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: 'Configurações & Backup' }),
      ).not.toBeInTheDocument();
    });
  });

  it('fecha o menu de ações de um treino quando está aberto', async () => {
    saveWorkoutSession(sessaoConcluida);
    renderHistoryView();

    fireEvent.contextMenu(await screen.findByText('Treino A - Peito'));

    expect(await screen.findByText('Editar Treino')).toBeInTheDocument();

    pressionarVoltar();

    await waitFor(() => {
      expect(screen.queryByText('Editar Treino')).not.toBeInTheDocument();
    });
  });

  it('pede confirmação de saída quando existe treino em andamento', async () => {
    saveActiveWorkoutSession({
      ...sessaoConcluida,
      id: 'ativa',
      name: 'Treino Livre',
      status: 'in_progress',
      durationInSeconds: 0,
    });
    renderHistoryView();

    await screen.findByText('Retomar');

    pressionarVoltar();

    expect(
      await screen.findByText(
        'Você possui um treino ativo. Deseja realmente sair do aplicativo ou prefere continuar seu treino?',
      ),
    ).toBeInTheDocument();

    pressionarVoltar();

    await waitFor(() => {
      expect(
        screen.queryByText(
          'Você possui um treino ativo. Deseja realmente sair do aplicativo ou prefere continuar seu treino?',
        ),
      ).not.toBeInTheDocument();
    });
  });

  it('prioriza fechar as configurações em vez de perguntar sobre o treino ativo', async () => {
    saveActiveWorkoutSession({
      ...sessaoConcluida,
      id: 'ativa',
      name: 'Treino Livre',
      status: 'in_progress',
    });
    renderHistoryView();

    await screen.findByText('Retomar');
    fireEvent.click(screen.getByLabelText('Configurações e Backup'));

    expect(
      await screen.findByRole('heading', { name: 'Configurações & Backup' }),
    ).toBeInTheDocument();

    pressionarVoltar();

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: 'Configurações & Backup' }),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.queryByText(
        'Você possui um treino ativo. Deseja realmente sair do aplicativo ou prefere continuar seu treino?',
      ),
    ).not.toBeInTheDocument();
  });

  it('não abre nenhum diálogo quando não há treino ativo nem modal aberto', () => {
    renderHistoryView();

    pressionarVoltar();

    expect(screen.queryByText('Treino em Andamento')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Histórico' })).toBeInTheDocument();
  });
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
