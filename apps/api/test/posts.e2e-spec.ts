import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/configure-app.js';
import { PrismaService } from './../src/prisma/prisma.service.js';
import { resetDatabase } from './reset-database.js';

type PostBody = {
  id: string;
  title: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  code?: string | null;
};
type PageBody = {
  items: PostBody[];
  total: number;
  page: number;
  pageSize: number;
};

describe('Posts (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication<INestApplication<App>>();
    configureApp(app);
    await app.init();
    await resetDatabase(app.get(PrismaService));
    token = await signUp('Ana Souza', 'ana@example.com');
  });

  afterEach(async () => {
    await app.close();
  });

  const http = () => request(app.getHttpServer());

  async function signUp(name: string, email: string): Promise<string> {
    await http()
      .post('/users')
      .send({ name, email, password: 'senha123' })
      .expect(201);
    const res = await http()
      .post('/auth/tokens')
      .send({ email, password: 'senha123' })
      .expect(201);
    return (res.body as { accessToken: string }).accessToken;
  }

  async function publish(body: Record<string, unknown>): Promise<PostBody> {
    const res = await http()
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'Descrição do projeto', ...body })
      .expect(201);
    return res.body as PostBody;
  }

  // O índice full-text é populado de forma assíncrona após a inserção.
  async function searchUntil(
    query: string,
    expectedTotal: number,
  ): Promise<PageBody> {
    const deadline = Date.now() + 20_000;
    for (;;) {
      const res = await http().get(`/posts?${query}`).expect(200);
      const page = res.body as PageBody;
      if (page.total === expectedTotal || Date.now() > deadline) {
        return page;
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  describe('POST /posts', () => {
    it('publica com 201, Location e tags sem duplicatas', async () => {
      const res = await http()
        .post('/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: ' React zero to hero ',
          body: 'Projeto para praticar hooks.',
          code: 'const a = 1',
          imageUrl: 'https://example.com/capa.png',
          tags: ['React', ' react ', 'Front-end'],
        })
        .expect(201)
        .expect('Content-Type', /json/);

      const body = res.body as Record<string, unknown>;
      expect(body).toEqual({
        id: expect.any(String),
        title: 'React zero to hero',
        body: 'Projeto para praticar hooks.',
        code: 'const a = 1',
        imageUrl: 'https://example.com/capa.png',
        tags: ['Front-end', 'React'],
        author: {
          id: expect.any(String),
          name: 'Ana Souza',
          handle: 'ana.souza',
        },
        likesCount: 0,
        commentsCount: 0,
        likedByMe: false,
        createdAt: expect.any(String),
      });
      expect(res.headers.location).toBe(`/posts/${body.id as string}`);
    });

    it('exige autenticação', async () => {
      await http().post('/posts').send({ title: 'T', body: 'B' }).expect(401);
    });

    it('valida os dados com 400', async () => {
      for (const payload of [
        { title: '', body: 'B' },
        { title: 'T', body: 'B', imageUrl: 'javascript:alert(1)' },
        { title: 'T', body: 'B', tags: ['a', 'b', 'c', 'd', 'e', 'f'] },
        { title: 'T', body: 'B', extra: true },
      ]) {
        await http()
          .post('/posts')
          .set('Authorization', `Bearer ${token}`)
          .send(payload)
          .expect(400);
      }
    });
  });

  describe('GET /posts', () => {
    it('é público, pagina e ordena por recentes', async () => {
      await publish({ title: 'Primeiro' });
      await publish({ title: 'Segundo' });
      await publish({ title: 'Terceiro' });

      const res = await http().get('/posts?pageSize=2').expect(200);
      const page = res.body as PageBody;
      expect(page).toMatchObject({ page: 1, pageSize: 2, total: 3 });
      expect(page.items.map((p) => p.title)).toEqual(['Terceiro', 'Segundo']);
      expect(page.items[0]).not.toHaveProperty('code');
    });

    it('busca por texto com full-text search (prefixo e todas as palavras)', async () => {
      await publish({
        title: 'Hooks no React',
        body: 'Componentes funcionais',
      });
      await publish({ title: 'APIs com NestJS', body: 'Módulos e serviços' });
      await publish({
        title: 'Acessibilidade',
        body: 'Leitores de tela no React',
      });

      const prefix = await searchUntil('q=reac', 2);
      expect(prefix.items.map((p) => p.title).sort()).toEqual([
        'Acessibilidade',
        'Hooks no React',
      ]);

      const all = await searchUntil('q=react%20hooks', 1);
      expect(all.items.map((p) => p.title)).toEqual(['Hooks no React']);

      const accents = await searchUntil(
        `q=${encodeURIComponent('módulos')}`,
        1,
      );
      expect(accents.items.map((p) => p.title)).toEqual(['APIs com NestJS']);

      const none = await http().get('/posts?q=inexistente').expect(200);
      expect((none.body as PageBody).total).toBe(0);
    });

    it('trata operadores digitados como texto comum', async () => {
      await publish({ title: 'React' });
      await http()
        .get(`/posts?q=${encodeURIComponent('") OR * -- NEAR(')}`)
        .expect(200);
    });

    it('filtra por todas as tags, sem diferenciar maiúsculas', async () => {
      await publish({ title: 'A', tags: ['React', 'Front-end'] });
      await publish({ title: 'B', tags: ['React'] });

      const res = await http()
        .get('/posts?tags=react&tags=FRONT-END')
        .expect(200);
      expect((res.body as PageBody).items.map((p) => p.title)).toEqual(['A']);

      const single = await http().get('/posts?tags=React').expect(200);
      expect((single.body as PageBody).total).toBe(2);
    });

    it('rejeita parâmetros inválidos com 400', async () => {
      await http().get('/posts?sort=antigos').expect(400);
      await http().get('/posts?pageSize=100').expect(400);
      await http().get('/posts?page=0').expect(400);
    });
  });

  describe('curtidas', () => {
    it('curte e descurte de forma idempotente, refletindo em likedByMe e populares', async () => {
      const first = await publish({ title: 'Primeiro' });
      await publish({ title: 'Segundo' });
      const auth = { Authorization: `Bearer ${token}` };

      await http().put(`/posts/${first.id}/like`).set(auth).expect(204);
      await http().put(`/posts/${first.id}/like`).set(auth).expect(204);

      const popular = await http()
        .get('/posts?sort=popular')
        .set(auth)
        .expect(200);
      expect(
        (popular.body as PageBody).items.map((p) => [
          p.title,
          p.likesCount,
          p.likedByMe,
        ]),
      ).toEqual([
        ['Primeiro', 1, true],
        ['Segundo', 0, false],
      ]);

      const anonymous = await http().get(`/posts/${first.id}`).expect(200);
      expect(anonymous.body).toMatchObject({ likesCount: 1, likedByMe: false });

      await http().delete(`/posts/${first.id}/like`).set(auth).expect(204);
      await http().delete(`/posts/${first.id}/like`).set(auth).expect(204);
      const after = await http()
        .get(`/posts/${first.id}`)
        .set(auth)
        .expect(200);
      expect(after.body).toMatchObject({ likesCount: 0, likedByMe: false });
    });

    it('exige autenticação e retorna 404 para post inexistente', async () => {
      const post = await publish({ title: 'Post' });
      await http().put(`/posts/${post.id}/like`).expect(401);
      await http()
        .put('/posts/00000000-0000-4000-8000-000000000000/like')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('comentários', () => {
    it('lista publicamente e comenta autenticado', async () => {
      const post = await publish({ title: 'Post' });
      const other = await signUp('Bia Lima', 'bia@example.com');

      const res = await http()
        .post(`/posts/${post.id}/comments`)
        .set('Authorization', `Bearer ${other}`)
        .send({ body: ' Muito bom! ' })
        .expect(201);
      expect(res.headers.location).toBe(`/posts/${post.id}/comments`);
      expect(res.body).toMatchObject({
        body: 'Muito bom!',
        author: { name: 'Bia Lima', handle: 'bia.lima' },
      });

      const list = await http().get(`/posts/${post.id}/comments`).expect(200);
      expect(list.body).toEqual([res.body]);

      const detail = await http().get(`/posts/${post.id}`).expect(200);
      expect(detail.body).toMatchObject({ commentsCount: 1 });
    });

    it('valida, exige autenticação e retorna 404', async () => {
      const post = await publish({ title: 'Post' });
      await http()
        .post(`/posts/${post.id}/comments`)
        .send({ body: 'Oi' })
        .expect(401);
      await http()
        .post(`/posts/${post.id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ body: '   ' })
        .expect(400);
      await http().get('/posts/nao-e-uuid/comments').expect(404);
    });
  });

  it('GET /posts/:id retorna o detalhe com código ou 404', async () => {
    const post = await publish({ title: 'Post', code: 'console.log(1)' });
    const res = await http().get(`/posts/${post.id}`).expect(200);
    expect(res.body).toMatchObject({ title: 'Post', code: 'console.log(1)' });

    await http().get('/posts/00000000-0000-4000-8000-000000000000').expect(404);
    await http().get('/posts/nao-e-uuid').expect(404);
  });

  it('GET /tags lista as tags mais usadas', async () => {
    await publish({ title: 'A', tags: ['React', 'CSS'] });
    await publish({ title: 'B', tags: ['React'] });

    const res = await http().get('/tags').expect(200);
    expect(res.body).toEqual([
      { name: 'React', postsCount: 2 },
      { name: 'CSS', postsCount: 1 },
    ]);
  });
});
