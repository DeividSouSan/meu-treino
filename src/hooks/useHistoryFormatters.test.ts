import { describe, it, expect } from 'vitest';
import { useHistoryFormatters } from './useHistoryFormatters';

/**
 * Testes para useHistoryFormatters.
 *
 * Este hook não contém estado nem efeitos colaterais do React — ele só
 * retorna duas funções puras. Por isso podemos chamá-lo diretamente,
 * sem precisar de renderHook nem de um provider de contexto.
 *
 * foco: proteger contra regressões na formatação que o usuário vê
 * (datas e duração) na tela de histórico.
 */
const { formatWorkoutDate, formatWorkoutDuration } = useHistoryFormatters();

describe('formatWorkoutDuration', () => {
  it('formata duração em minutos para o singular correto', () => {
    expect(formatWorkoutDuration(120)).toBe('2 min');
  });

  it('arredonda para cima quando os segundos ultrapassam o meio minuto', () => {
    // 90 segundos = 1,5 min → Math.round(1,5) = 2
    expect(formatWorkoutDuration(90)).toBe('2 min');
  });

  it('arredonda para baixo quando está abaixo do meio minuto', () => {
    // 59 segundos → Math.round(0,983) = 1
    expect(formatWorkoutDuration(59)).toBe('1 min');
  });

  it('formata duração zero corretamente', () => {
    expect(formatWorkoutDuration(0)).toBe('0 min');
  });

  it('formata durações de uma hora ou mais', () => {
    expect(formatWorkoutDuration(3600)).toBe('60 min');
  });
});

describe('formatWorkoutDate', () => {
  it('retorna uma string contendo o ano informado', () => {
    const resultado = formatWorkoutDate('2024-01-15T10:30:00.000Z');
    expect(typeof resultado).toBe('string');
    expect(resultado).toContain('2024');
  });

  it('usa a convenção de data brasileira com separador de barra', () => {
    const resultado = formatWorkoutDate('2024-01-15T10:30:00.000Z');
    // pt-BR utiliza barra (dd/mm/aaaa) e não travessão (yyyy-mm-dd)
    expect(resultado).toMatch(/\//);
  });

  it('formata datas diferentes de forma distinta', () => {
    const dataJaneiro = formatWorkoutDate('2024-01-15T10:30:00.000Z');
    const dataDezembro = formatWorkoutDate('2024-12-20T10:30:00.000Z');
    expect(dataJaneiro).not.toBe(dataDezembro);
  });

  it('não lança exceção para uma string de data inválida', () => {
    expect(() => formatWorkoutDate('nao-e-uma-data')).not.toThrow();
  });
});
