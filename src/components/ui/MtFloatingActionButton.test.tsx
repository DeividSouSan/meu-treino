import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MtFloatingActionButton } from './MtFloatingActionButton';

describe('MtFloatingActionButton', () => {
  it('renderiza corretamente com estado básico circular', () => {
    render(
      <MtFloatingActionButton onClick={() => {}} title="Adicionar" ariaLabel="Botão Add">
        <span data-testid="icon">+</span>
      </MtFloatingActionButton>
    );
    
    const btn = screen.getByRole('button', { name: 'Botão Add' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('title', 'Adicionar');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    
    // Verifica arredondamento (por ser apenas ícone de 1 caractere, isExtended deve ser falso)
    expect(btn.style.borderRadius).toBe('50%');
  });

  it('renderiza estendido quando recebe a prop label', () => {
    render(
      <MtFloatingActionButton onClick={() => {}} label="Novo Treino" />
    );
    
    const btn = screen.getByText('Novo Treino');
    expect(btn).toBeInTheDocument();
    
    // Verifica arredondamento (por conter label, isExtended deve ser true)
    expect(btn.style.borderRadius).toBe('28px');
  });

  it('chama a função onClick ao ser clicado', () => {
    const handleClick = vi.fn();
    render(<MtFloatingActionButton onClick={handleClick} label="Clicável" />);
    
    fireEvent.click(screen.getByText('Clicável'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('aceita ícone via prop e children', () => {
    render(
      <MtFloatingActionButton onClick={() => {}} icon={<span data-testid="prop-icon" />}>
        <span data-testid="child-icon" />
      </MtFloatingActionButton>
    );
    
    expect(screen.getByTestId('prop-icon')).toBeInTheDocument();
    expect(screen.getByTestId('child-icon')).toBeInTheDocument();
  });

  it('aplica estilo customizado', () => {
    render(
      <MtFloatingActionButton onClick={() => {}} label="A" style={{ zIndex: 100 }} />
    );
    
    const btn = screen.getByText('A');
    expect(btn.style.zIndex).toBe('100');
  });
});
