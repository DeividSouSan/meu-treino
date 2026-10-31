import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CueManager } from './CueManager';

const PLACEHOLDER = 'Ex: Controlar a descida no agachamento';

function renderCueManager(overrides: Partial<React.ComponentProps<typeof CueManager>> = {}) {
  const onAddCue = vi.fn();
  const onRemoveCue = vi.fn();
  const utils = render(
    <CueManager cues={[]} onAddCue={onAddCue} onRemoveCue={onRemoveCue} {...overrides} />,
  );

  return { ...utils, onAddCue, onRemoveCue };
}

function enviarLembrete(texto: string) {
  const input = screen.getByPlaceholderText(PLACEHOLDER);
  fireEvent.change(input, { target: { value: texto } });

  const form = input.closest('form');
  if (form) {
    fireEvent.submit(form);
  }

  return input;
}

describe('CueManager', () => {
  it('exibe o título da seção e a lista de lembretes', () => {
    renderCueManager({ cues: ['Manter coluna reta', 'Respirar fundo'] });

    expect(screen.getByText('Cues da Sessão (Lembretes)')).toBeInTheDocument();
    expect(screen.getByText('Manter coluna reta')).toBeInTheDocument();
    expect(screen.getByText('Respirar fundo')).toBeInTheDocument();
  });

  it('exibe o estado vazio quando não há lembretes', () => {
    renderCueManager();

    expect(screen.getByText('Nenhum lembrete adicionado')).toBeInTheDocument();
  });

  it('adiciona um lembrete e limpa o campo de texto', () => {
    const { onAddCue } = renderCueManager();

    const input = enviarLembrete('Novo lembrete');

    expect(onAddCue).toHaveBeenCalledWith('Novo lembrete');
    expect(input).toHaveValue('');
  });

  it('remove espaços em volta do lembrete antes de adicionar', () => {
    const { onAddCue } = renderCueManager();

    enviarLembrete('   Aquecer bem   ');

    expect(onAddCue).toHaveBeenCalledWith('Aquecer bem');
  });

  it('não adiciona lembretes vazios ou compostos apenas por espaços', () => {
    const { onAddCue } = renderCueManager();

    enviarLembrete('    ');

    expect(onAddCue).not.toHaveBeenCalled();
  });

  it('remove o lembrete correto pelo índice', () => {
    const { onRemoveCue } = renderCueManager({
      cues: ['Primeiro', 'Segundo', 'Terceiro'],
    });

    const botoesRemover = screen.getAllByTitle('Remover');
    expect(botoesRemover).toHaveLength(3);

    fireEvent.click(botoesRemover[1]);

    expect(onRemoveCue).toHaveBeenCalledWith(1);
  });
});
