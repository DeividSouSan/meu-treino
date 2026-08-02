import React, { useState, useEffect } from 'react';
import type { WorkoutSession, WorkoutExercise } from '../types/workout';
import { useStopwatch } from '../hooks/useStopwatch';
import { ExerciseCard } from '../components/ExerciseCard';

/**
 * Interface de propriedades para a visualização do treino ativo/modo edição.
 */
export interface ActiveWorkoutViewProps {
  activeSession: WorkoutSession | null;
  editingSession: WorkoutSession | null;
  onUpdateActiveSession: (workoutSession: WorkoutSession) => void;
  onUpdateEditingSession: (workoutSession: WorkoutSession) => void;
  onFinishActiveWorkout: (templateName?: string) => void;
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
  const [targetRestDuration, setTargetRestDuration] = useState<number>(0);

  const [cueInput, setCueInput] = useState<string>('');
  const [exerciseSearchInput, setExerciseSearchInput] = useState<string>('');
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [templateNameInput, setTemplateNameInput] = useState<string>('');

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

  const handleSetAddedCallback = (restTimeInSeconds: number) => {
    setTargetRestDuration(restTimeInSeconds);
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
      setShowTemplateModal(true);
    }
  };

  const handleFinalizeWithoutTemplate = () => {
    const finalSession = {
      ...currentSession,
      durationInSeconds: sessionStopwatch.seconds,
    };
    handleUpdateSession(finalSession);
    onFinishActiveWorkout();
  };

  const handleFinalizeWithTemplate = () => {
    const finalSession = {
      ...currentSession,
      durationInSeconds: sessionStopwatch.seconds,
    };
    handleUpdateSession(finalSession);
    onFinishActiveWorkout(templateNameInput);
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
          <button className="danger small" onClick={onCancelActiveWorkout}>
            Cancelar
          </button>
          <button className="primary small" onClick={handleSaveOrFinishClick}>
            {isEditing ? 'Salvar' : 'Encerrar'}
          </button>
        </div>
      </header>

      <main style={{ paddingBottom: '120px' }}>
        <section className="card">
          <h2>Cues da Sessão (Lembretes)</h2>
          <form onSubmit={handleAddCue} style={{ display: 'flex', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-xs)' }}>
            <input
              type="text"
              value={cueInput}
              onChange={(event) => setCueInput(event.target.value)}
              placeholder="Ex: Controlar a descida no agachamento"
            />
            <button type="submit" className="primary">
              Add
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
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {currentSession.exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onUpdate={handleUpdateExercise}
              onDelete={() => handleDeleteExercise(exercise.id)}
              onSetAdded={handleSetAddedCallback}
            />
          ))}
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
            <button className="primary" onClick={() => handleAddExercise(exerciseSearchInput)}>
              +
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
      </main>

      {/* Manual Rest Timer Widget Footer */}
      <div
        style={{
          position: 'fixed',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '600px',
          backgroundColor: 'var(--card-background)',
          borderTop: '1px solid var(--border-color)',
          padding: '12px var(--spacing-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100,
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>
            Cronômetro de Descanso
          </span>
          <strong style={{ fontSize: '1.25rem', fontFamily: 'monospace' }}>
            {formatTimerValue(restStopwatch.seconds)}
            {targetRestDuration > 0 && (
              <span className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 'normal', marginLeft: '6px' }}>
                / {targetRestDuration}s
              </span>
            )}
          </strong>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
          <button className="small" onClick={restStopwatch.reset}>
            Reset
          </button>
          <button className="small" onClick={restStopwatch.isRunning ? restStopwatch.pause : restStopwatch.start}>
            {restStopwatch.isRunning ? 'Pausar' : 'Iniciar'}
          </button>
        </div>
      </div>

      {/* Save Template Modal Prompt overlay */}
      {showTemplateModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            style={{
              width: '90%',
              maxWidth: '400px',
              backgroundColor: 'var(--card-background)',
              padding: 'var(--spacing-lg)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <h2>Salvar como Template?</h2>
            <p className="text-secondary" style={{ fontSize: '0.9rem', margin: 'var(--spacing-xs) 0 var(--spacing-md)' }}>
              Deseja salvar a estrutura de exercícios deste treino como um modelo para facilitar futuros treinos?
            </p>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label>Nome do Template (Opcional)</label>
              <input
                type="text"
                value={templateNameInput}
                onChange={(event) => setTemplateNameInput(event.target.value)}
                placeholder="Ex: Treino Peito 1"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <button className="primary" onClick={handleFinalizeWithTemplate} disabled={templateNameInput.trim() === ''}>
                Salvar e Finalizar Treino
              </button>
              <button onClick={handleFinalizeWithoutTemplate}>
                Apenas Finalizar Treino
              </button>
              <button className="danger" onClick={() => setShowTemplateModal(false)}>
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
