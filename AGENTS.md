# Diretrizes para Agentes de IA & Engenharia

Este documento é a referência oficial sobre os princípios arquiteturais, a filosofia do produto, as convenções de código, os padrões de qualidade e os processos de trabalho no projeto **Meu Treino**.

---

## 🏋️‍♂️ 1. Filosofia do Produto & Arquitetura

O **Meu Treino** é um rastreador de musculação progressivo (**PWA**), desenvolvido com foco em simplicidade, velocidade e funcionamento **offline-first**, desenhado para atuar como um **substituto direto do caderno físico de anotações**.

- **Notepad-Style (Sem Checkboxes):** Sem burocracia de marcação. Se uma série está listada na tela, ela já foi executada.
- **Soberania dos Dados (Zero Bloat):** Todos os dados pertencem ao usuário e ficam armazenados localmente no navegador via `LocalStorage` e backups JSON limpos. Sem cadastro, sem anúncios, sem telemetria e sem servidores na nuvem.
- **Mobile-First Rigoroso:** O app é desenhado primordialmente para uso com uma mão na academia. A interface é contida em largura máxima mobile (600px) com ergonomia touch em botões e controles.
- **Arquitetura de Estado Modular:** É expressamente proibido fazer *prop-drilling*. O estado global é dividido em contextos especializados (`NavigationContext`, `SessionContext`, `HistoryContext`), consumidos por container hooks co-localizados (`useActiveWorkoutScreen`, `useHistoryView`, `useExerciseScreen`).
- **SOLID & KISS:** Mantenha soluções simples, diretas e legíveis. Evite abstrações prematuras ou complexidade acidental.

---

## 🧩 2. Componentes de UI (`Mt*`) vs. Componentes de Domínio

Qualquer novo componente deve ser classificado corretamente antes de ser criado:

```
┌──────────────────────────────────────────────────────────┐
│                   Novo Componente                        │
└────────────────────────────┬─────────────────────────────┘
                             │
            ¿Manipula entidades de treino como             │
          WorkoutSession, ExerciseSet ou regras?           │
               /                            \
             NÃO                            SIM
             /                                \
┌───────────────────────────┐      ┌───────────────────────────┐
│   Componente de UI (Mt*)  │      │   Componente de Domínio   │
├───────────────────────────┤      ├───────────────────────────┤
│ • Pasta: src/components/ui│      │ • Pasta: src/components/  │
│ • Prefixo: "Mt" obrigatório│     │   (ou active-workout/     │
│   (ex: MtButton, MtCard)  │      │    ou history/)           │
│ • Agnóstico a regras de   │      │ • Nome semântico de treino│
│   negócio e dados         │      │   (ex: ExerciseSetItem)   │
│ • Exportado no index.ts   │      │ • Constrói visual usando  │
│   de ui/                  │      │   MtComponents            │
└───────────────────────────┘      └───────────────────────────┘
```

### A. Componentes de UI / Design System (`Mt*`)
- **Localização:** `src/components/ui/`
- **Nomenclatura:** **SEMPRE** prefixados com `Mt` (ex.: `MtButton`, `MtCard`, `MtField`, `MtInput`, `MtInputForm`, `MtPill`, `MtEmptyState`, `MtAlert`, `MtSectionTitle`, `MtEditableList`, `MtFloatingActionButton`, `MtSuggestionDropdown`).
- **Responsabilidade:** Primitivos visuais puros, estilos, microinterações e acessibilidade.
- **Restrição:** **NUNCA** devem importar tipos de domínio (`WorkoutSession`, `ExerciseSet`, etc.). Recebem apenas propriedades genéricas (`children`, `onClick`, `variant`, `style`, `label`).
- **Exportação:** Sempre exportados no barrel `src/components/ui/index.ts`.

### B. Componentes de Domínio
- **Localização:**
  - `src/components/`: Componentes compartilhados de domínio (`ExerciseScreen`, `ExerciseSetItem`, `ExerciseList`, `ExerciseTechniquePills`, `LastWorkoutSets`, `RestTimer`).
  - `src/components/active-workout/`: Componentes do treino ativo (`ActiveWorkoutHeader`, `CueManager`, `ExerciseSearch`).
  - `src/components/history/`: Componentes do histórico (`ActiveWorkoutCard`, `BackupSection`, `WorkoutHistoryItem`, `WorkoutHistoryList`, `VersionInfo`).
