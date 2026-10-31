import { useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { NavigationContext, type ScreenId, type NavigationParams } from './NavigationContext';

// Debug mode: define globally for development debugging
// Set (window as any).__DEBUG_NAV__ = true in your app to enable
const devLog = (...args: unknown[]) => {
  // Check debug mode on each call (not just at module load)
  // This allows enabling/disabling via console without page reload
  if (typeof window !== 'undefined' && (window as any).__DEBUG_NAV__) {
    const timestamp = new Date().toLocaleTimeString('pt-BR', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    console.log('[NavigationProvider DEBUG]', timestamp, '|', ...args);
  }
};

export interface NavigationProviderProps {
  children: ReactNode;
  initialScreen?: ScreenId;
}

const SCREEN_PATHS: Record<ScreenId, string> = {
  history: '/',
  active_workout: '/treino',
  exercise_screen: '/exercicio',
  settings: '/configuracoes',
};

function pathnameForScreen(screen: ScreenId, params?: NavigationParams): string {
  if (screen === 'exercise_screen' && params?.exerciseId) {
    return `/exercicio/${params.exerciseId}`;
  }
  return SCREEN_PATHS[screen];
}

function screenFromPathname(pathname: string): { screen: ScreenId; exerciseId: string | null } {
  if (pathname === '/') return { screen: 'history', exerciseId: null };
  if (pathname === '/treino') return { screen: 'active_workout', exerciseId: null };
  if (pathname === '/configuracoes') return { screen: 'settings', exerciseId: null };

  const exerciseMatch = pathname.match(/^\/exercicio\/([^/]+)$/);
  if (exerciseMatch) {
    return { screen: 'exercise_screen', exerciseId: exerciseMatch[1] };
  }

  // Fallback: caminho desconhecido vai para histórico
  return { screen: 'history', exerciseId: null };
}

export function NavigationProvider({
  children,
  initialScreen = 'history',
}: NavigationProviderProps) {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(initialScreen);
  const [exerciseId, setExerciseId] = useState<string | null>(null);

  // Refs para manter o listener de popstate estável (sem re-registrar a cada mudança)
  const currentScreenRef = useRef(currentScreen);
  const exerciseIdRef = useRef(exerciseId);

  useEffect(() => {
    currentScreenRef.current = currentScreen;
  }, [currentScreen]);

  useEffect(() => {
    exerciseIdRef.current = exerciseId;
  }, [exerciseId]);

  devLog('NavigationProvider initialized', {
    initialScreen,
    currentScreen,
    exerciseId,
  });

  // Navega para uma tela, atualizando o estado React e o history do navegador
  const navigateTo = useCallback((screen: ScreenId, params?: NavigationParams) => {
    const path = pathnameForScreen(screen, params);
    const newExerciseId =
      screen === 'exercise_screen' && params?.exerciseId ? params.exerciseId : null;

    setCurrentScreen(screen);
    setExerciseId(newExerciseId);
    window.history.pushState({ screen, exerciseId: newExerciseId }, '', path);

    devLog('navigateTo', { screen, params, path, exerciseId: newExerciseId });
  }, []);

  const navigateToHistory = useCallback(() => {
    navigateTo('history');
  }, [navigateTo]);

  const navigateToActiveWorkout = useCallback(() => {
    navigateTo('active_workout');
  }, [navigateTo]);

  const navigateToExercise = useCallback(
    (exerciseIdParam: string) => {
      navigateTo('exercise_screen', { exerciseId: exerciseIdParam });
    },
    [navigateTo],
  );

  const navigateToSettings = useCallback(() => {
    navigateTo('settings');
  }, [navigateTo]);

  const goBackToList = useCallback(() => {
    navigateTo('active_workout');
  }, [navigateTo]);

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  // Sincroniza o estado inicial com a URL no mount (deep link / refresh).
  // Se o pathname for o padrão "/", respeita a prop initialScreen.
  useEffect(() => {
    const isDefaultPath = window.location.pathname === '/';
    const { screen, exerciseId: parsedExerciseId } = isDefaultPath
      ? { screen: initialScreen, exerciseId: null }
      : screenFromPathname(window.location.pathname);

    setCurrentScreen(screen);
    setExerciseId(parsedExerciseId);

    const initialState = { screen, exerciseId: parsedExerciseId };
    window.history.replaceState(initialState, '', window.location.pathname);

    devLog('initial state synced from pathname', {
      pathname: window.location.pathname,
      screen,
      exerciseId: parsedExerciseId,
    });
  }, [initialScreen]);

  // Efeito: gerencia popstate do navegador (botão voltar / gestos)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as {
        screen?: ScreenId;
        exerciseId?: string | null;
      } | null;

      devLog('popstate event received', {
        state,
        currentScreenBefore: currentScreenRef.current,
      });

      // Se o estado vier do history.state (pushState/replaceState), use-o diretamente
      if (state?.screen) {
        setCurrentScreen(state.screen);
        setExerciseId(state.exerciseId ?? null);
        return;
      }

      // Caso contrário, re-derive a partir do pathname atual (deep link externo)
      const { screen, exerciseId: parsedExerciseId } = screenFromPathname(window.location.pathname);
      setCurrentScreen(screen);
      setExerciseId(parsedExerciseId);
      devLog('popstate derived from pathname', {
        screen,
        exerciseId: parsedExerciseId,
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  devLog('popstate listener added');

  const value = {
    currentScreen,
    exerciseId,
    navigateTo,
    navigateToHistory,
    navigateToActiveWorkout,
    navigateToExercise,
    navigateToSettings,
    goBackToList,
    goBack,
  };

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
