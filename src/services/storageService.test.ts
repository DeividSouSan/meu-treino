import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { WorkoutSession } from '../types/workout';
import {
  getWorkoutHistory,
  saveWorkoutSession,
  deleteWorkoutSession,
  getWorkoutTemplates,
  saveWorkoutTemplate,
  deleteWorkoutTemplate,
  getActiveWorkoutSession,
  saveActiveWorkoutSession,
  getLastBackupWorkoutCount,
  saveLastBackupWorkoutCount,
  clearAllWorkoutData,
} from './storageService';

/**
 * Testes para storageService.
 *
 * storageService é a camada de persistência (LocalStorage). Proteger esta
 * camada contra regressões é essencial: um erro aqui = perda ou corrupção
 * dos dados do usuário.
 *
 * Estratégia: usamos o localStorage real do jsdom, limpando-o entre cada teste
 * e manipulando diretamente os valores armazenados para cobrir casos de
 * corrupção (JSON inválido).
 */

// Chaves internas do armazenamento — espelham as constantes privadas do
// módulo para que os testes de corrupção atuem exatamente sobre os dados certos.
const HISTORY_STORAGE_KEY = 'meu_treino_history';
const TEMPLATE_STORAGE_KEY = 'meu_treino_templates';
const ACTIVE_WORKOUT_STORAGE_KEY = 'meu_treino_active';
const LAST_BACKUP_COUNT_STORAGE_KEY = 'meu_treino_last_backup_count';

function criarSessaoDeTreino(parciais: Partial<WorkoutSession> = {}): WorkoutSession {
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
  };
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getWorkoutHistory', () => {
  it('retorna uma lista vazia quando não há nada salvo', () => {
    expect(getWorkoutHistory()).toEqual([]);
  });

  it('retorna uma lista vazia quando o JSON está corrompido', () => {
    localStorage.setItem(HISTORY_STORAGE_KEY, '{ json invalido');
    expect(getWorkoutHistory()).toEqual([]);
  });

  it('retorna os treinos salvos ordenados da data mais recente para a mais antiga', () => {
    const primeiroTreino = criarSessaoDeTreino({
      id: 'mais-velho',
      date: '2024-01-10T08:00:00.000Z',
    });
    const segundoTreino = criarSessaoDeTreino({
      id: 'mais-novo',
      date: '2024-02-20T12:00:00.000Z',
    });

    saveWorkoutSession(primeiroTreino);
    saveWorkoutSession(segundoTreino);

    const historico = getWorkoutHistory();
    expect(historico[0].id).toBe('mais-novo');
    expect(historico[1].id).toBe('mais-velho');
  });
});

describe('saveWorkoutSession', () => {
  it('adiciona uma nova sessão quando o histórico está vazio', () => {
    const sessao = criarSessaoDeTreino();
    saveWorkoutSession(sessao);

    const historico = getWorkoutHistory();
    expect(historico).toHaveLength(1);
    expect(historico[0]).toEqual(sessao);
  });

  it('atualiza uma sessão existente em vez de duplicar, quando o id coincide', () => {
    const sessaoOriginal = criarSessaoDeTreino({ id: 'sessao-1', name: 'Nome Original' });
    const sessaoAtualizada = criarSessaoDeTreino({ id: 'sessao-1', name: 'Nome Atualizado' });

    saveWorkoutSession(sessaoOriginal);
    saveWorkoutSession(sessaoAtualizada);

    const historico = getWorkoutHistory();
    expect(historico).toHaveLength(1);
    expect(historico[0].name).toBe('Nome Atualizado');
  });

  it('mantém sessões anteriores ao adicionar uma nova', () => {
    const primeiraSessao = criarSessaoDeTreino({ id: 'sessao-1' });
    const segundaSessao = criarSessaoDeTreino({ id: 'sessao-2' });

    saveWorkoutSession(primeiraSessao);
    saveWorkoutSession(segundaSessao);

    expect(getWorkoutHistory()).toHaveLength(2);
  });
});

describe('deleteWorkoutSession', () => {
  it('remove a sessão com o identificador informado', () => {
    const sessaoParaExcluir = criarSessaoDeTreino({ id: 'excluir' });
    const sessaoParaManter = criarSessaoDeTreino({ id: 'manter' });

    saveWorkoutSession(sessaoParaExcluir);
    saveWorkoutSession(sessaoParaManter);

    deleteWorkoutSession('excluir');

    const historico = getWorkoutHistory();
    expect(historico).toHaveLength(1);
    expect(historico[0].id).toBe('manter');
  });

  it('não lança erro quando o identificador não existe no histórico', () => {
    expect(() => deleteWorkoutSession('id-inexistente')).not.toThrow();
  });
});

