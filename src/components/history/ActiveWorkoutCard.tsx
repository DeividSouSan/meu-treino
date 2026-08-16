import type { WorkoutSession } from '../../types/workout';
import { MtCard } from '../ui';
import { ChevronRight } from 'lucide-react';

export interface ActiveWorkoutCardProps {
  activeSession: WorkoutSession;
  onResume: () => void;
  formatWorkoutDate: (dateString: string) => string;
}

export function ActiveWorkoutCard({ activeSession, onResume, formatWorkoutDate }: ActiveWorkoutCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onResume();
    }
  };

  const sessionDisplayName =
    activeSession.name && activeSession.name !== 'Treino Livre'
      ? activeSession.name
      : 'Treino em Andamento';

  return (
    <MtCard
      role="button"
      tabIndex={0}
      onClick={onResume}
      onKeyDown={handleKeyDown}
      className="active-workout-card shadow-hover"
      style={{
        borderLeft: '4px solid var(--warning-color)',
        cursor: 'pointer',
        userSelect: 'none',
        marginBottom: 'var(--spacing-md)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--warning-color)',
              }}
            />
            <h3 style={{ color: 'var(--warning-color)', fontSize: '0.9rem', margin: 0 }}>
              Treino em Andamento
            </h3>
          </div>
          <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            {sessionDisplayName}
          </strong>
          <p className="text-secondary" style={{ fontSize: '0.8rem' }}>
            Iniciado em {formatWorkoutDate(activeSession.date)}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--warning-color)',
            fontWeight: 600,
            fontSize: '0.85rem',
            padding: '6px 10px',
            borderRadius: 'var(--border-radius)',
            backgroundColor: 'var(--warning-light)',
            flexShrink: 0,
          }}
        >
          <span>Retomar</span>
          <ChevronRight size={16} strokeWidth={2.5} />
        </div>
      </div>
    </MtCard>
  );
}