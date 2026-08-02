import { useState, useEffect, useRef } from 'react';

/**
 * Interface de retorno do hook customizado useStopwatch.
 */
export interface UseStopwatchResult {
  seconds: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setSeconds: (newSeconds: number) => void;
}

/**
 * Hook customizado para gerenciar um cronômetro de tempo progressivo.
 */
export function useStopwatch(initialSeconds: number = 0, autoStart: boolean = false): UseStopwatchResult {
  const [seconds, setSecondsState] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);
  const intervalReference = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalReference.current = window.setInterval(() => {
        setSecondsState((previousSeconds) => previousSeconds + 1);
      }, 1000);
    } else if (intervalReference.current !== null) {
      clearInterval(intervalReference.current);
      intervalReference.current = null;
    }

    return () => {
      if (intervalReference.current !== null) {
        clearInterval(intervalReference.current);
      }
    };
  }, [isRunning]);

  const start = () => {
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setSecondsState(0);
    setIsRunning(true);
  };

  const setSeconds = (newSeconds: number) => {
    setSecondsState(newSeconds);
  };

  return {
    seconds,
    isRunning,
    start,
    pause,
    reset,
    setSeconds,
  };
}
