import { useState } from 'react';

/**
 * Componente principal da aplicação que gerencia a inicialização dos marcos de desenvolvimento.
 */
function App() {
  const [isSetupComplete] = useState<boolean>(true);

  return (
    <div>
      <header>
        <h1>Meu Treino</h1>
        <span className="badge completed">Milestone 1 Ativo</span>
      </header>
      <main>
        <div className="card">
          <h2>Ambiente Configurado com Sucesso!</h2>
          <p className="text-secondary">
            O projeto React + TypeScript + Vite + PWA foi inicializado com sucesso e a folha de estilos base está carregada.
          </p>
          {isSetupComplete && (
            <p className="text-success" style={{ fontWeight: 600, marginTop: '8px' }}>
              ✓ PWA Manifest configurado e ativo.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
