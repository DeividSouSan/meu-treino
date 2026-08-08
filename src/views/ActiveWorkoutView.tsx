import React, { useState, useEffect } from 'react';
import type { WorkoutSession, WorkoutExercise } from '../types/workout';
import { useStopwatch } from '../hooks/useStopwatch';
import { ExerciseList } from '../components/ExerciseList';
import { ExerciseScreen } from '../components/ExerciseScreen';

/**
 * Interface de propriedades para a visualização do treino ativo/modo edição.
 */
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

/**
 * Componente de visualização e edição de treinos ativos ou passados (Tela Coringa).
 */
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

  const handleUpdateSession = (updatedSession: WorkoutSession) => {
    if (isEditing) {
      onUpdateEditingSession(updatedSession);
    } else {
      onUpdateActiveSession(updatedSession);
    }
  };

  const handleAddCue = (event: React.FormEvent) => {
    event.preventDefault();
    if (cueInput.trim() === '') {
      return;
    }
    const updatedCues = [...currentSession.cues, cueInput.trim()];
    handleUpdateSession({
      ...currentSession,
      cues: updatedCues,
    });
    setCueInput('');
  };

  const handleRemoveCue = (cueIndexToRemove: number) => {
    const updatedCues = currentSession.cues.filter((_, index) => {
      return index !== cueIndexToRemove;
    });
    handleUpdateSession({
      ...currentSession,
      cues: updatedCues,
    });
  };

  const handleAddExercise = (exerciseName: string) => {
    const trimmedName = exerciseName.trim();
    if (trimmedName === '') {
      return;
    }

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
  };

  const handleUpdateExercise = (updatedExercise: WorkoutExercise) => {
    const updatedExercises = currentSession.exercises.map((exercise) => {
      return exercise.id === updatedExercise.id ? updatedExercise : exercise;
    });
    handleUpdateSession({
      ...currentSession,
      exercises: updatedExercises,
    });
  };

  const handleDeleteExercise = (exerciseIdToDelete: string) => {
    const userConfirmed = window.confirm('Deseja realmente remover este exercício do treino?');
    if (!userConfirmed) {
      return;
    }
    const updatedExercises = currentSession.exercises.filter((exercise) => {
      return exercise.id !== exerciseIdToDelete;
    });
    handleUpdateSession({
      ...currentSession,
      exercises: updatedExercises,
    });
  };

  const handleSetAddedCallback = (_restTimeInSeconds: number) => {
    restStopwatch.reset();
  };

  const handleSaveOrFinishClick = () => {
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
  };

  const formatTimerValue = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${paddedMinutes}:${paddedSeconds}`;
    }
    return `${paddedMinutes}:${paddedSeconds}`;
  };

  const formatWorkoutDateTitle = (dateString: string) => {
    const parsedDate = new Date(dateString);
    return parsedDate.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPastExerciseSuggestions = () => {
    const uniqueNames = Array.from(
      new Set(
        workoutHistory.flatMap((session) => {
          return session.exercises.map((exercise) => {
            return exercise.name;
          });
        })
      )
    );

    if (exerciseSearchInput.trim() === '') {
      return [];
    }

    return uniqueNames.filter((name) => {
      return name.toLowerCase().includes(exerciseSearchInput.toLowerCase());
    });
  };

  const exerciseSuggestions = getPastExerciseSuggestions();

  const selectedExercise = currentSession.exercises.find(
    (exercise) => exercise.id === currentExerciseId
  ) || null;

  const currentExerciseIndex = currentSession.exercises.findIndex(
    (exercise) => exercise.id === currentExerciseId
  );

  const handleSelectExercise = (exerciseId: string) => {
    setCurrentExerciseId(exerciseId);
  };

  const handleBackToList = () => {
    setCurrentExerciseId(null);
  };

  const handleNavigatePrevious = () => {
    if (currentExerciseIndex > 0) {
      const previousExercise = currentSession.exercises[currentExerciseIndex - 1];
      setCurrentExerciseId(previousExercise.id);
    }
  };

  const handleNavigateNext = () => {
    if (currentExerciseIndex < currentSession.exercises.length - 1) {
      const nextExercise = currentSession.exercises[currentExerciseIndex + 1];
      setCurrentExerciseId(nextExercise.id);
    }
  };

  return (
    <div>
      <header>
        <div>
          <h1 style={{ fontSize: '1.1rem' }}>
            {formatWorkoutDateTitle(currentSession.date)}
          </h1>
          <span className="text-secondary" style={{ fontSize: '0.8rem', display: 'block' }}>
            {isEditing ? 'Modo Edição' : `Duração: ${formatTimerValue(sessionStopwatch.seconds)}`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
          <button 
            className="small" 
            onClick={onCancelActiveWorkout}
            style={{ 
              borderColor: 'var(--danger-color)',
              color: 'var(--danger-color)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Cancelar
          </button>
          <button 
            className="small" 
            onClick={handleSaveOrFinishClick}
            style={{ 
              borderColor: 'var(--accent-color)',
              color: 'var(--accent-color)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {isEditing ? 'Salvar' : 'Encerrar'}
          </button>
        </div>
      </header>

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
            <section className="card">
              <h2>Cues da Sessão (Lembretes)</h2>
              <form onSubmit={handleAddCue} style={{ display: 'flex', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-xs)' }}>
                <input
                  type="text"
                  value={cueInput}
                  onChange={(event) => setCueInput(event.target.value)}
                  placeholder="Ex: Controlar a descida no agachamento"
                />
                <button 
                  type="submit"
                  className="small"
                  style={{ 
                    borderColor: 'var(--accent-color)',
                    color: 'var(--accent-color)'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </form>
              {currentSession.cues.length > 0 && (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 'var(--spacing-sm)' }}>
                  {currentSession.cues.map((cue, index) => (
                    <li
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 10px',
                        backgroundColor: 'var(--background-color)',
                        borderRadius: 'var(--border-radius)',
                        fontSize: '0.9rem',
                      }}
                    >
                      <span>{cue}</span>
                      <button
                        className="text text-danger"
                        style={{ padding: '0 4px', fontSize: '0.8rem' }}
                        onClick={() => handleRemoveCue(index)}
                        title="Remover lembrete"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section style={{ marginTop: 'var(--spacing-md)' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-sm)' }}>Exercícios</h2>
              <ExerciseList
                exercises={currentSession.exercises}
                selectedExerciseId={currentExerciseId}
                onSelectExercise={handleSelectExercise}
              />
            </section>

            <section className="card" style={{ marginTop: 'var(--spacing-md)' }}>
              <h2>Adicionar Exercício</h2>
              <div style={{ display: 'flex', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-xs)', position: 'relative' }}>
                <input
                  type="text"
                  value={exerciseSearchInput}
                  onChange={(event) => setExerciseSearchInput(event.target.value)}
                  placeholder="Buscar ou digitar nome do exercício..."
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleAddExercise(exerciseSearchInput);
                    }
                  }}
                />
                <button 
                  className="small" 
                  onClick={() => handleAddExercise(exerciseSearchInput)}
                  style={{ 
                    width: '42px',
                    borderColor: 'var(--accent-color)',
                    color: 'var(--accent-color)'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>

              {exerciseSuggestions.length > 0 && (
                <div
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius)',
                    marginTop: '4px',
                    maxHeight: '150px',
                    overflowY: 'auto',
                    backgroundColor: 'var(--card-background)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {exerciseSuggestions.map((suggestion) => (
                    <div
                      key={suggestion}
                      onClick={() => handleAddExercise(suggestion)}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--border-color)',
                        fontSize: '0.9rem',
                      }}
                      className="suggestion-item"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

    </div>
  );
}
