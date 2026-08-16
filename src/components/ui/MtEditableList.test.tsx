import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MtEditableList, MtEditableListItem } from './MtEditableList';

describe('MtEditableList', () => {
  const items: MtEditableListItem[] = [
    { id: '1', content: 'Item 1' },
    { id: '2', content: 'Item 2' },
  ];

  it('renderiza emptyMessage quando a lista está vazia', () => {
    render(<MtEditableList items={[]} onRemove={() => {}} emptyMessage="Vazio" />);
    expect(screen.getByText('Vazio')).toBeInTheDocument();
  });

  it('renderiza os itens usando o defaultRenderItem', () => {
    render(<MtEditableList items={items} onRemove={() => {}} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Remover' })).toHaveLength(2);
  });

  it('chama onRemove com o ID correto ao clicar no botão de remover', () => {
    const handleRemove = vi.fn();
    render(<MtEditableList items={items} onRemove={handleRemove} />);
    
    const removeButtons = screen.getAllByRole('button', { name: 'Remover' });
    fireEvent.click(removeButtons[0]);
    
    expect(handleRemove).toHaveBeenCalledTimes(1);
    expect(handleRemove).toHaveBeenCalledWith('1');
  });

  it('permite o uso de renderItem customizado', () => {
    const customRender = (item: MtEditableListItem) => (
      <div data-testid="custom-render">{item.content}</div>
    );
    
    render(<MtEditableList items={items} onRemove={() => {}} renderItem={customRender} />);
    
    const customItems = screen.getAllByTestId('custom-render');
    expect(customItems).toHaveLength(2);
    expect(customItems[1]).toHaveTextContent('Item 2');
    
    // O default não deve ter renderizado os botões normais
    expect(screen.queryByRole('button', { name: 'Remover' })).not.toBeInTheDocument();
  });
});
