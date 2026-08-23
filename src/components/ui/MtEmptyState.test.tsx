import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MtEmptyState } from './MtEmptyState';

describe('MtEmptyState', () => {
  describe('Tamanho: large (Padrão)', () => {
    it('renderiza o título corretamente', () => {
      render(<MtEmptyState title="Nenhum dado encontrado" />);
      expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();
    });

    it('renderiza a descrição quando provida', () => {
      render(<MtEmptyState title="Título" description="Descrição detalhada aqui." />);
      expect(screen.getByText('Descrição detalhada aqui.')).toBeInTheDocument();
    });

    it('renderiza o ícone quando provido', () => {
      render(<MtEmptyState title="Título" icon={<svg data-testid="icon" />} />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renderiza o botão de ação e dispara evento ao clicar', () => {
      const handleAction = vi.fn();
      render(
        <MtEmptyState title="Título" actionLabel="Tentar Novamente" onAction={handleAction} />,
      );

      const btn = screen.getByRole('button', { name: 'Tentar Novamente' });
      expect(btn).toBeInTheDocument();

      fireEvent.click(btn);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('alinha corretamente os itens de acordo com a propriedade "align"', () => {
      // Default: align="center"
      const { container: centerContainer } = render(<MtEmptyState title="Centralizado" />);
      const centerDiv = centerContainer.firstChild as HTMLElement;
      expect(centerDiv.style.alignItems).toBe('center');
      expect(centerDiv.style.textAlign).toBe('center');

      // align="left"
      const { container: leftContainer } = render(<MtEmptyState title="Esquerda" align="left" />);
      const leftDiv = leftContainer.firstChild as HTMLElement;
      expect(leftDiv.style.alignItems).toBe('flex-start');
      expect(leftDiv.style.textAlign).toBe('left');
    });

    it('aplica estilo customizado (style e titleStyle)', () => {
      const { container } = render(
        <MtEmptyState
          title="Customizado"
          style={{ padding: '10px' }}
          titleStyle={{ color: 'blue' }}
        />,
      );

      const wrapperDiv = container.firstChild as HTMLElement;
      expect(wrapperDiv.style.padding).toBe('10px');

      const titleEl = screen.getByText('Customizado');
      expect(titleEl.style.color).toBe('blue');
    });
  });

  describe('Tamanho: small', () => {
    it('renderiza apenas o título compacto se não houver descrição ou ação', () => {
      const { container } = render(<MtEmptyState size="small" title="Vazio compacto" />);
      const p = container.firstChild as HTMLElement;
      expect(p.tagName).toBe('P');
      expect(p).toHaveTextContent('Vazio compacto');
      expect(p.style.fontSize).toBe('0.85rem');
    });

    it('renderiza com descrição e botão de ação compacto', () => {
      const handleAction = vi.fn();
      render(
        <MtEmptyState
          size="small"
          title="Vazio compacto"
          description="Algo compacto"
          actionLabel="Agir"
          onAction={handleAction}
        />,
      );

      expect(screen.getByText('Vazio compacto')).toBeInTheDocument();
      expect(screen.getByText('Algo compacto')).toBeInTheDocument();

      const btn = screen.getByRole('button', { name: 'Agir' });
      expect(btn).toBeInTheDocument();

      fireEvent.click(btn);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });
  });
});
