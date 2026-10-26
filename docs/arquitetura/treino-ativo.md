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

## Fluxo do usuário

```mermaid
graph TD
    A[Abrir app / Histórico] --> B[Tocar em "Novo Treino" ou em um treino concluído]
    B --> C[Treino Ativo]
    C -->|Adicionar Exercício| C
    C -->|Tocar exercício| D[Tela Exercício]
    D -->|Registrar séries| C
    C -->|Editar nome / cues| C
    C -->|Finalizar Treino| E[Marcar como concluído e enviar ao Histórico]
    C -->|Cancelar| F[Descartar sessão ativa]
    E --> A[Histórico - treino concluído aparece na lista]
    F --> A[Histórico - sem alterações]
```

## Como as peças se coordenam (diagrama de camadas)

O código espalha a responsabilidade entre vários arquivos. Este diagrama mostra quem chama quem quando o usuário interage com o Treino Ativo:

```
View (ActiveWorkoutView.tsx)
  └─ Pura, sem lógica. Recebe dados e callbacks via props de useActiveWorkoutScreen.
      │
      ▼ props + callbacks
Container (useActiveWorkoutScreen.ts)
  └─ Único ponto que une a sessão ativa e a sessão em edição em uma "sessão visual".
      │ consome
      ├─ SessionContext (startNewWorkout, updateActiveSession, finishActiveWorkout, cancelActiveWorkout, saveEditedWorkout)
      └─ NavigationContext (navigateToHistory, navigateToActiveWorkout)
      │
      ▼ chama quando necessário
Serviço de persistência (storageService.ts)
  └─ Lê e grava diretamente no LocalStorage (chaves: meu_treino_active, meu_treino_history)
```

Essa separação é intencional: nenhum componente recebe props em cascade (prop-drilling é proibido pelo AGENTS.md). Cada camada tem um papel claro e a View nunca sabe que o LocalStorage existe.

## O que você vê ao abrir

Ao abrir o Treino Ativo, a tela é composta por:

- **Cabeçalho**: nome do treino (editável) e cronômetro de duração total (stopwatch).
- **Lista de exercícios**: cada exercício exibe nome e permite entrada para a Tela Exercício.
- **Botão "Adicionar Exercício"**: cria um novo exercício em branco na sessão.
- **Gerenciamento de cues**: lembretes gerais da sessão (ex: "lembrar de alongar o ombro").
- **Botões de ação**: "Finalizar Treino" e "Cancelar Treino".
- **Card de retomada** (quando aplicável): exibe o treino em andamento para continuar de onde parou.

Não aparecem séries individuais nem detalhes de cada exercício — esses são vistos apenas ao entrar na [Tela Exercício](./tela-exercicio.md).

## O container `useActiveWorkoutScreen` e a "sessão visual"

O container `useActiveWorkoutScreen` é responsável por decidir se uma alteração deve ser aplicada à sessão ativa ou à sessão em edição, dependendo de qual estiver aberta. Ele une a sessão ativa e a sessão em edição em uma única "sessão visual", gerencia o cronômetro de duração e aplica mutações (cues, exercícios) no estado global.

## Estados de sessão: ativa vs em edição

O código usa dois estados distintos de sessão, e isso pode parecer redundante à primeira vista. Não é. Cada um representa um momento diferente:

| Estado             | Significado                                                   | Quando é preenchido                       | Quando é limpo                         |
| ------------------ | ------------------------------------------------------------- | ----------------------------------------- | -------------------------------------- |
| `sessão ativa`     | Treino criado do zero ou retomado do Histórico, em andamento. | Clique em "Novo Treino" ou "Retomar"      | Finalizar ou cancelar o treino         |
| `sessão em edição` | Treino concluído aberto a partir do Histórico para alteração. | Toque em um treino concluído no Histórico | Salvar alterações ou cancelar a edição |

**Por que dois estados?** Porque o fluxo de criação do zero e o fluxo de edição de um treino existente são caminhos diferentes. Separar os estados evita que alterações de um treino em edição sejam confundidas com um treino novo em andamento.

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

## Fluxo passo a passo: finalizar um treino

1. **Usuário clica em "Finalizar Treino"**: o container `useActiveWorkoutScreen` chama `finishActiveWorkout(session)` do `SessionContext`.
2. **Marcação como concluída**: a sessão recebe `status: "completed"` e a data/hora de finalização.
3. **Grava no Histórico**: o `SessionContext` chama `saveWorkoutSession` do `storageService`, que move o treino da chave `meu_treino_active` para a chave `meu_treino_history`.
4. **Limpeza da sessão ativa**: a chave `meu_treino_active` é limpa, pois não há mais treino em andamento.
5. **Navegação de volta**: o container chama `navigateToHistory()` do `NavigationContext`, levando o usuário de volta à tela do Histórico, onde o treino finalizado agora aparece como concluído.

## Filosofia de componentização e onde as coisas acontecem

O projeto segue a separação entre componentes de UI (`Mt*`, agnósticos) e componentes de domínio (nomes de treino). No Treino Ativo isso se reflete assim:

- **`ActiveWorkoutView.tsx`** — View pura. Não tem lógica: recebe todos os dados e callbacks de `useActiveWorkoutScreen` via props. Só renderiza.
- **`useActiveWorkoutScreen.ts`** — container único da tela. Une sessão ativa e sessão em edição, gerencia o cronômetro de duração e aplica mutações no estado global.
- **`SessionContext.tsx` / `SessionProvider.tsx`** — contexto global que guarda o treino ativo (ou em edição) e expõe funções para criar, atualizar, cancelar e finalizar.

Nenhum componente recebe props em cascade: tudo vem dos contextos especializados (`SessionContext`, `NavigationContext`) consumidos pelo container co-localizado.

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
