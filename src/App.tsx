import { useWorkout } from './hooks/useWorkout';
import { HistoryView } from './views/HistoryView';
import { ActiveWorkoutView } from './views/ActiveWorkoutView';

/**
 * Componente raiz do aplicativo que coordena o roteamento simples de telas com base no estado.
 */
function App() {
  const {
    currentView,
    workoutHistory,
    workoutTemplates,
    activeSession,
    editingSession,
    startNewWorkout,
    startEditingWorkout,
    cancelActiveWorkout,
    updateActiveSession,
    updateEditingSession,
    finishActiveWorkout,
    saveEditedWorkout,
    deleteSession,
    deleteTemplate,
    reloadAllData,
  } = useWorkout();

  const handleResumeActiveWorkout = () => {
    // Redireciona para o treino ativo que já está em andamento
    if (activeSession) {
      startNewWorkout(activeSession);
    }
  };

  return (
    <div>
      {currentView === 'history' ? (
        <HistoryView
          workoutHistory={workoutHistory}
          workoutTemplates={workoutTemplates}
          activeSession={activeSession}
          startNewWorkout={startNewWorkout}
          startEditingWorkout={startEditingWorkout}
          deleteSession={deleteSession}
          deleteTemplate={deleteTemplate}
          reloadAllData={reloadAllData}
          onResumeActiveWorkout={handleResumeActiveWorkout}
        />
      ) : (
        <ActiveWorkoutView
          activeSession={activeSession}
          editingSession={editingSession}
          onUpdateActiveSession={updateActiveSession}
          onUpdateEditingSession={updateEditingSession}
          onFinishActiveWorkout={finishActiveWorkout}
          onSaveEditedWorkout={saveEditedWorkout}
          onCancelActiveWorkout={cancelActiveWorkout}
          workoutHistory={workoutHistory}
        />
      )}
    </div>
  );
}

export default App;
