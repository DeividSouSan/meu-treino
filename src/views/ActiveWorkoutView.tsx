import { useState, useEffect, useCallback, useMemo } from 'react';
import type { WorkoutSession, WorkoutExercise } from '../types/workout';
import { useStopwatch } from '../hooks/useStopwatch';
import { ExerciseList } from '../components/ExerciseList';
import { ExerciseScreen } from '../components/ExerciseScreen';
import {
  ActiveWorkoutHeader,
  CueManager,
  ExerciseSearch,
} from '../components/active-workout';

export interface ActiveWorkoutViewProps {
  activeSession: WorkoutSession | null;
  editingSession: WorkoutSession | null;
  onUpdateActiveSession: (workoutSession: WorkoutSession) => void;
  onUpdateEditingSession: (workoutSession: WorkoutSession) => void;
  onFinishActiveWorkout: () => void;
  onSaveEditedWorkout: () => void;
  onCancelActiveWorkout: () => void;
  workoutHistory: WorkoutSession[];
}

export function ActiveWorkoutView({
  activeSession,
  editingSession,
  onUpdateActiveSession,
  onUpdateEditingSession,
  onFinishActiveWorkout,
  onSaveEditedWorkout,
  onCancelActiveWorkout,
  workoutHistory,
}: ActiveWorkoutViewProps) {
  const currentSession = editingSession || activeSession;
  const isEditing = editingSession !== null;

  const sessionStopwatch = useStopwatch(
    currentSession ? currentSession.durationInSeconds : 0,
    !isEditing && currentSession?.status === 'in_progress'
  );

  const restStopwatch = useStopwatch(0, false);

  const [cueInput, setCueInput] = useState<string>('');
  const [exerciseSearchInput, setExerciseSearchInput] = useState<string>('');
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(null);

  useEffect(() => {
    if (currentSession) {
      sessionStopwatch.setSeconds(currentSession.durationInSeconds);
    }
  }, [currentSession?.id]);

  const handleUpdateSession = useCallback((updatedSession: WorkoutSession) => {
    if (isEditing) {
      onUpdateEditingSession(updatedSession);
    } else {
      onUpdateActiveSession(updatedSession);
    }
  }, [isEditing, onUpdateActiveSession, onUpdateEditingSession]);

  const handleAddCue = useCallback((cue: string) => {
    if (!currentSession) return;
    const updatedCues = [...currentSession.cues, cue];
    handleUpdateSession({
      ...currentSession,
      cues: updatedCues,
    });
  }, [currentSession, handleUpdateSession]);

  const handleRemoveCue = useCallback((cueIndex: number) => {
    if (!currentSession) return;
    const updatedCues = currentSession.cues.filter((_, index) => index !== cueIndex);
    handleUpdateSession({
      ...currentSession,
      cues: updatedCues,
    });
  }, [currentSession, handleUpdateSession]);

  const handleAddExercise = useCallback((exerciseName: string) => {
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

    handleUpdateSession({
      ...currentSession,
      exercises: [...currentSession.exercises, newExercise],
    });

    setExerciseSearchInput('');
  }, [currentSession, handleUpdateSession]);

  const handleUpdateExercise = useCallback((updatedExercise: WorkoutExercise) => {
    if (!currentSession) return;
    const updatedExercises = currentSession.exercises.map((exercise) =>
      exercise.id === updatedExercise.id ? updatedExercise : exercise
    );
    handleUpdateSession({
      ...currentSession,
      exercises: updatedExercises,
    });
  }, [currentSession, handleUpdateSession]);

  const handleDeleteExercise = useCallback((exerciseId: string) => {
    if (!currentSession) return;
    const userConfirmed = window.confirm('Deseja realmente remover este exercício do treino?');
    if (!userConfirmed) return;

    handleUpdateSession({
      ...currentSession,
      exercises: currentSession.exercises.filter((exercise) => exercise.id !== exerciseId),
    });
  }, [currentSession, handleUpdateSession]);

  const handleSetAddedCallback = useCallback(() => {
    restStopwatch.reset();
  }, [restStopwatch]);

  const handleSaveOrFinishClick = useCallback(() => {
    if (!currentSession) return;
    const finalSession = {
      ...currentSession,
      durationInSeconds: sessionStopwatch.seconds,
    };
    handleUpdateSession(finalSession);

    if (isEditing) {
      onSaveEditedWorkout();
    } else {
      onFinishActiveWorkout();
    }
  }, [currentSession, sessionStopwatch.seconds, isEditing, handleUpdateSession, onSaveEditedWorkout, onFinishActiveWorkout]);

  const formatWorkoutDateTitle = useCallback((dateString: string) => {
    const parsedDate = new Date(dateString);
    return parsedDate.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const getPastExerciseSuggestions = useCallback(() => {
    const uniqueNames = Array.from(
      new Set(
        workoutHistory.flatMap((session) =>
          session.exercises.map((exercise) => exercise.name)
        )
      )
    );

    if (exerciseSearchInput.trim() === '') {
      return [];
    }

    return uniqueNames
      .filter((name) => name.toLowerCase().includes(exerciseSearchInput.toLowerCase()))
      .map((name) => ({ id: name, name }));
  }, [workoutHistory, exerciseSearchInput]);

  const exerciseSuggestions = useMemo(() => getPastExerciseSuggestions(), [getPastExerciseSuggestions]);

  const selectedExercise = currentSession?.exercises.find(
    (exercise) => exercise.id === currentExerciseId
  ) || null;

  const currentExerciseIndex = currentSession?.exercises.findIndex(
    (exercise) => exercise.id === currentExerciseId
  ) ?? -1;

  const handleSelectExercise = useCallback((exerciseId: string) => {
    setCurrentExerciseId(exerciseId);
  }, []);

  const handleBackToList = useCallback(() => {
    setCurrentExerciseId(null);
  }, []);

  const handleNavigatePrevious = useCallback(() => {
    if (currentSession && currentExerciseIndex > 0) {
      const previousExercise = currentSession.exercises[currentExerciseIndex - 1];
      setCurrentExerciseId(previousExercise.id);
    }
  }, [currentSession, currentExerciseIndex]);

  const handleNavigateNext = useCallback(() => {
    if (currentSession && currentExerciseIndex < currentSession.exercises.length - 1) {
      const nextExercise = currentSession.exercises[currentExerciseIndex + 1];
      setCurrentExerciseId(nextExercise.id);
    }
  }, [currentSession, currentExerciseIndex]);

  if (!currentSession) {
    return (
      <main>
        <div className="card">
          <h2>Erro de Sessão</h2>
          <p className="text-secondary">Nenhum treino ativo ou em edição foi encontrado.</p>
          <button className="primary" onClick={onCancelActiveWorkout}>
            Voltar ao Histórico
          </button>
        </div>
      </main>
    );
  }

  return (
    <div>
      <ActiveWorkoutHeader
        session={currentSession}
        isEditing={isEditing}
        formattedDate={formatWorkoutDateTitle(currentSession.date)}
        onCancel={onCancelActiveWorkout}
        onSaveOrFinish={handleSaveOrFinishClick}
      />

      <main style={{ paddingBottom: currentExerciseId ? '20px' : '120px' }}>
        {currentExerciseId && selectedExercise ? (
          <ExerciseScreen
            exercise={selectedExercise}
            onUpdate={handleUpdateExercise}
            onDelete={() => {
              handleDeleteExercise(selectedExercise.id);
              handleBackToList();
            }}
            onSetAdded={handleSetAddedCallback}
            onBack={handleBackToList}
            onNavigatePrevious={handleNavigatePrevious}
            onNavigateNext={handleNavigateNext}
            hasPrevious={currentExerciseIndex > 0}
            hasNext={currentExerciseIndex < currentSession.exercises.length - 1}
          />
        ) : (
          <>
            <CueManager
              cues={currentSession.cues}
              cueInput={cueInput}
              onCueInputChange={setCueInput}
              onAddCue={handleAddCue}
              onRemoveCue={handleRemoveCue}
            />

            <section style={{ marginTop: 'var(--spacing-md)' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-sm)' }}>Exercícios</h2>
              <ExerciseList
                exercises={currentSession.exercises}
                selectedExerciseId={currentExerciseId}
                onSelectExercise={handleSelectExercise}
              />
            </section>

            <ExerciseSearch
              searchInput={exerciseSearchInput}
              onSearchInputChange={setExerciseSearchInput}
              onAddExercise={handleAddExercise}
              suggestions={exerciseSuggestions}
            />
          </>
        )}
      </main>
    </div>
  );
}