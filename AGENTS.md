# Instruções para agentes

## Estrutura do projeto

CodeConnect é um monorepo pnpm com dois aplicativos TypeScript:

- `apps/web`: React com Vite. Entrada em `src/main.tsx`, componente principal em `src/App.tsx`, estilos em `src/App.css` e `src/index.css`.
- `apps/api`: NestJS. Entrada em `src/main.ts`, composição em `src/app.module.ts`, controllers e services em `src/`, testes unitários `*.spec.ts` e testes de integração em `test/*.e2e-spec.ts`.
- `pnpm-workspace.yaml` define os pacotes; `pnpm-lock.yaml` é o lockfile compartilhado.

Os aplicativos ainda contêm as telas e endpoints iniciais dos templates. Não presuma integrações, banco de dados ou autenticação já implementados. Consulte também `apps/api/AGENTS.md` ao trabalhar na API.

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

- Mantenha o estilo do arquivo alterado: o frontend usa aspas simples e omite ponto e vírgula; a API usa aspas simples e ponto e vírgula.
- Ambos os pacotes usam ESM. Na API, preserve a extensão `.js` nos imports relativos dos arquivos TypeScript, conforme a configuração NodeNext.
- No frontend, use componentes funcionais e hooks, seguindo as regras de Atomic Design, Tailwind e testes abaixo. Na API, preserve a organização NestJS com módulos, controllers e services e injeção de dependências.
- Use pnpm para alterações de dependências e mantenha o lockfile sincronizado. Não edite `node_modules/`, `dist/` ou arquivos `*.tsbuildinfo` manualmente.
- Nunca inclua credenciais ou arquivos `.env` em commits.
- Preserve alterações preexistentes do usuário e mantenha mudanças restritas à tarefa solicitada.

## Frontend: Atomic Design, Tailwind e testes

- Organize os componentes em `apps/web/src/components/` nas camadas `atoms`, `molecules`, `organisms`, `templates` e `pages`.
- `atoms` são elementos básicos; `molecules` combinam elementos em pequenas unidades funcionais; `organisms` compõem seções da interface; `templates` definem layouts; `pages` conectam os layouts aos dados e fluxos da aplicação.
- Componha as camadas superiores a partir das inferiores. Componentes de camadas inferiores não devem importar componentes das superiores. Evite regras de negócio e acesso à API em atoms e molecules.
- Use Tailwind como padrão de estilização e mantenha cores, espaçamentos e demais tokens consistentes. Reserve CSS personalizado para necessidades que as utilities não expressem adequadamente e para estilos globais.
- Todo componente, de qualquer camada, deve ter um teste automatizado cobrindo seu uso essencial. Mantenha o teste próximo do componente, com nome `NomeDoComponente.test.tsx`.
- Teste o comportamento observável pelo usuário: renderização do conteúdo essencial e, quando houver interação, a ação principal e seu resultado. Prefira consultas por papel, nome acessível e texto; snapshots isolados não satisfazem essa exigência.
- Use Vitest com React Testing Library e user-event para os testes de componentes. Ao introduzir essa estrutura, configure o ambiente DOM e os scripts necessários no pacote web.
- Tailwind e a estrutura de testes do frontend ainda precisam ser configurados. Ao implementar componentes, prepare a infraestrutura necessária e entregue o componente com seu teste passando.

## Backend: princípios REST

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

## Git: Conventional Commits

- Use Conventional Commits para ambos os aplicativos e para alterações na raiz do monorepo: `<tipo>(<escopo opcional>): <descrição>`.
- Use tipos coerentes com a mudança, como `feat`, `fix`, `docs`, `refactor`, `test`, `style`, `build`, `ci`, `perf`, `revert` e `chore`. O tipo `style` se refere à formatação do código; mudanças visuais de produto devem usar o tipo correspondente ao seu efeito, como `feat` ou `fix`.
- Quando útil, use escopos como `web`, `api` ou `workspace`. Exemplos: `feat(web): adiciona formulário de cadastro`, `fix(api): retorna 404 para recurso inexistente` e `docs(workspace): atualiza instruções dos agentes`.
- Sinalize mudanças incompatíveis com `!` após o tipo/escopo ou com um rodapé `BREAKING CHANGE:`, descrevendo o impacto e a migração necessária.
- Mantenha cada commit focado em uma mudança lógica. Antes de criar commits, revise o diff e inclua apenas os arquivos relacionados à tarefa.

## Validação

- Para alterações de código, execute lint e build do aplicativo afetado.
- Para mudanças de comportamento da API, execute os testes unitários e, quando afetarem endpoints ou integração HTTP, os testes e2e. Acrescente testes relevantes para novos comportamentos e correções.
- Para mudanças no frontend, execute também os testes dos componentes afetados. Enquanto o script de testes não existir, configure-o junto da implementação dos componentes; a verificação no navegador complementa os testes automatizados.
- Para mudanças apenas de documentação, confira os comandos e caminhos citados; não é necessário compilar os aplicativos.
- Informe quais verificações foram executadas e eventuais falhas ou limitações.
