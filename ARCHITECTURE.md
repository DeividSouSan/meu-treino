# Diretrizes de Arquitetura e Plano de Implementação: Meu Treino 🏋️‍♂️

Este documento define as regras de codificação, a estrutura de diretórios, as abstrações do sistema e o cronograma de desenvolvimento dividido em milestones lógicos.

---

## 1. Diretrizes de Codificação e Boas Práticas

Para manter o projeto limpo, manutenível e alinhado com as suas preferências, adotaremos as seguintes regras rígidas:

### A. Nomes de Variáveis Verbosos
- **Regra:** Nunca use abreviações de uma letra (como `i`, `e`, `t`, `w`) para variáveis, parâmetros ou retornos.
- **Exemplos:**
  - ❌ `history.map((t, i) => ...)`
  -  `history.map((workoutSession, index) => ...)`
  - ❌ `const [w, setW] = useState(...)`
  -  `const [weightInKg, setWeightInKg] = useState(...)`
  - ❌ `catch (e)`
  -  `catch (error)`

### B. Regras de Comentários
- **Sem Comentários em Funções:** Nunca escreva comentários explicativos dentro do corpo das funções. O código em si deve ser legível e autoexplicativo por meio de variáveis e funções verbosas.
- **Comentários apenas em Interfaces/Declarações:** Escreva comentários JSDoc descritivos apenas em assinaturas de funções, tipos TypeScript, declarações de hooks customizados e definições de classes/interfaces.
- **Exemplo:**
  ```typescript
  /**
   * Representa a estrutura de dados de uma série de exercícios.
   */
  export interface ExerciseSet {
    weightInKg: number;
    repetitions: number;
    restTimeInSeconds: number;
    advancedTechniques: AdvancedTechnique[];
  }
  ```

### C. Abstrações e Separação de Conceitos
- **Camada de Dados (Services):** O acesso ao `localStorage` ou manipulações de JSON de importação/exportação não devem ocorrer diretamente nos componentes React. Criaremos serviços dedicados em `src/services/` para isolar essa lógica.
- **Gerenciamento de Estado (Context/Hooks):** Lógicas de controle de tempo, cálculo de duração e mutação de treinos ativos ficarão em hooks customizados (`src/hooks/`) ou em contextos centrais.

---

## 2. Estrutura de Diretórios Final

O projeto React estruturado em TypeScript segue o padrão abaixo:

```text
src/
├── assets/           # Ícones do PWA e imagens estáticas
├── components/       # Componentes de UI puros (ExerciseCard)
├── hooks/            # Custom hooks (useStopwatch, useWorkout)
├── services/         # Abstrações de I/O (storageService, backupService)
├── types/            # Definições de tipos e interfaces TypeScript (workout)
├── views/            # Telas principais (HistoryView, ActiveWorkoutView)
├── index.css         # Variáveis do tema claro e reset CSS
├── App.tsx           # Roteador simples e esqueleto da aplicação
└── main.tsx          # Ponto de entrada do React
```

---

## 3. Plano de Implementação (Milestones)

O desenvolvimento será feito de forma iterativa, validando cada etapa lógica antes de avançar para a próxima.

### 📍 Milestone 1: Setup do Projeto e Design System (CSS)
* **Objetivo:** Inicializar o projeto e definir a identidade visual minimalista (modo claro) e a base de tipos.
* **Tarefas:**
  1. Criar o esqueleto do projeto usando Vite + React + TypeScript.
  2. Configurar o `vite-plugin-pwa` para suporte a PWA (manifesto e service worker).
  3. Criar `src/App.css` contendo o reset e as variáveis CSS de cor/espaçamento para o modo claro.
  4. Definir as interfaces de tipos em `src/types/workout.ts` com a documentação JSDoc necessária.

### 📍 Milestone 2: Serviços de Dados e Armazenamento
* **Objetivo:** Criar os mecanismos para carregar, salvar e exportar/importar treinos sem nenhuma interface ainda.
* **Tarefas:**
  1. Implementar o serviço de armazenamento `storageService.ts` com funções verbosas para salvar e obter sessões e templates.
  2. Implementar o serviço de backup `backupService.ts` para exportar dados agregados em JSON e realizar o parser de importação de JSON validando tipos.
  3. Criar testes rápidos de leitura/escrita no localStorage.

### 📍 Milestone 3: Tela Inicial (Histórico de Treinos e Templates)
* **Objetivo:** Desenvolver a tela inicial contendo os treinos salvos, botões de importação/exportação e gerenciamento de templates.
* **Tarefas:**
  1. Desenvolver a visualização da linha do tempo dos treinos passados (exibindo data, tempo e exercícios de forma limpa).
  2. Adicionar o fluxo de exclusão de treinos antigos.
  3. Implementar a interface de seleção e inicialização de treinos: Treino em Branco, Repetir Último Treino e Carregar Templates.
  4. Integrar os botões de download e upload do JSON de backup.

### 📍 Milestone 4: Tela Ativa / Modo Edição (A Tela Coringa)
* **Objetivo:** Desenvolver a interface principal de execução e edição de treinos baseada no seu rascunho visual.
* **Tarefas:**
  1. Criar o layout da sessão com data/hora, timer total e input de Cues da Sessão.
  2. Desenvolver o card de exercício expansível/colapsável.
  3. Implementar a lista de séries adicionadas (reps, peso, tempo) com botões rápidos de incremento (`Mesmas reps`, `-1 rep`, `+1 rep`) e remoção.
  4. Adicionar a barra de seleção de técnicas avançadas (`FS`, `RP`, `DS`, `ISO`).
  5. Integrar o cronômetro progressivo de descanso no rodapé, que inicia a contagem ao adicionar uma série e pode ser resetado manualmente.
  6. Garantir que esta mesma tela possa ser aberta em modo "Editar" para treinos já finalizados.

### 📍 Milestone 5: Polimento, PWA e Testes Finais
* **Objetivo:** Ativar o PWA, ajustar responsividade no celular e polir interações.
* **Tarefas:**
  1. Validar a responsividade em telas mobile do iOS/Android usando ferramentas de emulação.
  2. Testar o funcionamento offline completo (sem rede).
  3. Verificar o comportamento do autocompletar dinâmico de exercícios extraído do histórico.
  4. Ajustes finais de contraste e polimento CSS.
