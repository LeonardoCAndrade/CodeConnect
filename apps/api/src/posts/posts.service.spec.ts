import { NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service.js';
import { InMemoryPostsRepository } from './testing/in-memory-posts.repository.js';

const ana = { id: 'a0000000-0000-4000-8000-000000000001', name: 'Ana Souza' };
const bia = { id: 'b0000000-0000-4000-8000-000000000002', name: 'Bia Lima' };

describe('PostsService', () => {
  let repository: InMemoryPostsRepository;
  let service: PostsService;

  beforeEach(() => {
    repository = new InMemoryPostsRepository();
    repository.addAuthor(ana);
    repository.addAuthor(bia);
    service = new PostsService(repository);
  });

  function publish(title: string, tags: string[] = [], body = 'Descrição') {
    return service.create({ title, body, tags }, ana.id);
  }

  it('publica um post com autor, handle e contagens zeradas', async () => {
    const post = await service.create(
      {
        title: 'Hooks no React',
        body: 'Como criar hooks',
        code: '   ',
        tags: ['React'],
      },
      ana.id,
    );

    expect(post).toEqual({
      id: expect.any(String),
      title: 'Hooks no React',
      body: 'Como criar hooks',
      code: null,
      imageUrl: null,
      tags: ['React'],
      author: { id: ana.id, name: 'Ana Souza', handle: 'ana.souza' },
      likesCount: 0,
      commentsCount: 0,
      likedByMe: false,
      createdAt: expect.any(Date),
    });
  });

  it('lista os mais recentes primeiro, com paginação', async () => {
    await publish('Primeiro');
    await publish('Segundo');
    await publish('Terceiro');

    const page = await service.list({ pageSize: 2 });
    expect(page).toMatchObject({ page: 1, pageSize: 2, total: 3 });
    expect(page.items.map((p) => p.title)).toEqual(['Terceiro', 'Segundo']);
    expect(page.items[0]).not.toHaveProperty('code');

    const second = await service.list({ pageSize: 2, page: 2 });
    expect(second.items.map((p) => p.title)).toEqual(['Primeiro']);
  });

  it('filtra pela busca (todas as palavras, por prefixo) e por todas as tags', async () => {
    await publish('Hooks no React', ['React', 'Front-end']);
    await publish('Acessibilidade no React', ['React']);
    await publish('APIs com NestJS', ['Back-end']);

    const search = await service.list({ q: 'reac hook' });
    expect(search.items.map((p) => p.title)).toEqual(['Hooks no React']);

    const tags = await service.list({ tags: ['react', 'FRONT-END'] });
    expect(tags.items.map((p) => p.title)).toEqual(['Hooks no React']);

    const accents = await service.list({ q: 'acessibilidade' });
    expect(accents.total).toBe(1);
  });

  it('ordena por curtidas na aba populares e informa likedByMe', async () => {
    const first = await publish('Primeiro');
    await publish('Segundo');
    await service.like(first.id, bia.id);

    const popular = await service.list({ sort: 'popular' }, bia.id);
    expect(
      popular.items.map((p) => [p.title, p.likesCount, p.likedByMe]),
    ).toEqual([
      ['Primeiro', 1, true],
      ['Segundo', 0, false],
    ]);
  });

  it('curte e descurte de forma idempotente', async () => {
    const post = await publish('Post');

    await service.like(post.id, bia.id);
    await service.like(post.id, bia.id);
    expect((await service.findById(post.id, bia.id)).likesCount).toBe(1);

    await service.unlike(post.id, bia.id);
    await service.unlike(post.id, bia.id);
    const after = await service.findById(post.id, bia.id);
    expect(after).toMatchObject({ likesCount: 0, likedByMe: false });
  });

  it('comenta e lista os comentários do post', async () => {
    const post = await publish('Post');

    const comment = await service.createComment(
      post.id,
      { body: 'Muito bom!' },
      bia.id,
    );
    expect(comment).toEqual({
      id: expect.any(String),
      body: 'Muito bom!',
      author: { id: bia.id, name: 'Bia Lima', handle: 'bia.lima' },
      createdAt: expect.any(Date),
    });
    await expect(service.listComments(post.id)).resolves.toEqual([comment]);
    expect((await service.findById(post.id)).commentsCount).toBe(1);
  });

  it('retorna 404 para post inexistente', async () => {
    const missing = 'c0000000-0000-4000-8000-000000000003';
    await expect(service.findById(missing)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.like(missing, bia.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.unlike(missing, bia.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.listComments(missing)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(
      service.createComment(missing, { body: 'Oi' }, bia.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lista as tags mais usadas', async () => {
    await publish('A', ['React', 'CSS']);
    await publish('B', ['React']);

    await expect(service.listTags()).resolves.toEqual([
      { name: 'React', postsCount: 2 },
      { name: 'CSS', postsCount: 1 },
    ]);
  });
});
