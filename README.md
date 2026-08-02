# Meu Treino 🏋️‍♂️

**Meu Treino** é um rastreador de musculação progressivo (PWA) e offline-first, desenvolvido para ser tão rápido, leve e flexível quanto um bloco de notas físico. 

Sem cadastros, sem anúncios, sem conexão com a internet e sem distrações.

---

## 📢 Proposta Sincera

**Meu Treino** foi criado para quem quer registrar treinos com o mínimo de atrito. 

❌ **O que ele NÃO é:**
* Um aplicativo com gráficos complexos, estimativas de calorias ou redes sociais integradas.
* Um sistema rígido com listas de exercícios fixas que bloqueiam a sua edição.
* Um serviço em nuvem que coleta seus dados pessoais.

✅ **O que ele É:**
* Um substituto direto do caderninho de papel ou do bloco de notas do celular.
* Uma ferramenta ágil para marcar pesos, repetições e técnicas avançadas em segundos.
* Um app soberano: todos os dados pertencem a você e ficam armazenados localmente no seu dispositivo.

---

## 🎯 Principais Funcionalidades

* **Registro Notepad-Style (Sem Checkboxes):** Esqueça a burocracia de "marcar como feito". Se uma série está listada na tela, ela já foi executada.
* **Cronômetro de Descanso Sutil:** Inicia a contagem progressiva automaticamente no rodapé assim que você registra uma nova série, sem alarmes irritantes.
* **Técnicas Avançadas (Tags por Série):** Toggles rápidos para associar técnicas avançadas como `RP` (Rest-Pause), `DS` (Drop-set), `FS` (Feeder-set) e `ISO` (Isometria) a séries individuais.
* **Flexibilidade Total de Carga:** Permite alterar o peso e repetições de cada série de forma independente.
* **Templates & Repetições:** Salve treinos frequentes como modelos reutilizáveis ou carregue rapidamente a estrutura do seu último treino para progredir carga.
* **Soberania de Dados (Backup em JSON):** Exporte todo o seu histórico em um clique. O arquivo JSON gerado é estruturado de forma limpa, ideal para que você possa alimentar ferramentas de Inteligência Artificial para analisar sua evolução.

---

## 📲 Como Instalar (PWA)

Por ser um Progressive Web App (PWA), você pode instalá-lo diretamente na tela inicial do seu celular, rodando em tela cheia e funcionando 100% offline:

### No iOS (Safari):
1. Abra o link do aplicativo no Safari.
2. Toque no botão **Compartilhar** (ícone de quadrado com seta para cima).
3. Selecione **"Adicionar à Tela de Início"**.

### No Android (Chrome):
1. Abra o link do aplicativo no Chrome.
2. Toque no menu de **três pontos** no canto superior direito.
3. Toque em **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.

---

## 🛠️ Stack Tecnológica

* **Framework:** React + TypeScript (Vite)
* **Estilização:** CSS Puro (Light-mode plano de alto contraste)
* **Persistência:** LocalStorage (Nativo do navegador)
* **PWA:** `vite-plugin-pwa` para service worker offline e manifesto
