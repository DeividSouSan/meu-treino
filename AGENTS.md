Faça:
- Modularize o sistema, sempre crie componentes que são auto-contidos.
- Escreva código explicito, seja verboso, não abrevie.
- Escreva usando a linguagem do domínio e evite termos técnicos da programação.
- Escreva código para que um humano, um desenvolvedor júnior, consiga entender facilmente apenas lendo.
- Lembre-se que é tudo mobile-first, e leve isso a sério.
- SEMPRE crie componentes que são autocontidos: eles tem toda a lógica dentro deles, a única coisa que eles recebem é o estado atual da entidade manipulada.
- Ações destrutivas (como apagar uma série) sempre exigem confirmação do usuário antes de serem executadas.
- Sempre que for inserir tags HTML, ou estiver revisitando um arquivo, verifique se já não existe um MtComponent que substitui a tag.
- Faça commits pequenos e frequentes, nunca deixe trabalho acumular para commitar tudo no final.
- Implemente os princípios SOLID e KISS 
- Verifique as skills existentes e utilize-as conforme o "When to use" especificado em cada.
- Nunca baixe pacotes sem pedir confirmação.


Nunca faça:
- Não apague componentes que já existem sem perguntar antes.
- Não altere o esquema do banco de dados sem sugerir uma migração.
- Não faça prop-drilling em nenhuma circuância.



