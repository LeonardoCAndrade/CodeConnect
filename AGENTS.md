# Instruções para agentes

Este arquivo contém as regras gerais do monorepo e do frontend. As regras específicas da API ficam em `apps/api/AGENTS.md`: leia-o antes de planejar, alterar ou revisar qualquer coisa em `apps/api` e siga os dois arquivos.

As regras dos agentes ficam somente nos arquivos `AGENTS.md`. Os arquivos `CLAUDE.md` apenas importam o `AGENTS.md` do mesmo diretório; ao adicionar ou alterar regras, edite o `AGENTS.md` correspondente, nunca o `CLAUDE.md`.

## Estrutura do projeto

CodeConnect é um monorepo pnpm com dois aplicativos TypeScript:

- `apps/web`: React com Vite, Tailwind CSS 4 (plugin `@tailwindcss/vite`) e Vitest. Entrada em `src/main.tsx`, componente raiz em `src/App.tsx`, estilos globais em `src/index.css`, componentes em `src/components/` e configuração dos testes em `src/test/setup.ts`.
  - A comunicação com a API fica em `src/api/`: `client.ts` (cliente `openapi-fetch` que injeta o token Bearer), `auth.ts` (login e cadastro com erros traduzidos em `ApiError`) e `session.ts` (token no `localStorage` ou `sessionStorage`, conforme "Lembrar-me"). Componentes não chamam a API diretamente; as `pages` usam essas funções.
  - `src/api/schema.d.ts` é gerado a partir do Swagger da API com `pnpm --filter web api:types` (com a API rodando) e fica versionado; nunca o edite à mão. O gerador roda via `pnpm dlx` porque `openapi-typescript` ainda não é compatível com o TypeScript 7 do frontend.
  - Em desenvolvimento, o Vite encaminha `/api/*` para `http://localhost:3000` (proxy em `vite.config.ts`); em outros ambientes, defina `VITE_API_URL` (modelo em `apps/web/.env.example`). Nos testes, substitua o `fetch` com os helpers de `src/test/fetch.ts`.
- `apps/api`: NestJS. A estrutura e as convenções estão em `apps/api/AGENTS.md`.
- `pnpm-workspace.yaml` define os pacotes e os scripts de instalação permitidos (`allowBuilds`); `pnpm-lock.yaml` é o lockfile compartilhado.
- `compose.yaml` sobe o SQL Server usado pela API, com os dados no volume `mssql-data`. A senha vem de `MSSQL_SA_PASSWORD` no `.env` da raiz (modelo em `.env.example`).

O frontend já tem as telas de login (`LoginPage`) e cadastro (`SignupPage`), compostas por componentes Atomic Design e integradas à API (o cadastro faz login automático em seguida). A API tem cadastro de usuários e emissão de tokens JWT, com os usuários persistidos em SQL Server via Prisma. Parta do código existente em vez de recriá-lo.

## Ambiente e comandos

Use Node.js 22.12 ou superior e a versão de pnpm definida em `package.json` (`pnpm@12.15.0`). Execute os comandos abaixo na raiz. No PowerShell com scripts bloqueados, use `pnpm.cmd`.

| Comando | Finalidade |
| --- | --- |
| `pnpm install` | Instalar dependências do workspace |
| `pnpm dev` | Iniciar os dois aplicativos |
| `pnpm dev:web` / `pnpm dev:api` | Iniciar um aplicativo |
| `pnpm build` | Compilar os dois aplicativos |
| `pnpm build:web` / `pnpm build:api` | Compilar um aplicativo |
| `pnpm lint` | Verificar os dois aplicativos com Oxlint |
| `pnpm lint:web` / `pnpm lint:api` | Verificar um aplicativo |
| `pnpm test:web` | Executar testes de componentes do frontend com Vitest |
| `pnpm test:api` | Executar testes unitários da API com Vitest |
| `pnpm test:api:e2e` | Executar testes de integração da API com Vitest e Supertest (requer o SQL Server do compose) |
| `pnpm db:up` / `pnpm db:down` | Subir ou parar o SQL Server do `compose.yaml` |
| `pnpm db:migrate` | Criar e aplicar uma migration a partir do schema Prisma (desenvolvimento) |
| `pnpm db:deploy` | Aplicar as migrations pendentes |

