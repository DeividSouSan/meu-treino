import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MtSuggestionDropdown, MtSuggestionItem } from './MtSuggestionDropdown';

describe('MtSuggestionDropdown', () => {
  const suggestions: MtSuggestionItem[] = [
    { id: '1', label: 'Opção 1' },
    { id: '2', label: 'Opção 2' },
  ];

  it('não renderiza nada se a lista de sugestões for vazia', () => {
    const { container } = render(<MtSuggestionDropdown suggestions={[]} onSelect={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza os itens de sugestão corretamente usando defaultRenderItem', () => {
    render(<MtSuggestionDropdown suggestions={suggestions} onSelect={() => {}} />);
    expect(screen.getByText('Opção 1')).toBeInTheDocument();
    expect(screen.getByText('Opção 2')).toBeInTheDocument();
  });

  it('chama onSelect ao clicar em uma sugestão', () => {
    const handleSelect = vi.fn();
    render(<MtSuggestionDropdown suggestions={suggestions} onSelect={handleSelect} />);
    
    fireEvent.click(screen.getByText('Opção 2'));
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith({ id: '2', label: 'Opção 2' });
  });

  it('permite usar renderItem customizado', () => {
    const customRender = (item: MtSuggestionItem) => <button data-testid="custom-item">{item.label}</button>;
    
    render(<MtSuggestionDropdown suggestions={suggestions} onSelect={() => {}} renderItem={customRender} />);
    
    const customItems = screen.getAllByTestId('custom-item');
    expect(customItems).toHaveLength(2);
    expect(customItems[0]).toHaveTextContent('Opção 1');
  });
});