- **Nomenclatura:** Nomes semânticos do vocabulário de treino, **SEM** prefixo `Mt` (ex.: `ExerciseSetItem`, `LastWorkoutSets`, `CueManager`).
- **Responsabilidade:** Manipular dados de treino e aplicar regras de negócio da sessão.
- **Restrição:** Devem ser autocontidos e **utilizar obrigatoriamente os componentes `Mt*` para montar toda a sua camada de interface visual**.

---

## 📁 3. Visão Geral do Repositório & Estrutura de Pastas

```
meu-treino/
├── .agents/                    # Skills e ferramentas especializadas para agentes de IA
├── docs/                       # Documentação técnica, relatórios e notas de release
│   └── DESIGN.md               # Princípios de Design & Mobile UX (leitura obrigatória para UI/UX)
├── src/
│   ├── types/                  # Entidades de domínio (WorkoutSession, WorkoutExercise, ExerciseSet, etc.)
│   ├── services/               # Persistência LocalStorage (storageService) e import/export JSON (backupService)
│   ├── hooks/                  # Provedores de contexto (session/, history/, navigation/) e hooks utilitários
│   ├── views/                  # Telas principais da aplicação (ActiveWorkoutView/, HistoryView/)
│   └── components/
│       ├── ui/                 # Design System interno (todos com prefixo Mt*)
│       ├── active-workout/     # Componentes de domínio da tela de treino ativo
│       └── history/            # Componentes de domínio da tela de histórico
```

---

## 🛠️ 4. Tech Stack Oficial

- **Core & Framework:** React 19 + TypeScript + Vite.
- **PWA & Offline:** `vite-plugin-pwa` para service worker offline e manifesto de instalação no celular.
- **Estilização:** CSS Puro com Design Tokens centralizados em `src/index.css` (sem Tailwind, light mode de alto contraste, ergonomia touch).
- **Ícones:** `lucide-react`.
- **Testes & Qualidade:** Vitest, `@testing-library/react`, `@testing-library/jest-dom`, Stryker Mutator (Mutation Testing) e Oxlint.
- **Persistência:** LocalStorage nativo do navegador e exportação/importação JSON.

---

## 🎨 5. Política do Design System (`Mt*`) & Princípios de UX

- **Leitura Obrigatória de UX (`docs/DESIGN.md`):** Sempre que qualquer tarefa envolver alterações, melhorias ou criação de UI/UX, o agente **PRECISA** consultar e seguir rigorosamente os princípios de design para app 100% mobile definidos em `docs/DESIGN.md`.
- **Proibição de Tags HTML Puras:** É expressamente proibido usar tags HTML nativas (`<button>`, `<div className="card">`, `<section className="card">`, `<span className="pill">`, etc.) quando já existir ou couber a criação de um componente `Mt*`.
- **Ações Destrutivas Exigem Confirmação:** Ações destrutivas (como excluir série, remover exercício, cancelar treino ou resetar dados) **sempre** exigem diálogo de confirmação explícita do usuário antes de serem executadas.
- **Preservação de Componentes:** Nunca apague nem renomeie componentes existentes sem perguntar e confirmar previamente com o usuário.

---

## 📦 6. Política de Dependências

- **Manter a Base Leve (Zero Bloat):** Evite adicionar novas dependências externas. O aplicativo preza por independência, alta velocidade e soberania.
- **Sugestão de Soluções:** Se uma funcionalidade complexa justificar uma biblioteca pronta da comunidade, o agente deve sugerir a adição com justificativa técnica clara.
- **Proibição Estrita:** **NUNCA** baixe nem instale novos pacotes (`npm install <pacote>`, `yarn add`, etc.) sem pedir autorização prévia e explícita ao usuário.

---

## 🧪 7. Qualidade, Testes & Padrões de Código

- **Linter Obrigatório:** Execute **sempre** `npm run lint` (`oxlint`) antes de realizar commits. O código deve ter **0 erros**.
- **Testes Automatizados:** Execute **sempre** `npm test` (`vitest run`) e `npm run build` antes de fechar commits, garantindo que nenhuma regressão foi introduzida.
- **Commits Pequenos, Frequentes e em Português:** Nunca acumule trabalho para commitar tudo de uma vez. Escreva commits atômicos em português seguindo o padrão do **Conventional Commits**:
  - `feat(ui): adiciona componente MtBadge`
  - `fix(history): corrige cálculo de duração na visualização`
  - `refactor(session): simplifica fluxo de atualização de séries`
  - `test(services): adiciona testes de importação de backup`
  - `docs: atualiza documentação no AGENTS.md`
