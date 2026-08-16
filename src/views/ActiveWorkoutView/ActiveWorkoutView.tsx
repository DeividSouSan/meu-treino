import { useState, useCallback } from 'react';
import { useActiveWorkoutScreen } from './useActiveWorkoutScreen';
import { useExerciseNavigation } from '../../hooks/useExerciseNavigation';
import { ExerciseList } from '../../components/ExerciseList';
import { ExerciseScreen } from '../../components/ExerciseScreen';
import {
  ActiveWorkoutHeader,
  CueManager,
  ExerciseSearch,
} from '../../components/active-workout';
import { MtEmptyState, MtSectionTitle, MtCard } from '../../components/ui';
import { Dumbbell } from 'lucide-react';
import { useNavigation } from '../../hooks';

/**
 * ActiveWorkoutView é a tela apresentacional do treino ativo.
 *
 * Ela não recebe props: toda a informação vem do container useActiveWorkoutScreen,
 * que por sua vez lê o contexto de treino. Isso mantém a view enxuta e sem
 * prop-drilling — nenhum callback é repassado em cascade.
 */
export function ActiveWorkoutView() {
  const {
    session,
    isEditing,
    durationStopwatch,
    workoutHistory,
    addCue,
    removeCue,
    addExercise,
    updateExercise,
    deleteExercise,
    saveOrFinish,
    cancel,
    renameSession,
  } = useActiveWorkoutScreen();

  /**
   * Controle interno de qual exercício está sendo visualizado/editado.
   * Quando é nulo, mostra a lista de exercícios; caso contrário, abre a tela
   * de edição (ExerciseScreen) do exercício selecionado.
   */
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(null);

  const handleSelectExercise = useCallback((exerciseId: string) => {
    setCurrentExerciseId(exerciseId);
  }, []);

  const handleBackToList = useCallback(() => {
    setCurrentExerciseId(null);
  }, []);

  const navigation = useExerciseNavigation(
    session.exercises,
    currentExerciseId,
    handleSelectExercise
  );

  const { navigateToHistory } = useNavigation();

  if (!session) {
    return (
      <main>
        <MtCard>
          <MtEmptyState
            align="left"
            title="Erro de Sessão"
            titleStyle={{ fontSize: '1.1rem', fontWeight: 600 }}
            description="Nenhum treino ativo ou em edição foi encontrado."
            actionLabel="Voltar ao Histórico"
            onAction={cancel}
          />
        </MtCard>
      </main>
    );
  }

  return (
    <div>
      <ActiveWorkoutHeader
        session={session}
        isEditing={isEditing}
        durationStopwatch={durationStopwatch}
        onSaveOrFinish={ () => {
          saveOrFinish();
          navigateToHistory();
        }
        }
        onCancel={() => {
          cancel();
          navigateToHistory();
        }}
        onRenameSession={renameSession}
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
            exerciseNavigation={{
              onBack: handleBackToList,
              onNavigatePrevious: navigation.navigatePrevious,
              onNavigateNext: navigation.navigateNext,
              hasPrevious: navigation.hasPrevious,
              hasNext: navigation.hasNext,
            }}
          />
        ) : (
          <>
            <CueManager
              cues={session.cues}
              onAddCue={addCue}
              onRemoveCue={removeCue}
            />

            <section style={{ marginTop: 'var(--spacing-md)' }}>
              <MtSectionTitle
                icon={<Dumbbell size={18} />}
                style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-sm)' }}
              >
                Exercícios
              </MtSectionTitle>
              <ExerciseList
                exercises={session.exercises}
                selectedExerciseId={currentExerciseId}
                onSelectExercise={handleSelectExercise}
              />
            </section>

            <ExerciseSearch
              onAddExercise={addExercise}
              getSuggestions={(query: string) => {
                const uniqueExerciseNames = Array.from(
                  new Set(
                    workoutHistory.flatMap((sessionItem) =>
                      sessionItem.exercises.map((exercise) => exercise.name)
                    )
                  )
                );

                if (query.trim() === '') {
                  return [];
                }

                return uniqueExerciseNames
                  .filter((name) => name.toLowerCase().includes(query.toLowerCase()))
                  .map((name: string) => ({ id: name, name }));
              }}
            />
          </>
        )}
      </main>
    </div>
  );
}
