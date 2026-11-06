// Popula o banco de desenvolvimento com autores e 10 posts de exemplo.
// Execute com `pnpm db:seed`. É idempotente: recria os posts dos autores de exemplo
// sem tocar nos demais usuários. Nunca rode contra o banco de testes ou de produção.
import 'reflect-metadata';
import { PrismaMssql } from '@prisma/adapter-mssql';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { loadEnvFile } from '../src/load-env.js';
import { PasswordHasher } from '../src/users/password-hasher.js';

loadEnvFile();

const PASSWORD = 'senha123';

const authors = [
  { key: 'julio', name: 'Julio Lima', email: 'julio@codeconnect.dev' },
  { key: 'marcia', name: 'Marcia Alves', email: 'marcia@codeconnect.dev' },
  { key: 'gabriel', name: 'Gabriel Luz', email: 'gabriel@codeconnect.dev' },
  { key: 'marcela', name: 'Marcela Lins', email: 'marcela@codeconnect.dev' },
] as const;

type AuthorKey = (typeof authors)[number]['key'];

const image = (n: number) =>
  `https://picsum.photos/seed/codeconnect-${n}/960/480`;

// imageUrl null e a URL quebrada exercitam o fallback de thumbnail do frontend.
const posts: {
  author: AuthorKey;
  title: string;
  body: string;
  tags: string[];
  imageUrl: string | null;
  code?: string;
  likedBy: AuthorKey[];
  comments: [AuthorKey, string][];
}[] = [
  {
    author: 'julio',
    title: 'Hooks personalizados no React',
    body: 'Como extraí a lógica de formulários para hooks reutilizáveis e deixei os componentes mais simples de testar.',
    tags: ['React', 'Front-end'],
    imageUrl: image(1),
    code: `function useToggle(initial = false) {
  const [on, setOn] = useState(initial)
  const toggle = useCallback(() => setOn((value) => !value), [])
  return [on, toggle] as const
}`,
    likedBy: ['marcia', 'gabriel', 'marcela'],
    comments: [
      ['marcia', 'Achei muito bom seu código, @julio, parabéns!'],
      ['gabriel', 'Quanto tempo você levou para finalizar esse projeto?'],
    ],
  },
  {
    author: 'marcia',
    title: 'Dashboard acessível com Tailwind',
    body: 'Um painel administrativo com contraste adequado, navegação por teclado e leitores de tela testados.',
    tags: ['Acessibilidade', 'CSS', 'Front-end'],
    imageUrl: image(2),
    likedBy: ['julio', 'marcela'],
    comments: [['marcela', 'Espero chegar um dia nesse nível! Muito bom!']],
  },
  {
    author: 'gabriel',
    title: 'API REST com NestJS e Prisma',
    body: 'Estrutura de módulos, repositórios e validação de DTOs em uma API de cadastro de usuários.',
    tags: ['NestJS', 'Back-end', 'TypeScript'],
    imageUrl: image(3),
    code: `@Get(':id')
findOne(@Param('id', ParseUUIDPipe) id: string) {
  return this.usersService.findById(id)
}`,
    likedBy: ['julio'],
    comments: [],
  },
  {
    author: 'marcela',
    title: 'Botões animados só com CSS',
    body: 'Microinterações de hover e foco usando transições, sem nenhuma biblioteca de animação.',
    tags: ['CSS', 'Front-end'],
    imageUrl: null,
    likedBy: ['julio', 'marcia', 'gabriel'],
    comments: [['julio', 'Ficou muito fluido, parabéns!']],
  },
  {
    author: 'julio',
    title: 'Aplicativo de delivery em React Native',
    body: 'Telas de cardápio, carrinho e acompanhamento de pedido com navegação em pilha e abas.',
    tags: ['React', 'Mobile'],
    imageUrl: image(5),
    likedBy: ['marcela'],
    comments: [],
  },
  {
    author: 'marcia',
    title: 'Busca full-text no SQL Server',
    body: 'Como usar CONTAINSTABLE para pesquisar por prefixo em títulos e descrições com bom desempenho.',
    tags: ['SQL', 'Back-end'],
    imageUrl: 'https://imagens.codeconnect.invalid/busca-full-text.png',
    code: `SELECT p.id
FROM posts p
INNER JOIN CONTAINSTABLE(posts, (title, body), '"reac*"') ft
  ON ft.[KEY] = p.id`,
    likedBy: ['gabriel'],
    comments: [['gabriel', 'Não sabia que dava para buscar por prefixo!']],
  },
  {
    author: 'gabriel',
    title: 'Testes de componentes com Testing Library',
    body: 'Testando o comportamento que a pessoa usuária vê: papéis, nomes acessíveis e interações reais.',
    tags: ['React', 'Testes'],
    imageUrl: image(7),
    likedBy: ['julio', 'marcia'],
    comments: [],
  },
  {
    author: 'marcela',
    title: 'Design system com tokens',
    body: 'Cores, espaçamentos e tipografia definidos uma vez e reaproveitados em todos os componentes.',
    tags: ['Design', 'CSS'],
    imageUrl: image(8),
    likedBy: [],
    comments: [],
  },
  {
    author: 'julio',
    title: 'Autenticação JWT de ponta a ponta',
    body: 'Emissão de token na API, armazenamento da sessão no navegador e rotas protegidas no React.',
    tags: ['Segurança', 'Back-end', 'React'],
    imageUrl: null,
    code: `const token = await jwtService.signAsync({ sub: user.id })
return { accessToken: token, tokenType: 'Bearer' }`,
    likedBy: ['marcia', 'gabriel'],
    comments: [['marcela', 'Explicação muito clara, obrigada!']],
  },
  {
    author: 'marcia',
    title: 'Gráficos interativos com D3',
    body: 'Visualização de dados de vendas com zoom, tooltip e transições entre períodos.',
    tags: ['Dados', 'Front-end'],
    imageUrl: image(10),
    likedBy: ['julio'],
    comments: [],
  },
];

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL não definida em apps/api/.env');
  }
  if (/;database=codeconnect_test(;|$)/i.test(url)) {
    throw new Error('O seed não deve rodar no banco de testes');
  }

  const prisma = new PrismaClient({ adapter: new PrismaMssql(url) });
  try {
    const passwordHash = await new PasswordHasher().hash(PASSWORD);
    const ids = {} as Record<AuthorKey, string>;
    for (const author of authors) {
      const user = await prisma.user.upsert({
        where: { email: author.email },
        create: { name: author.name, email: author.email, passwordHash },
        update: { name: author.name, passwordHash },
      });
      ids[author.key] = user.id;
    }
    const authorIds = Object.values(ids);

    // Recria só o conteúdo dos autores de exemplo.
    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { authorId: { in: authorIds } } }),
      prisma.like.deleteMany({ where: { userId: { in: authorIds } } }),
      prisma.post.deleteMany({ where: { authorId: { in: authorIds } } }),
    ]);

    // Do mais antigo ao mais novo, com uma hora de intervalo: o primeiro da lista
    // aparece no topo do feed ("recentes").
    const now = Date.now();
    for (const [index, post] of posts.entries()) {
      const createdAt = new Date(now - index * 60 * 60 * 1000);
      await prisma.post.create({
        data: {
          title: post.title,
          body: post.body,
          code: post.code ?? null,
          imageUrl: post.imageUrl,
          authorId: ids[post.author],
          createdAt,
          tags: {
            create: post.tags.map((name) => ({
              tag: { connectOrCreate: { where: { name }, create: { name } } },
            })),
          },
          likes: {
            create: post.likedBy.map((key) => ({ userId: ids[key] })),
          },
          comments: {
            create: post.comments.map(([key, body], i) => ({
              authorId: ids[key],
              body,
              createdAt: new Date(createdAt.getTime() + (i + 1) * 60_000),
            })),
          },
        },
      });
    }

    console.log(
      `Seed concluído: ${authors.length} autores e ${posts.length} posts. ` +
        `Senha dos autores: ${PASSWORD}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

await main();
