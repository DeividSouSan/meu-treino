import { createContext } from 'react';

export interface UseNavigationReturn {
  currentView: 'history' | 'active_workout';
  navigateToHistory: () => void;
  navigateToActiveWorkout: () => void;
}

export const NavigationContext = createContext<UseNavigationReturn | null>(null);