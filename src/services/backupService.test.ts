import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { exportWorkoutBackup, importWorkoutBackup } from './backupService';
import { saveWorkoutSession, getWorkoutHistory, getLastBackupWorkoutCount } from './storageService';
import type { WorkoutSession } from '../types/workout';

/**
 * Testes para backupService.
 *
 * A camada de backup é onde a integridade dos dados do usuário entra em
 * risco: uma importação mal validada pode destruir o histórico, e uma
 * exportação com formato errado pode gerar backups inúteis.
 *
 * Estratégia: importWorkoutBackup é a parte "pura" (validação de JSON) e
 * é testada isoladamente contra o LocalStorage real. exportWorkoutBackup
 * tem side-effects de DOM, então damos mock apenas nas APIs de URL e no
 * clique do link de download, deixando o resto como o jsdom fornece.
 */

function criarSessaoDeTreinoValida(parciais: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: 'sessao-1',
    date: '2024-01-15T10:30:00.000Z',
    durationInSeconds: 1200,
    name: 'Treino de Peito',
    cues: ['Controlar a descida'],
    exercises: [],
    isTemplate: false,
    status: 'completed',
    ...parciais,
  } as WorkoutSession;
}

/**
 * Uma sessão válida precisa de todos os campos checados por
 * isValidWorkoutSession: id, date, durationInSeconds, name, cues, exercises.
 */
function sessaoValidaJSON(id: string): WorkoutSession {
  return criarSessaoDeTreinoValida({ id });
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('importWorkoutBackup', () => {
  it('retorna true e salva todas as sessões válidas quando o JSON é bem-formado', () => {
    const backupJson = JSON.stringify({
      version: 1,
      history: [sessaoValidaJSON('s1'), sessaoValidaJSON('s2')],
    });

    const result = importWorkoutBackup(backupJson);
    expect(result.success).toBe(true);
    expect(result.count).toBe(2);

    const historico = getWorkoutHistory();
    expect(historico).toHaveLength(2);
    expect(historico.map((s) => s.id).sort()).toEqual(['s1', 's2']);
  });

  it('descarta apenas as sessões inválidas e mantém as válidas', () => {
    const backupJson = JSON.stringify({
      version: 1,
      history: [
        sessaoValidaJSON('valida'),
        { id: 'incompleta' }, // falta date, name, cues, exercises...
        { id: 123, date: 'x' }, // tipos errados
      ],
    });

    const result = importWorkoutBackup(backupJson);
    expect(result.success).toBe(true);
    expect(result.count).toBe(1);

    const historico = getWorkoutHistory();
    expect(historico).toHaveLength(1);
    expect(historico[0].id).toBe('valida');
  });

  it('retorna false quando a string não é JSON válido', () => {
    expect(importWorkoutBackup('{ json totalmente invalido').success).toBe(false);
  });

  it('retorna false quando o JSON parseado não é um objeto', () => {
    expect(importWorkoutBackup('123').success).toBe(false);
    expect(importWorkoutBackup('null').success).toBe(false);
  });

  it('retorna false quando a propriedade history não é um array (e não é uma sessão individual válida)', () => {
    const backupJson = JSON.stringify({ version: 1, history: 'nao-e-array' });
    expect(importWorkoutBackup(backupJson).success).toBe(false);
  });

  it('retorna true e salva nada quando o histórico vem vazio', () => {
    const backupJson = JSON.stringify({ version: 1, history: [] });

    const result = importWorkoutBackup(backupJson);
    expect(result.success).toBe(true);
    expect(result.count).toBe(0);
    expect(getWorkoutHistory()).toEqual([]);
  });

  it('atualiza a contagem de backup para a quantidade de sessões importadas', () => {
    const backupJson = JSON.stringify({
      version: 1,
      history: [sessaoValidaJSON('s1'), sessaoValidaJSON('s2'), sessaoValidaJSON('s3')],
    });

    importWorkoutBackup(backupJson);

    expect(getLastBackupWorkoutCount()).toBe(3);
  });
});

describe('exportWorkoutBackup', () => {
  it('inicia o download de um arquivo JSON contendo o histórico atual', async () => {
    saveWorkoutSession(sessaoValidaJSON('s1'));
    saveWorkoutSession(sessaoValidaJSON('s2'));

    const blobEnviado = prepararCapturaDeDownload();
    exportWorkoutBackup();
    const blobResultante = await blobEnviado;

    // O download foi disparado (createObjectURL chamado com um Blob)
    expect(blobResultante).toBeInstanceOf(Blob);

    // O conteúdo do backup reflete o histórico salvo
    const conteudoExportado = JSON.parse(await blobResultante.text());
    expect(conteudoExportado.version).toBe(1);
    expect(conteudoExportado.history).toHaveLength(2);
    expect(conteudoExportado.history.map((s: WorkoutSession) => s.id).sort()).toEqual(['s1', 's2']);
  });

  it('atualiza a contagem de backup para o tamanho do histórico exportado', () => {
    prepararAmbienteDeDownloadSilencioso();

    // Primeiro backup com 0 treinos → contagem 0
    exportWorkoutBackup();
    expect(getLastBackupWorkoutCount()).toBe(0);

    // Agora com 2 treinos → contagem 2
    saveWorkoutSession(sessaoValidaJSON('s1'));
    saveWorkoutSession(sessaoValidaJSON('s2'));
    exportWorkoutBackup();
    expect(getLastBackupWorkoutCount()).toBe(2);
  });

  it('inicia o download mesmo quando o histórico está vazio', async () => {
    const blobEnviado = prepararCapturaDeDownload();
    exportWorkoutBackup();
    const blobResultante = await blobEnviado;

    expect(blobResultante).toBeInstanceOf(Blob);
    const conteudoExportado = JSON.parse(await blobResultante.text());
    expect(conteudoExportado.history).toEqual([]);
  });
});

/**
 * Espiona URL.createObjectURL e URL.revokeObjectURL, e também o clique do
 * link de download, evitando warnings de navegação do jsdom.
 *
 * Usado nos testes em que só nos importa que o download seja disparado
 * e que a contagem de backup seja atualizada.
 */
function prepararAmbienteDeDownloadSilencioso(): void {
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url-falso');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
}

/**
 * Instala espionas em URL.createObjectURL/URL.revokeObjectURL e no clique do
 * link, e devolve uma promessa que resolve com o Blob passado para
 * createObjectURL. Assim inspecionamos o conteúdo do arquivo gerado sem
 * poluir o navegador.
 *
 * A promessa é criada ANTES de chamar exportWorkoutBackup, de modo que os
 * spies já estejam instalados quando o download for disparado.
 */
function prepararCapturaDeDownload(): Promise<Blob> {
  return new Promise<Blob>((resolve) => {
    vi.spyOn(URL, 'createObjectURL').mockImplementation((objeto: Blob | MediaSource) => {
      if (objeto instanceof Blob) {
        resolve(objeto);
      }
      return 'blob:url-falso';
    });
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
  });
}
