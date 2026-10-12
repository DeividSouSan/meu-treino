import type {
  WorkoutSession,
  WorkoutExercise,
  ExerciseSet,
  AdvancedTechnique,
  EquipmentType,
  LoadType,
} from '../types/workout';

export type {
  AdvancedTechnique,
  ExerciseSet,
  EquipmentType,
  LoadType,
  WorkoutExercise,
  WorkoutSession,
};

interface GroupedSet {
  count: number;
  weightInKg: number;
  repetitions: number;
  restTimeInSeconds: number;
  advancedTechniques: AdvancedTechnique[];
}

/** Agrupa séries consecutivas idênticas (mesmo peso, reps, descanso e técnicas). */
function groupSets(sets: ExerciseSet[]): GroupedSet[] {
  const groups: GroupedSet[] = [];

  for (const s of sets) {
    const last = groups[groups.length - 1];
    const sameAsLast =
      last &&
      last.weightInKg === s.weightInKg &&
      last.repetitions === s.repetitions &&
      last.restTimeInSeconds === s.restTimeInSeconds &&
      last.advancedTechniques.join(',') === s.advancedTechniques.join(',');

    if (sameAsLast) {
      last.count++;
    } else {
      groups.push({
        count: 1,
        weightInKg: s.weightInKg,
        repetitions: s.repetitions,
        restTimeInSeconds: s.restTimeInSeconds,
        advancedTechniques: s.advancedTechniques,
      });
    }
  }

  return groups;
}

function formatDuration(seconds: number): string {
  const min = Math.round(seconds / 60);
  return `${min}min`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// --- exportador principal ---

/**
 * Gera uma representação compacta e legível de uma sessão de treino,
 * otimizada para colar em um chat de IA (menos tokens que o JSON bruto).
 */
export function exportSessionForAI(session: WorkoutSession): string {
  const lines: string[] = [];

  const statusStr = session.status === 'completed' ? 'concluído' : 'em andamento';
  lines.push(
    `Treino: ${session.name} | ${formatDate(session.date)} | ${formatDuration(
      session.durationInSeconds,
    )} | ${statusStr}`,
  );

  if (session.cues.length > 0) {
    lines.push(`Obs. gerais: ${session.cues.join('; ')}`);
  }

  lines.push('');

  session.exercises.forEach((ex, i) => {
    const meta: string[] = [];
    if (ex.equipmentType) meta.push(ex.equipmentType);
    if (ex.loadType) meta.push(ex.loadType === 'each_side' ? 'cada lado' : 'total');
    const metaStr = meta.length ? ` (${meta.join(', ')})` : '';
    const notesStr = ex.notes ? ` — obs: ${ex.notes}` : '';

    lines.push(`${i + 1}. ${ex.name}${metaStr}${notesStr}`);

    const grouped = groupSets(ex.sets);
    for (const g of grouped) {
      const techStr = g.advancedTechniques.length ? ` [${g.advancedTechniques.join(',')}]` : '';
      lines.push(
        `   ${g.count}x${g.repetitions} @ ${g.weightInKg}kg | descanso ${g.restTimeInSeconds}s${techStr}`,
      );
    }
  });

  return lines.join('\n');
}

/**
 * Exporta múltiplas sessões (ex: histórico das últimas semanas) de forma
 * ainda mais enxuta, uma abaixo da outra, separadas por linha em branco.
 */
export function exportHistoryForAI(sessions: WorkoutSession[]): string {
  return sessions
    .filter((s) => !s.isTemplate) // templates raramente interessam pra análise de progresso
    .map(exportSessionForAI)
    .join('\n\n---\n\n');
}
