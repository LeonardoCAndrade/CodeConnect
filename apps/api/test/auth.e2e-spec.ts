import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/configure-app.js';
import { PrismaService } from './../src/prisma/prisma.service.js';
import { resetDatabase } from './reset-database.js';

const newUser = {
  name: 'Ana Souza',
  email: 'ana@example.com',
  password: 'senha123',
};

describe('Users e Auth (e2e)', () => {
  let app: INestApplication<App>;

  async function createApp(): Promise<INestApplication<App>> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const instance =
      moduleFixture.createNestApplication<INestApplication<App>>();
    configureApp(instance);
    await instance.init();
    return instance;
  }

  beforeEach(async () => {
    app = await createApp();
    await resetDatabase(app.get(PrismaService));
  });

  afterEach(async () => {
    await app.close();
  });

  async function login(): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/auth/tokens')
      .send({ email: newUser.email, password: newUser.password })
      .expect(201);
    return (res.body as { accessToken: string }).accessToken;
  }

  describe('POST /users', () => {
    it('cria o usuário com 201 e Location', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /json/);

      const body = res.body as Record<string, unknown>;
      expect(body).toEqual({
        id: expect.any(String),
        name: newUser.name,
        email: newUser.email,
        createdAt: expect.any(String),
      });
      expect(res.headers.location).toBe(`/users/${body.id as string}`);
    });

    it('retorna 409 para email já cadastrado', async () => {
      await request(app.getHttpServer()).post('/users').send(newUser);

      await request(app.getHttpServer())
        .post('/users')
        .send({ ...newUser, email: 'ANA@example.com' })
        .expect(409);
    });

    it.each([
      ['email inválido', { ...newUser, email: 'nao-e-email' }],
      ['senha curta', { ...newUser, password: '123' }],
      ['nome ausente', { email: newUser.email, password: newUser.password }],
      ['campo extra', { ...newUser, role: 'admin' }],
    ])('retorna 400 para %s', async (_case, body) => {
      await request(app.getHttpServer()).post('/users').send(body).expect(400);
    });
  });

  describe('POST /auth/tokens', () => {
    beforeEach(async () => {
      await request(app.getHttpServer()).post('/users').send(newUser);
    });

    it('emite token Bearer com credenciais válidas', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/tokens')
        .send({ email: newUser.email, password: newUser.password })
        .expect(201);

      expect(res.body).toEqual({
        accessToken: expect.any(String),
        tokenType: 'Bearer',
        expiresIn: expect.any(Number),
      });
    });

    it('retorna 401 para senha incorreta', async () => {
      await request(app.getHttpServer())
        .post('/auth/tokens')
        .send({ email: newUser.email, password: 'errada' })
        .expect(401);
    });

    it('retorna 400 para corpo inválido', async () => {
      await request(app.getHttpServer())
        .post('/auth/tokens')
        .send({ email: newUser.email })
        .expect(400);
    });
  });

  describe('GET /users/me', () => {
    it('retorna o usuário autenticado', async () => {
      await request(app.getHttpServer()).post('/users').send(newUser);
      const token = await login();

      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toMatchObject({
        name: newUser.name,
        email: newUser.email,
      });
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('retorna 401 sem token ou com token inválido', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer invalido')
        .expect(401);
    });
  });

  describe('GET /users/:id', () => {
    it('retorna o usuário indicado no Location', async () => {
      const created = await request(app.getHttpServer())
        .post('/users')
        .send(newUser);
      const token = await login();

      await request(app.getHttpServer())
        .get(created.headers.location as string)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({ email: newUser.email });
        });
    });

    it('retorna 404, 400 e 401 conforme o caso', async () => {
      await request(app.getHttpServer()).post('/users').send(newUser);
      const token = await login();

      await request(app.getHttpServer())
        .get('/users/3f1c2b4e-8a1d-4c6e-9f2a-1b2c3d4e5f60')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
      await request(app.getHttpServer())
        .get('/users/nao-e-uuid')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
      await request(app.getHttpServer())
        .get('/users/3f1c2b4e-8a1d-4c6e-9f2a-1b2c3d4e5f60')
        .expect(401);
    });
  });

  it('mantém o usuário no banco após reiniciar a aplicação', async () => {
    const created = await request(app.getHttpServer())
      .post('/users')
      .send(newUser)
      .expect(201);
    await app.close();

    app = await createApp();
    const token = await login();

    await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id: (created.body as { id: string }).id,
          email: newUser.email,
        });
      });
  });

  it('expõe a documentação OpenAPI com as rotas', async () => {
    const res = await request(app.getHttpServer())
      .get('/docs-json')
      .expect(200);

    const paths = Object.keys((res.body as { paths: object }).paths);
    expect(paths).toEqual(
      expect.arrayContaining([
        '/users',
        '/users/me',
        '/users/{id}',
        '/auth/tokens',
      ]),
    );
  });
});
