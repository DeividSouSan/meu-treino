# Tela Exercício

A **Tela Exercício** é onde o usuário registra as séries de um exercício específico durante um treino. É a parte mais tática do aplicativo: carga, repetições, descanso, técnicas avançadas e validação de dados acontecem aqui.

## O que a Tela Exercício faz

- Edita o nome do exercício, a carga de referência e as notas rápidas.
- Adiciona uma nova série com repetições, carga, tempo de descanso e técnicas avançadas.
- Atualiza uma série existente (alterar reps, carga, descanso, técnicas).
- Exclui uma série.
- Aplica ajuste rápido de repetições (`+1`, `-1`, etc.).
- Copia as repetições da última série para os campos de entrada.
- Roda o cronômetro de descanso entre séries.
- Valida os campos antes de adicionar uma série (ex: repetições devem ser maiores que zero).
- Sincroniza notas globais de exercício (a mesma nota aparece para "Supino" em qualquer treino).

## O que a Tela Exercício NÃO faz

- Não gerencia a lista de exercícios do treino (isso é o [Treino Ativo](./treino-ativo.md)).
- Não finaliza ou cancela o treino como um todo (isso é o [Treino Ativo](./treino-ativo.md)).
- Não lista treinos concluídos (isso é o [Histórico](./historico.md)).

## Como foi implementado

O módulo é composto por:

- **`ExerciseScreen.tsx`** — a View da tela. Renderiza os inputs de reps/carga/descanso, a lista de séries, o cronômetro de descanso e os botões de ação.
- **`useExerciseScreen.ts`** — o container hook. Mantém uma cópia de trabalho do exercício (estado interno) e notifica o pai sempre que algo muda via `onUpdateExercise`.
- **`ExerciseSetItem.tsx`** — renderiza uma série individual na lista.
- **`ExerciseList.tsx`** — renderiza a lista de séries do exercício.
- **`ExerciseTechniquePills.tsx`** — chips para selecionar técnicas avançadas (RP, DS, FS, ISO).
- **`LastWorkoutSets.tsx`** — mostra as séries do último treino para esse mesmo exercício (referência).
- **`RestTimer.tsx`** — cronômetro de descanso.

O container `useExerciseScreen` consolidou o estado do formulário em uma única fonte de verdade: o exercício de trabalho. Quando o usuário navega para outro exercício, o estado interno é sincronizado com o exercício novo recebido pelo pai.

## Relação com o Treino Ativo

A Tela Exercício é acionada pelo [Treino Ativo](./treino-ativo.md). Toda vez que o usuário modifica algo (adiciona série, muda nome, altera carga), o container chama `onUpdateExercise`, que atualiza o exercício dentro da sessão ativa no `SessionContext`.

Ou seja: a Tela Exercício não sabe nada sobre o treino como um todo; ela apenas recebe um exercício e devolve um exercício modificado.

## Relação com a persistência

A Tela Exercício lê e grava notas globais de exercício via `storageService`:

- `getGlobalExerciseNote(exerciseName)` — recupera a nota salva globalmente para esse nome de exercício.
- `saveGlobalExerciseNote(exerciseName, notes)` — salva a nota, normalizada em minúsculas e sem espaços, sob a chave `meu_treino_global_notes`.

Isso significa que, se o usuário anotar "pescoço neutro" no Supino de um treino, essa mesma nota estará disponível no Supino de qualquer outro treino.

## Fluxo típico (em linguagem natural)

1. Dentro do Treino Ativo, o usuário toca em um exercício → abre a Tela Exercício.
2. Vê o nome do exercício, carga de referência e notas.
3. Digita repetições e carga da série, ajusta o descanso se quiser, seleciona técnicas avançadas (ex: "FS" para Feeder Set).
4. Clica em "Adicionar Série" → a série aparece na lista abaixo.
5. Se quiser repetir as repetições da última série, clica em "Copiar último set".
6. Após adicionar a série, o cronômetro de descanso é zerado e começa a contar.
7. Quando termina com o exercício, volta para o Treino Ativo. Todas as alterações já foram salvas na sessão.

## Referências cruzadas

- Para o contexto do treino que contém esse exercício, veja [Treino Ativo](./treino-ativo.md).
- Para onde o treino vai ao ser finalizado, veja [Histórico](./historico.md).
- Para o mapa geral do sistema, veja [Visão Geral](./visao-geral.md).

## Ficou de fora?

Assuntos que não couberam aqui:

- Técnicas avançadas detalhadas (o que cada sigla significa e como afeta o descanso).
- Validação de erro quando o formulário está inválido (mensagem de modal).
- Inputs de `equipmentType` e `loadType` (equipamento e tipo de carga).

Se algum desses precisar de documentação própria, é por aqui que começamos.

---

> **Para agentes:** regras de código, convenções e proibições estão em [AGENTS.md](../../AGENTS.md).
