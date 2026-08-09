import type { WorkoutSession } from '../../types/workout';
import { WorkoutHistoryItem } from './WorkoutHistoryItem';
import { Sun } from 'lucide-react';

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
        <Sun
          size={48}
          strokeWidth={1.5}
          color="var(--text-light)"
          style={{ marginBottom: 'var(--spacing-md)', opacity: 0.5 }}
        />
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