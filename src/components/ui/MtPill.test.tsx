import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MtPill } from './MtPill';

describe('MtPill', () => {
  it('renderiza o conteúdo corretamente', () => {
    render(<MtPill>Pílula</MtPill>);
    expect(screen.getByText('Pílula')).toBeInTheDocument();
  });

  it('aplica classe base e classe active quando isActive = true', () => {
    const { container } = render(<MtPill isActive>Pílula Ativa</MtPill>);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('pill');
    expect(el).toHaveClass('active');
  });

  it('não aplica classe active quando isActive = false (padrão)', () => {
    const { container } = render(<MtPill>Pílula Normal</MtPill>);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('pill');
    expect(el).not.toHaveClass('active');
  });

  it('aplica title e style corretamente', () => {
    const { container } = render(<MtPill title="Dica" style={{ color: 'red' }}>Conteúdo</MtPill>);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveAttribute('title', 'Dica');
    expect(el.style.color).toBe('red');
  });

  it('chama onClick ao clicar', () => {
    const handleClick = vi.fn();
    render(<MtPill onClick={handleClick}>Clicável</MtPill>);
    fireEvent.click(screen.getByText('Clicável'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('chama onClick ao pressionar Enter ou Espaço quando há onClick', () => {
    const handleClick = vi.fn();
    render(<MtPill onClick={handleClick}>Acessível</MtPill>);
    
    const pill = screen.getByText('Acessível');
    expect(pill).toHaveAttribute('role', 'button');
    expect(pill).toHaveAttribute('tabindex', '0');

    fireEvent.keyDown(pill, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(pill, { key: ' ' }); // Espaço
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('não define role e tabIndex se onClick não for provido', () => {
    render(<MtPill>Inativo</MtPill>);
    const pill = screen.getByText('Inativo');
    expect(pill).not.toHaveAttribute('role');
    expect(pill).not.toHaveAttribute('tabindex');
  });
});
