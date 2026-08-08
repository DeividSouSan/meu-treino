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
        <h1>Histórico</h1>
      </header>

      <main>
        <section className="card" style={{ gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Backup</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-xs)' }}>
            <button 
              className="small" 
              onClick={handleExportBackup}
              style={{ 
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Exportar
            </button>
            <button 
              className="small" 
              onClick={handleTriggerFileInput}
              style={{ 
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Importar
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              style={{ display: 'none' }}
            />
          </div>
          {workoutsSinceLastBackup > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 10px',
              backgroundColor: 'var(--warning-light)',
              borderRadius: 'var(--border-radius)',
              fontSize: '0.8rem',
              color: 'var(--warning-color)',
              fontWeight: 600,
              marginTop: 'var(--spacing-xs)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {workoutsSinceLastBackup} {workoutsSinceLastBackup === 1 ? 'treino novo' : 'treinos novos'} desde último backup
            </div>
          )}
        </section>

        {activeSession && (
          <div className="card" style={{ 
            borderLeft: '4px solid var(--warning-color)',
            marginBottom: 'var(--spacing-md)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: 'var(--warning-color)', marginBottom: '4px' }}>Treino em Andamento</h3>
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
          <h2 style={{ margin: 0 }}>Histórico</h2>
          {workoutHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-lg) 0' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 'var(--spacing-md)', opacity: 0.5 }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              <p className="text-secondary" style={{ fontSize: '0.95rem', marginBottom: 'var(--spacing-md)', fontWeight: 500 }}>
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
                    gap: '6px',
                    padding: 'var(--spacing-sm) 0',
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--background-color)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {session.name !== 'Treino Livre' ? session.name : 'Treino Livre'}
                    </strong>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      color: 'var(--accent-color)',
                      fontWeight: 600,
                      fontFamily: 'monospace'
                    }}>
                      {formatWorkoutDuration(session.durationInSeconds)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
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
          title="Novo Treino"
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
