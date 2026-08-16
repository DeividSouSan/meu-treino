import packageInfo from '../../../package.json';
import { useHistoryView } from './useHistoryView';
import {
  BackupSection,
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
} from '../../components/ui';
import { Calendar, Settings, Plus, Pencil, Download, Trash2 } from 'lucide-react';

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
    handleCreateNewWorkout,
    formatWorkoutDate,
    formatWorkoutDuration,
  } = useHistoryView();

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
          style={{ padding: '6px 8px', minHeight: '40px' }}
        >
          <Settings size={20} strokeWidth={2.25} color="var(--text-secondary)" />
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
          <MtSectionTitle icon={<Calendar size={18} />}>
            Histórico
          </MtSectionTitle>
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

      <MtModal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        title="Configurações & Backup"
      >
        <div className="mt-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <BackupSection
            asCard={false}
            onImportSuccess={handleImportSuccess}
            workoutHistoryLength={workoutHistory.length}
          />
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 'var(--spacing-xs) 0' }} />
          <VersionInfo version={packageInfo.version} />
        </div>
      </MtModal>

      <MtModal
        isOpen={selectedSessionForActions !== null}
        onClose={closeActionMenu}
        title={selectedSessionForActions ? selectedSessionForActions.name : 'Ações do Treino'}
      >
        <div className="mt-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
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
    </div>
  );
}

