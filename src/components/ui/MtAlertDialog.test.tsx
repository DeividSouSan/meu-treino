import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MtAlertDialog } from './MtAlertDialog';

describe('MtAlertDialog', () => {
  it('não renderiza nada quando isOpen é false', () => {
    render(
      <MtAlertDialog
        isOpen={false}
        title="Título"
        message="Mensagem de alerta"
        onClose={vi.fn()}
      />,
    );

    expect(screen.queryByText('Título')).not.toBeInTheDocument();
    expect(screen.queryByText('Mensagem de alerta')).not.toBeInTheDocument();
  });

  it('renderiza título, mensagem e botão de ação quando isOpen é true', () => {
    render(
      <MtAlertDialog
        isOpen={true}
        title="Atenção"
        message="Número de repetições inválido"
        buttonText="OK"
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Atenção')).toBeInTheDocument();
    expect(screen.getByText('Número de repetições inválido')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('chama onClose ao clicar no botão de confirmação', () => {
    const handleClose = vi.fn();
    render(
      <MtAlertDialog
        isOpen={true}
        title="Atenção"
        message="Mensagem de teste"
        onClose={handleClose}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
