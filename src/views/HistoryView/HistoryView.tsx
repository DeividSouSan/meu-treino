import packageInfo from '../../../package.json';
import { useHistoryView } from './useHistoryView';
import {
  BackupSection,
  ActiveWorkoutCard,
  WorkoutHistoryList,
  FloatingActionButton,
  VersionInfo,
} from '../../components/history';

/**
 * HistoryView é a tela apresentacional do histórico de treinos.
 *
 * Ela não contém lógica: toda ação e formatação vem do container useHistoryView.
 * Seu único trabalho é organizar os blocos visuais (backup, treino ativo,
 * lista de histórico, FAB e versão) e repassar as informações para os
 * componentes filhos.
 */
export function HistoryView() {
  const {
    workoutHistory,
    activeSession,
    resumeActiveWorkout,
    handleSessionTap,
    handleSessionLongPress,
    handleImportSuccess,
    handleCreateNewWorkout,
    formatWorkoutDate,
    formatWorkoutDuration,
  } = useHistoryView();

  return (
    <div>
      <header>
        <h1>Histórico</h1>
      </header>

      <main>
        <BackupSection
          onImportSuccess={handleImportSuccess}
          workoutHistoryLength={workoutHistory.length}
        />

        {activeSession && (
          <ActiveWorkoutCard
            activeSession={activeSession}
            onResume={resumeActiveWorkout}
            formatWorkoutDate={formatWorkoutDate}
          />
        )}

        <section className="card" style={{ gap: 'var(--spacing-sm)' }}>
          <h2 style={{ margin: 0 }}>Histórico</h2>
          <WorkoutHistoryList
            sessions={workoutHistory}
            onSessionTap={handleSessionTap}
            onSessionLongPress={handleSessionLongPress}
            formatWorkoutDate={formatWorkoutDate}
            formatWorkoutDuration={formatWorkoutDuration}
            onCreateFirstWorkout={handleCreateNewWorkout}
          />
        </section>
      </main>

      <FloatingActionButton onClick={handleCreateNewWorkout}>
        +
      </FloatingActionButton>

      <VersionInfo version={packageInfo.version} />
    </div>
  );
}
