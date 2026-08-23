import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MtSectionTitle } from './MtSectionTitle';

describe('MtSectionTitle', () => {
  it('renderiza o título corretamente', () => {
    render(<MtSectionTitle>Meu Título</MtSectionTitle>);
    expect(screen.getByText('Meu Título')).toBeInTheDocument();
  });

  it('renderiza o ícone quando provido', () => {
    const IconMock = () => <svg data-testid="icone-teste" />;
    render(<MtSectionTitle icon={<IconMock />}>Com Ícone</MtSectionTitle>);

    expect(screen.getByTestId('icone-teste')).toBeInTheDocument();
    expect(screen.getByText('Com Ícone')).toBeInTheDocument();
  });

  it('aplica estilo customizado', () => {
    const { container } = render(
      <MtSectionTitle style={{ marginBottom: '20px' }}>Estilo</MtSectionTitle>,
    );
    const wrapperDiv = container.firstChild as HTMLElement;
    expect(wrapperDiv.style.marginBottom).toBe('20px');
  });
});
