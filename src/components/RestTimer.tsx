import type { UseStopwatchResult } from '../hooks/useStopwatch';

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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
            <path d="M3 5v7h7" />
          </svg>
        </button>
      </div>
    </div>
  );
}