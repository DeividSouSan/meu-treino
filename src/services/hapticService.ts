/**
 * Serviço defensivo para feedback háptico (vibração) em PWAs.
 *
 * Suportado nativamente na maioria dos navegadores mobile (Android).
 * Em navegadores sem suporte (ex: iOS Safari) ou ambientes de teste,
 * falha silenciosamente sem gerar erros.
 */
export const hapticService = {
  /**
   * Vibração rápida e sutil para toques em steppers ou seletores (20ms).
   */
  lightTap(): void {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(20);
      }
    } catch {
      // Falha silenciosa
    }
  },

  /**
   * Vibração de confirmação média ao salvar/adicionar série (45ms).
   */
  success(): void {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(45);
      }
    } catch {
      // Falha silenciosa
    }
  },

  /**
   * Padrão duplo de vibração ao zerar/finalizar o tempo de descanso.
   */
  timerFinished(): void {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate([180, 80, 180]);
      }
    } catch {
      // Falha silenciosa
    }
  },
};
