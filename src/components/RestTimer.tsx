import { useEffect, useRef } from 'react';
import type { UseStopwatchResult } from '../hooks/useStopwatch';
import { Clock, RotateCcw } from 'lucide-react';
import { MtButton } from './ui';
import { hapticService } from '../services/hapticService';

export interface RestTimerProps {
  stopwatch: UseStopwatchResult;
  targetSeconds: number;
}

export function RestTimer({ stopwatch, targetSeconds }: RestTimerProps) {
  const { seconds } = stopwatch;
  const hasTriggeredHapticRef = useRef(false);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isRestComplete = seconds >= targetSeconds && targetSeconds > 0;

  useEffect(() => {
    if (seconds === targetSeconds && targetSeconds > 0 && !hasTriggeredHapticRef.current) {
      hapticService.timerFinished();
      hasTriggeredHapticRef.current = true;
    }
    if (seconds === 0) {
      hasTriggeredHapticRef.current = false;
    }
  }, [seconds, targetSeconds]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--spacing-md) 0',
        marginTop: 'var(--spacing-sm)',
        borderTop: '1px solid var(--border-color)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
        <Clock size={18} strokeWidth={2.25} color="var(--text-secondary)" />
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Descanso
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '4px',
          color: isRestComplete ? 'var(--success-color)' : 'var(--text-primary)',
          transition: 'color 0.2s ease',
        }}
      >
        <span
          style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            fontFamily: 'monospace',
            letterSpacing: '0.05em',
          }}
        >
          {formatTime(seconds)}
        </span>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          /{formatTime(targetSeconds)}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
        <MtButton
          size="small"
          onClick={() => {
            hapticService.lightTap();
            stopwatch.reset();
          }}
          title="Resetar cronômetro"
          aria-label="Resetar cronômetro de descanso"
          style={{ minWidth: '44px', minHeight: '44px', padding: '0' }}
        >
          <RotateCcw size={18} strokeWidth={2.25} />
        </MtButton>
      </div>
    </div>
  );
}
