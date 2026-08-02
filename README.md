# Meu Treino 🏋️‍♂️

**Meu Treino** é um aplicativo pessoal e minimalista para rastreamento de musculação, projetado para ser tão simples e direto quanto um bloco de notas, com uma interface visual limpa (modo claro), plana e sem atritos desnecessários.

---

## 🎯 Filosofia de Design e Fluxo

1. **Eficiência e Velocidade (Sem Fricção):**
   - Menos toques possíveis para registrar uma série.
   - **Simplicidade do Bloco de Notas:** Não há caixas de seleção para "marcar como feito". Se uma série está listada no exercício, ela foi realizada. Você apenas digita o peso e as repetições.
2. **Modo Claro & Visual Limpo:**
   - Visual em **modo claro** com fundo claro (branco/cinza) e alto contraste.
   - Sem gradientes, neon ou complexidades desnecessárias — tão simples quanto ler um bloco de notas físico.
3. **Duas Telas Principais:**
   - **Histórico (Tela Inicial):** Linha do tempo dos treinos anteriores com opções para exportar/importar dados, gerenciar histórico (editar/excluir treinos) e iniciar uma nova sessão com templates salvos.
   - **Sessão de Treino Ativa (Tela Coringa):** Onde você realiza o treino atual ou edita treinos passados (reutilizando a mesma tela). Permite gerenciar exercícios e séries, preencher carga/repetições e adicionar técnicas.

---

## 📊 Estrutura das Informações Rastreadas

Para cada exercício na sessão, o aplicativo gerencia:
- **Nome do Exercício**
- **Carga (Peso) por Série:** Flexibilidade para subir ou descer o peso em cada série individual.
- **Séries Dinâmicas:** Adicione ou remova séries na hora.
- **Comparativo Direto:** Exibição sutil do peso e repetições do último treino para facilitar a progressão.
- **Técnicas Avançadas (Tags) por Série:** Toggles rápidos para associar técnicas como `RP` (Rest-Pause), `DS` (Drop-set), `FS` (Failure Set / Até a Falha) e `ISO` (Isometria) a séries específicas.
- **Notas Pessoais:** Campo de texto rápido para observações rápidas do exercício.

---

## ⏱️ Cronômetros e Tempo

O controle de tempo é flexível e dinâmico, evitando a rigidez dos aplicativos tradicionais:
1. **Cronômetro do Treino:** Um contador geral simples de duração do treino ativo exibido no topo.
2. **Cronômetro de Descanso Progressivo:**
   - O stopwatch de descanso inicia em `00:00` automaticamente quando o usuário adiciona uma nova série (`+ Série`) ou inicia manualmente.
   - O usuário acompanha visualmente e clica para resetar ou iniciar a próxima série, sem alarmes ou pressões.

---

## 💾 Armazenamento e Exportação

- **Offline-First:** Todo o histórico de treinos é armazenado no próprio dispositivo (via LocalStorage/IndexedDB). Sem servidores.
- **Exportação e Importação de Dados:** 
  - **Exportar JSON:** Baixa o arquivo `meu_treino_backup.json` estruturado para segurança ou para leitura por Inteligências Artificiais.
  - **Importar JSON:** Permite restaurar o histórico de treinos a partir de um arquivo de backup local.




