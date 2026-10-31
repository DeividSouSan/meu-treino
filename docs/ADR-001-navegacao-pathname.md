# ADR-001: Navegação centralizada por `pathname` (History API)

**Status:** Proposta / Implementação em andamento  
**Autor:** Deivid + Cline  
**Data:** 31/10/2026

## Contexto

Hoje o `NavigationProvider` gerencia `currentView` e `modalStack` apenas em memória React (`useState`), sem gravar nada no `window.history`. O botão "voltar" do navegador não fecha modais nem muda de tela, e não é possível navegar diretamente para o modal de configurações, tela de exercício ou outras telas via URL.

## Decisão

Adotar o `location.pathname` como a **única fonte da verdade** sobre qual tela está aberta. Tanto um clique em botão quanto o gesto/botão "voltar" do navegador disparam `popstate` e restauram o mesmo estado. Não há diferenciação entre gesto e clique.

### Telas e rotas

| Pathname | Tela (`currentScreen`) | Componente renderizado |
|----------|------------------------|------------------------|
| `/` | `'history'` | `HistoryView` |
| `/treino` | `'active_workout'` | `ActiveWorkoutView` |
| `/exercicio/:id` | `'exercise_screen'` | `ExerciseScreenView` |
| `/configuracoes` | `'settings'` | `SettingsView` |

### Novas regras

- `ModalId`, `modalStack`, `openModal`, `closeModal`, `isModalOpen` são **removidos** da API pública do `NavigationContext`.
- Modal é tratado como tela (`settings`, `exercise_screen`).
- O `NavigationProvider` é o **único** responsável por saber em qual tela o usuário está e renderizá-la impiedosamente via `App.tsx`.
- `history.state` é usado apenas internamente como suporte; a navegação pública se dá por `pathname` via `pushState` / `replaceState`.
- Não há suporte a múltiplos modais abertos simultaneamente (não é requisito).
- `exercise_id` na rota `/exercicio/:id` pode referenciar qualquer exercício, inclusive de treinos passados (histórico de execuções).

### Nova API do `useNavigation()`

```ts
export type ScreenId = 'history' | 'active_workout' | 'exercise_screen' | 'settings';

export interface UseNavigationReturn {
  currentScreen: ScreenId;
  exerciseId: string | null;

  navigateTo: (screen: ScreenId, params?: { exerciseId?: string }) => void;
  navigateToHistory: () => void;
  navigateToActiveWorkout: () => void;
  navigateToExercise: (exerciseId: string) => void;
  navigateToSettings: () => void;
  goBackToList: () => void; // volta de /exercicio/:id para /treino
  goBack: () => void; // window.history.back()
}
```

### Fluxo de exemplo

1. Usuário em `/` (histórico).
2. Clica "Novo treino" → `navigateToActiveWorkout()` → `pushState({}, '', '/treino')` → renderiza `ActiveWorkoutView`.
3. Clica em um exercício → `navigateToExercise('abc-123')` → `pushState({}, '', '/exercicio/abc-123')` → renderiza `ExerciseScreenView`.
4. Apertar voltar → `popstate` com pathname `/treino` → `currentScreen = 'active_workout'`, `exerciseId = null` → renderiza `ActiveWorkoutView`.
5. Clica em Configurações → `navigateToSettings()` → `pushState({}, '', '/configuracoes')` → renderiza `SettingsView`.
6. Apertar voltar → `popstate` com pathname `/treino` → volta para `ActiveWorkoutView`.

## Consequências

### Positivas
- Botão "voltar" do navegador funciona para fechar telas e voltar entre views.
- Deep link direto para qualquer tela via URL.
- Um único ponto de verdade (`NavigationProvider`) para toda navegação da aplicação.
- Sem `modalStack`, sem diferenciação gesto vs clique.

### Negativas / riscos
- Quebra de compatibilidade: componentes que usam `openModal`/`closeModal`/`isModalOpen` precisam ser reescritos.
- `HistoryView` perde o `MtModal` de configurações embutido; vira tela separada `/configuracoes`.
- `ActiveWorkoutView` perde o estado local `currentExerciseId`; passa a ler `exerciseId` da URL.

## Arquivos afetados

- `src/hooks/navigation/NavigationContext.tsx` — nova interface `ScreenId`, remoção de modal stack.
- `src/hooks/navigation/NavigationProvider.tsx` — parse de `pathname`, `pushState`/`replaceState`, listener `popstate`.
- `src/hooks/navigation/index.ts` — exports atualizados.
- `src/views/ActiveWorkoutView/ActiveWorkoutView.tsx` — remove `useState` local, usa `exerciseId` do navigation.
- `src/views/HistoryView/useHistoryView.ts` — remove `openSettings`/`closeSettings`/`isSettingsOpen`, adiciona `navigateToSettings`.
- `src/views/HistoryView/HistoryView.tsx` — remove `MtModal` de settings, navega para `/configuracoes`.
- `src/views/SettingsView/SettingsView.tsx` — **nova** view de configurações/backup.
- `src/views/ExerciseScreenView/ExerciseScreenView.tsx` — **nova** view que renderiza `ExerciseScreen` por `exerciseId`.
- `src/App.tsx` — switch render baseado em `currentScreen`.
- `src/hooks/navigation/NavigationProvider.test.tsx` — testes reescritos para `pathname`/`popstate`.