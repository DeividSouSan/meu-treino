import type { WorkoutSession } from '../../types/workout';
import { WorkoutHistoryItem } from './WorkoutHistoryItem';

export interface WorkoutHistoryListProps {
  sessions: WorkoutSession[];
  onSessionTap: (session: WorkoutSession) => void;
  onSessionLongPress: (sessionId: string) => void;
  formatWorkoutDate: (dateString: string) => string;
  formatWorkoutDuration: (durationInSeconds: number) => string;
  onCreateFirstWorkout: () => void;
}

export function WorkoutHistoryList({
  sessions,
  onSessionTap,
  onSessionLongPress,
  formatWorkoutDate,
  formatWorkoutDuration,
  onCreateFirstWorkout,
}: WorkoutHistoryListProps) {
  if (sessions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--spacing-lg) 0' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 'var(--spacing-md)', opacity: 0.5 }}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        <p className="text-secondary" style={{ fontSize: '0.95rem', marginBottom: 'var(--spacing-md)', fontWeight: 500 }}>
          Nenhum treino registrado
        </p>
        <button className="primary" onClick={onCreateFirstWorkout}>
          Criar primeiro treino
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
      {sessions.map((session) => (
        <WorkoutHistoryItem
          key={session.id}
          session={session}
          onTap={onSessionTap}
          onLongPress={onSessionLongPress}
          formatWorkoutDate={formatWorkoutDate}
          formatWorkoutDuration={formatWorkoutDuration}
        />
      ))}
    </div>
  );
}