import { createContext, useContext } from 'react';

export type ScreenId = 'history' | 'active_workout' | 'exercise_screen' | 'settings';

export interface NavigationParams {
  exerciseId?: string;
}

export interface UseNavigationReturn {
  currentScreen: ScreenId;
  exerciseId: string | null;

  navigateTo: (screen: ScreenId, params?: NavigationParams) => void;
  navigateToHistory: () => void;
  navigateToActiveWorkout: () => void;
  navigateToExercise: (exerciseId: string) => void;
  navigateToSettings: () => void;
  goBackToList: () => void;
  goBack: () => void;
}

export const NavigationContext = createContext<UseNavigationReturn | null>(null);

export function useNavigation() {
  return useContext(NavigationContext);
}
