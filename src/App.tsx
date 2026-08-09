import { WorkoutProvider, useContextWorkout } from './hooks/index';
import { HistoryView } from './views/HistoryView';
import { ActiveWorkoutView } from './views/ActiveWorkoutView';

function AppContent() {
  const { currentView, workoutHistory } = useContextWorkout();

  return (
    <div>
      {currentView === 'history' ? (
        <HistoryView />
      ) : (
        <ActiveWorkoutView workoutHistory={workoutHistory} />
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