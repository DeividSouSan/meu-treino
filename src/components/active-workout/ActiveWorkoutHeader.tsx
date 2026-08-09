import type { WorkoutSession } from '../../types/workout';
import type { UseStopwatchResult } from '../../hooks/useStopwatch';
import { MtButton } from '../ui';
import { X, Check } from 'lucide-react';

export interface ActiveWorkoutHeaderProps {
  session: WorkoutSession;
  isEditing: boolean;
  durationStopwatch: UseStopwatchResult;
  onCancel: () => void;
  onSaveOrFinish: () => void;
}

export function ActiveWorkoutHeader({
  session,
  isEditing,
  durationStopwatch,
  onCancel,
  onSaveOrFinish,
}: ActiveWorkoutHeaderProps) {
  const formattedDate = new Date(session.date).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header>
      <div>
        <h1 style={{ fontSize: '1.1rem' }}>
          {formattedDate}
        </h1>
        <span className="text-secondary" style={{ fontSize: '0.8rem', display: 'block' }}>
          {isEditing ? 'Modo Edição' : `Duração: ${formatTimerValue(durationStopwatch.seconds)}`}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
        <MtButton
          size="small"
          variant="danger"
          onClick={onCancel}
        >
          <X size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          Cancelar
        </MtButton>
        <MtButton
          size="small"
          variant="primary"
          onClick={onSaveOrFinish}
        >
          <Check size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          {isEditing ? 'Salvar' : 'Encerrar'}
        </MtButton>
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