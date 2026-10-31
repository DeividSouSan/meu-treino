import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BackupSection } from './BackupSection';

const useBackupSectionMock = vi.fn();

vi.mock('./useBackupSection', () => ({
  useBackupSection: (...args: unknown[]) => useBackupSectionMock(...args),
}));

function configurarHook(overrides: Record<string, unknown> = {}) {
  useBackupSectionMock.mockReturnValue({
    workoutsSinceLastBackup: 0,
    exportBackup: vi.fn(),
    importBackup: vi.fn(),
    ...overrides,
  });
}

function selecionarArquivo(container: HTMLElement, conteudo: string) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  const arquivo = new File([conteudo], 'backup.json', { type: 'application/json' });
  fireEvent.change(input, { target: { files: [arquivo] } });
}

describe('BackupSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configurarHook();
  });

  it('mostra alerta informativo quando não há treinos pendentes de backup', () => {
    render(
      <BackupSection
        onImportSuccess={vi.fn()}
        onExportSuccess={vi.fn()}
        workoutHistoryLength={3}
      />,
    );

    expect(
      screen.getByText('Todos os treinos registrados estão salvos no último arquivo exportado.'),
    ).toBeInTheDocument();
  });

  it('mostra alerta no singular quando há um treino pendente', () => {
    configurarHook({ workoutsSinceLastBackup: 1 });

    render(
      <BackupSection
        onImportSuccess={vi.fn()}
        onExportSuccess={vi.fn()}
        workoutHistoryLength={3}
      />,
    );

    expect(screen.getByText(/1 treino novo não salvo em arquivo/)).toBeInTheDocument();
  });

  it('mostra alerta no plural quando há vários treinos pendentes', () => {
    configurarHook({ workoutsSinceLastBackup: 4 });

    render(
      <BackupSection
        onImportSuccess={vi.fn()}
        onExportSuccess={vi.fn()}
        workoutHistoryLength={3}
      />,
    );

    expect(screen.getByText(/4 treinos novos não salvos em arquivo/)).toBeInTheDocument();
  });

  it('dispara a exportação e o callback de sucesso ao clicar em Exportar JSON', () => {
    const exportBackup = vi.fn();
    const onExportSuccess = vi.fn();
    configurarHook({ exportBackup });

    render(
      <BackupSection
        onImportSuccess={vi.fn()}
        onExportSuccess={onExportSuccess}
        workoutHistoryLength={2}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /exportar json/i }));

    expect(exportBackup).toHaveBeenCalledTimes(1);
    expect(onExportSuccess).toHaveBeenCalledTimes(1);
  });

  it('exibe mensagem específica ao importar um único treino e chama onImportSuccess ao fechar', async () => {
    const importBackup = vi.fn().mockReturnValue({
      success: true,
      count: 1,
      sessionName: 'Peito e Tríceps',
    });
    const onImportSuccess = vi.fn();
    configurarHook({ importBackup });

    const { container } = render(
      <BackupSection
        onImportSuccess={onImportSuccess}
        onExportSuccess={vi.fn()}
        workoutHistoryLength={0}
      />,
    );

    selecionarArquivo(container, '{"history":[]}');

    await waitFor(() => {
      expect(screen.getByText('Importação Concluída')).toBeInTheDocument();
    });
    expect(
      screen.getByText('O treino "Peito e Tríceps" foi adicionado ao seu histórico com sucesso!'),
    ).toBeInTheDocument();
    expect(onImportSuccess).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));

    expect(onImportSuccess).toHaveBeenCalledTimes(1);
  });

  it('exibe mensagem com a quantidade ao importar vários treinos', async () => {
    configurarHook({
      importBackup: vi.fn().mockReturnValue({ success: true, count: 3 }),
    });

    const { container } = render(
      <BackupSection
        onImportSuccess={vi.fn()}
        onExportSuccess={vi.fn()}
        workoutHistoryLength={0}
      />,
    );

    selecionarArquivo(container, '{"history":[]}');

    await waitFor(() => {
      expect(
        screen.getByText('3 treinos foram importados e sincronizados com seu histórico!'),
      ).toBeInTheDocument();
    });
  });

  it('avisa quando o backup é válido mas não contém treinos novos', async () => {
    configurarHook({
      importBackup: vi.fn().mockReturnValue({ success: true, count: 0 }),
    });

    const { container } = render(
      <BackupSection
        onImportSuccess={vi.fn()}
        onExportSuccess={vi.fn()}
        workoutHistoryLength={0}
      />,
    );

    selecionarArquivo(container, '{"history":[]}');

    await waitFor(() => {
      expect(
        screen.getByText('O backup foi processado, mas nenhum treino novo foi encontrado.'),
      ).toBeInTheDocument();
    });
  });

  it('exibe erro e não chama onImportSuccess quando o arquivo é inválido', async () => {
    const onImportSuccess = vi.fn();
    configurarHook({
      importBackup: vi.fn().mockReturnValue({ success: false, count: 0 }),
    });

    const { container } = render(
      <BackupSection
        onImportSuccess={onImportSuccess}
        onExportSuccess={vi.fn()}
        workoutHistoryLength={0}
      />,
    );

    selecionarArquivo(container, 'nao-e-json');

    await waitFor(() => {
      expect(screen.getByText('Erro na Importação')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));

    expect(onImportSuccess).not.toHaveBeenCalled();
  });

  it('não abre o seletor de arquivo nem importa quando nenhum arquivo é escolhido', () => {
    const importBackup = vi.fn();
    configurarHook({ importBackup });

    const { container } = render(
      <BackupSection
        onImportSuccess={vi.fn()}
        onExportSuccess={vi.fn()}
        workoutHistoryLength={0}
      />,
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [] } });

    expect(importBackup).not.toHaveBeenCalled();
    expect(screen.queryByText('Importação Concluída')).not.toBeInTheDocument();
  });
});
