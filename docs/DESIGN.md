# Design System - Meu Treino

## Filosofia de UI/UX

### Princípio Fundamental: Simplicidade Extrema

O "Meu Treino" é projetado com a mentalidade de **"um bloco de notas digital"**. A prioridade máxima é a velocidade e a simplicidade de uso. Cada elemento visual deve justificar sua existência.

### Mobile-First

Todas as decisões de design são tomadas primeiro para telas pequenas. A interface é otimizada para uso com uma mão, com elementos de ação posicionados para fácil acesso com o polegar.

---

## Diretrizes de Interface

### 1. Hierarquia Visual Minimalista

**Regra:** Manter apenas informações essenciais visíveis por padrão.

- **Tela Inicial (Histórico):**
  - Backup (topo, ícone + ação)
  - Treino em andamento (se houver)
  - Histórico resumido (nome, data/hora, duração)
  - FAB "Novo Treino" (fixo, sempre acessível)
  
- **Remoção de Elementos:**
  - Sem detalhes desnecessários (ex: lista de exercícios no histórico)
  - Sem botões redundantes (editar/excluir substituídos por gestos)
  - Sem seções que não agreguem valor direto ao usuário

### 2. Gestos Substituem Botões

**Objetivo:** Reduzir clutter visual e aumentar a fluidez.

- **Toque curto:** Ação primária (abrir/editar)
- **Toque longo (600ms):** Ação secundária/destrutiva (excluir)
- **Context menu (desktop):** Alternativa ao toque longo

**Implementação:**
```typescript
onTouchStart → iniciar timer (600ms)
onTouchEnd → cancelar timer (se < 600ms) = toque curto
onContextMenu → toque longo
```

### 3. Ícones ao Invés de Texto

**Quando usar ícones:**
- Ação visualmente óbvia (📥 exportar, 📤 importar)
- Espaço limitado
- Elementos repetitivos

**Quando usar texto:**
- Ação ambígua que pode causar confusão
- Primeira interação do usuário com a funcionalidade
- Labels importantes que precisam de clareza absoluta

### 4. Estados Vazios

**Regra:** Nunca mostrar uma tela vazia sem direcionamento.

```
"Nenhum treino registrado"
    ↓
[Botão: Criar primeiro treino]
```

Sempre fornecer um caminho claro para a ação principal.

### 5. Feedback e Confirmação

- **Ações destrutivas** (excluir): Sempre requerem confirmação (`window.confirm`)
- **Ações irreversíveis:** Nunca são executadas sem confirmação explícita
- **Feedback positivo:** Alertas apenas para erros ou sucessos importantes

### 6. Tipografia

- **Tamanhos:** Escala limitada (1.35rem, 1.15rem, 1rem, 0.9rem, 0.85rem, 0.8rem)
- **Cores:** 
  - Primária: `#212529` (texto principal)
  - Secundária: `#495057` (informações complementares)
  - Muted: `#adb5bd` (informações terciárias)
- **Fontes:** System UI stack para performance nativa

### 7. Espaçamento

- **Escala:** 4px, 8px, 16px, 24px
- **Gaps consistentes** entre elementos relacionados
- **Respiração** suficiente entre seções (cards)

### 8. Cores e Identidade Visual

**Paleta Principal:**
- Background: `#f8f9fa` (cinza claro)
- Cards: `#ffffff` (branco puro)
- Accent: `#4f46e5` (índigo)
- Success: `#198754` (verde)
- Danger: `#dc3545` (vermelho)
- Warning: `#fd7e14` (laranja)

**Uso:**
- Accent: Ações primárias, elementos ativos
- Success: Concluído, finalizado
- Danger: Ações destrutivas
- Warning: Alertas, lembretes

### 9. Componentes Reutilizáveis

**Cards:**
- Container padrão para agrupamento de conteúdo
- Borda sutil, padding generoso
- Background branco para contraste

**Badges:**
- Estados pequenos e discretos
- Cores semânticas (completed, in-progress)
- Uso: tags, status, categorização

