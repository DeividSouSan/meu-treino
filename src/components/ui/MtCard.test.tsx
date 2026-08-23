import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MtCard } from './MtCard';

describe('MtCard', () => {
  it('renderiza o conteúdo (children) corretamente', () => {
    render(
      <MtCard>
        <span data-testid="child">Conteúdo</span>
      </MtCard>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
  });

  it('renderiza como a tag especificada na propriedade "as"', () => {
    const { container: divContainer } = render(<MtCard as="div">Div</MtCard>);
    expect(divContainer.querySelector('div')).toBeInTheDocument();

    const { container: sectionContainer } = render(<MtCard as="section">Section</MtCard>);
    expect(sectionContainer.querySelector('section')).toBeInTheDocument();

    const { container: articleContainer } = render(<MtCard as="article">Article</MtCard>);
    expect(articleContainer.querySelector('article')).toBeInTheDocument();
  });

  it('aplica classes adicionais preservando a classe base "card"', () => {
    const { container } = render(<MtCard className="minha-classe-extra">X</MtCard>);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('card');
    expect(el).toHaveClass('minha-classe-extra');
  });

  it('repassa estilo customizado (style)', () => {
    const { container } = render(<MtCard style={{ marginTop: '10px' }}>X</MtCard>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.marginTop).toBe('10px');
  });

  it('dispara evento onClick quando clicado', () => {
    const handleClick = vi.fn();
    render(
      <MtCard onClick={handleClick} data-testid="card">
        Botão Card
      </MtCard>,
    );

    // Precisamos buscar pelo texto para usar fireEvent
    fireEvent.click(screen.getByText('Botão Card'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('aceita propriedades de acessibilidade (role, tabIndex, onKeyDown)', () => {
    const handleKeyDown = vi.fn();
    render(
      <MtCard role="button" tabIndex={0} onKeyDown={handleKeyDown}>
        Card Acessível
      </MtCard>,
    );

    const card = screen.getByText('Card Acessível');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabindex', '0');

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });
});
