import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportAISection } from './ExportAISection';
import type { WorkoutSession } from '../../types/workout';

function criarSessao(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: 'sessao',
    date: new Date().toISOString(),
    durationInSeconds: 3000,
    name: 'Treino Recente',
    cues: [],
    isTemplate: false,
    status: 'completed',
    exercises: [
      {
        id: 'e1',
        name: 'Agachamento',
        weightInKg: 100,
        notes: '',
        sets: [{ weightInKg: 100, repetitions: 10, restTimeInSeconds: 90, advancedTechniques: [] }],
      },
    ],
    ...overrides,
  };
}

function diasAtras(dias: number): string {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  return data.toISOString();
}

interface CapturaDeDownload {
  blob: Promise<Blob>;
  nomeDoArquivo: () => string;
}

function prepararCapturaDeDownload(): CapturaDeDownload {
  let nome = '';
  let resolverBlob: (blob: Blob) => void = () => undefined;
  const blob = new Promise<Blob>((resolve) => {
    resolverBlob = resolve;
  });

  vi.spyOn(URL, 'createObjectURL').mockImplementation((objeto: Blob | MediaSource) => {
    if (objeto instanceof Blob) {
      resolverBlob(objeto);
    }
    return 'blob:url-falsa';
  });
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    nome = this.download;
  });

  return { blob, nomeDoArquivo: () => nome };
}

function exportar() {
  fireEvent.click(screen.getByRole('button', { name: /exportar para ia/i }));
}

describe('ExportAISection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza o seletor de período com "Última semana" como padrão', () => {
    render(<ExportAISection workoutHistory={[criarSessao()]} />);

    expect(screen.getAllByText('Exportar para IA').length).toBeGreaterThan(0);
    expect(screen.getByRole('combobox')).toHaveValue('lastWeek');
  });

  it('baixa um arquivo workout.txt com o resumo do período', async () => {
    const captura = prepararCapturaDeDownload();

    render(<ExportAISection workoutHistory={[criarSessao()]} />);
    exportar();

    expect(captura.nomeDoArquivo()).toBe('workout.txt');

    const conteudo = await (await captura.blob).text();
    expect(conteudo).toContain('Treino: Treino Recente');
    expect(conteudo).toContain('1. Agachamento');
    expect(conteudo).toContain('1x10 @ 100kg');
    expect(conteudo).toContain('descanso 90s');
  });

  it('exclui treinos mais antigos que a última semana', async () => {
    const captura = prepararCapturaDeDownload();

    render(
      <ExportAISection
        workoutHistory={[
          criarSessao({ id: 'recente', name: 'Treino Recente', date: diasAtras(2) }),
          criarSessao({ id: 'antigo', name: 'Treino Antigo', date: diasAtras(20) }),
        ]}
      />,
    );
    exportar();

    const conteudo = await (await captura.blob).text();
    expect(conteudo).toContain('Treino Recente');
    expect(conteudo).not.toContain('Treino Antigo');
  });

  it('inclui treinos de até um mês quando o período é alterado', async () => {
    const captura = prepararCapturaDeDownload();

    render(
      <ExportAISection
        workoutHistory={[
          criarSessao({ id: 'recente', name: 'Treino Recente', date: diasAtras(2) }),
          criarSessao({ id: 'antigo', name: 'Treino Antigo', date: diasAtras(20) }),
        ]}
      />,
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'lastMonth' } });
    expect(screen.getByRole('combobox')).toHaveValue('lastMonth');

    exportar();

    const conteudo = await (await captura.blob).text();
    expect(conteudo).toContain('Treino Recente');
    expect(conteudo).toContain('Treino Antigo');
  });

  it('não exporta templates para a IA', async () => {
    const captura = prepararCapturaDeDownload();

    render(
      <ExportAISection
        workoutHistory={[
          criarSessao({ id: 'feito', name: 'Treino Feito' }),
          criarSessao({ id: 'template', name: 'Modelo de Treino', isTemplate: true }),
        ]}
      />,
    );
    exportar();

    const conteudo = await (await captura.blob).text();
    expect(conteudo).toContain('Treino Feito');
    expect(conteudo).not.toContain('Modelo de Treino');
  });

  it('libera a URL temporária depois de iniciar o download', async () => {
    prepararCapturaDeDownload();
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');

    render(<ExportAISection workoutHistory={[criarSessao()]} />);
    exportar();

    await waitFor(() => {
      expect(revokeSpy).toHaveBeenCalledWith('blob:url-falsa');
    });
  });

  it('renderiza dentro de um card por padrão e como bloco simples com asCard={false}', () => {
    const { container, unmount } = render(<ExportAISection workoutHistory={[criarSessao()]} />);
    expect(container.querySelector('section')).toBeInTheDocument();
    unmount();

    const semCard = render(<ExportAISection workoutHistory={[criarSessao()]} asCard={false} />);
    expect(semCard.container.querySelector('section')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
