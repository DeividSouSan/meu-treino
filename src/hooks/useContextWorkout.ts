import { useContext } from 'react';
import { WorkoutContext } from './WorkoutContext';

export function useContextWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useContextWorkout must be used within a WorkoutProvider');
  }
  return context;
}