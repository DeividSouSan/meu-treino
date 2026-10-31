import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStopwatch } from './useStopwatch';

/**
 * useStopwatch usa `Date.now()` como fonte de tempo real. Com fake timers do
 * Vitest o relógio do sistema também é virtualizado, então conseguimos simular
 * a passagem do tempo de forma determinística.
 */
describe('useStopwatch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('inicia parado com os segundos iniciais informados', () => {
    const { result } = renderHook(() => useStopwatch(42));

    expect(result.current.seconds).toBe(42);
    expect(result.current.isRunning).toBe(false);
  });

  it('começa a contar automaticamente quando autoStart = true', () => {
    const { result } = renderHook(() => useStopwatch(0, true));

    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(3_000);
    });

    expect(result.current.seconds).toBe(3);
  });

  it('incrementa os segundos enquanto está rodando', () => {
    const { result } = renderHook(() => useStopwatch());

    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    expect(result.current.seconds).toBe(5);
  });

  it('acumula o tempo ao pausar e não conta enquanto pausado', () => {
    const { result } = renderHook(() => useStopwatch(0, true));

    act(() => {
      vi.advanceTimersByTime(4_000);
    });
    expect(result.current.seconds).toBe(4);

    act(() => result.current.pause());
    expect(result.current.isRunning).toBe(false);

    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(result.current.seconds).toBe(4);

    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(2_000);
    });

    expect(result.current.seconds).toBe(6);
  });

  it('zera e volta a contar ao chamar reset', () => {
    const { result } = renderHook(() => useStopwatch(0, true));

    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(result.current.seconds).toBe(5);

    act(() => result.current.reset());

    expect(result.current.seconds).toBe(0);
    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    expect(result.current.seconds).toBe(2);
  });

  it('define o valor manualmente quando pausado', () => {
    const { result } = renderHook(() => useStopwatch());

    act(() => result.current.setSeconds(50));

    expect(result.current.seconds).toBe(50);
    expect(result.current.isRunning).toBe(false);

    act(() => {
      vi.advanceTimersByTime(3_000);
    });
    expect(result.current.seconds).toBe(50);
  });

  it('reposiciona o ponto de partida ao definir o valor enquanto roda', () => {
    const { result } = renderHook(() => useStopwatch(0, true));

    act(() => {
      vi.advanceTimersByTime(4_000);
    });
    expect(result.current.seconds).toBe(4);

    act(() => result.current.setSeconds(30));
    act(() => {
      vi.advanceTimersByTime(2_000);
    });

    expect(result.current.seconds).toBe(32);
  });

  it('reinicializa quando o valor inicial muda externamente', () => {
    const { result, rerender } = renderHook(({ initialSeconds }) => useStopwatch(initialSeconds), {
      initialProps: { initialSeconds: 10 },
    });

    expect(result.current.seconds).toBe(10);

    rerender({ initialSeconds: 25 });

    expect(result.current.seconds).toBe(25);
    expect(result.current.isRunning).toBe(false);
  });

  it('passa a rodar quando autoStart muda para true', () => {
    const { result, rerender } = renderHook(({ autoStart }) => useStopwatch(0, autoStart), {
      initialProps: { autoStart: false },
    });

    expect(result.current.isRunning).toBe(false);

    rerender({ autoStart: true });

    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    expect(result.current.seconds).toBe(2);
  });
});
