import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useHardwareBackPress } from './useHardwareBackPress';

describe('useHardwareBackPress', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('empurra estado virtual no history quando ativado', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const onBack = vi.fn();

    renderHook(() => useHardwareBackPress(onBack, true));

    expect(pushStateSpy).toHaveBeenCalledWith({ isVirtualBackState: true }, '');
  });

  it('não empurra estado quando desabilitado (enabled = false)', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const onBack = vi.fn();

    renderHook(() => useHardwareBackPress(onBack, false));

    expect(pushStateSpy).not.toHaveBeenCalled();
  });

  it('executa o callback onBack quando o evento popstate é disparado', () => {
    const onBack = vi.fn();

    renderHook(() => useHardwareBackPress(onBack, true));

    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('mantém o handler na pilha após ser acionado (não remove no popstate)', () => {
    const onBack = vi.fn();

    renderHook(() => useHardwareBackPress(onBack, true));

    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(onBack).toHaveBeenCalledTimes(1);

    // O handler permanece na pilha; um novo popstate deve acioná-lo novamente
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(onBack).toHaveBeenCalledTimes(2);
  });

  it('não chama history.back() ao desmontar se o popstate não tiver sido acionado', () => {
    const backSpy = vi.spyOn(window.history, 'back');
    const onBack = vi.fn();

    // Simula que o history.state é a entrada virtual
    Object.defineProperty(window.history, 'state', {
      value: { isVirtualBackState: true },
      configurable: true,
      writable: true,
    });

    const { unmount } = renderHook(() => useHardwareBackPress(onBack, true));

    unmount();

    // O desmont apenas remove o handler da pilha; não navega para trás.
    expect(backSpy).not.toHaveBeenCalled();
    expect(onBack).not.toHaveBeenCalled();
  });

  it('remove o próprio handler da pilha ao desmontar sem afetar outros handlers', () => {
    const firstHandler = vi.fn();
    const secondHandler = vi.fn();

    renderHook(() => useHardwareBackPress(firstHandler, true));
    const { unmount } = renderHook(() => useHardwareBackPress(secondHandler, true));

    // O topo da pilha (secondHandler) é acionado
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(secondHandler).toHaveBeenCalledTimes(1);
    expect(firstHandler).not.toHaveBeenCalled();

    // Desmonta o segundo hook: remove apenas ele da pilha
    unmount();

    // O primeiro handler continua no topo e deve ser acionado no próximo popstate
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(firstHandler).toHaveBeenCalledTimes(1);
  });

  it('não re-executa o efeito quando apenas o callback muda (useRef)', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();

    const { rerender } = renderHook(({ callback }) => useHardwareBackPress(callback, true), {
      initialProps: { callback: firstCallback },
    });

    // pushState foi chamado apenas uma vez no mount
    expect(pushStateSpy).toHaveBeenCalledTimes(1);

    // Mudar o callback não deve re-executar o efeito nem empurrar novo estado
    rerender({ callback: secondCallback });
    expect(pushStateSpy).toHaveBeenCalledTimes(1);

    // O segundo callback é o que é executado no popstate
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(secondCallback).toHaveBeenCalledTimes(1);
    expect(firstCallback).not.toHaveBeenCalled();
  });
});
