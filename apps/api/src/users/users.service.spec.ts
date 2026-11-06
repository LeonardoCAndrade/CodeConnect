import { ConflictException, NotFoundException } from '@nestjs/common';
import { PasswordHasher } from './password-hasher.js';
import { InMemoryUsersRepository } from './testing/in-memory-users.repository.js';
import { EmailAlreadyExistsError } from './users.repository.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let repository: InMemoryUsersRepository;
  let service: UsersService;

  beforeEach(() => {
    repository = new InMemoryUsersRepository();
    service = new UsersService(repository, new PasswordHasher());
  });

  it('cria um usuário sem expor a senha', async () => {
    const user = await service.create({
      name: ' Ana Souza ',
      email: 'Ana@Example.com',
      password: 'senha123',
    });

    expect(user).toEqual({
      id: expect.any(String),
      name: 'Ana Souza',
      email: 'ana@example.com',
      createdAt: expect.any(Date),
    });
    expect(user).not.toHaveProperty('password');
    expect(user).not.toHaveProperty('passwordHash');
  });

  it('rejeita email já cadastrado, ignorando maiúsculas', async () => {
    await service.create({
      name: 'Ana',
      email: 'ana@example.com',
      password: 'senha123',
    });

    await expect(
      service.create({
        name: 'Outra Ana',
        email: 'ANA@example.com',
        password: 'senha456',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('busca um usuário pelo id', async () => {
    const created = await service.create({
      name: 'Ana',
      email: 'ana@example.com',
      password: 'senha123',
    });

    await expect(service.findById(created.id)).resolves.toEqual(created);
    await expect(service.findById('inexistente')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('converte conflito do repositório em cadastro simultâneo para 409', async () => {
    vi.spyOn(repository, 'create').mockRejectedValueOnce(
      new EmailAlreadyExistsError(),
    );

    await expect(
      service.create({
        name: 'Ana',
        email: 'ana@example.com',
        password: 'senha123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('encontra o usuário apenas com credenciais válidas', async () => {
    await service.create({
      name: 'Ana',
      email: 'ana@example.com',
      password: 'senha123',
    });

    await expect(
      service.findByCredentials('ANA@example.com', 'senha123'),
    ).resolves.toMatchObject({ email: 'ana@example.com' });
    await expect(
      service.findByCredentials('ana@example.com', 'errada'),
    ).resolves.toBeUndefined();
    await expect(
      service.findByCredentials('outra@example.com', 'senha123'),
    ).resolves.toBeUndefined();
  });
});
