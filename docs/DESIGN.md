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

### 7. Ergonomia do Polegar (Thumb Zone)

O aplicativo é usado predominantemente com uma mão durante o cansaço do treino. Todas as ações dominantes e frequentes (Adicionar Série, Avançar Exercício, Finalizar Treino) devem estar concentradas na metade inferior da tela (área de alcance natural do polegar).

### 8. Áreas de Toque Generosas (Regra do Dedo Gordo)

- Todo elemento interativo deve possuir uma área de toque efetiva (_hit target_) de, no mínimo, **48x48px**.
- Botões primários dominantes e botões de ação flutuante (FAB) devem ter **56px** de altura/diâmetro.
- Ícones de controle devem ter dimensões mínimas de 18px a 20px com espessura de traço reforçada (`strokeWidth={2.25}`).

### 9. Entrada de Dados por Ajuste Rápido (Steppers & Incrementos)

- Minimizar a necessidade de abrir o teclado virtual durante o treino.
- Priorizar seletores rápidos (`-` / `+`), repetição da última série e chips de incremento rápido (`+1 rep`, `+2kg`, `+5kg`).
- Manter o toque direto no número como alternativa para saltos grandes de carga, disparando teclado estritamente numérico (`inputmode="decimal"`).

### 10. Feedback Multissensorial Imediato (Visual & Tátil)

- Resposta instantânea a cada registro com confirmação visual de alto contraste.
- Utilização de feedback háptico (vibração nativa do PWA via `navigator.vibrate`) ao salvar séries e ao zerar o cronômetro de descanso, com fallback silencioso para dispositivos sem suporte.

### 11. Fricção Seletiva e Prevenção de Erros

- Ações construtivas (salvar série, iniciar descanso, avançar exercício) possuem **zero atrito** (1 toque direto).
- Ações destrutivas (excluir série, remover exercício, cancelar treino, resetar dados) exigem **atrito deliberado** (confirmação explícita via `MtConfirmDialog`).

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

- Reservar o roxo/índigo para ações e estados de alta importância.
- Evitar que múltiplos controles concorrentes pareçam simultaneamente primários.

### 4. Linguagem Semântica e Consistente de Estados

- **Em Andamento:** Foco operacional no exercício e na série corrente.
- **Descanso:** Destaque temporal do cronômetro sem poluir a visão do próximo exercício.
- **Concluído / Sucesso:** Confirmação visual imediata do registro da série ou conclusão do treino.
- **Atenção / Erro:** Alertas claros e contextuais apenas quando uma ação corretiva for indispensável.

### 5. Contraste e Destaque para Dados Operacionais

- Aumentar o tamanho e o contraste das informações vitais em movimento na academia: **repetições**, **carga (kg)** e **cronômetro de descanso**.
