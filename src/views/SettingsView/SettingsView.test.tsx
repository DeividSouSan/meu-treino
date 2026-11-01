import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsView } from './SettingsView';
import { HistoryProvider, NavigationProvider, SessionProvider, ThemeProvider } from '../../hooks';

function renderSettingsView() {
  return render(
    <ThemeProvider>
      <NavigationProvider>
        <SessionProvider>
          <HistoryProvider>
            <SettingsView />
          </HistoryProvider>
        </SessionProvider>
      </NavigationProvider>
    </ThemeProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('SettingsView — seletor de tema', () => {
  it('exibe o seletor de tema com as três opções', () => {
    renderSettingsView();

    const select = screen.getByLabelText('Tema');

    expect(select).toHaveValue('system');
    expect(screen.getByRole('option', { name: 'Seguir o sistema' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Claro' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Escuro' })).toBeInTheDocument();
  });

  it('aplica e persiste o tema escuro ao selecionar Escuro', async () => {
    renderSettingsView();

    fireEvent.change(screen.getByLabelText('Tema'), { target: { value: 'dark' } });

    expect(localStorage.getItem('meu_treino_theme')).toBe('dark');
    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    });
  });

  it('restaura o tema escuro salvo ao remontar a tela', async () => {
    const { unmount } = renderSettingsView();

    fireEvent.change(screen.getByLabelText('Tema'), { target: { value: 'dark' } });
    unmount();

    renderSettingsView();

    await waitFor(() => {
      expect(screen.getByLabelText('Tema')).toHaveValue('dark');
    });
    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    });
  });

  it('volta para o tema claro ao selecionar Claro', async () => {
    renderSettingsView();

    fireEvent.change(screen.getByLabelText('Tema'), { target: { value: 'dark' } });
    fireEvent.change(screen.getByLabelText('Tema'), { target: { value: 'light' } });

    expect(localStorage.getItem('meu_treino_theme')).toBe('light');
    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    });
  });
});
