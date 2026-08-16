import type { WorkoutSession } from '../../types/workout';
import { MtCard, MtButton } from '../ui';

export interface ActiveWorkoutCardProps {
  activeSession: WorkoutSession;
  onResume: () => void;
  formatWorkoutDate: (dateString: string) => string;
}

export function ActiveWorkoutCard({ activeSession, onResume, formatWorkoutDate }: ActiveWorkoutCardProps) {
  return (
    <MtCard
      style={{
        borderLeft: '4px solid var(--warning-color)',
        marginBottom: 'var(--spacing-md)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ color: 'var(--warning-color)', marginBottom: '4px' }}>Treino em Andamento</h3>
          <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
            Iniciado em: {formatWorkoutDate(activeSession.date)}
          </p>
        </div>
        <MtButton variant="primary" size="small" onClick={onResume}>
          Retomar
        </MtButton>
      </div>
    </MtCard>
  );
}