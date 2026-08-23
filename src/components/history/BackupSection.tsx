import React, { useRef, useCallback, useState } from 'react';
import { useBackupSection } from './useBackupSection';
import { MtAlert, MtSectionTitle, MtButton, MtCard, MtAlertDialog } from '../ui';
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
  /**
   * Se verdadeiro, renderiza dentro de um MtCard. Se falso, renderiza como container flexível simples.
   * Padrão: true.
   */
  asCard?: boolean;
}

/**
 * BackupSection é a seção de exportação/importação de dados.
 *
 * É puramente apresentacional: toda a lógica de backup (serviços, contagem)
 * está no container useBackupSection. Aqui só orquestramos a UI de input de
 * arquivo (FileReader) e os alertas de feedback ao usuário.
 */
export function BackupSection({
  onImportSuccess,
  workoutHistoryLength,
  asCard = true,
}: BackupSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedbackDialog, setFeedbackDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'primary' | 'danger';
    isSuccess: boolean;
  } | null>(null);

  const { workoutsSinceLastBackup, exportBackup, importBackup } =
    useBackupSection(workoutHistoryLength);

  const handleCloseFeedback = useCallback(() => {
    const wasSuccess = feedbackDialog?.isSuccess;
    setFeedbackDialog(null);
    if (wasSuccess) {
      onImportSuccess();
    }
  }, [feedbackDialog, onImportSuccess]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = event.target.files;
      if (!fileList || fileList.length === 0) {
        return;
      }

      const selectedFile = fileList[0];
      const fileReader = new FileReader();

      fileReader.onload = (fileEvent) => {
        const fileContent = fileEvent.target?.result;
        if (typeof fileContent === 'string') {
          const result = importBackup(fileContent);
          if (result.success) {
            const feedbackMessage =
              result.count === 1 && result.sessionName
                ? `O treino "${result.sessionName}" foi adicionado ao seu histórico com sucesso!`
                : result.count > 0
                  ? `${result.count} treinos foram importados e sincronizados com seu histórico!`
                  : 'O backup foi processado, mas nenhum treino novo foi encontrado.';

            setFeedbackDialog({
              isOpen: true,
              title: 'Importação Concluída',
              message: feedbackMessage,
              variant: 'primary',
              isSuccess: true,
            });
          } else {
            setFeedbackDialog({
              isOpen: true,
              title: 'Erro na Importação',
              message:
                'Não foi possível importar os dados. Verifique se o arquivo JSON está no formato correto.',
              variant: 'danger',
              isSuccess: false,
            });
          }
        }
      };

      fileReader.readAsText(selectedFile);
    },
    [importBackup],
  );

  const handleExportBackup = useCallback(() => {
    exportBackup();
  }, [exportBackup]);

  const handleTriggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const content = (
    <>
      <MtSectionTitle icon={<CloudUpload size={18} strokeWidth={2} color="var(--accent-color)" />}>
        Backup de Treinos
      </MtSectionTitle>

      <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
        Seus treinos são salvos exclusivamente neste navegador. Exporte regularmente para não perder
        seus dados.
      </p>

      <div style={{ display: 'flex', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-xs)' }}>
        <MtButton size="small" onClick={handleExportBackup} style={{ flex: 1 }}>
          <Download size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          Exportar JSON
        </MtButton>
        <MtButton size="small" onClick={handleTriggerFileInput} style={{ flex: 1 }}>
          <Upload size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          Importar JSON
        </MtButton>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".json"
          style={{ display: 'none' }}
        />
      </div>

      {workoutsSinceLastBackup > 0 ? (
        <MtAlert variant="warning" style={{ marginTop: 'var(--spacing-xs)' }}>
          {workoutsSinceLastBackup}{' '}
          {workoutsSinceLastBackup === 1 ? 'treino novo não salvo' : 'treinos novos não salvos'} em
          arquivo. Exporte seu backup agora.
        </MtAlert>
      ) : (
        <MtAlert variant="info" style={{ marginTop: 'var(--spacing-xs)' }}>
          Todos os treinos registrados estão salvos no último arquivo exportado.
        </MtAlert>
      )}
    </>
  );

  return (
    <>
      {asCard ? (
        <MtCard
          as="section"
          style={{ gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}
        >
          {content}
        </MtCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {content}
        </div>
      )}

      <MtAlertDialog
        isOpen={Boolean(feedbackDialog?.isOpen)}
        title={feedbackDialog?.title || ''}
        message={feedbackDialog?.message || ''}
        variant={feedbackDialog?.variant || 'primary'}
        buttonText="Entendido"
        onClose={handleCloseFeedback}
      />
    </>
  );
}
