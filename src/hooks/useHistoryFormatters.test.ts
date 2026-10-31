import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHistoryFormatters } from './useHistoryFormatters';

/**
 * Testes para useHistoryFormatters.
 *
 * Foco: proteger contra regressões na formatação que o usuário vê
 * (datas e duração) na tela de histórico.
 */
describe('formatWorkoutDuration', () => {
  const { result } = renderHook(() => useHistoryFormatters());
  const { formatWorkoutDuration } = result.current;

  it('formata a duração em minutos', () => {
    expect(formatWorkoutDuration(120)).toBe('2 min');
  });

  it('arredonda para cima a partir de meio minuto', () => {
    // 90 segundos = 1,5 min → Math.round(1,5) = 2
    expect(formatWorkoutDuration(90)).toBe('2 min');
    expect(formatWorkoutDuration(30)).toBe('1 min');
  });

  it('arredonda para baixo quando está abaixo do meio minuto', () => {
    // 29 segundos = 0,483 min → 0
    expect(formatWorkoutDuration(29)).toBe('0 min');
    // 89 segundos = 1,483 min → 1
    expect(formatWorkoutDuration(89)).toBe('1 min');
  });

  it('formata duração zero corretamente', () => {
    expect(formatWorkoutDuration(0)).toBe('0 min');
  });

  it('formata durações de uma hora ou mais sem converter para horas', () => {
    expect(formatWorkoutDuration(3600)).toBe('60 min');
    expect(formatWorkoutDuration(5400)).toBe('90 min');
  });
});

describe('formatWorkoutDate', () => {
  const { result } = renderHook(() => useHistoryFormatters());
  const { formatWorkoutDate } = result.current;

  it('formata a data no padrão brasileiro dd/mm/aaaa com hora e minuto', () => {
    const resultado = formatWorkoutDate('2024-01-15T10:30:00.000Z');

    expect(resultado).toMatch(/^\d{2}\/\d{2}\/2024, \d{2}:\d{2}$/);
    expect(resultado).toContain('15/01/2024');
  });

  it('formata datas diferentes de forma distinta', () => {
    const dataJaneiro = formatWorkoutDate('2024-01-15T10:30:00.000Z');
    const dataDezembro = formatWorkoutDate('2024-12-20T10:30:00.000Z');

    expect(dataJaneiro).not.toBe(dataDezembro);
    expect(dataDezembro).toContain('20/12/2024');
  });

  it('retorna "Invalid Date" para uma string de data inválida, sem lançar exceção', () => {
    expect(formatWorkoutDate('nao-e-uma-data')).toBe('Invalid Date');
  });
});
