import packageInfo from '../../../package.json';
import { useHistoryView } from './useHistoryView';
import {
  BackupSection,
  ActiveWorkoutCard,
  WorkoutHistoryList,
  VersionInfo,
} from '../../components/history';
import { MtCard, MtFloatingActionButton, MtSectionTitle, MtConfirmDialog } from '../../components/ui';
import { Calendar } from 'lucide-react';

/**
 * HistoryView é a tela apresentacional do histórico de treinos.
 *
 * Ela não contém lógica: toda ação e formatação vem do container useHistoryView.
 * Seu único trabalho é organizar os blocos visuais (backup, treino ativo,
 * lista de histórico, FAB e versão) e repassar as informações para os
 * componentes filhos.
 */
export function HistoryView() {
  const {
    workoutHistory,
    activeSession,
    sessionToDeleteId,
    resumeActiveWorkout,
    handleSessionTap,
    handleSessionLongPress,
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
      </header>

      <main>
        <BackupSection
          onImportSuccess={handleImportSuccess}
          workoutHistoryLength={workoutHistory.length}
        />

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

      <MtFloatingActionButton onClick={handleCreateNewWorkout}>
        +
      </MtFloatingActionButton>

      <VersionInfo version={packageInfo.version} />

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
