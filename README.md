# CodeConnect

Workspace pnpm com dois apps gerados usando `npx`: React com Vite e TypeScript em `apps/web`, e NestJS em `apps/api`.

## Requisitos

- Node.js 22.12 ou superior
- pnpm 12.15.0
- Docker com Docker Compose (SQL Server da API)

## Executar

Na raiz do workspace:

```sh
pnpm install
cp .env.example .env                  # defina MSSQL_SA_PASSWORD
cp apps/api/.env.example apps/api/.env  # use a mesma senha em DATABASE_URL
pnpm db:up                            # sobe o SQL Server (dados no volume mssql-data)
pnpm db:deploy                        # aplica as migrations
pnpm dev
```

O frontend inicia em http://localhost:5173 e a API em http://localhost:3000. O Vite pode escolher outra porta caso a padrão esteja ocupada.

## Comandos na raiz

| Comando | Ação |
| --- | --- |
| `pnpm dev` | Inicia os dois apps em desenvolvimento |
| `pnpm dev:web` | Inicia somente o React/Vite |
| `pnpm dev:api` | Inicia somente o NestJS com watch |
| `pnpm build` | Compila os dois apps |
| `pnpm build:web` | Compila o frontend |
| `pnpm build:api` | Compila a API |
| `pnpm lint` | Verifica os dois apps |
| `pnpm lint:web` | Verifica o frontend |
| `pnpm lint:api` | Verifica a API |
| `pnpm test:api` | Executa os testes unitários da API |
| `pnpm test:api:e2e` | Executa os testes de integração da API (requer o SQL Server) |
| `pnpm db:up` | Sobe o SQL Server do `compose.yaml` |
| `pnpm db:down` | Para o SQL Server, mantendo os dados no volume |
| `pnpm db:migrate` | Cria e aplica uma migration a partir do schema Prisma |
| `pnpm db:deploy` | Aplica as migrations pendentes |
| `pnpm preview:web` | Serve o build do frontend para conferência |
| `pnpm start:api` | Executa o build da API em produção |

Execute o build correspondente antes de `preview:web` ou `start:api`.

Para outros comandos, use `pnpm --filter web <comando>` ou `pnpm --filter api <comando>` na raiz.

No PowerShell com execução de scripts bloqueada, use `pnpm.cmd` no lugar de `pnpm`.
