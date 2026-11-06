# Instruções para agentes: API

Regras específicas de `apps/api`. Elas complementam as regras gerais do monorepo em `AGENTS.md` na raiz, que também se aplicam aqui.

## Convenções de implementação

- Use aspas simples e ponto e vírgula, mantendo o estilo do arquivo alterado.
- O pacote usa ESM com resolução NodeNext: preserve a extensão `.js` nos imports relativos dos arquivos TypeScript.
- Preserve a organização NestJS com módulos, controllers e services e injeção de dependências.
- Entrada em `src/main.ts`, composição em `src/app.module.ts`, testes unitários `*.spec.ts` ao lado do código e testes de integração em `test/*.e2e-spec.ts`.

## Banco de dados

- A API usa SQL Server (via `compose.yaml` na raiz) com Prisma 7 e o driver adapter `@prisma/adapter-mssql`. A conexão vem de `DATABASE_URL` em `apps/api/.env` (modelo em `.env.example`).
- O schema fica em `prisma/schema.prisma` e as migrations em `prisma/migrations/`. Altere o schema e gere a migration com `pnpm db:migrate`; nunca edite migrations já aplicadas.
- O client é gerado em `src/generated/prisma` (ignorado pelo git e pelo lint) por `prisma generate`, que roda no `postinstall`, no `build`, no `dev` e no `test:e2e`.
- O acesso ao banco fica atrás de repositórios: `UsersRepository` é uma classe abstrata usada como token de injeção, implementada por `PrismaUsersRepository`. Services não importam o Prisma. Traduza erros do Prisma (por exemplo, `P2002`) para erros de domínio no repositório.
- Testes unitários usam implementações em memória (`src/users/testing/`). Os testes e2e usam o banco `codeconnect_test` (ou `DATABASE_URL_TEST`), aplicam as migrations no `globalSetup` e limpam as tabelas antes de cada teste.

## Princípios REST

- Modele a API em torno de recursos, com URLs que usem substantivos no plural, identificadores estáveis e hierarquias que representem relações reais. Evite verbos de ação nas URLs quando a operação puder ser expressa por recursos e métodos HTTP.
- Respeite a semântica dos métodos: `GET` e `HEAD` são seguros e não alteram o estado de negócio; `POST` cria recursos ou processa operações; `PUT` substitui a representação do recurso; `PATCH` aplica alterações parciais; `DELETE` remove o recurso.
- Preserve a idempotência de `PUT` e `DELETE` e dos métodos seguros. Repetir a requisição deve manter o mesmo efeito pretendido no servidor, embora a resposta possa variar. Defina e documente a semântica de repetição de operações `PATCH` e `POST` quando necessário.
- Mantenha as requisições sem estado de sessão no servidor: cada requisição deve conter o contexto necessário para ser processada. Isso não impede persistir recursos e dados de negócio.
- Use códigos HTTP coerentes: `200` para sucesso com representação, `201` para criação com `Location` do recurso criado, `202` para processamento assíncrono e `204` para sucesso sem corpo. Diferencie `400`, `401`, `403`, `404`, `405`, `409`, `415` e `422` conforme a causa; não retorne erros como `200`. Respostas `HEAD` e `204` não devem conter corpo.
- Valide parâmetros, query strings e corpos com DTOs e validação de entrada. Padronize as representações e os erros, sem expor stack traces, detalhes internos ou segredos.
- Respeite a interface uniforme: identifique recursos, manipule-os por representações, produza mensagens autodescritivas e ofereça links e controles de hipermídia que indiquem as transições disponíveis quando aplicável ao fluxo.
- Declare os tipos de mídia e respeite `Content-Type` e `Accept`, retornando `415` ou `406` quando apropriado. Defina políticas explícitas de cache; use validadores como `ETag` ou `Last-Modified` quando aplicáveis, incluindo requisições condicionais e proteção contra atualizações concorrentes.
- Padronize paginação, filtros e ordenação de coleções. Mantenha autenticação e autorização em guards ou camadas apropriadas, preservando a separação entre transporte HTTP e regras de negócio.
- Preserve a arquitetura em camadas, permitindo intermediários como proxies e caches sem exigir conhecimento da implementação interna. Code-on-demand é uma restrição REST opcional e não precisa ser introduzida.
- Documente os contratos dos endpoints e cubra com testes os métodos, status, cabeçalhos, validação, autorização e semântica de idempotência relevantes para cada recurso.

## Telemetria

- A API não tem telemetria de produção configurada. Não execute `npx @nestjs/observe link`, não instale `@nestjs/observe` e não adicione o servidor MCP do NestJS Observe sem pedido explícito, pois isso altera dependências, `src/app.module.ts` e `.env`.

## Validação

Os comandos abaixo usam os scripts da raiz do monorepo. Dentro de `apps/api`, use os equivalentes do pacote: `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e`.

- Para alterações de código, execute `pnpm lint:api` e `pnpm build:api`.
- Para mudanças de comportamento, execute `pnpm test:api` e, quando afetarem endpoints, integração HTTP ou o banco, `pnpm test:api:e2e` (com o SQL Server rodando: `pnpm db:up`). Acrescente testes relevantes para novos comportamentos e correções.
