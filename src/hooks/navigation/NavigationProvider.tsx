import { useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { NavigationContext } from './NavigationContext';
import { useHardwareBackPress } from './useHardwareBackPress';

export interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [currentView, setCurrentView] = useState<'history' | 'active_workout'>('history');
  const backHandlerRef = useRef<(() => void) | null>(null);

  // Único ponto de interceptação do gesto de voltar para todo o app.
  // O handler ativo é lido do contexto e executado quando o usuário aperta voltar.
  useHardwareBackPress(() => {
    backHandlerRef.current?.();
  }, true);

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

  const value = {
    currentView,
    navigateToHistory,
    navigateToActiveWorkout,
    registerBackHandler,
    clearBackHandler,
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
