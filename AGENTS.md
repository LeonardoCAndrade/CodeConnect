# Instruções para agentes

Este arquivo contém as regras gerais do monorepo e do frontend. As regras específicas da API ficam em `apps/api/AGENTS.md`; siga os dois arquivos ao trabalhar em `apps/api`.

## Estrutura do projeto

CodeConnect é um monorepo pnpm com dois aplicativos TypeScript:

- `apps/web`: React com Vite. Entrada em `src/main.tsx`, componente principal em `src/App.tsx`, estilos em `src/App.css` e `src/index.css`.
- `apps/api`: NestJS. Entrada em `src/main.ts`, composição em `src/app.module.ts`, controllers e services em `src/`, testes unitários `*.spec.ts` e testes de integração em `test/*.e2e-spec.ts`.
- `pnpm-workspace.yaml` define os pacotes; `pnpm-lock.yaml` é o lockfile compartilhado.

Os aplicativos ainda contêm as telas e endpoints iniciais dos templates. Não presuma integrações, banco de dados ou autenticação já implementados.

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
| `pnpm test:api` | Executar testes unitários da API com Vitest |
| `pnpm test:api:e2e` | Executar testes de integração da API com Vitest e Supertest |

O frontend usa a porta 5173 por padrão; a API usa `PORT` ou 3000. Outros scripts podem ser executados com `pnpm --filter web <script>` ou `pnpm --filter api <script>`.

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
- Use Vitest com React Testing Library e user-event para os testes de componentes. Ao introduzir essa estrutura, configure o ambiente DOM e os scripts necessários no pacote web.
- Tailwind e a estrutura de testes do frontend ainda precisam ser configurados. Ao implementar componentes, prepare a infraestrutura necessária e entregue o componente com seu teste passando.

## Git: Conventional Commits

- Crie commits, merges e pushes apenas quando solicitado. Se estiver no branch padrão, crie um branch antes de commitar.
- Use Conventional Commits para ambos os aplicativos e para alterações na raiz do monorepo: `<tipo>(<escopo opcional>): <descrição>`.
- Use tipos coerentes com a mudança, como `feat`, `fix`, `docs`, `refactor`, `test`, `style`, `build`, `ci`, `perf`, `revert` e `chore`. O tipo `style` se refere à formatação do código; mudanças visuais de produto devem usar o tipo correspondente ao seu efeito, como `feat` ou `fix`.
- Quando útil, use escopos como `web`, `api` ou `workspace`. Exemplos: `feat(web): adiciona formulário de cadastro`, `fix(api): retorna 404 para recurso inexistente` e `docs(workspace): atualiza instruções dos agentes`.
- Sinalize mudanças incompatíveis com `!` após o tipo/escopo ou com um rodapé `BREAKING CHANGE:`, descrevendo o impacto e a migração necessária.
- Mantenha cada commit focado em uma mudança lógica. Antes de criar commits, revise o diff e inclua apenas os arquivos relacionados à tarefa.

## Validação

- Para alterações de código, execute lint e build do aplicativo afetado.
- Para mudanças no frontend, execute também os testes dos componentes afetados. Enquanto o script de testes não existir, configure-o junto da implementação dos componentes; a verificação no navegador complementa os testes automatizados.
- Para mudanças na API, siga também a seção de validação de `apps/api/AGENTS.md`.
- Para mudanças apenas de documentação, confira os comandos e caminhos citados; não é necessário compilar os aplicativos.
- Informe quais verificações foram executadas e eventuais falhas ou limitações.
