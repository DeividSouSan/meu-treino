import React, { useRef, useState, useCallback } from 'react';
import { exportWorkoutBackup, importWorkoutBackup } from '../../services/backupService';
import { getLastBackupWorkoutCount, getWorkoutHistory } from '../../services/storageService';
import { MtAlert, MtSectionTitle } from '../ui';
import { CloudUpload, Download, Upload } from 'lucide-react';

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
      <MtSectionTitle icon={<CloudUpload size={18} strokeWidth={2} color="var(--accent-color)" />}>
        Backup
      </MtSectionTitle>
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
          <Download size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
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
          <Upload size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
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
        <MtAlert variant="warning" style={{ marginTop: 'var(--spacing-xs)' }}>
          {workoutsSinceLastBackup} {workoutsSinceLastBackup === 1 ? 'treino novo' : 'treinos novos'} desde último backup
        </MtAlert>
      )}
    </section>
  );
}