import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MtAlert } from './MtAlert';

describe('MtAlert', () => {
  it('renderiza corretamente o alert com variant info por padrão', () => {
    const { container } = render(<MtAlert>Mensagem Info</MtAlert>);
    expect(screen.getByText('Mensagem Info')).toBeInTheDocument();
    
    // Icone Info e cor da variant info
    const div = container.firstChild as HTMLElement;
    expect(div.style.backgroundColor).toBe('var(--accent-light)');
  });

  it('renderiza a variant warning', () => {
    const { container } = render(<MtAlert variant="warning">Aviso</MtAlert>);
    const div = container.firstChild as HTMLElement;
    expect(div.style.backgroundColor).toBe('var(--warning-light)');
  });

  it('renderiza a variant danger', () => {
    const { container } = render(<MtAlert variant="danger">Erro</MtAlert>);
    const div = container.firstChild as HTMLElement;
    expect(div.style.backgroundColor).toBe('var(--danger-light)');
  });

  it('renderiza a variant success', () => {
    const { container } = render(<MtAlert variant="success">Sucesso</MtAlert>);
    const div = container.firstChild as HTMLElement;
    expect(div.style.backgroundColor).toBe('var(--success-light)');
  });

  it('renderiza um ícone customizado', () => {
    render(
      <MtAlert icon={<svg data-testid="custom-icon" />}>
        Custom Icon
      </MtAlert>
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('aplica style adicional', () => {
    const { container } = render(
      <MtAlert style={{ padding: '20px' }}>Estilo</MtAlert>
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.padding).toBe('20px');
  });
});
