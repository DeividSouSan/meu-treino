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



