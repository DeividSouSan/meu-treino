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
 * Utiliza timestamps de alta precisão (performance.now) para evitar
 * o drift acumulativo típico de setInterval puro, garantindo que o
 * tempo decorrido corresponda ao tempo real.
 */
export function useStopwatch(initialSeconds: number = 0, autoStart: boolean = false): UseStopwatchResult {
  const [seconds, setSecondsState] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);

  const accumulatedSecondsRef = useRef<number>(initialSeconds);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const updateDisplayedTime = () => {
    if (startTimeRef.current !== null) {
      const elapsedMs = performance.now() - startTimeRef.current;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      setSecondsState(accumulatedSecondsRef.current + elapsedSeconds);
    }
  };

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
      const tick = () => {
        updateDisplayedTime();
        animationFrameRef.current = requestAnimationFrame(tick);
      };
      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
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
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
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
    startTimeRef.current = null;
    setSecondsState(0);
    setIsRunning(true);
  };

  const setSeconds = (newSeconds: number) => {
    accumulatedSecondsRef.current = newSeconds;
    startTimeRef.current = null;
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
