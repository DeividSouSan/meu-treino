import type { UseStopwatchResult } from '../hooks/useStopwatch';
import { Clock, RotateCcw } from 'lucide-react';

export interface RestTimerProps {
  stopwatch: UseStopwatchResult;
  targetSeconds: number;
}

export function RestTimer({ stopwatch, targetSeconds }: RestTimerProps) {
  const { seconds, isRunning } = stopwatch;

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isRestComplete = seconds >= targetSeconds && targetSeconds > 0;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--spacing-sm) 0',
        marginTop: 'var(--spacing-sm)',
        borderTop: '1px solid var(--border-color)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
        <Clock size={16} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Descanso</span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '4px',
          color: isRestComplete ? 'var(--accent-color)' : 'var(--text-color)',
          transition: 'color 0.3s ease',
        }}
      >
        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
          {formatTime(seconds)}
        </span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          /{formatTime(targetSeconds)}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
        <button
          className="small"
          onClick={() => stopwatch.reset()}
          title="Resetar"
          style={{ padding: '4px 8px' }}
        >
          <RotateCcw size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </button>
      </div>
    </div>
  );
}