**Ícones:**
- Estilo: **apenas outline** (sem preenchimento)
- strokeWidth: 2 ou 2.5
- Uso: ações, navegação, indicadores
- Combinação ícone + texto quando a ação precisa de clareza

**Botões:**
- Estilo preferido: **outline** (sem background sólido)
- Cores semânticas via borda e texto
- Dois tamanhos: default, small
- Estados: hover (background sutil), disabled
- Gap interno consistente (8px)
- Evitar preenchimentos sólidos

**Exemplos de ícones por contexto:**
- Navegação: setas direcionais (← →)
- Ações destrutivas: lixeira, X
- Ações positivas: check, +
- Backup: seta para baixo (exportar), seta para cima (importar)
- Avisos: círculo com exclamação

### 10. Navegação

- **FAB (Floating Action Button):** Ação primária "Novo Treino"
  - Fixo no bottom-right
  - Sempre visível (z-index alto)
  - Ícone "+" (sem texto)
  
- **Headers fixos:**
  - Sticky positioning
  - Background sólido
  - Conteúdo essencial apenas

### 11. Acessibilidade

**Considerações:**
- Contraste mínimo de 4.5:1 para texto
- Touch targets mínimo de 44x44px
- Labels semânticos em botões de ação
- Focus states visíveis

**Trade-offs Aceitáveis:**
- Toque longo pode ser desafiador para usuários com deficiências motoras
- Ausência de onboarding (usuário descobre por tentativa)
- Sem feedback háptico diferenciado

---

## Padrões de Implementação

### CSS-in-JS (Inline Styles)

**Por quê:** Flexibilidade máxima para ajustes rápidos, sem build step.

**Regras:**
- Usar CSS variables para valores repetitivos
- Evitar hardcoded values quando possível
- Manter estilos organizados por seção

### Estado e Performance

- **useState:** Para estado local de componentes
- **useEffect:** Para sincronização com localStorage
- **useCallback:** Para funções passadas como props (evita re-renders)
- **useRef:** Para acessar DOM (file input, timers)

### Tratamento de Dados

- **LocalStorage:** Fonte única de verdade
- **Sincronização:** Após cada mutação, recarregar dados
- **Validação:** Sempre validar estrutura de dados importados

---

## Decisões Técnicas

### Por que Remover Templates?

**Motivo:** Reduzir complexidade cognitiva. O usuário quer registrar treinos, não gerenciar modelos.

**Alternativa:** Usar sugestões de exercícios baseadas no histórico (mais natural).

### Por que Gestos ao Invés de Botões?

**Motivo:** 
1. Liberar espaço visual
2. Torna a interface mais limpa
3. Fluxo de uso mais rápido (após aprendizado)

**Risco:** Descoberta de funcionalidades. Aceitável porque:
- Usuário é o próprio desenvolvedor
- App é pessoal, não comercial

### Por que Ícones no Backup?

**Motivo:** Ação óbvia (exportar/importar), ícones universais. Economiza ~70% do espaço.

---

## Métricas de Sucesso

### Performance
- First Contentful Paint < 1s
- Time to Interactive < 2s
- Tamanho total < 100KB (gzipped)

### Usabilidade
- Usuário consegue iniciar treino em < 2 toques
- Histórico visível sem scroll
- Ação de backup acessível imediatamente

### Manutenibilidade
- Código limpo e documentado
- Tipos TypeScript estritos
- Componentes pequenos e focados

---

## Próximos Passos (Propostos)

1. **Onboarding Opcional:** Primeira vez, mostrar sutilmente os gestos
2. **Feedback Háptico:** Vibrar ao detectar toque longo
3. **Animações:** Transições suaves entre telas
4. **Modo Escuro:** Suporte a dark mode
5. **Acessibilidade:** Alternativas de acessibilidade para gestos

---

## Notas

Este documento é vivo. Todas as decisões de design devem ser documentadas aqui para manter consistência e facilitar onboarding de novos desenvolvedores (ou do próprio "futuro eu").

**Última atualização:** 2026-08-08