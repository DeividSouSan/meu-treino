import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MtInputForm } from './MtInputForm';

describe('MtInputForm', () => {
  it('renderiza o formulário com input e botão', () => {
    render(
      <MtInputForm
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
        placeholder="Digite algo"
        submitButtonContent="Enviar"
      />
    );
    
    expect(screen.getByPlaceholderText('Digite algo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();
  });

  it('chama onSubmit ao submeter o formulário se o valor não estiver vazio', () => {
    const handleSubmit = vi.fn();
    render(
      <MtInputForm
        value="Meu Valor"
        onChange={() => {}}
        onSubmit={handleSubmit}
        submitButtonContent="Enviar"
      />
    );
    
    const btn = screen.getByRole('button', { name: 'Enviar' });
    fireEvent.click(btn); // Clicar no botão type="submit" dentro de um form dispara onSubmit
    
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith('Meu Valor'); // Verifica o trim()
  });

  it('não chama onSubmit se o valor for vazio ou apenas espaços em branco', () => {
    const handleSubmit = vi.fn();
    render(
      <MtInputForm
        value="   "
        onChange={() => {}}
        onSubmit={handleSubmit}
        submitButtonContent="Enviar"
      />
    );
    
    const btn = screen.getByRole('button', { name: 'Enviar' });
    fireEvent.click(btn);
    
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('repassa onKeyDown e styles corretamente', () => {
    const handleKeyDown = vi.fn();
    render(
      <MtInputForm
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
        submitButtonContent="X"
        onKeyDown={handleKeyDown}
        inputStyle={{ color: 'red' }}
        submitButtonStyle={{ background: 'blue' }}
        placeholder="Teste"
      />
    );
    
    const input = screen.getByPlaceholderText('Teste') as HTMLInputElement;
    expect(input.style.color).toBe('red');

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(handleKeyDown).toHaveBeenCalledTimes(1);

    const btn = screen.getByRole('button', { name: 'X' });
    expect(btn.style.background).toBe('blue');
  });
});
