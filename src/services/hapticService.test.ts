import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { hapticService } from './hapticService';

describe('hapticService', () => {
  const originalVibrate = navigator.vibrate;

  beforeEach(() => {
    // Mock navigator.vibrate
    navigator.vibrate = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    navigator.vibrate = originalVibrate;
  });

  it('deve disparar vibração de toque leve com 20ms', () => {
    hapticService.lightTap();
    expect(navigator.vibrate).toHaveBeenCalledWith(20);
  });

  it('deve disparar vibração de sucesso com 45ms', () => {
    hapticService.success();
    expect(navigator.vibrate).toHaveBeenCalledWith(45);
  });

  it('deve disparar padrão de vibração de finalização do timer [180, 80, 180]', () => {
    hapticService.timerFinished();
    expect(navigator.vibrate).toHaveBeenCalledWith([180, 80, 180]);
  });

  it('não deve lançar erro se navigator.vibrate lançar exceção', () => {
    navigator.vibrate = vi.fn().mockImplementation(() => {
      throw new Error('Permissão negada');
    });

    expect(() => hapticService.success()).not.toThrow();
  });

  it('não deve falhar se navigator.vibrate for undefined', () => {
    // @ts-expect-error testando ausência de vibrate
    delete navigator.vibrate;

    expect(() => hapticService.lightTap()).not.toThrow();
    expect(() => hapticService.success()).not.toThrow();
    expect(() => hapticService.timerFinished()).not.toThrow();
  });
});
