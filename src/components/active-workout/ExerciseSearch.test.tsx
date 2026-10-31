import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseSearch } from './ExerciseSearch';

const PLACEHOLDER = 'Buscar ou digitar nome do exercício...';

function renderSearch(sugestoes: { id: string; name: string }[] = []) {
  const onAddExercise = vi.fn();
  const getSuggestions = vi.fn().mockReturnValue(sugestoes);
  const utils = render(
    <ExerciseSearch onAddExercise={onAddExercise} getSuggestions={getSuggestions} />,
  );

  return { ...utils, onAddExercise, getSuggestions };
}

function digitar(texto: string) {
  const input = screen.getByPlaceholderText(PLACEHOLDER);
  fireEvent.change(input, { target: { value: texto } });
  return input;
}

describe('ExerciseSearch', () => {
  it('exibe o campo de busca e o título da seção', () => {
    renderSearch();

    expect(screen.getByText('Adicionar Exercício')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(PLACEHOLDER)).toBeInTheDocument();
  });

  it('adiciona o exercício digitado ao clicar no botão e limpa o campo', () => {
    const { onAddExercise } = renderSearch();

    const input = digitar('Remada Curvada');
    fireEvent.click(screen.getByRole('button'));

    expect(onAddExercise).toHaveBeenCalledWith('Remada Curvada');
    expect(input).toHaveValue('');
  });

  it('adiciona o exercício digitado ao pressionar Enter e limpa o campo', () => {
    const { onAddExercise } = renderSearch();

    const input = digitar('Agachamento Livre');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onAddExercise).toHaveBeenCalledWith('Agachamento Livre');
    expect(input).toHaveValue('');
  });

  it('ignora outras teclas no campo de busca', () => {
    const { onAddExercise } = renderSearch();

    fireEvent.keyDown(digitar('Supino'), { key: 'Tab' });

    expect(onAddExercise).not.toHaveBeenCalled();
  });

  it('busca sugestões conforme o usuário digita', () => {
    const sugestoes = [
      { id: 'supino-reto', name: 'Supino Reto' },
      { id: 'supino-inclinado', name: 'Supino Inclinado' },
    ];
    const { getSuggestions } = renderSearch(sugestoes);

    digitar('supino');

    expect(getSuggestions).toHaveBeenCalledWith('supino');
    expect(screen.getByText('Supino Reto')).toBeInTheDocument();
    expect(screen.getByText('Supino Inclinado')).toBeInTheDocument();
  });

  it('não busca sugestões quando o campo está vazio ou só com espaços', () => {
    const { getSuggestions } = renderSearch();

    digitar('   ');

    expect(getSuggestions).not.toHaveBeenCalled();
    expect(screen.queryByText('Supino Reto')).not.toBeInTheDocument();
  });

  it('adiciona o exercício ao selecionar uma sugestão e fecha a lista', () => {
    const { onAddExercise } = renderSearch([{ id: 'supino-reto', name: 'Supino Reto' }]);

    const input = digitar('sup');
    fireEvent.click(screen.getByText('Supino Reto'));

    expect(onAddExercise).toHaveBeenCalledWith('Supino Reto');
    expect(input).toHaveValue('');
    expect(screen.queryByText('Supino Reto')).not.toBeInTheDocument();
  });
});
