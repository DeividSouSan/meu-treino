import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MtStepper } from './MtStepper';

describe('MtStepper', () => {
  it('deve renderizar o label e o valor inicial', () => {
    render(<MtStepper label="Carga" value="30" onChange={() => {}} unit="kg" />);

    expect(screen.getByText('Carga (kg)')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toHaveValue(30);
  });

  it('deve chamar onChange com valor incrementado ao clicar no botão +', () => {
    const handleChange = vi.fn();
    render(<MtStepper label="Reps" value="10" step={1} onChange={handleChange} />);

    const plusButton = screen.getByLabelText('Aumentar Reps');
    fireEvent.click(plusButton);

    expect(handleChange).toHaveBeenCalledWith('11');
  });

  it('deve chamar onChange com valor decrementado ao clicar no botão -', () => {
    const handleChange = vi.fn();
    render(<MtStepper label="Reps" value="10" step={1} onChange={handleChange} />);

    const minusButton = screen.getByLabelText('Diminuir Reps');
    fireEvent.click(minusButton);

    expect(handleChange).toHaveBeenCalledWith('9');
  });

  it('não deve permitir decrementar abaixo do mínimo configurado', () => {
    const handleChange = vi.fn();
    render(<MtStepper label="Reps" value="0" min={0} onChange={handleChange} />);

    const minusButton = screen.getByLabelText('Diminuir Reps');
    expect(minusButton).toBeDisabled();
    fireEvent.click(minusButton);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('deve renderizar chips de incremento rápido e aplicar o salto ao clicar', () => {
    const handleChange = vi.fn();
    render(
      <MtStepper label="Carga" value="20" quickIncrements={[2.5, 5]} onChange={handleChange} />,
    );

    const chip25 = screen.getByText('+2.5');
    const chip5 = screen.getByText('+5');

    expect(chip25).toBeInTheDocument();
    expect(chip5).toBeInTheDocument();

    fireEvent.click(chip5);
    expect(handleChange).toHaveBeenCalledWith('25');
  });

  it('permite digitação direta no input numérico', () => {
    const handleChange = vi.fn();
    render(<MtStepper label="Carga" value="20" onChange={handleChange} />);

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '45' } });

    expect(handleChange).toHaveBeenCalledWith('45');
  });

  it('não deve permitir incrementar acima do máximo configurado', () => {
    const handleChange = vi.fn();
    render(<MtStepper label="Reps" value="10" max={10} onChange={handleChange} />);

    const plusButton = screen.getByLabelText('Aumentar Reps');
    expect(plusButton).toBeDisabled();
    fireEvent.click(plusButton);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('desabilita todos os botões e inputs se disabled = true', () => {
    const handleChange = vi.fn();
    render(
      <MtStepper label="Reps" value="10" disabled onChange={handleChange} quickIncrements={[5]} />,
    );

    const input = screen.getByRole('spinbutton');
    const plusButton = screen.getByLabelText('Aumentar Reps');
    const minusButton = screen.getByLabelText('Diminuir Reps');
    const quickBtn = screen.getByText('+5');

    expect(input).toBeDisabled();
    expect(plusButton).toBeDisabled();
    expect(minusButton).toBeDisabled();
    expect(quickBtn).toBeDisabled();

    // Tentar ajustar via botão QuickIncrement também não deve disparar
    fireEvent.click(quickBtn);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renderiza chips de incremento rápido negativo (exibe o número sem "+" adicional)', () => {
    const handleChange = vi.fn();
    render(<MtStepper label="Carga" value="20" quickIncrements={[-5]} onChange={handleChange} />);

    const chipMinus5 = screen.getByText('-5');
    expect(chipMinus5).toBeInTheDocument();

    fireEvent.click(chipMinus5);
    expect(handleChange).toHaveBeenCalledWith('15');
  });

  it('utiliza fallback para 0 caso value seja string não numérica no handleAdjust', () => {
    const handleChange = vi.fn();
    render(<MtStepper label="Reps" value="inválido" step={1} onChange={handleChange} />);

    const plusButton = screen.getByLabelText('Aumentar Reps');
    fireEvent.click(plusButton);

    // Como "inválido" vira 0, 0 + 1 = 1
    expect(handleChange).toHaveBeenCalledWith('1');
  });

  it('deve definir o valor diretamente quando setValueOnQuickIncrement for true e ocultar o sinal +', () => {
    const handleChange = vi.fn();
    render(
      <MtStepper
        label="Descanso"
        value="30"
        quickIncrements={[60]}
        setValueOnQuickIncrement={true}
        onChange={handleChange}
      />,
    );

    // O chip deve exibir "60" ao invés de "+60"
    const chip = screen.getByText('60');
    expect(chip).toBeInTheDocument();
    expect(screen.queryByText('+60')).not.toBeInTheDocument();

    fireEvent.click(chip);
    expect(handleChange).toHaveBeenCalledWith('60');
  });
});
