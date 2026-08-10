Faça:
- Modularize o sistema, sempre crie componentes que são auto-contidos.
- Escreva código explicito, seja verboso, não abrevie.
- Escreva usando a linguagem do domínio e evite termos técnicos da programação.
- Escreva código para que um humano, um desenvolvedor júnior, consiga entender facilmente apenas lendo.
- Lembre-se que é tudo mobile-first, e leve isso a sério.
- SEMPRE crie componentes que são autocontidos: eles tem toda a lógica dentro deles, a única coisa que eles recebem é o estado atual da entidade manipulada.
- Adicione novas linhas ao AGENTS.md conforme for aprendendo novas regras. NUNCA apague uma linha desse arquivo.
- Ações destrutivas (como apagar uma série) sempre exigem confirmação do usuário antes de serem executadas.
- Sempre que for inserir tags HTML, ou estiver revisitando um arquivo, verifique se já não existe um MtComponent que substitui a tag.

Nunca faça:
- Não apague componentes que já existem sem perguntar antes.
- Não altere o esquema do banco de dados sem sugerir uma migração.
- Não faça prop-drilling em nenhuma circuância.

APRENDIZADOS DO AGENTE (insira aqui o que foi aprendido):
- O item de uma série de exercício não deve ser expansível por toque (não use toggle tipo acordeão). A interação de toque deve abrir apenas o modo de edição inline do set, mantendo a visualização normal sempre fixa.
- Destructive actions confirmation: sempre peça confirmação antes de apagar uma série.
- Confirmação em ações acidentais: ações como Salvar e Encerrar o treino ativo também devem pedir confirmação, pois podem ser acionadas por acidente e atrapalhar o progresso do usuário.
- Mobile-first: priorize toques grandes e evite interações de clique que não têm um destino claro.
- Exercícios são identificados pelo nome, não pelo ID, pois os IDs (UUID) são regenerados a cada nova sessão a partir de um template. A correspondência por nome (case-insensitive e sem espaços) permite localizar o mesmo exercício em treinos anteriores.
- Visualizações rápidas de histórico (como as séries do último treino) devem ser exibidas fixas e sempre visíveis, sem interações de toque ou toggles, mantendo a informação disponível para referência durante o treino.
