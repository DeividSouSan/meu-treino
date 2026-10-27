import { useCallback, useEffect, useState } from 'react';
import packageInfo from '../../../package.json';
import { useHistoryView } from './useHistoryView';
import { useTheme, useNavigation } from '../../hooks';
import {
  BackupSection,
  ExportAISection,
  ActiveWorkoutCard,
  WorkoutHistoryList,
  VersionInfo,
} from '../../components/history';

import {
  MtCard,
  MtFloatingActionButton,
  MtSectionTitle,
  MtConfirmDialog,
  MtButton,
  MtModal,
  MtSelect,
} from '../../components/ui';
import {
  Calendar,
  Settings,
  Plus,
  Pencil,
  Download,
  Trash2,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';

/**
 * HistoryView é a tela apresentacional do histórico de treinos.
 *
 * Ela não contém lógica: toda ação e formatação vem do container useHistoryView.
 * Organiza o topo com o treino em andamento (se houver), a lista de histórico,
 * o botão de configurações/backup no cabeçalho e o botão flutuante para novo treino.
 */
export function HistoryView() {
  const {
    workoutHistory,
    activeSession,
    sessionToDeleteId,
    selectedSessionForActions,
    isSettingsOpen,
    hasUnsavedSessions,
    openSettings,
    closeSettings,
    resumeActiveWorkout,
    handleSessionTap,
    handleSessionLongPress,
    closeActionMenu,
    handleEditFromActionMenu,
    handleExportFromActionMenu,
    handleDeleteFromActionMenu,
    confirmDeleteSession,
    cancelDeleteSession,
    handleImportSuccess,
    handleExportSuccess,
    handleCreateNewWorkout,
    confirmNewWorkout,
    confirmCreateNewWorkout,
    cancelCreateNewWorkout,
    formatWorkoutDate,
    formatWorkoutDuration,
  } = useHistoryView();

  const { theme, setTheme, resolvedTheme } = useTheme();

  const [isExitWarningOpen, setIsExitWarningOpen] = useState(false);

  const { registerBackHandler, clearBackHandler } = useNavigation();

  // Handler de prioridade para o gesto de voltar no Histórico:
  // 1. Fecha o aviso de saída se estiver aberto
  // 2. Fecha as configurações se estiverem abertas
  // 3. Fecha o menu de ações se estiver aberto
  // 4. Abre o aviso de saída se houver treino ativo
  // 5. Senão, não trata (permite sair do app)
  const historyBackHandler = useCallback(() => {
    if (isExitWarningOpen) {
      setIsExitWarningOpen(false);
      return;
    }
    if (isSettingsOpen) {
      closeSettings();
      return;
    }
    if (selectedSessionForActions !== null) {
      closeActionMenu();
      return;
    }
    if (activeSession) {
      setIsExitWarningOpen(true);
      return;
    }
  }, [
    isExitWarningOpen,
    setIsExitWarningOpen,
    isSettingsOpen,
    closeSettings,
    selectedSessionForActions,
    closeActionMenu,
    activeSession,
  ]);

  useEffect(() => {
    registerBackHandler(historyBackHandler);
    return () => clearBackHandler();
  }, [registerBackHandler, clearBackHandler, historyBackHandler]);

  return (
    <div>
      <header>
        <h1>Histórico</h1>
        <MtButton
          variant="text"
          size="small"
          onClick={openSettings}
          aria-label="Configurações e Backup"
          title="Configurações e Backup"
          style={
            hasUnsavedSessions
              ? { padding: '6px 8px', minHeight: '40px', border: '2px var(--danger-color) dashed' }
              : { padding: '6px 8px', minHeight: '40px' }
          }
        >
          <Settings
            size={20}
            strokeWidth={2.25}
            color={`${hasUnsavedSessions ? 'var(--danger-color)' : 'var(--text-secondary)'}`}
          />
        </MtButton>
      </header>

      <main>
        {activeSession && (
          <ActiveWorkoutCard
            activeSession={activeSession}
            onResume={resumeActiveWorkout}
            formatWorkoutDate={formatWorkoutDate}
          />
        )}

        <MtCard as="section" style={{ gap: 'var(--spacing-sm)' }}>
          <MtSectionTitle icon={<Calendar size={18} />}>Histórico</MtSectionTitle>
          <WorkoutHistoryList
            sessions={workoutHistory}
            onSessionTap={handleSessionTap}
            onSessionLongPress={handleSessionLongPress}
            formatWorkoutDate={formatWorkoutDate}
            formatWorkoutDuration={formatWorkoutDuration}
            onCreateFirstWorkout={handleCreateNewWorkout}
          />
        </MtCard>
      </main>

      <MtFloatingActionButton
        onClick={handleCreateNewWorkout}
        icon={<Plus size={20} strokeWidth={2.5} />}
        label="Novo Treino"
        ariaLabel="Criar novo treino"
      />

      <MtModal isOpen={isSettingsOpen} onClose={closeSettings} title="Configurações & Backup">
        <div
          className="mt-modal-body"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-sm) 0',
            }}
          >
            {resolvedTheme === 'dark' ? (
              <Moon size={18} strokeWidth={2.25} />
            ) : resolvedTheme === 'light' ? (
              <Sun size={18} strokeWidth={2.25} />
            ) : (
              <Monitor size={18} strokeWidth={2.25} />
            )}
            <MtSelect
              label="Tema"
              value={theme}
              onChange={(event) => setTheme(event.target.value as 'light' | 'dark' | 'system')}
              options={[
                { value: 'system', label: 'Seguir o sistema' },
                { value: 'light', label: 'Claro' },
                { value: 'dark', label: 'Escuro' },
              ]}
              style={{ flex: 1, maxWidth: '220px' }}
            />
          </div>
          <BackupSection
            asCard={false}
            onImportSuccess={handleImportSuccess}
            onExportSuccess={handleExportSuccess}
            workoutHistoryLength={workoutHistory.length}
          />
          <hr
            style={{
              border: 'none',
              borderTop: '1px solid var(--border-color)',
              margin: 'var(--spacing-xs) 0',
            }}
          />
          {/* Pass the full workout history to ExportAISection for proper export */}
          <ExportAISection asCard={false} workoutHistory={workoutHistory} />
          <hr
            style={{
              border: 'none',
              borderTop: '1px solid var(--border-color)',
              margin: 'var(--spacing-xs) 0',
            }}
          />
          <VersionInfo version={packageInfo.version} />
        </div>
      </MtModal>

      <MtModal
        isOpen={selectedSessionForActions !== null}
        onClose={closeActionMenu}
        title={selectedSessionForActions ? selectedSessionForActions.name : 'Ações do Treino'}
      >
        <div
          className="mt-modal-body"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}
        >
          <MtButton
            variant="default"
            onClick={handleEditFromActionMenu}
            style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
          >
            <Pencil size={18} style={{ marginRight: '8px' }} />
            Editar Treino
          </MtButton>
          <MtButton
            variant="default"
            onClick={handleExportFromActionMenu}
            style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
          >
            <Download size={18} style={{ marginRight: '8px' }} />
            Exportar este Treino (JSON)
          </MtButton>
          <MtButton
            variant="danger"
            onClick={handleDeleteFromActionMenu}
            style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
          >
            <Trash2 size={18} style={{ marginRight: '8px' }} />
            Excluir Treino
          </MtButton>
        </div>
      </MtModal>

      <MtConfirmDialog
        isOpen={sessionToDeleteId !== null}
        title="Excluir Treino"
        message="Deseja realmente excluir este treino do histórico? Esta ação não pode ser desfeita."
        confirmVariant="danger"
        confirmText="Excluir"
        onConfirm={confirmDeleteSession}
        onCancel={cancelDeleteSession}
      />

      <MtConfirmDialog
        isOpen={confirmNewWorkout}
        title="Treino em Andamento"
        message="Você já possui um treino em andamento. Deseja descartá-lo e iniciar um novo treino?"
        confirmVariant="danger"
        confirmText="Iniciar Novo Treino"
        cancelText="Cancelar"
        onConfirm={confirmCreateNewWorkout}
        onCancel={cancelCreateNewWorkout}
      />

      <MtConfirmDialog
        isOpen={isExitWarningOpen}
        title="Treino em Andamento"
        message="Você possui um treino ativo. Deseja realmente sair do aplicativo ou prefere continuar seu treino?"
        confirmVariant="default"
        confirmText="Continuar Treino"
        cancelText="Sair do App"
        onConfirm={() => {
          setIsExitWarningOpen(false);
          resumeActiveWorkout();
        }}
        onCancel={() => {
          setIsExitWarningOpen(false);
          window.history.back();
        }}
      />
    </div>
  );
}
