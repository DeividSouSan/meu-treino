import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { runNotesMigrationV150 } from './services/notesMigration';

// Executa a migração isolada de notas (v1.5.0)
runNotesMigrationV150();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
