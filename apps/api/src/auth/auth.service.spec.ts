import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PasswordHasher } from '../users/password-hasher.js';
import { InMemoryUsersRepository } from '../users/testing/in-memory-users.repository.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import type { JwtPayload } from './jwt-payload.js';

describe('AuthService', () => {
  const jwtService = new JwtService({ secret: 'segredo-de-teste' });
  let usersService: UsersService;
  let authService: AuthService;

  beforeEach(async () => {
    usersService = new UsersService(
      new InMemoryUsersRepository(),
      new PasswordHasher(),
    );
    authService = new AuthService(usersService, jwtService);
    await usersService.create({
      name: 'Ana',
      email: 'ana@example.com',
      password: 'senha123',
    });
  });

  it('emite um JWT com o id e o email do usuário', async () => {
    const result = await authService.createToken({
      email: 'ana@example.com',
      password: 'senha123',
    });

    expect(result.tokenType).toBe('Bearer');
    expect(result.expiresIn).toBeGreaterThan(0);
    const payload = await jwtService.verifyAsync<JwtPayload>(
      result.accessToken,
    );
    expect(payload.email).toBe('ana@example.com');
    expect(payload.sub).toEqual(expect.any(String));
  });

  it.each([
    ['senha incorreta', 'ana@example.com', 'errada'],
    ['email inexistente', 'outra@example.com', 'senha123'],
  ])('rejeita %s', async (_case, email, password) => {
    await expect(
      authService.createToken({ email, password }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
