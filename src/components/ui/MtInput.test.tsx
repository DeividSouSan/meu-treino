import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MtInput } from './MtInput';

describe('MtInput', () => {
  it('renderiza o input e repassa o value corretamente', () => {
    render(<MtInput value="Texto" onChange={() => {}} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('Texto');
  });

  it('chama onChange quando o valor muda', () => {
    const handleChange = vi.fn();
    render(<MtInput value="" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Novo' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('aceita propriedades de tipo (number), placeholder, style e onKeyDown', () => {
    const handleKeyDown = vi.fn();
    render(
      <MtInput
        value="5"
        onChange={() => {}}
        type="number"
        placeholder="Valor numérico"
        style={{ color: 'blue' }}
        onKeyDown={handleKeyDown}
      />
    );
    
    const input = screen.getByPlaceholderText('Valor numérico') as HTMLInputElement;
    expect(input.type).toBe('number');
    expect(input.style.color).toBe('blue');

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });
});
