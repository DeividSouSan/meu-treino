import { getWorkoutHistory, getWorkoutTemplates, getGlobalExerciseNotes } from './storageService';

const MIGRATION_FLAG_KEY = 'meu_treino_notes_migrated_v1_5_0';

export function runNotesMigrationV150(): void {
  if (localStorage.getItem(MIGRATION_FLAG_KEY) === 'true') {
    return;
  }

  const history = getWorkoutHistory();
  const templates = getWorkoutTemplates();

  // Agrupa notas por nome do exercício
  const tempMap: Record<string, string[]> = {};

  const addNote = (name: string, note: string) => {
    const key = name.trim().toLowerCase();
    const cleanNote = note.trim();
    if (!key || !cleanNote) return;

    if (!tempMap[key]) {
      tempMap[key] = [];
    }
    // Evita duplicar exatamente o mesmo texto
    if (!tempMap[key].includes(cleanNote)) {
      tempMap[key].push(cleanNote);
    }
  };

  // 1. Processa templates
  for (const template of templates) {
    for (const exercise of template.exercises) {
      if (exercise.name && exercise.notes) {
        addNote(exercise.name, exercise.notes);
      }
    }
  }

  // 2. Processa histórico (do mais antigo para o mais recente)
  const sortedHistory = [...history].reverse();
  for (const session of sortedHistory) {
    for (const exercise of session.exercises) {
      if (exercise.name && exercise.notes) {
        addNote(exercise.name, exercise.notes);
      }
    }
  }

  // 3. Salva concatenando com divisores "---"
  const globalNotes = getGlobalExerciseNotes();
  for (const [exerciseKey, noteList] of Object.entries(tempMap)) {
    if (noteList.length > 0) {
      const existing = globalNotes[exerciseKey];
      const combined = existing ? [existing, ...noteList] : noteList;

      const uniqueNotes = Array.from(new Set(combined));
      globalNotes[exerciseKey] = uniqueNotes.join('\n---\n');
    }
  }

  // Persiste no storage
  const GLOBAL_NOTES_STORAGE_KEY = 'meu_treino_global_notes';
  localStorage.setItem(GLOBAL_NOTES_STORAGE_KEY, JSON.stringify(globalNotes));
  localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
}
