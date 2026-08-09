import type { ReactNode } from 'react';
import { useWorkout } from './useWorkout';
import { WorkoutContext } from './WorkoutContext';

export interface WorkoutProviderProps {
  children: ReactNode;
}

export function WorkoutProvider({ children }: WorkoutProviderProps) {
  const workout = useWorkout();

  return (
    <WorkoutContext.Provider value={workout}>
      {children}
    </WorkoutContext.Provider>
  );
}