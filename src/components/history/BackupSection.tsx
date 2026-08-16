import React, { useRef, useCallback } from 'react';
import { useBackupSection } from './useBackupSection';
import { MtAlert, MtSectionTitle, MtButton, MtCard } from '../ui';
import { CloudUpload, Download, Upload } from 'lucide-react';

export interface BackupSectionProps {
  /**
   * Disparado após uma importação bem-sucedida, para que a View recarregue
   * (ex.: voltar ao histórico).
   */
  onImportSuccess: () => void;
  /**
   * Quantidade atual de treinos no histórico. Serve para calcular quantos
   * treinos novos existem desde o último backup.
   */
  workoutHistoryLength: number;
}

/**
 * BackupSection é a seção de exportação/importação de dados.
 *
 * É puramente apresentacional: toda a lógica de backup (serviços, contagem)
 * está no container useBackupSection. Aqui só orquestramos a UI de input de
 * arquivo (FileReader) e os alertas de feedback ao usuário.
 */
export function BackupSection({ onImportSuccess, workoutHistoryLength }: BackupSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { workoutsSinceLastBackup, exportBackup, importBackup } = useBackupSection(workoutHistoryLength);

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
        const importSucceeded = importBackup(fileContent);
        if (importSucceeded) {
          onImportSuccess();
          alert('Dados importados com sucesso!');
        } else {
          alert('Erro ao importar. Verifique se o arquivo JSON está no formato correto.');
        }
      }
    };

    fileReader.readAsText(selectedFile);
  }, [importBackup, onImportSuccess]);

  const handleExportBackup = useCallback(() => {
    exportBackup();
  }, [exportBackup]);

  const handleTriggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <MtCard as="section" style={{ gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
      <MtSectionTitle icon={<CloudUpload size={18} strokeWidth={2} color="var(--accent-color)" />}>
        Backup
      </MtSectionTitle>
      <div style={{ display: 'flex', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-xs)' }}>
        <MtButton size="small" onClick={handleExportBackup} style={{ flex: 1 }}>
          <Download size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          Exportar
        </MtButton>
        <MtButton size="small" onClick={handleTriggerFileInput} style={{ flex: 1 }}>
          <Upload size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          Importar
        </MtButton>
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
    </MtCard>
  );
}
