import { useCallback, useContext, useState, type ReactNode } from 'react';
import { NavigationContext } from './NavigationContext';

export interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [currentView, setCurrentView] = useState<'history' | 'active_workout'>('history');

  const navigateToHistory = useCallback(() => {
    setCurrentView('history');
  }, []);

  const navigateToActiveWorkout = useCallback(() => {
    setCurrentView('active_workout');
  }, []);

  const value = {
    currentView,
    navigateToHistory,
    navigateToActiveWorkout,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}