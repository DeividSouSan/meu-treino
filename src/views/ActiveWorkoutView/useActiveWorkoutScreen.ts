import { useCallback, useMemo } from 'react';
import type { WorkoutSession, WorkoutExercise } from '../../types/workout';
import { useStopwatch } from '../../hooks/useStopwatch';
import type { UseStopwatchResult } from '../../hooks/useStopwatch';
import { useSession, useHistory } from '../../hooks';

export interface UseActiveWorkoutScreenResult {
  /**
   * A sessão atual (ativa ou em edição), pronta para ser exibida.
   */
  session: WorkoutSession;
  /**
   * Verdadeiro quando o usuário está editando uma sessão salva.
   */
  isEditing: boolean;
  /**
   * Cronômetro que mede a duração da sessão enquanto ela está em andamento.
   */
  durationStopwatch: UseStopwatchResult;
  /**
   * Quantos treinos existem no histórico (usado para sugestões de exercícios).
   */
  workoutHistory: WorkoutSession[];
  /**
   * Adiciona um lembrete (cue) à sessão atual.
   */
  addCue: (cue: string) => void;
  /**
   * Remove um lembrete (cue) da sessão atual pela posição.
   */
  removeCue: (cueIndex: number) => void;
  /**
   * Cria um novo exercício e o adiciona à sessão atual.
   */
  addExercise: (exerciseName: string) => void;
  /**
   * Substitui o exercício atualizado dentro da sessão.
   */
  updateExercise: (updatedExercise: WorkoutExercise) => void;
  /**
   * Remove um exercício da sessão, com confirmação do usuário.
   */
  deleteExercise: (exerciseId: string) => void;
  /**
   * Salva (edição) ou encerra (ativa) a sessão. A confirmação do
   * usuário é feita pelo componente que chama este método.
   */
  saveOrFinish: () => void;
  /**
   * Cancela a sessão atual, descartando alterações não salvas.
   */
  cancel: () => void;
}

/**
 * useActiveWorkoutScreen é o CONTÊINER da tela de treino ativo/editing.
 *
 * Ele é o único responsável por:
 *  - unir a sessão ativa e a sessão em edição em uma única "sessão visual"
 *  - gerenciar o cronômetro de duração da sessão
 *  - aplicar mutações (cues, exercícios) no estado global do contexto
 *  - persistir o encerramento, o salvamento e o cancelamento
 *
 * Não recebe callbacks de fora: tudo vem dos contextos de sessão e histórico.
 * Assim a View (ActiveWorkoutView) não repassa props em cascade.
 */
export function useActiveWorkoutScreen(): UseActiveWorkoutScreenResult {
  const {
    activeSession,
    editingSession,
    updateActiveSession,
    updateEditingSession,
    finishActiveWorkout,
    saveEditedWorkout,
    cancelActiveWorkout,
  } = useSession();
  const { workoutHistory } = useHistory();

  const session = editingSession || activeSession;
  const isEditing = editingSession !== null;

  const sessionStopwatch = useStopwatch(
    session ? session.durationInSeconds : 0,
    !isEditing && session?.status === 'in_progress'
  );

  /**
   * Aplica uma sessão modificada no estado correto (ativo ou edição).
   */
  const updateSession = useCallback((updatedSession: WorkoutSession) => {
    if (isEditing) {
      updateEditingSession(updatedSession);
    } else {
      updateActiveSession(updatedSession);
    }
  }, [isEditing, updateActiveSession, updateEditingSession]);

  const addCue = useCallback((cue: string) => {
    const currentSession = session;
    if (!currentSession) return;
    updateSession({ ...currentSession, cues: [...currentSession.cues, cue] });
  }, [session, updateSession]);

  const removeCue = useCallback((cueIndex: number) => {
    const currentSession = session;
    if (!currentSession) return;
    updateSession({ ...currentSession, cues: currentSession.cues.filter((_: string, index: number) => index !== cueIndex) });
  }, [session, updateSession]);

  const addExercise = useCallback((exerciseName: string) => {
    const currentSession = session;
    if (!currentSession) return;
    const trimmedName = exerciseName.trim();
    if (trimmedName === '') return;

    const newExercise: WorkoutExercise = {
      id: crypto.randomUUID(),
      name: trimmedName,
      weightInKg: 0,
      notes: '',
      sets: [],
    };

    updateSession({ ...currentSession, exercises: [...currentSession.exercises, newExercise] });
  }, [session, updateSession]);

  const updateExercise = useCallback((updatedExercise: WorkoutExercise) => {
    const currentSession = session;
    if (!currentSession) return;
    updateSession({
      ...currentSession,
      exercises: currentSession.exercises.map((exercise: WorkoutExercise) =>
        exercise.id === updatedExercise.id ? updatedExercise : exercise
      ),
    });
  }, [session, updateSession]);

  const deleteExercise = useCallback((exerciseId: string) => {
    const currentSession = session;
    if (!currentSession) return;
    const userConfirmed = window.confirm('Deseja realmente remover este exercício do treino?');
    if (!userConfirmed) return;

    updateSession({
      ...currentSession,
      exercises: currentSession.exercises.filter((exercise: WorkoutExercise) => exercise.id !== exerciseId),
    });
  }, [session, updateSession]);

  /**
   * Salva (edição) ou encerra (ativa). Passa a sessão final — com a
   * duração atualizada — diretamente para o contexto, evitando a
   * leitura de estado stale feita antes.
   */
  const saveOrFinish = useCallback(() => {
    if (!session) return;
    const finalSession: WorkoutSession = {
      ...session,
      durationInSeconds: sessionStopwatch.seconds,
    };

    if (isEditing) {
      saveEditedWorkout(finalSession);
    } else {
      finishActiveWorkout(finalSession);
    }
  }, [session, sessionStopwatch.seconds, isEditing, saveEditedWorkout, finishActiveWorkout]);

  const cancel = useCallback(() => {
    cancelActiveWorkout();
  }, [cancelActiveWorkout]);

  return useMemo(() => ({
    session: session!,
    isEditing,
    durationStopwatch: sessionStopwatch,
    workoutHistory,
    addCue,
    removeCue,
    addExercise,
    updateExercise,
    deleteExercise,
    saveOrFinish,
    cancel,
  }), [
    session,
    isEditing,
    sessionStopwatch,
    workoutHistory,
    addCue,
    removeCue,
    addExercise,
    updateExercise,
    deleteExercise,
    saveOrFinish,
    cancel,
  ]);
}