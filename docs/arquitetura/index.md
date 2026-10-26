# Documentação de Arquitetura — Meu Treino

Bem-vindo à documentação de arquitetura do **Meu Treino**.

Esta pasta reúne guias escritos para humanos (e lidos por agentes) que explicam como cada grande parte do sistema funciona. O objetivo é que qualquer pessoa consiga entender o comportamento do app sem precisar ler linha por linha do código-fonte.

## Como navegar por esta documentação

Comece pela [visão geral](./visao-geral.md) se quiser entender o sistema como um todo. Depois, vá direto ao módulo que lhe interessa:

- [Histórico](./historico.md) — lista de treinos concluídos, edição, exportação e exclusão.
- [Treino Ativo](./treino-ativo.md) — criação de treinos, gerenciamento de exercícios e encerramento de sessão.
- [Tela Exercício](./tela-exercicio.md) — edição de séries, cargas, repetições, descanso e técnicas avançadas.

Cada módulo explica:

1. O que faz e o que **não** faz.
2. Fluxo do usuário (diagrama Mermaid).
3. Como as peças se coordenam (diagrama de camadas: quem chama quem).
4. O que você vê ao abrir (detalhes da interface).
5. Onde os dados moram (chaves do `LocalStorage`).
6. Decisões de design ("por que" de cada escolha).
7. Filosofia de componentização (`Mt*` para UI, componentes de domínio para regras de treino).
8. Exemplos de fluxo de uso em linguagem natural.
9. Referências cruzadas para os outros módulos.

Ao final de cada arquivo há uma seção **"Ficou de fora?"**, onde acumulamos assuntos que não pertencem a nenhum dos três módulos principais. Se algo parecer que merece um arquivo novo, é por ali que começamos a conversa.

---

> **Dica:** o vocabulário aqui é intencionalmente humanizado. Se você é um agente de IA e precisa de regras estritas de código, convenções e proibições, consulte o [AGENTS.md](../../AGENTS.md).
