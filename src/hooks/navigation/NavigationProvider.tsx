import { useCallback, useContext, useRef, useState, useEffect, type ReactNode } from 'react';
import { NavigationContext, type ModalId } from './NavigationContext';
import { useHardwareBackPress } from './useHardwareBackPress';

export interface NavigationProviderProps {
  children: ReactNode;
  initialView?: 'history' | 'active_workout';
}

export function NavigationProvider({ children, initialView = 'history' }: NavigationProviderProps) {
  const [currentView, setCurrentView] = useState<'history' | 'active_workout'>(initialView);
  const [modalStack, setModalStack] = useState<ModalId[]>([]);
  const backHandlerRef = useRef<(() => void) | null>(null);

  // Único ponto de interceptação do gesto de voltar para todo o app.
  useHardwareBackPress(() => {
    backHandlerRef.current?.();
  }, true);

  // Empilha modal ao abrir; dessempilha ao fechar
  const openModal = useCallback((id: ModalId) => {
    setModalStack(prev => [...prev, id]);
  }, []);

  const closeModal = useCallback((id: ModalId) => {
    setModalStack(prev => prev.filter(mod => mod !== id));
  }, []);

  const isModalOpen = useCallback((id: ModalId) => {
    return modalStack.includes(id);
  }, [modalStack]);

  // Navegação entre views
  const navigateToHistory = useCallback(() => {
    setCurrentView('history');
  }, []);

  const navigateToActiveWorkout = useCallback(() => {
    setCurrentView('active_workout');
  }, []);

  const registerBackHandler = useCallback((handler: () => void) => {
    backHandlerRef.current = handler;
  }, []);

  const clearBackHandler = useCallback(() => {
    backHandlerRef.current = null;
  }, []);

  // Efeito: gerencia popstate do browser
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as {
        view?: 'history' | 'active_workout';
        modals?: ModalId[];
        isVirtualBackState?: boolean;
      } | null;

      // Se for estado virtual de voltar (protegido), não navegar
      if (state?.isVirtualBackState) {
        return;
      }

      // Navegar baseado no view salvo
      if (state?.view === 'history') {
        setCurrentView('history');
      } else if (state?.view === 'active_workout') {
        setCurrentView('active_workout');
      }

      // Restaurar stack de modais se presente
      if (state?.modals !== undefined) {
        setModalStack(state.modals);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView, modalStack]);

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
    window.history.pushState(initialState, '');
  }, [currentView]);

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
