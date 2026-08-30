import type { WorkoutSession } from '../types/workout';

const HISTORY_STORAGE_KEY = 'meu_treino_history';
const TEMPLATE_STORAGE_KEY = 'meu_treino_templates';
const ACTIVE_WORKOUT_STORAGE_KEY = 'meu_treino_active';

/**
 * Recupera o histórico completo de sessões de treino salvas.
 */
export function getWorkoutHistory(): WorkoutSession[] {
  const historyJson = localStorage.getItem(HISTORY_STORAGE_KEY);
  if (!historyJson) {
    return [];
  }
  try {
    const workoutSessions = JSON.parse(historyJson) as WorkoutSession[];
    return workoutSessions.sort((firstSession, secondSession) => {
      return new Date(secondSession.date).getTime() - new Date(firstSession.date).getTime();
    });
  } catch {
    return [];
  }
}

/**
 * Salva ou atualiza uma sessão de treino no histórico.
 */
export function saveWorkoutSession(workoutSession: WorkoutSession): void {
  const currentHistory = getWorkoutHistory();
  const existingSessionIndex = currentHistory.findIndex((session) => {
    return session.id === workoutSession.id;
  });

  if (existingSessionIndex !== -1) {
    currentHistory[existingSessionIndex] = workoutSession;
  } else {
    currentHistory.push(workoutSession);
  }

  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(currentHistory));
}

/**
 * Remove uma sessão de treino do histórico pelo identificador.
 */
export function deleteWorkoutSession(workoutSessionId: string): void {
  const currentHistory = getWorkoutHistory();
  const filteredHistory = currentHistory.filter((session) => {
    return session.id !== workoutSessionId;
  });
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filteredHistory));
}

/**
 * Recupera todos os templates de treino salvos.
 */
export function getWorkoutTemplates(): WorkoutSession[] {
  const templatesJson = localStorage.getItem(TEMPLATE_STORAGE_KEY);
  if (!templatesJson) {
    return [];
  }
  try {
    return JSON.parse(templatesJson) as WorkoutSession[];
  } catch {
    return [];
  }
}

/**
 * Salva ou atualiza um template de treino.
 */
export function saveWorkoutTemplate(workoutTemplate: WorkoutSession): void {
  const currentTemplates = getWorkoutTemplates();
  const existingTemplateIndex = currentTemplates.findIndex((template) => {
    return template.id === workoutTemplate.id;
  });

  if (existingTemplateIndex !== -1) {
    currentTemplates[existingTemplateIndex] = workoutTemplate;
  } else {
    currentTemplates.push(workoutTemplate);
  }

  localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(currentTemplates));
}

/**
 * Remove um template de treino pelo identificador.
 */
export function deleteWorkoutTemplate(workoutTemplateId: string): void {
  const currentTemplates = getWorkoutTemplates();
  const filteredTemplates = currentTemplates.filter((template) => {
    return template.id !== workoutTemplateId;
  });
  localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(filteredTemplates));
}

/**
 * Recupera a sessão de treino ativa atual, se houver uma em andamento.
 */
export function getActiveWorkoutSession(): WorkoutSession | null {
  const activeWorkoutJson = localStorage.getItem(ACTIVE_WORKOUT_STORAGE_KEY);
  if (!activeWorkoutJson) {
    return null;
  }
  try {
    return JSON.parse(activeWorkoutJson) as WorkoutSession;
  } catch {
    return null;
  }
}

/**
 * Salva a sessão de treino ativa atual ou remove do armazenamento se nulo.
 */
export function saveActiveWorkoutSession(workoutSession: WorkoutSession | null): void {
  if (workoutSession === null) {
    localStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
  } else {
    localStorage.setItem(ACTIVE_WORKOUT_STORAGE_KEY, JSON.stringify(workoutSession));
  }
}

const LAST_BACKUP_COUNT_STORAGE_KEY = 'meu_treino_last_backup_count';
const GLOBAL_NOTES_STORAGE_KEY = 'meu_treino_global_notes';

/**
 * Recupera as notas globais unificadas de todos os exercícios.
 */
export function getGlobalExerciseNotes(): Record<string, string> {
  const notesJson = localStorage.getItem(GLOBAL_NOTES_STORAGE_KEY);
  if (!notesJson) {
    return {};
  }
  try {
    return JSON.parse(notesJson) as Record<string, string>;
  } catch {
    return {};
  }
}

/**
 * Salva a nota de um exercício globalmente de forma unificada (Singleton).
 */
export function saveGlobalExerciseNote(exerciseName: string, notes: string): void {
  const allNotes = getGlobalExerciseNotes();
  const normalizedKey = exerciseName.trim().toLowerCase();
  if (!normalizedKey) {
    return;
  }
  allNotes[normalizedKey] = notes;
  localStorage.setItem(GLOBAL_NOTES_STORAGE_KEY, JSON.stringify(allNotes));
}

/**
 * Recupera o número de treinos salvos que estavam no histórico durante o último backup.
 */
export function getLastBackupWorkoutCount(): number {
  const lastBackupCountString = localStorage.getItem(LAST_BACKUP_COUNT_STORAGE_KEY);
  if (!lastBackupCountString) {
    return 0;
  }
  const numericCount = parseInt(lastBackupCountString, 10);
  return isNaN(numericCount) ? 0 : numericCount;
}

/**
 * Define o número de treinos no histórico no momento em que o backup foi realizado.
 */
export function saveLastBackupWorkoutCount(workoutCount: number): void {
  localStorage.setItem(LAST_BACKUP_COUNT_STORAGE_KEY, String(workoutCount));
}

/**
 * Limpa todo o histórico de dados local do aplicativo (usado para resets ou limpezas).
 */
export function clearAllWorkoutData(): void {
  localStorage.removeItem(HISTORY_STORAGE_KEY);
  localStorage.removeItem(TEMPLATE_STORAGE_KEY);
  localStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
  localStorage.removeItem(LAST_BACKUP_COUNT_STORAGE_KEY);
  localStorage.removeItem(GLOBAL_NOTES_STORAGE_KEY);
}
