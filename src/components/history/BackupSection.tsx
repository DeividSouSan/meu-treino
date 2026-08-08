import React, { useRef, useState, useCallback } from 'react';
import { exportWorkoutBackup, importWorkoutBackup } from '../../services/backupService';
import { getLastBackupWorkoutCount, getWorkoutHistory } from '../../services/storageService';

export interface BackupSectionProps {
  onImportSuccess: () => void;
  workoutHistoryLength: number;
}

export function BackupSection({ onImportSuccess, workoutHistoryLength }: BackupSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastBackupCount, setLastBackupCount] = useState<number>(getLastBackupWorkoutCount());
  const workoutsSinceLastBackup = Math.max(0, workoutHistoryLength - lastBackupCount);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
          onImportSuccess();
          setLastBackupCount(getWorkoutHistory().length);
          alert('Dados importados com sucesso!');
        } else {
          alert('Erro ao importar. Verifique se o arquivo JSON está no formato correto.');
        }
      }
    };

    fileReader.readAsText(selectedFile);
  }, [onImportSuccess]);

  const handleExportBackup = useCallback(() => {
    exportWorkoutBackup();
    setLastBackupCount(workoutHistoryLength);
  }, [workoutHistoryLength]);

  const handleTriggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
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
  );
}