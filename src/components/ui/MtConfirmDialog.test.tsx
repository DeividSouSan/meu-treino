import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MtConfirmDialog } from './MtConfirmDialog';

describe('MtConfirmDialog', () => {
  it('não renderiza conteúdo quando isOpen é false', () => {
    render(
      <MtConfirmDialog
        isOpen={false}
        title="Título Teste"
        message="Mensagem Teste"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.queryByText('Título Teste')).not.toBeInTheDocument();
    expect(screen.queryByText('Mensagem Teste')).not.toBeInTheDocument();
  });

  it('renderiza título, mensagem e botões padrão quando isOpen é true', () => {
    render(
      <MtConfirmDialog
        isOpen={true}
        title="Excluir Item"
        message="Tem certeza de que deseja excluir?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText('Excluir Item')).toBeInTheDocument();
    expect(screen.getByText('Tem certeza de que deseja excluir?')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Confirmar')).toBeInTheDocument();
  });

  it('chama onConfirm ao clicar no botão de confirmação', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <MtConfirmDialog
        isOpen={true}
        title="Encerrar Treino"
        message="Deseja finalizar o treino?"
        confirmText="Finalizar"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    fireEvent.click(screen.getByText('Finalizar'));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleCancel).not.toHaveBeenCalled();
  });

  it('chama onCancel ao clicar no botão de cancelamento', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <MtConfirmDialog
        isOpen={true}
        title="Descartar Treino"
        message="Deseja descartar?"
        cancelText="Voltar"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    fireEvent.click(screen.getByText('Voltar'));
    expect(handleCancel).toHaveBeenCalledTimes(1);
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it('chama onCancel ao pressionar a tecla Escape', () => {
    const handleCancel = vi.fn();

    render(
      <MtConfirmDialog
        isOpen={true}
        title="Escape Test"
        message="Pressione escape"
        onConfirm={vi.fn()}
        onCancel={handleCancel}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
