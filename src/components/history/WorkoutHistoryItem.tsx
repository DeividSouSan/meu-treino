import { useCallback, useRef } from 'react';
import type { WorkoutSession } from '../../types/workout';

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

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onLongPress(session.id);
  }, [session.id, onLongPress]);

  return (
    <div
      onClick={() => onTap(session)}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: 'var(--spacing-sm) 0',
        borderBottom: '1px solid var(--border-color)',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        transition: 'background-color 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--background-color)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          {session.name !== 'Treino Livre' ? session.name : 'Treino Livre'}
        </strong>
        <span style={{ 
          fontSize: '0.85rem', 
          color: 'var(--accent-color)',
          fontWeight: 600,
          fontFamily: 'monospace'
        }}>
          {formatWorkoutDuration(session.durationInSeconds)}
        </span>
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        {formatWorkoutDate(session.date)}
      </div>
    </div>
  );
}