# Diretrizes para Agentes de IA & Engenharia

Este documento reúne os princípios arquiteturais, convenções de código e restrições obrigatórias para o desenvolvimento no projeto **Meu Treino**.

---

## 🏛️ 1. Arquitetura & Componentização

- **Princípios SOLID & KISS:** Implemente soluções simples, diretas e modulares, evitando complexidade acidental.
- **Componentes Autocontidos:** Sempre crie componentes autocontidos. Eles devem encapsular sua própria lógica interna e estado de interação, recebendo externamente apenas o estado atual da entidade manipulada.
- **Sem Prop-Drilling:** É expressamente proibido fazer *prop-drilling* em qualquer circunstância. Utilize os contextos especializados (`SessionContext`, `HistoryContext`, `NavigationContext`) ou hooks dedicados.
- **Mobile-First Rigoroso:** O aplicativo é desenhado e otimizado primordialmente para uso em smartphones no ambiente de treino. Priorize ergonomia touch, áreas de toque adequadas e layouts fluidos limitados à largura mobile.

---

## 🎨 2. Design System & Interface (`Mt*`)

- **Adesão ao Design System:** Sempre que for inserir tags HTML, ou estiver revisitando um arquivo `.tsx`, verifique se já existe (ou deve ser criado) um componente do Design System (`MtComponent`, ex.: `MtButton`, `MtCard`, `MtField`, `MtPill`, `MtEmptyState`, `MtAlert`, `MtSectionTitle`, `MtEditableList`) para substituir a tag nativa.
- **Preservação de Componentes Existentes:** Nunca apague nem renomeie componentes já existentes na base de código sem perguntar e confirmar previamente com o usuário.

---

## 🛡️ 3. Segurança e Confirmação de Ações

- **Confirmação em Ações Destrutivas:** Ações destrutivas (como apagar uma série, remover um exercício, cancelar um treino ativo ou resetar dados) **sempre** exigem diálogo de confirmação explícita do usuário antes de serem executadas.

---

## 📖 4. Legibilidade e Linguagem de Domínio

- **Linguagem do Domínio:** Escreva utilizando o vocabulário real do domínio de musculação/treino (ex.: *série*, *repetições*, *carga*, *descanso*, *template*, *cues*), evitando termos técnicos abstratos de programação sempre que possível.
- **Código Explícito e Verboso:** Escreva código claro e descritivo. Não utilize abreviações crípticas.
- **Acessível a Iniciantes:** Estruture o código para que qualquer pessoa, inclusive um desenvolvedor júnior, consiga entender o fluxo de funcionamento apenas lendo o arquivo.

---

## 🗄️ 5. Dados e Persistência

- **Esquema de Dados Seguro:** Não altere a estrutura das entidades ou o esquema de armazenamento (LocalStorage/Backup) sem sugerir e implementar uma rotina de migração compatível para proteger os dados históricos dos usuários.

---

## 🔄 6. Processo de Trabalho e Ferramentas

- **Commits Pequenos e Frequentes:** Faça commits atômicos, pequenos e frequentes. Nunca deixe alterações acumularem para commitar tudo de uma só vez no final da sessão.
- **Instalação de Pacotes:** Nunca baixe nem instale novos pacotes ou dependências (`npm install`, etc.) sem pedir autorização prévia ao usuário.
- **Uso de Skills:** Verifique as skills existentes no projeto (`.agents/skills/`) e utilize-as ativamente conforme os gatilhos de *"When to use"* especificados em cada uma.

---

## 🚫 Tabela Rápida: O que NUNCA fazer

| Proibição | Motivo |
| :--- | :--- |
| **Não apague componentes existentes sem perguntar** | Evita regressões e quebra de contratos visuais |
| **Não altere o esquema do banco sem migração** | Protege os dados reais dos usuários contra corrupção |
| **Não faça prop-drilling** | Mantém componentes desacoplados e a arquitetura limpa |
| **Não use tags HTML puras se houver `MtComponent`** | Garante consistência visual em todo o app |
| **Não instale dependências sem permissão** | Mantém a base leve, soberana e previsível |
