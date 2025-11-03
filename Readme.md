# Estrutura do Projeto

-> MicroFramework: Fastify, por que?
Integraçao direta com Typescript
Performace e Otimizaçao
Funçoes com padronizaçao de async/await

é considerado um microFramework, pois ele náo é opinado, voce pode configurar suas pastas da forma que bem entender, diferente do nest por exemplo!!

-> TypeScript: tipagem de codigo, trazendo mais segurança, confiabilidade, produtividade e inteligencia para nosso IDE.

-> Knex: query builder, para comunicaçao com banco de dados!

-> docker: subir o banco postgresql!

-> DB: Postgresql com knex!

-> docker-compose: subir o container!

-> zod: tratamento das envs

## Começando projeto

-> npm init -y: criando package.json

-> npm i -D typescript: instalando o TS como dependencia de desenvolvimento

-> npx tsc --init: cria o arquivo de configuraçao do TS
OBS: o NPX vem junto do npm e é um executavel de binarios das bibliotecas que instalamos no nosso projeto

-> npx tsc src/index.ts: converte meu codigo de TS para JS, já que o browser náo entende TS por padráo!

-> npm i fastify: microframework do node

-> npm i zod: biblioteca de validaçáo de envs e algoritimos

-> npm i -D @types/node: precisamos baixar esse pacote para fazer a ligaçao entre o node o typescript!

-> npm i -D tsx: converte nosso codigo em JS, sem poluir a nossa pasta, e roda o TS diretamente!

-- query builder --
-> npm install knex --save
-> npm install pg
-> npm install knex -g

-> npm i bcrypt: lib para criar hashs de senhas
-> npm i uuid & npm i type/uuid: cria id's aleatorios e seguros

# Regra de Negocio

### Regras da aplicação
[X] Deve ser possível criar um usuário
[x] Deve ser possível identificar o usuário entre as requisições
[x] Deve ser possível registrar uma refeição feita, com as seguintes informações:
   As refeições devem ser relacionadas a um usuário.
    - Nome
    - Descrição
    - Data e Hora
    - Está dentro ou não da dieta

[x] Deve ser possível editar uma refeição, podendo alterar todos os dados acima
[x] Deve ser possível apagar uma refeição
[x] Deve ser possível listar todas as refeições de um usuário
[x] Deve ser possível visualizar uma única refeição
[ ] Deve ser possível recuperar as métricas de um usuário
[x] Quantidade total de refeições registradas
[x] Quantidade total de refeições dentro da dieta
[x] Quantidade total de refeições fora da dieta
[ ] Melhor sequência de refeições dentro da dieta
[x] O usuário só pode visualizar, editar e apagar as refeições o qual ele criou
