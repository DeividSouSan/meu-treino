import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MtModal } from './MtModal';

describe('MtModal', () => {
  it('chama onClose ao clicar no overlay do backdrop quando closeOnBackdropClick = true', () => {
    const handleClose = vi.fn();
    render(
      <MtModal isOpen={true} onClose={handleClose}>
        <div>Conteúdo Modal</div>
      </MtModal>
    );

    const dialog = screen.getByRole('dialog');
    
    // O click no proprio dialog (overlay) aciona close.
    fireEvent.click(dialog);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // O click no interior nao aciona
    const content = screen.getByText('Conteúdo Modal');
    fireEvent.click(content);
    expect(handleClose).toHaveBeenCalledTimes(1); // Manteve 1
  });

  it('não chama onClose ao clicar no overlay do backdrop quando closeOnBackdropClick = false', () => {
    const handleClose = vi.fn();
    render(
      <MtModal isOpen={true} onClose={handleClose} closeOnBackdropClick={false}>
        <div>Conteúdo Modal</div>
      </MtModal>
    );

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(handleClose).not.toHaveBeenCalled();
  });
});
