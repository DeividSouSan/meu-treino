import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MtTextArea } from './MtTextArea';

describe('MtTextArea', () => {
  it('deve renderizar o componente com label e valor correto', () => {
    render(<MtTextArea label="Notas" value="Anotação de teste" onChangeValue={() => {}} />);

    expect(screen.getByLabelText('Notas')).toBeInTheDocument();
    expect(screen.getByLabelText('Notas')).toHaveValue('Anotação de teste');
  });

  it('deve chamar onChangeValue ao digitar no textarea', () => {
    const handleChangeValue = vi.fn();
    render(<MtTextArea label="Notas" value="" onChangeValue={handleChangeValue} />);

    const textarea = screen.getByLabelText('Notas');
    fireEvent.change(textarea, { target: { value: 'Nova anotação' } });

    expect(handleChangeValue).toHaveBeenCalledWith('Nova anotação');
  });

  it('deve renderizar com o placeholder correto', () => {
    render(
      <MtTextArea label="Notas" value="" placeholder="Digite algo..." onChangeValue={() => {}} />,
    );

    expect(screen.getByPlaceholderText('Digite algo...')).toBeInTheDocument();
  });
});
