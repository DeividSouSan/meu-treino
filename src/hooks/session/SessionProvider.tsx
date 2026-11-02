import { useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { WorkoutSession, WorkoutExercise } from '../../types/workout';
import { useStopwatch } from '../../hooks/useStopwatch';
import type { UseStopwatchResult } from '../../hooks/useStopwatch';
import {
  getActiveWorkoutSession,
  saveWorkoutSession,
  saveActiveWorkoutSession,
} from '../../services/storageService';
import { SessionContext } from './SessionContext';

/** Chave do localStorage que guarda o instante (Date.now) em que o treino atual iniciou. */
const STARTED_AT_STORAGE_KEY = 'meu_treino_started_at';

export interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);
  /** Segundos iniciais do cronômetro (definidos uma vez por sessão). */
  const [initialSeconds, setInitialSeconds] = useState(0);
  /** Instante de início do treino atual, salvo no localStorage para sobreviver a recarregamentos. */
  const startedAtRef = useRef<number | null>(null);
  /** ID da sessão para a qual o startedAt já foi inicializado (evita reset ao adicionar exercícios). */
  const currentSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    setActiveSession(getActiveWorkoutSession());
  }, []);

  /**
   * Inicializa o startedAt e os segundos iniciais do cronômetro quando uma
   * sessão ativa entra em modo in_progress. É executado uma única vez por
   * sessão (currentSessionIdRef evita redefinir ao adicionar exercícios).
   * Quando o app é reaberto, o startedAt salvo no localStorage permite
   * restaurar o tempo decorrido desde o início do treino.
   */
  useEffect(() => {
    const session = activeSession;
    if (!session || session.status !== 'in_progress') {
      setInitialSeconds(0);
      startedAtRef.current = null;
      currentSessionIdRef.current = null;
      localStorage.removeItem(STARTED_AT_STORAGE_KEY);
      return;
    }

    // Já inicializado para esta sessão: não redefine o cronômetro.
    if (currentSessionIdRef.current === session.id && startedAtRef.current !== null) {
      return;
    }

    const saved = localStorage.getItem(STARTED_AT_STORAGE_KEY);
    let startedAt: number;
    if (saved !== null) {
      startedAt = parseInt(saved, 10);
    } else {
      startedAt = Date.now();
      localStorage.setItem(STARTED_AT_STORAGE_KEY, String(startedAt));
    }

    startedAtRef.current = startedAt;
    currentSessionIdRef.current = session.id;

    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    setInitialSeconds(session.durationInSeconds + elapsed);
  }, [activeSession]);

  const sessionStopwatch: UseStopwatchResult = useStopwatch(
    initialSeconds,
    activeSession?.status === 'in_progress',
  );

  const startNewWorkout = useCallback((templateSession?: WorkoutSession | null) => {
    const newSessionId = crypto.randomUUID();
    const newSessionDate = new Date().toISOString();

    let initialExercises: WorkoutExercise[] = [];
    if (templateSession) {
      initialExercises = templateSession.exercises.map((exercise) => {
        return {
          id: crypto.randomUUID(),
          name: exercise.name,
          weightInKg: exercise.weightInKg,
          notes: exercise.notes,
          sets: [],
        };
      });
    }

    const newWorkoutSession: WorkoutSession = {
      id: newSessionId,
      date: newSessionDate,
      durationInSeconds: 0,
      name: templateSession ? templateSession.name : 'Treino Livre',
      cues: templateSession ? [...templateSession.cues] : [],
      exercises: initialExercises,
      isTemplate: false,
      status: 'in_progress',
    };

    setActiveSession(newWorkoutSession);
    saveActiveWorkoutSession(newWorkoutSession);
    setEditingSession(null);
  }, []);

  const startEditingWorkout = useCallback((workoutSession: WorkoutSession) => {
    setEditingSession(workoutSession);
    setActiveSession(null);
  }, []);

  const cancelActiveWorkout = useCallback(() => {
    setActiveSession(null);
    saveActiveWorkoutSession(null);
  }, []);

  const updateActiveSession = useCallback((updatedSession: WorkoutSession) => {
    setActiveSession(updatedSession);
    saveActiveWorkoutSession(updatedSession);
  }, []);

  const updateEditingSession = useCallback((updatedSession: WorkoutSession) => {
    setEditingSession(updatedSession);
  }, []);

  const finishActiveWorkout = useCallback(
    (sessionToComplete?: WorkoutSession) => {
      const sessionToClose = sessionToComplete ?? activeSession;
      if (!sessionToClose) {
        return;
      }

      const completedSession: WorkoutSession = {
        ...sessionToClose,
        status: 'completed',
      };

      saveWorkoutSession(completedSession);
      saveActiveWorkoutSession(null);
      setActiveSession(null);
    },
    [activeSession],
  );

  const saveEditedWorkout = useCallback(
    (sessionToSave?: WorkoutSession) => {
      const sessionToPersist = sessionToSave ?? editingSession;
      if (!sessionToPersist) {
        return;
      }

      saveWorkoutSession(sessionToPersist);
      setEditingSession(null);
    },
    [editingSession],
  );

  const value = {
    activeSession,
    editingSession,
    durationStopwatch: sessionStopwatch,
    startNewWorkout,
    startEditingWorkout,
    cancelActiveWorkout,
    updateActiveSession,
    updateEditingSession,
    finishActiveWorkout,
    saveEditedWorkout,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
