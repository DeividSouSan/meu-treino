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
 *
 * Mantém o tempo acumulado em um ref e recalcula o valor exibido
 * usando performance.now() para garantir precisão sem drift.
 */
export function useStopwatch(initialSeconds: number = 0, autoStart: boolean = false): UseStopwatchResult {
  const [seconds, setSecondsState] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);

  const accumulatedSecondsRef = useRef<number>(initialSeconds);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const updateTime = () => {
    if (startTimeRef.current !== null) {
      const elapsedMs = performance.now() - startTimeRef.current;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      setSecondsState(accumulatedSecondsRef.current + elapsedSeconds);
    }
  };

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
      intervalRef.current = window.setInterval(updateTime, 1000);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (startTimeRef.current !== null) {
        const elapsedMs = performance.now() - startTimeRef.current;
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        accumulatedSecondsRef.current += elapsedSeconds;
        startTimeRef.current = null;
        setSecondsState(accumulatedSecondsRef.current);
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
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
    accumulatedSecondsRef.current = 0;
    startTimeRef.current = performance.now();
    setSecondsState(0);
    setIsRunning(true);
  };

  const setSeconds = (newSeconds: number) => {
    accumulatedSecondsRef.current = newSeconds;
    if (isRunning) {
      startTimeRef.current = performance.now();
    } else {
      startTimeRef.current = null;
      setSecondsState(newSeconds);
    }
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
