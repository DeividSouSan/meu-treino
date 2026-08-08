import React, { useRef, useState, useCallback } from 'react';
import type { WorkoutSession } from '../types/workout';
import { exportWorkoutBackup, importWorkoutBackup } from '../services/backupService';
import { getLastBackupWorkoutCount, getWorkoutHistory } from '../services/storageService';
import packageInfo from '../../package.json';

/**
 * Interface de propriedades para a visualização do histórico.
 */
export interface HistoryViewProps {
  workoutHistory: WorkoutSession[];
  activeSession: WorkoutSession | null;
  startNewWorkout: (templateSession?: WorkoutSession | null) => void;
  startEditingWorkout: (workoutSession: WorkoutSession) => void;
  deleteSession: (sessionId: string) => void;
  reloadAllData: () => void;
  onResumeActiveWorkout: () => void;
}

/**
 * Componente de visualização do histórico de treinos.
 */
export function HistoryView({
  workoutHistory,
  activeSession,
  startNewWorkout,
  startEditingWorkout,
  deleteSession,
  reloadAllData,
  onResumeActiveWorkout,
}: HistoryViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastBackupCount, setLastBackupCount] = useState<number>(getLastBackupWorkoutCount());
  const workoutsSinceLastBackup = Math.max(0, workoutHistory.length - lastBackupCount);

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
          setLastBackupCount(getWorkoutHistory().length);
          alert('Dados importados com sucesso!');
        } else {
          alert('Erro ao importar. Verifique se o arquivo JSON está no formato correto.');
        }
      }
    };

    fileReader.readAsText(selectedFile);
  };

  const handleExportBackup = () => {
    exportWorkoutBackup();
    setLastBackupCount(workoutHistory.length);
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

  const handleSessionTap = useCallback((session: WorkoutSession) => {
    startEditingWorkout(session);
  }, [startEditingWorkout]);

  const handleSessionLongPress = useCallback((sessionId: string) => {
    handleConfirmDeleteSession(sessionId);
  }, [handleConfirmDeleteSession]);

  return (
    <div>
      <header>
        <h1>Histórico de Treinos</h1>
        <span className="badge completed">Offline-First</span>
      </header>

      <main>
        <section className="card" style={{ gap: 'var(--spacing-sm)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="text-secondary" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Backup</span>
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
              <button className="small" onClick={handleExportBackup} title="Exportar backup">
                📥
              </button>
              <button className="small" onClick={handleTriggerFileInput} title="Importar backup">
                📤
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                style={{ display: 'none' }}
              />
            </div>
          </div>
          {workoutsSinceLastBackup > 0 && (
            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--warning-color)',
                fontWeight: 600,
                marginTop: 'var(--spacing-xs)',
              }}
            >
              ⚠️ {workoutsSinceLastBackup} {workoutsSinceLastBackup === 1 ? 'treino realizado' : 'treinos realizados'} desde o último backup.
            </p>
          )}
        </section>

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

        <section className="card" style={{ gap: 'var(--spacing-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Histórico</h2>
          </div>
          {workoutHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-lg) 0' }}>
              <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: 'var(--spacing-md)' }}>
                Nenhum treino registrado
              </p>
              <button className="primary" onClick={() => startNewWorkout(null)}>
                Criar primeiro treino
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {workoutHistory.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionTap(session)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleSessionLongPress(session.id);
                  }}
                  onTouchStart={(e) => {
                    const timer = setTimeout(() => {
                      handleSessionLongPress(session.id);
                    }, 600);
                    e.currentTarget.dataset.timerId = String(timer);
                  }}
                  onTouchEnd={(e) => {
                    const timerId = e.currentTarget.dataset.timerId;
                    if (timerId) {
                      clearTimeout(Number(timerId));
                      delete e.currentTarget.dataset.timerId;
                    }
                  }}
                  onTouchMove={() => {
                    const timerId = document.querySelector('[data-timer-id]')?.getAttribute('data-timer-id');
                    if (timerId) {
                      clearTimeout(Number(timerId));
                    }
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: 'var(--spacing-sm)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.95rem' }}>
                      {session.name !== 'Treino Livre' ? session.name : 'Treino Livre'}
                    </strong>
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                      {formatWorkoutDuration(session.durationInSeconds)}
                    </span>
                  </div>
                  <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
                    {formatWorkoutDate(session.date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '600px',
          paddingLeft: '24px',
          paddingRight: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          pointerEvents: 'none',
          zIndex: 99,
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            opacity: 0.4,
            pointerEvents: 'none',
            userSelect: 'none',
            marginBottom: '16px',
          }}
        >
          v{packageInfo.version}
        </span>
        <button
          className="primary"
          onClick={() => startNewWorkout(null)}
          title="Iniciar Treino Livre"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            fontSize: '28px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            pointerEvents: 'auto',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            lineHeight: '1',
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}