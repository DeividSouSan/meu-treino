import { useCallback } from 'react';
import type { WorkoutSession } from '../types/workout';
import packageInfo from '../../package.json';
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
  const formatWorkoutDate = (dateString: string) => {
    const parsedDate = new Date(dateString);
    return parsedDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatWorkoutDuration = (durationInSeconds: number) => {
    const durationInMinutes = Math.round(durationInSeconds / 60);
    return `${durationInMinutes} min`;
  };

  const handleSessionTap = useCallback((session: WorkoutSession) => {
    startEditingWorkout(session);
  }, [startEditingWorkout]);

  const handleSessionLongPress = useCallback((sessionId: string) => {
    const userConfirmed = window.confirm('Deseja realmente excluir este treino do histórico?');
    if (userConfirmed) {
      deleteSession(sessionId);
    }
  }, [deleteSession]);

  const handleImportSuccess = useCallback(() => {
    onResumeActiveWorkout();
  }, [onResumeActiveWorkout]);

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
            onCreateFirstWorkout={() => startNewWorkout(null)}
          />
        </section>
      </main>

      <FloatingActionButton onClick={() => startNewWorkout(null)}>
        +
      </FloatingActionButton>
      
      <VersionInfo version={packageInfo.version} />
    </div>
  );
}