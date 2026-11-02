import { useCallback } from 'react';
import { useNavigation } from '../../hooks';
import { useActiveWorkoutScreen } from '../ActiveWorkoutView/useActiveWorkoutScreen';
import { useExerciseNavigation } from '../../hooks/useExerciseNavigation';
import { ExerciseScreen } from '../../components/exercise';
import type { WorkoutExercise } from '../../types/workout';

/**
 * ExerciseScreenView é a tela de edição de um exercício específico.
 *
 * Renderizada quando o pathname é /exercicio/:id. O exerciseId vem da URL
 * gerenciada pelo NavigationProvider. O exercício é buscado na sessão ativa
 * (ou em edição) via useActiveWorkoutScreen.
 *
 * Suporta qualquer exercício, inclusive de treinos passados, desde que o ID
 * seja resolvido para um WorkoutExercise disponível no contexto da sessão.
 */
export function ExerciseScreenView() {
  const { exerciseId, goBackToList, navigateToExercise } = useNavigation();
  const { session, updateExercise, deleteExercise } = useActiveWorkoutScreen();

  const exercise = session.exercises.find((e) => e.id === exerciseId) ?? null;

  const navigation = useExerciseNavigation(session.exercises, exerciseId, navigateToExercise);

  const handleUpdateExercise = useCallback(
    (updatedExercise: WorkoutExercise) => {
      updateExercise(updatedExercise);
    },
    [updateExercise],
  );

  const handleDeleteExercise = useCallback(() => {
    if (exercise) {
      deleteExercise(exercise.id);
      goBackToList();
    }
  }, [exercise, deleteExercise, goBackToList]);

  if (!exercise) {
    return (
      <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
        Exercício não encontrado.
      </div>
    );
  }

  return (
    <ExerciseScreen
      exercise={exercise}
      onUpdateExercise={handleUpdateExercise}
      onDeleteExercise={handleDeleteExercise}
      exerciseNavigation={{
        onBack: goBackToList,
        onNavigatePrevious: navigation.navigatePrevious,
        onNavigateNext: navigation.navigateNext,
        hasPrevious: navigation.hasPrevious,
        hasNext: navigation.hasNext,
      }}
    />
  );
}
