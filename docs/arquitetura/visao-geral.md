# Visão Geral do Sistema

O **Meu Treino** é um aplicativo pessoal de rastreamento de musculação. Funciona como um substituto digital do caderno de anotações que você leva para a academia: simples, rápido, funciona sem internet e todos os seus dados ficam apenas no seu navegador (via `LocalStorage`).

## O que o aplicativo faz, em resumo

1. Você abre o app e vê o **Histórico** — a lista de treinos já concluídos, do mais recente para o mais antigo.
2. A partir daí, pode criar um **Treino Ativo** novo (em branco ou a partir de um modelo salvo).
3. Dentro do treino ativo, você adiciona **exercícios** e, para cada exercício, registra **séries** com carga, repetições, descanso e técnicas avançadas.
4. Quando termina, finaliza o treino e ele volta para o Histórico como um treino concluído.

## Fluxo de navegação (alto nível)

```
Histórico  ↔  Treino Ativo  ↔  Tela do Exercício
```

- No **Histórico**, você toca em um treino para editá-lo ou cria um novo.
- No **Treino Ativo**, você gerencia a lista de exercícios e entra na tela de cada exercício para registrar séries.
- Na **Tela do Exercício**, você adiciona e edita séries, depois volta para o Treino Ativo.

## Quem detém o estado

O estado do app é dividido em três contextos especializados (não há passagem de props em cascade):

- **NavigationContext**: controla em qual tela o usuário está (`histórico` ou `treino ativo`).
- **SessionContext**: controla o treino ativo em andamento (criar, editar, cancelar, finalizar).
- **HistoryContext**: controla a lista de treinos concluídos no histórico (listar, excluir, recarregar).

## Onde os dados moram

Tudo fica no `LocalStorage` do navegador, dividido em quatro áreas principais:

- `meu_treino_history` — treinos concluídos.
- `meu_treino_templates` — modelos de treino reutilizáveis.
- `meu_treino_active` — o treino que está em andamento no momento.
- `meu_treino_global_notes` — notas globais de exercícios (ex: dica de execução do "Supino").

Não há cadastro, não há servidor, não há nuvem.

## Princípios que norteiam o sistema

- **Notepad-style:** se uma série está listada na tela, ela já foi executada. Não há checkboxes de confirmação.
- **Mobile-first rigoroso:** interface feita para uso com uma mão na academia, com alvos de toque generosos.
- **Offline-first:** o app funciona inteiramente sem internet.
- **Sem prop-drilling:** os componentes consomem os contextos diretamente, sem receber props encadeados.
- **Soberania dos dados:** o usuário exporta e importa backups em JSON quando quiser.

## Como ler os outros arquivos

Quer saber como o histórico foi implementado? Vá em [`historico.md`](./historico.md).
Quer entender o treino ativo? Vá em [`treino-ativo.md`](./treino-ativo.md).
Quer detalhes da tela de exercício? Vá em [`tela-exercicio.md`](./tela-exercicio.md).

Os arquivos se referenciam uns aos outros, então você pode navegar entre eles livremente.

## O que não encaixou aqui?

Esta visão geral é intencionalmente rasgada. Assuntos que não couberam em nenhum dos três módulos principais (backup em lote, exportação de IA, service worker, migração de notas, etc.) são listados ao final de cada módulo na seção **"Ficou de fora?"**. Se algo parecer que merece um documento próprio, é por ali que começa a discussão.

---

> **Para agentes:** se precisar de convenções de código, regras de nomeação (`Mt*` para UI, sem prefixo para domínio) e proibições de arquitetura, consulte o [AGENTS.md](../../AGENTS.md).
