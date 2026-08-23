import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MtButton } from './MtButton';

describe('MtButton', () => {
  it('aplica variant e size como classes corretamente (default = "")', () => {
    // Default
    const { container: defaultContainer } = render(<MtButton>Normal</MtButton>);
    expect(defaultContainer.firstChild).not.toHaveClass('medium'); // medium é o padrão mas não aplica classe explícita
    expect(defaultContainer.firstChild).not.toHaveClass('default'); // 'default' também não

    // Variant primária e size grande
    const { container: primaryContainer } = render(
      <MtButton variant="primary" size="large">
        Grande
      </MtButton>,
    );
    expect(primaryContainer.firstChild).toHaveClass('primary');
    expect(primaryContainer.firstChild).toHaveClass('large');

    // Variant danger e size small
    const { container: dangerContainer } = render(
      <MtButton variant="danger" size="small">
        Pequeno
      </MtButton>,
    );
    expect(dangerContainer.firstChild).toHaveClass('danger');
    expect(dangerContainer.firstChild).toHaveClass('small');
  });

  it('aplica style de disabled alterando a opacidade', () => {
    const { container } = render(<MtButton disabled>Inativo</MtButton>);
    const btn = container.firstChild as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(btn.style.opacity).toBe('0.5');
  });

  it('aplica type customizado e atributos de acessibilidade', () => {
    render(
      <MtButton type="submit" aria-label="Acessível" title="Dica" autoFocus>
        Acessível
      </MtButton>,
    );
    const btn = screen.getByRole('button', { name: 'Acessível' }) as HTMLButtonElement;
    expect(btn.type).toBe('submit');
    expect(btn.title).toBe('Dica');
    expect(btn).toHaveFocus();
  });
});
