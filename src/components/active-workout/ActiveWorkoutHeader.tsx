import type { WorkoutSession } from '../../types/workout';
import { IconButton } from '../ui/IconButton';

export interface ActiveWorkoutHeaderProps {
  session: WorkoutSession;
  isEditing: boolean;
  formattedDate: string;
  onCancel: () => void;
  onSaveOrFinish: () => void;
}

export function ActiveWorkoutHeader({
  session,
  isEditing,
  formattedDate,
  onCancel,
  onSaveOrFinish,
}: ActiveWorkoutHeaderProps) {
  return (
    <header>
      <div>
        <h1 style={{ fontSize: '1.1rem' }}>
          {formattedDate}
        </h1>
        <span className="text-secondary" style={{ fontSize: '0.8rem', display: 'block' }}>
          {isEditing ? 'Modo Edição' : `Duração: ${formatTimerValue(session.durationInSeconds)}`}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
        <IconButton 
          onClick={onCancel}
          variant="danger"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Cancelar
        </IconButton>
        <IconButton 
          onClick={onSaveOrFinish}
          variant="primary"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {isEditing ? 'Salvar' : 'Encerrar'}
        </IconButton>
      </div>
    </header>
  );
}

function formatTimerValue(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${paddedMinutes}:${paddedSeconds}`;
  }
  return `${paddedMinutes}:${paddedSeconds}`;
}