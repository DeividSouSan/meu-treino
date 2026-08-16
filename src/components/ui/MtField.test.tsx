import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MtField } from './MtField';

describe('MtField', () => {
  it('renderiza o label e o input corretamente', () => {
    render(<MtField label="Meu Campo" value="" onChange={() => {}} />);
    expect(screen.getByText('Meu Campo')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('repassa a propriedade value para o input', () => {
    render(<MtField label="Campo" value="Valor Inicial" onChange={() => {}} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('Valor Inicial');
  });

  it('chama onChange quando o valor muda', () => {
    const handleChange = vi.fn();
    render(<MtField label="Campo" value="" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Novo Valor' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('aceita propriedades de tipo (number), required, placeholder e step', () => {
    render(
      <MtField
        label="Número"
        value="10"
        onChange={() => {}}
        type="number"
        placeholder="Insira um número"
        required
        step="0.5"
      />
    );
    
    const input = screen.getByPlaceholderText('Insira um número') as HTMLInputElement;
    expect(input.type).toBe('number');
    expect(input.required).toBe(true);
    expect(input.step).toBe('0.5');
  });

  it('aplica estilo customizado (style e labelStyle)', () => {
    const { container } = render(
      <MtField
        label="Estilizado"
        value=""
        onChange={() => {}}
        style={{ margin: '10px' }}
        labelStyle={{ color: 'red' }}
      />
    );
    
    const div = container.firstChild as HTMLElement;
    expect(div.style.margin).toBe('10px');
    
    const label = screen.getByText('Estilizado');
    expect(label.style.color).toBe('red');
  });
});
