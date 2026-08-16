import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActiveWorkoutHeader } from './ActiveWorkoutHeader';
import type { WorkoutSession } from '../../types/workout';

const mockSession: WorkoutSession = {
  id: 'sessao-header-1',
  date: '2026-08-16T18:00:00.000Z',
  durationInSeconds: 900,
  name: 'Treino Livre',
  cues: [],
  exercises: [],
  isTemplate: false,
  status: 'in_progress',
};

const mockStopwatch = {
  seconds: 900,
  isRunning: true,
  start: vi.fn(),
  pause: vi.fn(),
  reset: vi.fn(),
  setSeconds: vi.fn(),
};

function renderHeader(
  overrides: Partial<{
    session: WorkoutSession;
    isEditing: boolean;
    onRenameSession: (name: string) => void;
    onSaveOrFinish: () => void;
    onCancel: () => void;
  }> = {}
) {
  return render(
    <ActiveWorkoutHeader
      session={overrides.session ?? mockSession}
      isEditing={overrides.isEditing ?? false}
      durationStopwatch={mockStopwatch}
      onSaveOrFinish={overrides.onSaveOrFinish ?? vi.fn()}
      onCancel={overrides.onCancel ?? vi.fn()}
      onRenameSession={overrides.onRenameSession ?? vi.fn()}
    />
  );
}

describe('ActiveWorkoutHeader — exibição do nome', () => {
  it('exibe o nome da sessão no cabeçalho', () => {
    renderHeader({ session: { ...mockSession, name: 'Peito e Tríceps' } });

    expect(screen.getByText('Peito e Tríceps')).toBeInTheDocument();
  });

  it('exibe o ícone de lápis ao lado do nome (modo de visualização)', () => {
    renderHeader();

    // O h1 clicável deve ter o atributo title de pista visual
    const nomeClicavel = screen.getByTitle('Tocar para renomear');
    expect(nomeClicavel).toBeInTheDocument();
  });

  it('exibe a duração no rodapé do cabeçalho quando não está em modo de edição', () => {
    renderHeader({ isEditing: false });

    expect(screen.getByText(/Duração:/)).toBeInTheDocument();
  });

  it('exibe "Modo Edição" no rodapé quando isEditing é true', () => {
    renderHeader({ isEditing: true });

    expect(screen.getByText('Modo Edição')).toBeInTheDocument();
  });
});

describe('ActiveWorkoutHeader — inline edit do nome (ativação)', () => {
  it('ao clicar no nome, ativa o campo de edição inline', () => {
    renderHeader();

    const nomeTitulo = screen.getByTitle('Tocar para renomear');
    fireEvent.click(nomeTitulo);

    const inputNome = screen.getByRole('textbox', { name: /nome do treino/i });
    expect(inputNome).toBeInTheDocument();
  });

  it('o input de edição inicia com o nome atual da sessão pré-preenchido', () => {
    renderHeader({ session: { ...mockSession, name: 'Costas e Bíceps' } });

    const nomeTitulo = screen.getByTitle('Tocar para renomear');
    fireEvent.click(nomeTitulo);

    const inputNome = screen.getByRole('textbox', { name: /nome do treino/i });
    expect(inputNome).toHaveValue('Costas e Bíceps');
  });

  it('o input respeita o limite máximo de 40 caracteres', () => {
    renderHeader();

    const nomeTitulo = screen.getByTitle('Tocar para renomear');
    fireEvent.click(nomeTitulo);

    const inputNome = screen.getByRole('textbox', { name: /nome do treino/i });
    expect(inputNome).toHaveAttribute('maxLength', '40');
  });
});

