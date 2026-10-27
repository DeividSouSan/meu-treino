import { useEffect, useRef } from 'react';

type BackHandler = () => void;

// Gerenciador de pilha global para interceptar o botão/gesto voltar do celular
const handlerStack: BackHandler[] = [];
let isPopStateListening = false;

function handlePopState() {
  if (handlerStack.length > 0) {
    const topHandler = handlerStack[handlerStack.length - 1];
    if (topHandler) {
      topHandler();
    }
  }
}

function ensurePopStateListener() {
  if (!isPopStateListening && typeof window !== 'undefined') {
    window.addEventListener('popstate', handlePopState);
    isPopStateListening = true;
  }
}

/**
 * useHardwareBackPress
 *
 * Registra um callback para ser executado quando o usuário acionar o gesto ou botão
 * de voltar do sistema celular (ou o back do navegador via popstate).
 *
 * Enquanto ativo (`enabled === true`), empurra uma entrada de histórico virtual no `history`
 * e empilha o handler. O handler permanece na pilha até ser desativado ou desmontado.
 *
 * O callback é lido por ref, portanto o efeito não é re-executado apenas porque a
 * função de callback mudou de referência entre renders.
 */
export function useHardwareBackPress(onBack: () => void, enabled: boolean = true) {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    ensurePopStateListener();

    // Empurra um estado no histórico para capturar o gesto de voltar
    window.history.pushState({ isVirtualBackState: true }, '');

    const handler: BackHandler = () => {
      onBackRef.current();
    };

    handlerStack.push(handler);

    return () => {
      const index = handlerStack.indexOf(handler);
      if (index !== -1) {
        handlerStack.splice(index, 1);
      }
    };
  }, [enabled]);
}
