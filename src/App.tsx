import { useWorkout } from './hooks/useWorkout';
import { HistoryView } from './views/HistoryView';

/**
 * Componente raiz do aplicativo que coordena o roteamento simples de telas com base no estado.
 */
function App() {
  const {
    currentView,
    workoutHistory,
    workoutTemplates,
    activeSession,
    startNewWorkout,
    startEditingWorkout,
    cancelActiveWorkout,
    deleteSession,
    deleteTemplate,
    reloadAllData,
  } = useWorkout();

  const handleResumeActiveWorkout = () => {
    // A ser implementado na navegação de tela ativa no Milestone 4
    console.log('Retomando treino ativo...');
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
        <div>
          <header>
            <h1>Sessão de Treino</h1>
            <button className="danger" onClick={cancelActiveWorkout}>
              Voltar
            </button>
          </header>
          <main>
            <div className="card">
              <h2>Treino Ativo</h2>
              <p className="text-secondary">
                A tela do treino ativo e de edição está sendo preparada no próximo milestone (Milestone 4).
              </p>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