describe('ActiveWorkoutHeader — inline edit do nome (commit via Enter)', () => {
  it('ao pressionar Enter com nome válido, chama onRenameSession com o nome trimado', () => {
    const onRenameSession = vi.fn();
    renderHeader({ onRenameSession });

    fireEvent.click(screen.getByTitle('Tocar para renomear'));

    const inputNome = screen.getByRole('textbox', { name: /nome do treino/i });
    fireEvent.change(inputNome, { target: { value: '  Pernas  ' } });
    fireEvent.keyDown(inputNome, { key: 'Enter' });

    expect(onRenameSession).toHaveBeenCalledWith('Pernas');
    expect(onRenameSession).toHaveBeenCalledTimes(1);
  });

  it('ao pressionar Enter com o mesmo nome, não chama onRenameSession', () => {
    const onRenameSession = vi.fn();
    renderHeader({ session: { ...mockSession, name: 'Treino Livre' }, onRenameSession });

    fireEvent.click(screen.getByTitle('Tocar para renomear'));

    const inputNome = screen.getByRole('textbox', { name: /nome do treino/i });
    // Mantém o mesmo valor
    fireEvent.keyDown(inputNome, { key: 'Enter' });

    expect(onRenameSession).not.toHaveBeenCalled();
  });

  it('ao pressionar Enter com nome vazio, não chama onRenameSession e fecha o input', () => {
    const onRenameSession = vi.fn();
    renderHeader({ onRenameSession });

    fireEvent.click(screen.getByTitle('Tocar para renomear'));

    const inputNome = screen.getByRole('textbox', { name: /nome do treino/i });
    fireEvent.change(inputNome, { target: { value: '' } });
    fireEvent.keyDown(inputNome, { key: 'Enter' });

    expect(onRenameSession).not.toHaveBeenCalled();
    // O input deve fechar e o título voltar
    expect(screen.getByTitle('Tocar para renomear')).toBeInTheDocument();
  });

  it('ao pressionar Enter com apenas espaços, não chama onRenameSession', () => {
    const onRenameSession = vi.fn();
    renderHeader({ onRenameSession });

    fireEvent.click(screen.getByTitle('Tocar para renomear'));

    const inputNome = screen.getByRole('textbox', { name: /nome do treino/i });
    fireEvent.change(inputNome, { target: { value: '   ' } });
    fireEvent.keyDown(inputNome, { key: 'Enter' });

    expect(onRenameSession).not.toHaveBeenCalled();
  });
});

describe('ActiveWorkoutHeader — inline edit do nome (Escape e blur)', () => {
  it('ao pressionar Escape, fecha o input sem chamar onRenameSession', () => {
    const onRenameSession = vi.fn();
    renderHeader({ onRenameSession });

    fireEvent.click(screen.getByTitle('Tocar para renomear'));

    const inputNome = screen.getByRole('textbox', { name: /nome do treino/i });
    fireEvent.change(inputNome, { target: { value: 'Nome Que Não Deve Ser Salvo' } });
    fireEvent.keyDown(inputNome, { key: 'Escape' });

    expect(onRenameSession).not.toHaveBeenCalled();
    expect(screen.getByTitle('Tocar para renomear')).toBeInTheDocument();
  });

  it('ao perder o foco com nome válido diferente, chama onRenameSession', () => {
    const onRenameSession = vi.fn();
    renderHeader({ onRenameSession });

    fireEvent.click(screen.getByTitle('Tocar para renomear'));

    const inputNome = screen.getByRole('textbox', { name: /nome do treino/i });
    fireEvent.change(inputNome, { target: { value: 'Ombros e Trapézio' } });
    fireEvent.blur(inputNome);

    expect(onRenameSession).toHaveBeenCalledWith('Ombros e Trapézio');
  });

  it('ao perder o foco com nome vazio, não chama onRenameSession e fecha o input', () => {
    const onRenameSession = vi.fn();
    renderHeader({ onRenameSession });

    fireEvent.click(screen.getByTitle('Tocar para renomear'));

    const inputNome = screen.getByRole('textbox', { name: /nome do treino/i });
    fireEvent.change(inputNome, { target: { value: '' } });
    fireEvent.blur(inputNome);

    expect(onRenameSession).not.toHaveBeenCalled();
    expect(screen.getByTitle('Tocar para renomear')).toBeInTheDocument();
  });
});

describe('ActiveWorkoutHeader — botões de ação', () => {
  it('ao clicar em cancelar, abre o diálogo de confirmação de cancelamento', () => {
    renderHeader({ isEditing: false });

    fireEvent.click(screen.getByTitle('Cancelar treino'));

    // Verifica que o título do modal de cancelamento aparece como heading
    expect(screen.getByRole('heading', { name: 'Cancelar Treino' })).toBeInTheDocument();
  });

  it('ao clicar em salvar, abre o diálogo de confirmação de encerramento', () => {
    renderHeader({ isEditing: false });

    fireEvent.click(screen.getByTitle('Encerrar treino'));

    expect(screen.getByRole('heading', { name: 'Encerrar Treino' })).toBeInTheDocument();
  });

  it('ao confirmar encerramento, chama onSaveOrFinish', () => {
    const onSaveOrFinish = vi.fn();
    renderHeader({ isEditing: false, onSaveOrFinish });

    fireEvent.click(screen.getByTitle('Encerrar treino'));
    fireEvent.click(screen.getByText('Encerrar'));

    expect(onSaveOrFinish).toHaveBeenCalledTimes(1);
  });

  it('ao confirmar cancelamento, chama onCancel', () => {
    const onCancel = vi.fn();
    renderHeader({ isEditing: false, onCancel });

    fireEvent.click(screen.getByTitle('Cancelar treino'));

    // Clica no botão "Cancelar Treino" (role=button) — diferente do título do modal (role=heading)
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar Treino' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
