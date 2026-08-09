import { createContext } from 'react';
import type { UseWorkoutResult } from './useWorkout';

export const WorkoutContext = createContext<UseWorkoutResult | null>(null);