describe('getWorkoutTemplates', () => {
  it('retorna uma lista vazia quando não há templates salvos', () => {
    expect(getWorkoutTemplates()).toEqual([]);
  });

  it('retorna uma lista vazia quando o JSON está corrompido', () => {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, 'nao-e-json');
    expect(getWorkoutTemplates()).toEqual([]);
  });
});

describe('saveWorkoutTemplate', () => {
  it('salva um novo template', () => {
    const template = criarSessaoDeTreino({ id: 'template-1', isTemplate: true });
    saveWorkoutTemplate(template);

    const templates = getWorkoutTemplates();
    expect(templates).toHaveLength(1);
    expect(templates[0]).toEqual(template);
  });

  it('substitui o template existente quando o id coincide', () => {
    const templateOriginal = criarSessaoDeTreino({ id: 'template-1', name: 'Original' });
    const templateAtualizado = criarSessaoDeTreino({ id: 'template-1', name: 'Atualizado' });

    saveWorkoutTemplate(templateOriginal);
    saveWorkoutTemplate(templateAtualizado);

    expect(getWorkoutTemplates()).toHaveLength(1);
    expect(getWorkoutTemplates()[0].name).toBe('Atualizado');
  });
});

describe('deleteWorkoutTemplate', () => {
  it('remove o template com o identificador informado', () => {
    saveWorkoutTemplate(criarSessaoDeTreino({ id: 'tpl-1', isTemplate: true }));
    saveWorkoutTemplate(criarSessaoDeTreino({ id: 'tpl-2', isTemplate: true }));

    deleteWorkoutTemplate('tpl-1');

    const templates = getWorkoutTemplates();
    expect(templates).toHaveLength(1);
    expect(templates[0].id).toBe('tpl-2');
  });
});

describe('getActiveWorkoutSession', () => {
  it('retorna null quando não há sessão ativa', () => {
    expect(getActiveWorkoutSession()).toBeNull();
  });

  it('retorna null quando o JSON armazenado está corrompido', () => {
    localStorage.setItem(ACTIVE_WORKOUT_STORAGE_KEY, 'corrompido!!!');
    expect(getActiveWorkoutSession()).toBeNull();
  });

  it('retorna a sessão ativa quando ela existe', () => {
    const sessaoAtiva = criarSessaoDeTreino({ id: 'ativa', status: 'in_progress' });
    saveActiveWorkoutSession(sessaoAtiva);

    expect(getActiveWorkoutSession()).toEqual(sessaoAtiva);
  });
});

describe('saveActiveWorkoutSession', () => {
  it('salva a sessão ativa informada', () => {
    const sessao = criarSessaoDeTreino({ id: 'ativa' });
    saveActiveWorkoutSession(sessao);

    expect(getActiveWorkoutSession()).toEqual(sessao);
  });

  it('remove a sessão ativa quando recebe null', () => {
    const sessao = criarSessaoDeTreino({ id: 'ativa' });
    saveActiveWorkoutSession(sessao);
    saveActiveWorkoutSession(null);

    expect(getActiveWorkoutSession()).toBeNull();
  });
});

describe('getLastBackupWorkoutCount', () => {
  it('retorna zero quando nada foi salvo', () => {
    expect(getLastBackupWorkoutCount()).toBe(0);
  });

  it('retorna zero quando o valor salvo não é um número', () => {
    localStorage.setItem(LAST_BACKUP_COUNT_STORAGE_KEY, 'nao-e-numero');
    expect(getLastBackupWorkoutCount()).toBe(0);
  });

  it('retorna a contagem salva anteriormente', () => {
    saveLastBackupWorkoutCount(25);
    expect(getLastBackupWorkoutCount()).toBe(25);
  });
});

describe('saveLastBackupWorkoutCount', () => {
  it('persiste a contagem como string no armazenamento', () => {
    saveLastBackupWorkoutCount(7);
    expect(localStorage.getItem(LAST_BACKUP_COUNT_STORAGE_KEY)).toBe('7');
  });
});

describe('clearAllWorkoutData', () => {
  it('remove todo o histórico, templates, sessão ativa e contagem de backup', () => {
    saveWorkoutSession(criarSessaoDeTreino({ id: 'h-1' }));
    saveWorkoutTemplate(criarSessaoDeTreino({ id: 't-1', isTemplate: true }));
    saveActiveWorkoutSession(criarSessaoDeTreino({ id: 'a-1' }));
    saveLastBackupWorkoutCount(3);

    clearAllWorkoutData();

    expect(getWorkoutHistory()).toEqual([]);
    expect(getWorkoutTemplates()).toEqual([]);
    expect(getActiveWorkoutSession()).toBeNull();
    expect(getLastBackupWorkoutCount()).toBe(0);
  });
});
