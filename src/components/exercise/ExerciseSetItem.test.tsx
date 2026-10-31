import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseSetItem } from './ExerciseSetItem';
import type { ExerciseSet } from '../../types/workout';

const mockSet: ExerciseSet = {
  repetitions: 12,
  weightInKg: 60,
  restTimeInSeconds: 60,
  advancedTechniques: ['RP'],
};

function renderItem(overrides: Partial<React.ComponentProps<typeof ExerciseSetItem>> = {}) {
  const onDelete = vi.fn();
  const onUpdate = vi.fn();
  const utils = render(
    <ExerciseSetItem
      set={mockSet}
      index={0}
      onDelete={onDelete}
      onUpdate={onUpdate}
      {...overrides}
    />,
  );

  return { ...utils, onDelete, onUpdate };
}

function entrarEmEdicao() {
  fireEvent.click(screen.getByLabelText('Editar série #1'));
}

function obterCamposDeEdicao() {
  const [reps, carga, descanso] = screen.getAllByRole('spinbutton');
  return { reps, carga, descanso };
}

describe('ExerciseSetItem — visualização', () => {
  it('exibe reps, carga e técnicas da série', () => {
    renderItem();

    expect(screen.getByText(/12\s*reps/)).toBeInTheDocument();
    expect(screen.getByText(/60\s*kg/)).toBeInTheDocument();
    expect(screen.getByText('RP')).toBeInTheDocument();
    expect(screen.getByLabelText('Editar série #1')).toBeInTheDocument();
  });

  it('mostra o descanso apenas quando é maior que zero', () => {
    const { unmount } = renderItem();

    expect(screen.getByText(/- 60s/)).toBeInTheDocument();
    unmount();

    renderItem({ set: { ...mockSet, restTimeInSeconds: 0 } });

    expect(screen.queryByText(/-\s*0s/)).not.toBeInTheDocument();
  });
});

describe('ExerciseSetItem — edição', () => {
  it('entra no modo de edição ao clicar no botão de editar', () => {
    renderItem();

    entrarEmEdicao();

    expect(screen.getByText('Série #1')).toBeInTheDocument();
    expect(screen.getByTitle('Salvar edição')).toBeInTheDocument();
    expect(screen.queryByLabelText('Editar série #1')).not.toBeInTheDocument();
  });

  it('salva reps, carga e descanso alterados pelos steppers', () => {
    const { onUpdate } = renderItem();

    entrarEmEdicao();

    fireEvent.click(screen.getByLabelText('Aumentar Reps'));
    fireEvent.click(screen.getByLabelText('Diminuir Carga'));
    fireEvent.click(screen.getByLabelText('Aumentar Descanso'));

    fireEvent.click(screen.getByTitle('Salvar edição'));

    expect(onUpdate).toHaveBeenCalledWith(0, {
      ...mockSet,
      repetitions: 13,
      weightInKg: 59,
      restTimeInSeconds: 75,
    });
  });

  it('salva os valores digitados manualmente nos campos', () => {
    const { onUpdate } = renderItem();

    entrarEmEdicao();
    const { reps, carga, descanso } = obterCamposDeEdicao();

    fireEvent.change(reps, { target: { value: '20' } });
    fireEvent.change(carga, { target: { value: '82.5' } });
    fireEvent.change(descanso, { target: { value: '45' } });

    fireEvent.click(screen.getByTitle('Salvar edição'));

    expect(onUpdate).toHaveBeenCalledWith(0, {
      ...mockSet,
      repetitions: 20,
      weightInKg: 82.5,
      restTimeInSeconds: 45,
    });
  });

  it('adiciona e remove técnicas avançadas no modo de edição', () => {
    const { onUpdate } = renderItem();

    entrarEmEdicao();

    fireEvent.click(screen.getByRole('button', { name: 'DS' }));
    fireEvent.click(screen.getByRole('button', { name: 'RP' }));
    fireEvent.click(screen.getByTitle('Salvar edição'));

    expect(onUpdate).toHaveBeenCalledWith(0, {
      ...mockSet,
      advancedTechniques: ['DS'],
    });
  });

  it('cancela a edição restaurando os valores originais', () => {
    const { onUpdate } = renderItem();

    entrarEmEdicao();
    const { reps, carga, descanso } = obterCamposDeEdicao();

    fireEvent.change(reps, { target: { value: '30' } });
    fireEvent.change(carga, { target: { value: '100' } });
    fireEvent.change(descanso, { target: { value: '180' } });
    fireEvent.click(screen.getByTitle('Cancelar'));

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.getByText(/12\s*reps/)).toBeInTheDocument();

    entrarEmEdicao();
    const camposRestaurados = obterCamposDeEdicao();

    expect(camposRestaurados.reps).toHaveValue(12);
    expect(camposRestaurados.carga).toHaveValue(60);
    expect(camposRestaurados.descanso).toHaveValue(60);
  });
});

describe('ExerciseSetItem — exclusão', () => {
  it('exige confirmação antes de excluir a série', () => {
    const { onDelete } = renderItem();

    entrarEmEdicao();
    fireEvent.click(screen.getByLabelText('Excluir série #1'));

    expect(screen.getByText('Excluir Série')).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(onDelete).toHaveBeenCalledWith(0);
  });

  it('não exclui quando o usuário cancela a confirmação', () => {
    const { onDelete } = renderItem();

    entrarEmEdicao();
    fireEvent.click(screen.getByLabelText('Excluir série #1'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByText('Série #1')).toBeInTheDocument();
  });
});
