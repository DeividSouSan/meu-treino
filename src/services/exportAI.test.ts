import { describe, it, expect } from 'vitest';
import { exportSessionForAI, exportHistoryForAI } from './exportAI';
import type { WorkoutSession } from '../types/workout';

describe('exportAIService', () => {
  const mockSession: WorkoutSession = {
    id: 's1',
    date: '2026-03-01T10:00:00.000Z',
    durationInSeconds: 3600,
    name: 'Treino A - Peito e Tríceps',
    cues: ['Manter escápulas retraídas', 'Foco no pico de contração'],
    isTemplate: false,
    status: 'completed',
    exercises: [
      {
        id: 'e1',
        name: 'Supino Reto',
        weightInKg: 80,
        notes: 'Execução controlada',
        equipmentType: 'barbell',
        loadType: 'total',
        sets: [
          { weightInKg: 80, repetitions: 10, restTimeInSeconds: 90, advancedTechniques: [] },
          { weightInKg: 80, repetitions: 10, restTimeInSeconds: 90, advancedTechniques: [] },
          { weightInKg: 85, repetitions: 8, restTimeInSeconds: 120, advancedTechniques: ['RP'] },
        ],
      },
    ],
  };

  it('deve formatar uma sessão individual de treino corretamente', () => {
    const result = exportSessionForAI(mockSession);

    expect(result).toContain('Treino: Treino A - Peito e Tríceps');
    expect(result).toContain('60min');
    expect(result).toContain('concluído');
    expect(result).toContain('Obs. gerais: Manter escápulas retraídas; Foco no pico de contração');
    expect(result).toContain('1. Supino Reto (barbell, total) — obs: Execução controlada');
    expect(result).toContain('2x10 @ 80kg | descanso 90s');
    expect(result).toContain('1x8 @ 85kg | descanso 120s [RP]');
  });

  it('deve agrupar sessões e ignorar templates em exportHistoryForAI', () => {
    const mockTemplateSession: WorkoutSession = {
      ...mockSession,
      id: 't1',
      isTemplate: true,
      name: 'Template A',
    };

    const result = exportHistoryForAI([mockSession, mockTemplateSession]);

    expect(result).toContain('Treino A - Peito e Tríceps');
    expect(result).not.toContain('Template A');
  });
});
