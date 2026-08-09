import { useState, useCallback } from 'react';
import type { WorkoutSession, WorkoutExercise } from '../types/workout';
import { useStopwatch } from '../hooks/useStopwatch';
import { useActiveWorkoutSession } from '../hooks/useActiveWorkoutSession';
import { useExerciseNavigation } from '../hooks/useExerciseNavigation';
import { ExerciseList } from '../components/ExerciseList';
import { ExerciseScreen } from '../components/ExerciseScreen';
import {
  ActiveWorkoutHeader,
  CueManager,
  ExerciseSearch,
} from '../components/active-workout';
import { MtEmptyState, MtSectionTitle } from '../components';
import { Dumbbell } from 'lucide-react';

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
  const {
    session,
    isEditing,
    durationStopwatch,
    updateSession,
    addCue,
    removeCue,
    addExercise,
    updateExercise,
    deleteExercise,
    onCancel,
    onSaveOrFinish,
  } = useActiveWorkoutSession({
    activeSession,
    editingSession,
    onUpdateActiveSession,
    onUpdateEditingSession,
    onFinishActiveWorkout,
    onSaveEditedWorkout,
    onCancelActiveWorkout,
  });

  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(null);

  const handleSelectExercise = useCallback((exerciseId: string) => {
    setCurrentExerciseId(exerciseId);
  }, []);

  const handleBackToList = useCallback(() => {
    setCurrentExerciseId(null);
  }, []);

  const navigation = useExerciseNavigation(session.exercises, currentExerciseId, handleSelectExercise);

  if (!session) {
    return (
      <main>
        <div className="card">
          <MtEmptyState
            align="left"
            title="Erro de Sessão"
            titleStyle={{ fontSize: '1.1rem', fontWeight: 600 }}
            description="Nenhum treino ativo ou em edição foi encontrado."
            actionLabel="Voltar ao Histórico"
            onAction={onCancel}
          />
        </div>
      </main>
    );
  }

  return (
    <div>
      <ActiveWorkoutHeader
        session={session}
        isEditing={isEditing}
        durationStopwatch={durationStopwatch}
        onCancel={onCancel}
        onSaveOrFinish={onSaveOrFinish}
      />

      <main style={{ paddingBottom: currentExerciseId ? '20px' : '120px' }}>
        {currentExerciseId && navigation.selectedExercise ? (
          <ExerciseScreen
            exercise={navigation.selectedExercise}
            onUpdateExercise={updateExercise}
            onDeleteExercise={() => {
              deleteExercise(navigation.selectedExercise!.id);
              handleBackToList();
            }}
            onSetAdded={() => {}}
            onBack={handleBackToList}
            onNavigatePrevious={navigation.navigatePrevious}
            onNavigateNext={navigation.navigateNext}
            hasPrevious={navigation.hasPrevious}
            hasNext={navigation.hasNext}
          />
        ) : (
          <>
            <CueManager
              cues={session.cues}
              onAddCue={addCue}
              onRemoveCue={removeCue}
            />

            <section style={{ marginTop: 'var(--spacing-md)' }}>
              <MtSectionTitle icon={<Dumbbell size={18} />} style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-sm)' }}>Exercícios</MtSectionTitle>
              <ExerciseList
                exercises={session.exercises}
                selectedExerciseId={currentExerciseId}
                onSelectExercise={handleSelectExercise}
              />
            </section>

            <ExerciseSearch
              onAddExercise={addExercise}
              getSuggestions={(query: string) => {
                const uniqueNames = Array.from(
                  new Set(
                    workoutHistory.flatMap((s) =>
                      s.exercises.map((e) => e.name)
                    )
                  )
                );

                if (query.trim() === '') {
                  return [];
                }

                return uniqueNames
                  .filter((name) => name.toLowerCase().includes(query.toLowerCase()))
                  .map((name) => ({ id: name, name }));
              }}
            />
          </>
        )}
      </main>
    </div>
  );
}