# Histórico

O **Histórico** é a tela de entrada do aplicativo. É onde o usuário vê todos os treinos já concluídos, organizados do mais recente para o mais antigo.

## O que o Histórico faz

- Lista todas as sessões de treino concluídas, com nome, data e duração formatada.
- Permite tocar em um treino para abri-lo em modo de edição.
- Permite toque longo em um treino para abrir um menu de ações (editar, exportar JSON individual, excluir).
- Permite excluir um treino, mas somente após confirmação explícita do usuário (ação destrutiva).
- Permite criar um novo treino em branco ("Treino Livre").
- Mostra um alerta quando existem treinos que ainda não foram incluídos em um backup.

## O que o Histórico NÃO faz

- Não edita série por série de um exercício (isso acontece na [Tela Exercício](./tela-exercicio.md)).
- Não roda cronômetro de descanso entre séries (isso pertence ao [Treino Ativo](./treino-ativo.md) ou à [Tela Exercício](./tela-exercicio.md)).
- Não cria ou gerencia modelos de treino diretamente (isso é feito dentro do Treino Ativo).

## Como foi implementado

O módulo é composto por:

- **`HistoryView.tsx`** — a View da tela. Recebe tudo que precisa de um container hook e só se preocupa em renderizar.
- **`useHistoryView.ts`** — o container hook. É o único ponto que conversa com os contextos de histórico, sessão e navegação para esta tela.
- **`HistoryContext.tsx` / `HistoryProvider.tsx`** — o contexto global que guarda a lista de treinos concluídos em memória e expõe funções para excluir e recarregar.

O container `useHistoryView` consolida ações que antes estavam espalhadas (tap, toque longo, editar, exportar, excluir, criar novo, formatters de data e duração) em uma única API declarativa para a View.

## Relação com a persistência

A leitura e gravação dos treinos concluídos é feita pelo serviço de persistência (`src/services/storageService.ts`):

- A chave usada no `LocalStorage` é **`meu_treino_history`**.
- Ao carregar, o histórico vem ordenado por data decrescente (o mais recente primeiro).
- Quando um treino é excluído, o `HistoryProvider` chama `deleteWorkoutSession` e recarrega a lista do `LocalStorage`.
- Quando um treino é editado e salvo, ele é gravado de volta no mesmo `LocalStorage`.

## Relação com a sessão

Quando o usuário toca em um treino do histórico para editá-lo, o Histórico:

1. Chama `startEditingWorkout(session)` no `SessionContext`, marcando aquela sessão como "em edição".
2. Navega para a tela de Treino Ativo via `navigateToActiveWorkout()` no `NavigationContext`.

Dali em diante, o Treino Ativo assume o controle daquela sessão.

## Relação com a navegação

O Histórico alternna entre duas views gerenciadas pelo `NavigationContext`:

- `history` — a tela atual.
- `active_workout` — para onde o usuário vai ao criar um novo treino ou editar um existente.

Quando uma importação de backup é concluída, o Histórico retorna automaticamente para a view `history`.

## Fluxo típico (em linguagem natural)

1. O usuário abre o aplicativo e cai direto no Histórico.
2. Vê a lista de treinos concluídos, ordenada do mais recente para o mais antigo.
3. Toca longo em um treino → aparece um menu com "Editar", "Exportar JSON" e "Excluir".
4. Escolhe "Editar" → o treino abre em modo de edição na tela de Treino Ativo.
5. Ou escolhe "Excluir" → aparece um diálogo de confirmação. Só após confirmar o treino é removido do `LocalStorage` e da lista na tela.

## Referências cruzadas

- Para o que acontece depois de tocar em "Editar", veja [Treino Ativo](./treino-ativo.md).
- Para como as séries dentro de um exercício são registradas, veja [Tela Exercício](./tela-exercicio.md).
- Para o mapa geral do sistema, veja [Visão Geral](./visao-geral.md).

## Ficou de fora?

Assuntos que não couberam aqui e podem merecer atenção futura:

- Backup em lote (exportar/importar todo o histórico de uma vez).
- Exportação de IA (gerar resumo do treino para IA).
- Service worker e atualização do PWA.
- Migração de notas antigas (`notesMigration`).

Se algum desses precisar de documentação própria, é por aqui que começamos.

---

> **Para agentes:** regras de código, convenções e proibições estão em [AGENTS.md](../../AGENTS.md).
