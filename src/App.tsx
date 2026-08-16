import { NavigationProvider, SessionProvider, HistoryProvider, useNavigation } from './hooks';
import { HistoryView } from './views/HistoryView';
import { ActiveWorkoutView } from './views/ActiveWorkoutView';

function AppContent() {
  const { currentView } = useNavigation();

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
    <NavigationProvider>
      <SessionProvider>
        <HistoryProvider>
          <AppContent />
        </HistoryProvider>
      </SessionProvider>
    </NavigationProvider>
  );
}

export default App;