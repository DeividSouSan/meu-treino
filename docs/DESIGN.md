# Princípios de Design & Mobile UX

A ideia é fazer o aplicativo funcionar como uma ferramenta de uso recorrente durante o treino: decisões rápidas, poucos toques, boa leitura em movimento e baixa fricção para registrar séries. A análise abaixo prioriza um produto 100% mobile.

---

## 📱 Princípios de Design para um App 100% Mobile

### 1. Uma ação primária por contexto
Em cada tela, deve haver uma ação obviamente dominante. Ações secundárias precisam desaparecer visualmente quando não são urgentes.

### 2. Toque grande, decisão pequena
O alvo de toque deve ser generoso, mas a quantidade de opções simultâneas deve ser pequena.

### 3. Contexto visível o tempo todo
O usuário precisa saber imediatamente em qual treino, exercício, série e estado de descanso está.

### 4. Registrar deve ser mais rápido que configurar
O aplicativo deve lembrar padrões do usuário e pedir apenas o que mudou.

### 5. O sistema deve preservar o fluxo
Navegar para um exercício não deveria parecer uma troca de página completa quando o usuário ainda está no mesmo treino.

### 6. Feedback precisa responder “foi salvo?”
Toda ação importante precisa de confirmação visual imediata, sem depender de mensagens vagas ou do usuário verificar o histórico.

---

## 🎨 Diretrizes Visuais & Refinamentos de Interface

### 1. Hierarquia Limpa e Menos Ruído Visual
- Reduzir a quantidade de bordas e sombras onde elas não ajudam a agrupar conteúdo.
- Priorizar espaçamento e superfícies limpas em vez de contornos excessivos para delimitar seções.

### 2. Escala Tipográfica Clara e Funcional
- **Título:** Identificação imediata da tela, seção ou exercício atual.
- **Informação Principal / Dados Operacionais:** Alto destaque e legibilidade para reps, carga e cronômetro.
- **Metadados:** Informações complementares (data, contagem total de séries, tempo decorrido) em tons secundários.
- **Estados Secundários:** Dicas, cues e notas de apoio sem disputar atenção com os controles ativos.

### 3. Uso Intencional da Cor de Destaque
- Reservar o roxo para ações e estados de alta importância.
- Evitar que múltiplos controles concorrentes pareçam simultaneamente primários.

### 4. Linguagem Semântica e Consistente de Estados
- **Em Andamento:** Foco operacional no exercício e na série corrente.
- **Descanso:** Destaque temporal do cronômetro sem poluir a visão do próximo exercício.
- **Concluído / Sucesso:** Confirmação visual imediata do registro da série ou conclusão do treino.
- **Atenção / Erro:** Alertas claros e contextuais apenas quando uma ação corretiva for indispensável.

### 5. Contraste e Destaque para Dados Operacionais
- Aumentar o tamanho e o contraste das informações vitais em movimento na academia: **repetições**, **carga (kg)** e **cronômetro de descanso**.
