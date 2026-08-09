import packageInfo from '../../package.json';
import { useContextWorkout } from '../hooks';
import { useHistoryFormatters } from '../hooks/useHistoryFormatters';
import { useHistoryActions } from '../hooks/useHistoryActions';
import { 
  BackupSection, 
  ActiveWorkoutCard, 
  WorkoutHistoryList, 
  FloatingActionButton, 
  VersionInfo 
} from '../components/history';

export function HistoryView() {
  const {
    workoutHistory,
    activeSession,
    startNewWorkout,
    startEditingWorkout,
    deleteSession,
    navigateToHistory,
  } = useContextWorkout();

  const { formatWorkoutDate, formatWorkoutDuration } = useHistoryFormatters();

  const { handleSessionTap, handleSessionLongPress, handleImportSuccess, handleCreateNewWorkout } = useHistoryActions({
    startEditingWorkout,
    deleteSession,
    onResumeActiveWorkout: navigateToHistory,
    startNewWorkout,
  });

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
            onResume={navigateToHistory}
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