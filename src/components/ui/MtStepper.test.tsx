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
      <MtStepper
        label="Carga"
        value="20"
        quickIncrements={[2.5, 5]}
        onChange={handleChange}
      />
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
});
