import type { WorkoutSession } from '../types/workout';
import packageInfo from '../../package.json';
import { useHistoryFormatters } from '../hooks/useHistoryFormatters';
import { useHistoryActions } from '../hooks/useHistoryActions';
import { 
  BackupSection, 
  ActiveWorkoutCard, 
  WorkoutHistoryList, 
  FloatingActionButton, 
  VersionInfo 
} from '../components/history';

export interface HistoryViewProps {
  workoutHistory: WorkoutSession[];
  activeSession: WorkoutSession | null;
  startNewWorkout: (templateSession?: WorkoutSession | null) => void;
  startEditingWorkout: (workoutSession: WorkoutSession) => void;
  deleteSession: (sessionId: string) => void;
  onResumeActiveWorkout: () => void;
}

export function HistoryView({
  workoutHistory,
  activeSession,
  startNewWorkout,
  startEditingWorkout,
  deleteSession,
  onResumeActiveWorkout,
}: HistoryViewProps) {
  const { formatWorkoutDate, formatWorkoutDuration } = useHistoryFormatters();

  const { handleSessionTap, handleSessionLongPress, handleImportSuccess, handleCreateNewWorkout } = useHistoryActions({
    startEditingWorkout,
    deleteSession,
    onResumeActiveWorkout,
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
            onResume={onResumeActiveWorkout}
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