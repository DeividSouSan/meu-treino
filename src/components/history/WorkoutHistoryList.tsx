import type { WorkoutSession } from '../../types/workout';
import { WorkoutHistoryItem } from './WorkoutHistoryItem';
import { MtEmptyState } from '../ui';
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
      <MtEmptyState
        icon={
          <Sun size={48} strokeWidth={1.5} color="var(--text-light)" />
        }
        title="Nenhum treino registrado"
        actionLabel="Criar primeiro treino"
        onAction={onCreateFirstWorkout}
      />
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