import { describe, it, expect, beforeEach } from 'vitest';
import { runNotesMigrationV150 } from './notesMigration';
import type { WorkoutSession } from '../types/workout';

describe('runNotesMigrationV150', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve migrar e concatenar notas de treinos do histórico e templates sem duplicar itens iguais', () => {
    const mockHistory: WorkoutSession[] = [
      {
        id: 'session-2',
        name: 'Treino A',
        date: '2026-08-29T10:00:00Z',
        durationInSeconds: 3600,
        exercises: [
          {
            id: 'ex-2',
            name: 'Supino Reto',
            notes: 'Halteres de 30kg',
            sets: [],
            weightInKg: 0,
          },
        ],
      },
      {
        id: 'session-1',
        name: 'Treino A',
        date: '2026-08-28T10:00:00Z',
        durationInSeconds: 3600,
        exercises: [
          {
            id: 'ex-1',
            name: 'Supino Reto',
            notes: 'Pegada média',
            sets: [],
            weightInKg: 0,
          },
        ],
      },
    ];

    const mockTemplates: WorkoutSession[] = [
      {
        id: 'template-1',
        name: 'Template Supino',
        date: '2026-08-27T10:00:00Z',
        durationInSeconds: 0,
        exercises: [
          {
            id: 'ex-temp-1',
            name: 'Supino Reto',
            notes: 'Focar na descida lenta',
            sets: [],
            weightInKg: 0,
          },
        ],
      },
    ];

    localStorage.setItem('meu_treino_history', JSON.stringify(mockHistory));
    localStorage.setItem('meu_treino_templates', JSON.stringify(mockTemplates));

    runNotesMigrationV150();

    const globalNotesJson = localStorage.getItem('meu_treino_global_notes');
    expect(globalNotesJson).not.toBeNull();

    const globalNotes = JSON.parse(globalNotesJson!) as Record<string, string>;

    // Devem aparecer na ordem correta: Templates primeiro, depois históricos (antigos para novos)
    // Portanto: 'Focar na descida lenta', 'Pegada média', 'Halteres de 30kg'
    expect(globalNotes['supino reto']).toBe(
      'Focar na descida lenta\n---\nPegada média\n---\nHalteres de 30kg',
    );

    // A flag de migração concluída deve ser setada
    expect(localStorage.getItem('meu_treino_notes_migrated_v1_5_0')).toBe('true');
  });

  it('não deve rodar novamente se a flag de migração já estiver setada', () => {
    localStorage.setItem('meu_treino_notes_migrated_v1_5_0', 'true');

    // Tenta gravar notas no histórico para testar se roda
    const mockHistory: WorkoutSession[] = [
      {
        id: 'session-1',
        name: 'Treino A',
        date: '2026-08-28T10:00:00Z',
        durationInSeconds: 3600,
        exercises: [
          {
            id: 'ex-1',
            name: 'Rosca Direta',
            notes: 'Nota nova',
            sets: [],
            weightInKg: 0,
          },
        ],
      },
    ];
    localStorage.setItem('meu_treino_history', JSON.stringify(mockHistory));

    runNotesMigrationV150();

    const globalNotesJson = localStorage.getItem('meu_treino_global_notes');
    expect(globalNotesJson).toBeNull();
  });
});
