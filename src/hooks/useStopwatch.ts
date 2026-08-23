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
 * Usa Date.now() como fonte de tempo em vez de performance.now(), o que garante
 * que o cronômetro continue avançando mesmo quando a aba está oculta, a tela
 * está desligada ou o app está em segundo plano. O setInterval ainda pode sofrer
 * throttling, mas o cálculo de tempo sempre parte de um timestamp real de
 * calendário (Date.now()), eliminando o congelamento observado com performance.now().
 *
 * Precisão esperada: ≤ 2 min de desvio em sessões de 35‑50 min (cronômetro da
 * sessão) e ≤ 10 s de desvio para o cronômetro de descanso entre séries.
 */
export function useStopwatch(
  initialSeconds: number = 0,
  autoStart: boolean = false,
): UseStopwatchResult {
  const [seconds, setSecondsState] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);

  // Armazena os segundos acumulados antes da última pausa.
  const accumulatedSecondsRef = useRef<number>(initialSeconds);
  // Armazena o timestamp Date.now() do momento em que o cronômetro foi iniciado/retomado.
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Reinicia o estado quando initialSeconds ou autoStart mudam externamente.
  useEffect(() => {
    accumulatedSecondsRef.current = initialSeconds;
    setSecondsState(initialSeconds);
    if (autoStart) {
      setIsRunning(true);
      startTimeRef.current = Date.now();
    } else {
      setIsRunning(false);
      startTimeRef.current = null;
    }
  }, [initialSeconds, autoStart]);

  // Calcula e atualiza os segundos exibidos com base no tempo real decorrido.
  const updateTime = () => {
    if (startTimeRef.current !== null) {
      const elapsedMs = Date.now() - startTimeRef.current;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      setSecondsState(accumulatedSecondsRef.current + elapsedSeconds);
    }
  };

  useEffect(() => {
    if (isRunning) {
      // Marca o instante de início usando a hora real do calendário.
      startTimeRef.current = Date.now();
      intervalRef.current = window.setInterval(updateTime, 1000);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Ao pausar, acumula os segundos decorridos desde o último start.
      if (startTimeRef.current !== null) {
        const elapsedMs = Date.now() - startTimeRef.current;
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
    startTimeRef.current = Date.now();
    setSecondsState(0);
    setIsRunning(true);
  };

  const setSeconds = (newSeconds: number) => {
    accumulatedSecondsRef.current = newSeconds;
    if (isRunning) {
      // Reposiciona o ponto de início para que o cálculo futuro seja correto.
      startTimeRef.current = Date.now();
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
