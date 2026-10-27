import { createContext, useContext } from 'react';

export type ModalId = 'exit_warning' | 'exercise_detail' | 'settings';

export interface UseNavigationReturn {
  currentView: 'history' | 'active_workout';
  navigateToHistory: () => void;
  navigateToActiveWorkout: () => void;
  registerBackHandler: (handler: () => void) => void;
  clearBackHandler: () => void;
  openModal: (id: ModalId) => void;
  closeModal: (id: ModalId) => void;
  isModalOpen: (id: ModalId) => boolean;
}

export const NavigationContext = createContext<UseNavigationReturn | null>(null);

export function useNavigation() {
  return useContext(NavigationContext);
}