Esses scripts existem apenas no `package.json` da raiz. Dentro de `apps/web` ou `apps/api`, use os scripts do próprio pacote (`lint`, `build`, `test` e, na API, `test:e2e`). O frontend usa a porta 5173 por padrão; a API usa `PORT` ou 3000. Outros scripts podem ser executados com `pnpm --filter web <script>` ou `pnpm --filter api <script>`.

## Convenções de implementação

- Mantenha o estilo do arquivo alterado. O frontend usa aspas simples e omite ponto e vírgula; as convenções da API estão em `apps/api/AGENTS.md`.
- Ambos os pacotes usam ESM.
- No frontend, use componentes funcionais e hooks, seguindo as regras de Atomic Design, Tailwind e testes abaixo.
- Use pnpm para alterações de dependências e mantenha o lockfile sincronizado. Não edite `node_modules/`, `dist/` ou arquivos `*.tsbuildinfo` manualmente.
- Nunca inclua credenciais ou arquivos `.env` em commits.
- Preserve alterações preexistentes do usuário e mantenha mudanças restritas à tarefa solicitada.
- Não adicione integrações externas, serviços de telemetria ou servidores MCP sem pedido explícito.

## Frontend: Atomic Design, Tailwind e testes

- Organize os componentes em `apps/web/src/components/` nas camadas `atoms`, `molecules`, `organisms`, `templates` e `pages`.
- `atoms` são elementos básicos; `molecules` combinam elementos em pequenas unidades funcionais; `organisms` compõem seções da interface; `templates` definem layouts; `pages` conectam os layouts aos dados e fluxos da aplicação.
- Componha as camadas superiores a partir das inferiores. Componentes de camadas inferiores não devem importar componentes das superiores. Evite regras de negócio e acesso à API em atoms e molecules.
- Use Tailwind como padrão de estilização e mantenha cores, espaçamentos e demais tokens consistentes. Reserve CSS personalizado para necessidades que as utilities não expressem adequadamente e para estilos globais.
- Todo componente, de qualquer camada, deve ter um teste automatizado cobrindo seu uso essencial. Mantenha o teste próximo do componente, com nome `NomeDoComponente.test.tsx`.
- Teste o comportamento observável pelo usuário: renderização do conteúdo essencial e, quando houver interação, a ação principal e seu resultado. Prefira consultas por papel, nome acessível e texto; snapshots isolados não satisfazem essa exigência.
- Use Vitest com React Testing Library e user-event para os testes de componentes. Tailwind, o ambiente jsdom e o setup dos testes (`src/test/setup.ts`) já estão configurados; reutilize essa infraestrutura em vez de reconfigurá-la.
- Entregue cada componente novo ou alterado com seu teste passando.

## Git: Conventional Commits

- Crie commits, merges e pushes apenas quando solicitado. Se estiver no branch padrão, crie um branch antes de commitar.
- Use Conventional Commits para ambos os aplicativos e para alterações na raiz do monorepo: `<tipo>(<escopo opcional>): <descrição>`.
- Use tipos coerentes com a mudança, como `feat`, `fix`, `docs`, `refactor`, `test`, `style`, `build`, `ci`, `perf`, `revert` e `chore`. O tipo `style` se refere à formatação do código; mudanças visuais de produto devem usar o tipo correspondente ao seu efeito, como `feat` ou `fix`.
- Quando útil, use escopos como `web`, `api` ou `workspace`. Exemplos: `feat(web): adiciona formulário de cadastro`, `fix(api): retorna 404 para recurso inexistente` e `docs(workspace): atualiza instruções dos agentes`.
- Sinalize mudanças incompatíveis com `!` após o tipo/escopo ou com um rodapé `BREAKING CHANGE:`, descrevendo o impacto e a migração necessária.
- Mantenha cada commit focado em uma mudança lógica. Antes de criar commits, revise o diff e inclua apenas os arquivos relacionados à tarefa.

## Validação

- Para alterações de código, execute lint e build do aplicativo afetado.
- Para mudanças no frontend, execute também `pnpm test:web`. A verificação no navegador complementa os testes automatizados.
- Para mudanças na API, siga também a seção de validação de `apps/api/AGENTS.md`.
- Para mudanças apenas de documentação, confira os comandos e caminhos citados; não é necessário compilar os aplicativos.
- Informe quais verificações foram executadas e eventuais falhas ou limitações.
