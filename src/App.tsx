import {
  NavigationProvider,
  SessionProvider,
  HistoryProvider,
  ThemeProvider,
  useNavigation,
} from './hooks';
import { HistoryView } from './views/HistoryView';
import { ActiveWorkoutView } from './views/ActiveWorkoutView';
import { ExerciseScreenView } from './views/ExerciseScreenView';
import { SettingsView } from './views/SettingsView';

function AppContent() {
  const { currentScreen } = useNavigation();

  switch (currentScreen) {
    case 'history':
      return <HistoryView />;
    case 'active_workout':
      return <ActiveWorkoutView />;
    case 'exercise_screen':
      return <ExerciseScreenView />;
    case 'settings':
      return <SettingsView />;
  }
}

function App() {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <SessionProvider>
          <HistoryProvider>
            <AppContent />
          </HistoryProvider>
        </SessionProvider>
      </NavigationProvider>
    </ThemeProvider>
  );
}

export default App;
