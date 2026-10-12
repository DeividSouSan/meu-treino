import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CueManager } from './CueManager';

describe('CueManager', () => {
  it('renders section title and cues list', () => {
    render(
      <CueManager
        cues={['Manter coluna reta', 'Respirar fundo']}
        onAddCue={vi.fn()}
        onRemoveCue={vi.fn()}
      />,
    );

    expect(screen.getByText('Cues da Sessão (Lembretes)')).toBeInTheDocument();
    expect(screen.getByText('Manter coluna reta')).toBeInTheDocument();
    expect(screen.getByText('Respirar fundo')).toBeInTheDocument();
  });

  it('calls onAddCue when new cue is submitted', () => {
    const handleAdd = vi.fn();
    render(<CueManager cues={[]} onAddCue={handleAdd} onRemoveCue={vi.fn()} />);

    const input = screen.getByPlaceholderText('Ex: Controlar a descida no agachamento');
    fireEvent.change(input, { target: { value: 'Novo lembrete' } });

    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    expect(handleAdd).toHaveBeenCalledWith('Novo lembrete');
  });
});
