import React, { useRef } from 'react';
import type { WorkoutSession } from '../types/workout';
import { exportWorkoutBackup, importWorkoutBackup } from '../services/backupService';

/**
 * Interface de propriedades para a visualização do histórico.
 */
export interface HistoryViewProps {
  workoutHistory: WorkoutSession[];
  workoutTemplates: WorkoutSession[];
  activeSession: WorkoutSession | null;
  startNewWorkout: (templateSession?: WorkoutSession | null) => void;
  startEditingWorkout: (workoutSession: WorkoutSession) => void;
  deleteSession: (sessionId: string) => void;
  deleteTemplate: (templateId: string) => void;
  reloadAllData: () => void;
  onResumeActiveWorkout: () => void;
}

/**
 * Componente de visualização do histórico de treinos e controle de modelos.
 */
export function HistoryView({
  workoutHistory,
  workoutTemplates,
  activeSession,
  startNewWorkout,
  startEditingWorkout,
  deleteSession,
  deleteTemplate,
  reloadAllData,
  onResumeActiveWorkout,
}: HistoryViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) {
      return;
    }

    const selectedFile = fileList[0];
    const fileReader = new FileReader();
    
    fileReader.onload = (fileEvent) => {
      const fileContent = fileEvent.target?.result;
      if (typeof fileContent === 'string') {
        const importSuccess = importWorkoutBackup(fileContent);
        if (importSuccess) {
          reloadAllData();
          alert('Dados importados com sucesso!');
        } else {
          alert('Erro ao importar. Verifique se o arquivo JSON está no formato correto.');
        }
      }
    };

    fileReader.readAsText(selectedFile);
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleConfirmDeleteSession = (sessionId: string) => {
    const userConfirmed = window.confirm('Deseja realmente excluir este treino do histórico?');
    if (userConfirmed) {
      deleteSession(sessionId);
    }
  };

  const handleConfirmDeleteTemplate = (templateId: string) => {
    const userConfirmed = window.confirm('Deseja realmente excluir este template?');
    if (userConfirmed) {
      deleteTemplate(templateId);
    }
  };

  const handleRepeatLastWorkout = () => {
    if (workoutHistory.length > 0) {
      const lastWorkoutSession = workoutHistory[0];
      startNewWorkout(lastWorkoutSession);
    }
  };

  const formatWorkoutDate = (dateString: string) => {
    const parsedDate = new Date(dateString);
    return parsedDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatWorkoutDuration = (durationInSeconds: number) => {
    const durationInMinutes = Math.round(durationInSeconds / 60);
    return `${durationInMinutes} min`;
  };

  return (
    <div>
      <header>
        <h1>Histórico de Treinos</h1>
        <span className="badge completed">Offline-First</span>
      </header>

      <main>
        {activeSession && (
          <div className="card" style={{ borderColor: 'var(--warning-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: 'var(--warning-color)' }}>Treino em Andamento</h3>
                <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                  Iniciado em: {formatWorkoutDate(activeSession.date)}
                </p>
              </div>
              <button className="primary small" onClick={onResumeActiveWorkout}>
                Retomar
              </button>
            </div>
          </div>
        )}

        <section className="card">
          <h2>Iniciar Treino</h2>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap', marginTop: 'var(--spacing-sm)' }}>
            <button className="primary" onClick={() => startNewWorkout(null)}>
              + Iniciar Treino Livre
            </button>
            <button
              onClick={handleRepeatLastWorkout}
              disabled={workoutHistory.length === 0}
              style={{ opacity: workoutHistory.length === 0 ? 0.5 : 1 }}
            >
              🔄 Repetir Último Treino
            </button>
          </div>
        </section>

        <section className="card">
          <h2>Templates (Modelos)</h2>
          {workoutTemplates.length === 0 ? (
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: 'var(--spacing-xs)' }}>
              Nenhum template salvo. Salve um modelo ao concluir um treino ativo.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
              {workoutTemplates.map((template) => (
                <div
                  key={template.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: 'var(--spacing-sm)',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>{template.name}</strong>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {template.exercises.map((exercise) => exercise.name).join(', ')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                    <button className="small" onClick={() => startNewWorkout(template)}>
                      Carregar
                    </button>
                    <button className="danger small" onClick={() => handleConfirmDeleteTemplate(template.id)}>
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2>Histórico</h2>
          {workoutHistory.length === 0 ? (
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: 'var(--spacing-xs)' }}>
              Nenhum treino registrado ainda. Comece agora mesmo!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
              {workoutHistory.map((session) => (
                <div
                  key={session.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-xs)',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: 'var(--spacing-md)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{formatWorkoutDate(session.date)}</strong>
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                      ⏱ {formatWorkoutDuration(session.durationInSeconds)}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {session.name !== 'Treino Livre' && (
                      <span className="badge completed" style={{ marginRight: '6px', fontSize: '0.7rem', padding: '2px 4px' }}>
                        {session.name}
                      </span>
                    )}
                    {session.exercises.map((exercise) => {
                      const setsCount = exercise.sets.length;
                      return `${exercise.name} (${setsCount} ${setsCount === 1 ? 'série' : 'séries'})`;
                    }).join(', ')}
                  </div>

                  {session.cues.length > 0 && (
                    <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                      Lembretes: {session.cues.join(' | ')}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-xs)' }}>
                    <button className="small" onClick={() => startEditingWorkout(session)}>
                      Editar
                    </button>
                    <button className="danger small" onClick={() => handleConfirmDeleteSession(session.id)}>
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2>Backup dos Dados</h2>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
            <button onClick={exportWorkoutBackup}>
              📥 Exportar Backup (JSON)
            </button>
            <button onClick={handleTriggerFileInput}>
              📤 Importar Backup (JSON)
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              style={{ display: 'none' }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
