import { WorkoutProvider, useContextWorkout } from './hooks/index';
import { HistoryView } from './views/HistoryView';
import { ActiveWorkoutView } from './views/ActiveWorkoutView';

function AppContent() {
  const { currentView } = useContextWorkout();

  return (
    <div>
      {currentView === 'history' ? (
        <HistoryView />
      ) : (
        <ActiveWorkoutView />
      )}
    </div>
  );
}

function App() {
  return (
    <WorkoutProvider>
      <AppContent />
    </WorkoutProvider>
  );
}

export default App;