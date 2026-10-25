# Treino Ativo

O **Treino Ativo** é a tela onde o usuário cria, edita e finaliza uma sessão de treino. É o "caderno aberto" da academia: você adiciona exercícios, organiza a ordem e, quando termina, encerra o treino para que ele vá para o Histórico.

## O que o Treino Ativo faz

- Cria um novo treino em branco (chamado "Treino Livre") ou a partir de um modelo salvo.
- Adiciona exercícios à sessão atual.
- Edita o nome do treino.
- Gerencia "cues" — lembretes gerais da sessão (ex: "lembrar de alongar o ombro").
- Acompanha a duração total do treino com um cronômetro (stopwatch).
- Finaliza o treino, marcando-o como concluído e enviando para o Histórico.
- Cancela o treino, descartando alterações não salvas.
- Permite editar um treino já concluído (abrindo-o a partir do Histórico).

## O que o Treino Ativo NÃO faz

- Não registra séries individuais de um exercício (isso acontece na [Tela Exercício](./tela-exercicio.md)).
- Não gerencia a lista de treinos concluídos (isso é o [Histórico](./historico.md)).

## Como foi implementado

O módulo é composto por:

- **`ActiveWorkoutView.tsx`** — a View da tela. Renderiza a lista de exercícios, o cabeçalho com nome e duração, e os botões de ação.
- **`useActiveWorkoutScreen.ts`** — o container hook único da tela. Une a sessão ativa e a sessão em edição em uma única "sessão visual", gerencia o cronômetro de duração e aplica mutações (cues, exercícios) no estado global.
- **`SessionContext.tsx` / `SessionProvider.tsx`** — o contexto global que guarda o treino ativo (ou em edição) e expõe funções para criar, atualizar, cancelar e finalizar.

O container `useActiveWorkoutScreen` é responsável por decidir se uma alteração deve ser aplicada à sessão ativa ou à sessão em edição, dependendo de qual estiver aberta.

## Relação com a sessão

Toda mutação do treino ativo passa pelo `SessionContext`:

- `startNewWorkout(template?)` — cria um novo treino, opcionalmente copiando exercícios de um modelo.
- `updateActiveSession(session)` — salva a sessão ativa no estado e no `LocalStorage`.
- `finishActiveWorkout(session)` — marca como concluída, grava no histórico e limpa a sessão ativa.
- `cancelActiveWorkout()` — descarta a sessão ativa.
- `saveEditedWorkout(session)` — grava as alterações de um treino que estava sendo editado.

## Relação com a navegação

O Treino Ativo usa o `NavigationContext` para:

- Voltar para o Histórico ao finalizar ou cancelar o treino (`navigateToHistory()`).
- Saber se está na view `active_workout` ou `history`.

Ao criar um novo treino a partir do Histórico, o fluxo é: Histórico → `startNewWorkout` → `navigateToActiveWorkout`.

## Relação com a persistência

A sessão ativa é gravada no `LocalStorage` sob a chave **`meu_treino_active`**. Isso permite que, se o usuário fechar o navegador ou recarregar a página, o treino em andamento seja recuperado e continue de onde parou.

Quando o treino é finalizado, ele é movido da chave `meu_treino_active` para a chave `meu_treino_history` (via `saveWorkoutSession`).

## Fluxo típico (em linguagem natural)

1. O usuário abre o app e está no Histórico.
2. Clica em "Novo Treino" → um treino em branco é criado ("Treino Livre") e a tela muda para Treino Ativo.
3. O usuário adiciona exercícios ao treino.
4. Para cada exercício, entra na [Tela Exercício](./tela-exercicio.md) para registrar séries.
5. Quando termina, clica em "Finalizar Treino" → o treino é marcado como concluído, grava no Histórico e volta para a tela inicial.

## Referências cruzadas

- Para editar séries dentro de cada exercício, veja [Tela Exercício](./tela-exercicio.md).
- Para onde o treino vai ao ser finalizado, veja [Histórico](./historico.md).
- Para o mapa geral do sistema, veja [Visão Geral](./visao-geral.md).

## Ficou de fora?

Assuntos que não couberam aqui:

- Modelos de treino (templates) — criação, listagem e exclusão de modelos.
- Cues gerenciados pelo `CueManager` dentro da tela ativa (podem merecer detalhe se a complexidade crescer).
- Stopwatch de duração vs. stopwatch de descanso (esse último é da Tela Exercício).

Se algum desses precisar de documentação própria, é por aqui que começamos.

---

> **Para agentes:** regras de código, convenções e proibições estão em [AGENTS.md](../../AGENTS.md).
