import { useCallback, useRef } from 'react';
import type { WorkoutSession } from '../../types/workout';
import { Clock } from 'lucide-react';

export interface WorkoutHistoryItemProps {
  session: WorkoutSession;
  onTap: (session: WorkoutSession) => void;
  onLongPress: (sessionId: string) => void;
  formatWorkoutDate: (dateString: string) => string;
  formatWorkoutDuration: (durationInSeconds: number) => string;
}

export function WorkoutHistoryItem({
  session,
  onTap,
  onLongPress,
  formatWorkoutDate,
  formatWorkoutDuration,
}: WorkoutHistoryItemProps) {
  const timerRef = useRef<number | null>(null);

  const handleTouchStart = useCallback(() => {
    timerRef.current = window.setTimeout(() => {
      onLongPress(session.id);
    }, 600);
  }, [session.id, onLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTouchMove = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onLongPress(session.id);
    },
    [session.id, onLongPress],
  );

  return (
    <div
      className="workout-history-item"
      onClick={() => onTap(session)}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <div className="workout-history-item__header">
        <strong className="workout-history-item__name">
          {session.name !== 'Treino Livre' ? session.name : 'Treino Livre'}
        </strong>
        <span className="workout-history-item__duration">
          {formatWorkoutDuration(session.durationInSeconds)}
        </span>
      </div>
      <div className="workout-history-item__date">
        <Clock size={12} strokeWidth={2} className="workout-history-item__date-icon" />
        {formatWorkoutDate(session.date)}
      </div>
    </div>
  );
}
