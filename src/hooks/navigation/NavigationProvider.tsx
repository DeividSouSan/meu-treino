import { useCallback, useContext, useRef, useState, useEffect, type ReactNode } from 'react';
import { NavigationContext, type ModalId } from './NavigationContext';
import { useHardwareBackPress } from './useHardwareBackPress';

// Debug mode: define globally for development debugging
// Set window.__DEBUG_NAV__ = true in your app to enable
const isDebugMode = typeof window !== 'undefined' && (window as any).__DEBUG_NAV__;
const devLog = (...args: unknown[]) => {
  if (isDebugMode) {
    console.log('[NavigationProvider DEBUG]', ...args);
  }
};

export interface NavigationProviderProps {
  children: ReactNode;
  initialView?: 'history' | 'active_workout';
}

export function NavigationProvider({ children, initialView = 'history' }: NavigationProviderProps) {
  const [currentView, setCurrentView] = useState<'history' | 'active_workout'>(initialView);
  const [modalStack, setModalStack] = useState<ModalId[]>([]);
  const backHandlerRef = useRef<(() => void) | null>(null);
  // Refs para manter o listener de popstate estável (sem re-registrar a cada mudança)
  const currentViewRef = useRef(currentView);
  const modalStackRef = useRef(modalStack);
  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);
  useEffect(() => {
    modalStackRef.current = modalStack;
  }, [modalStack]);

  // Único ponto de interceptação do gesto de voltar para todo o app.
  useHardwareBackPress(() => {
    backHandlerRef.current?.();
  }, true);

  devLog('NavigationProvider initialized', { initialView, modalStack: modalStack.length });

  // Empilha modal ao abrir; dessempilha ao fechar
  const openModal = useCallback((id: ModalId) => {
    setModalStack((prev) => {
      const newStack = [...prev, id];
      devLog('openModal', id, 'newStack:', newStack);
      window.history.pushState({ view: currentViewRef.current, modals: newStack }, '');
      return newStack;
    });
  }, []);

  const closeModal = useCallback((id: ModalId) => {
    setModalStack((prev) => {
      // remove apenas a última ocorrência (topo da pilha)
      const idx = prev.lastIndexOf(id);
      const newStack = idx === -1 ? prev : [...prev.slice(0, idx), ...prev.slice(idx + 1)];
      devLog('closeModal', id, 'newStack:', newStack);
      // Substitui o estado atual da history
      window.history.replaceState({ view: currentViewRef.current, modals: newStack }, '');
      // Remove o estado virtual de voltar ({ isVirtualBackState: true }) que foi
      // empilhado no usoHardwareBackPress no início da aplicação. Isso evita que
      // o próximo gesto de voltar reabra o modal ou cause comportamento duplo de back.
      // Sempre executamos o pop porque o estado virtual foi registrado no mount
      // do NavigationProvider e permanece na history stack.
      window.history.back();
      window.history.forward(); // restore the replaced state
      return newStack;
    });
  }, []);

  const isModalOpen = useCallback(
    (id: ModalId) => {
      const open = modalStack.includes(id);
      devLog('isModalOpen', id, 'open:', open, 'stack:', modalStack);
      return open;
    },
    [modalStack],
  );

  // Navegação entre views
  const navigateToHistory = useCallback(() => {
    setCurrentView('history');
    setModalStack([]);
    // Colapsa a pilha do navegador para a base (página inicial)
    window.history.replaceState({ view: 'history', modals: [] }, '');
    devLog('navigateToHistory', 'view: history (stack reset)');
  }, []);

  const navigateToActiveWorkout = useCallback(() => {
    setCurrentView('active_workout');
    window.history.pushState({ view: 'active_workout', modals: [] }, '');
    devLog('navigateToActiveWorkout', 'view: active_workout');
  }, []);

  const registerBackHandler = useCallback((handler: () => void) => {
    backHandlerRef.current = handler;
    devLog('registerBackHandler', 'handler bound');
  }, []);

  const clearBackHandler = useCallback(() => {
    backHandlerRef.current = null;
    devLog('clearBackHandler', 'handler cleared');
  }, []);

  // Efeito: gerencia popstate do browser
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as {
        view?: 'history' | 'active_workout';
        modals?: ModalId[];
        isVirtualBackState?: boolean;
      } | null;

      devLog('popstate event received', { state, currentViewBefore: currentViewRef.current });

      // Se for estado virtual de voltar (protegido), não navegar
      if (state?.isVirtualBackState) {
        devLog('popstate ignored: isVirtualBackState');
        return;
      }

      // Navegar baseado no view salvo
      if (state?.view === 'history') {
        setCurrentView('history');
        devLog('navigated to: history');
      } else if (state?.view === 'active_workout') {
        setCurrentView('active_workout');
        devLog('navigated to: active_workout');
      }

      // Restaurar stack de modais se presente
      if (state?.modals !== undefined) {
        setModalStack(state.modals);
        devLog('modalStack restored from history state:', state.modals);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  devLog('popstate listener added');

  // Efeito: empilha estado inicial no history na montagem
  useEffect(() => {
    const initialState: {
      view: 'history' | 'active_workout';
      modals: ModalId[];
      isVirtualBackState?: boolean;
    } = {
      view: currentView,
      modals: [],
    };
    window.history.replaceState(initialState, '');
    devLog('initial state pushed to history', {
      view: initialState.view,
      modals: initialState.modals,
    });
  }, []);

  const value = {
    currentView,
    navigateToHistory,
    navigateToActiveWorkout,
    registerBackHandler,
    clearBackHandler,
    openModal,
    closeModal,
    isModalOpen,
  };

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