- **Legibilidade & Linguagem de Domínio:** Escreva código explícito e verboso, usando termos reais de treino (*série*, *repetições*, *carga*, *descanso*, *template*, *cues*). O código deve ser compreensível para qualquer desenvolvedor júnior apenas lendo o arquivo.

---

## 🌿 8. Estratégia de Branches & Ciclo de Vida do Código

O repositório adota um fluxo de trabalho estruturado em 3 branches principais:

```
develop (Desenvolvimento diário)
   │
   ▼ (Merge)
homolog (Homologação / Staging no Surge.sh)
   │
   ▼ (Merge + Bump de versão + Release notes)
main (Produção / Código-fonte estável oficial)
   │
   ▼ (npm run deploy -> Build compilado em dist/)
gh-pages (Remoto: GitHub Pages público)
```

1. **`develop` (Desenvolvimento Ativo):** Branch de trabalho padrão no dia a dia. Todo novo desenvolvimento, melhoria, refatoração e testes iniciam aqui.
2. **`homolog` (Homologação / Staging):** Branch intermediária de pré-lançamento. Recebe merges de `develop` e é enviada para validação no celular via `npm run deploy:staging` (Surge.sh).
3. **`main` (Produção Oficial):** Contém exclusivamente o código-fonte estável e auditado pronto para produção. Recebe merges de `homolog` no momento de fechamento de releases.
4. **`gh-pages` (Hospedagem Remota):** Branch remota dedicada apenas a hospedar os assets estáticos minificados (`dist/`) servidos pelo GitHub Pages. Nunca editada diretamente.

---

## 🚀 9. Protocolo de Deploy, Ambientes & Release Notes

O projeto conta com dois ambientes de publicação isolados:

### A. Ambiente de Homologação / Staging (`npm run deploy:staging`)
- **Branch:** `homolog`
- **Destino:** `https://meu-treino-staging.surge.sh` (Surge.sh).
- **Propósito:** Validar alterações online no celular com `LocalStorage` e Service Worker isolados antes de atualizar a versão oficial.
- **Execução:** Pode ser executado a partir da branch `homolog` a qualquer momento para testes prévios.

### B. Ambiente de Produção Oficial (`npm run deploy` ou `npm run deploy:prod`)
- **Branch:** `main`
- **Destino:** `https://deividsousan.github.io/meu-treino/` (GitHub Pages via branch `gh-pages`).
- **Proibição de Deploy Automático:** **NUNCA** execute `npm run deploy` sem solicitação explícita e direta do usuário.
- **Procedimento Obrigatório ao Rodar Deploy de Produção:**
  Sempre que o usuário solicitar explicitamente o deploy de produção, o agente deve seguir rigorosamente estes passos:
  1. Estar na branch `main` com o código devidamente integrado de `homolog`.
  2. **Atualizar Versão:** Incrementar a versão no `package.json` de acordo com o SemVer (`major`, `minor` ou `patch`).
  3. **Criar Release Notes:** Criar ou atualizar o arquivo de release notes para desenvolvedores em `docs/releases/vX.Y.Z.md`, documentando as novidades, correções e melhorias técnicas da versão.
  4. **Commitar Release:** Fazer o commit da versão e release notes (`git commit -m "docs: release notes vX.Y.Z"`).
  5. **Executar Deploy:** Rodar o comando `npm run deploy` e informar o link publicado ao usuário.

---

## 🚫 10. Tabela Rápida: O que NUNCA fazer

| Proibição | Motivo |
| :--- | :--- |
| **Nunca rodar `npm run deploy` sem pedido explícito** | Evita deploys acidentais ou não testados em produção |
| **Nunca instalar dependências sem permissão** | Mantém a base leve, auditável e soberana |
| **Nunca usar tags HTML puras se houver `MtComponent`** | Garante uniformidade e consistência no Design System |
| **Nunca criar componentes de UI fora de `src/components/ui/` ou sem prefixo `Mt*`** | Mantém a separação clara entre primitivos e domínio |
| **Nunca fazer prop-drilling** | Mantém a arquitetura limpa e os componentes desacoplados |
| **Nunca alterar o esquema de armazenamento sem migração** | Protege os dados reais dos usuários contra corrupção |
| **Nunca apagar componentes existentes sem confirmação** | Previne quebras e regressões na aplicação |
