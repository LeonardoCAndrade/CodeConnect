import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard, type AuthenticatedRequest } from './auth.guard.js';

function contextFor(request: Partial<AuthenticatedRequest>): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  const jwtService = new JwtService({ secret: 'segredo-de-teste' });
  const guard = new AuthGuard(jwtService);

  it('rejeita requisição sem token', async () => {
    await expect(
      guard.canActivate(contextFor({ headers: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejeita token inválido ou com esquema diferente de Bearer', async () => {
    const token = await jwtService.signAsync({ sub: '1', email: 'a@a.com' });

    await expect(
      guard.canActivate(
        contextFor({ headers: { authorization: 'Bearer invalido' } }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      guard.canActivate(
        contextFor({ headers: { authorization: `Basic ${token}` } }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('aceita o esquema Bearer sem diferenciar maiúsculas', async () => {
    const token = await jwtService.signAsync({ sub: '1', email: 'a@a.com' });

    await expect(
      guard.canActivate(
        contextFor({ headers: { authorization: `bearer ${token}` } }),
      ),
    ).resolves.toBe(true);
  });

  it('rejeita token assinado com outro algoritmo', async () => {
    const other = new JwtService({
      secret: 'segredo-de-teste',
      signOptions: { algorithm: 'HS512' },
    });
    const token = await other.signAsync({ sub: '1', email: 'a@a.com' });

    await expect(
      guard.canActivate(
        contextFor({ headers: { authorization: `Bearer ${token}` } }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('aceita token válido e anexa o payload à requisição', async () => {
    const token = await jwtService.signAsync({ sub: '1', email: 'a@a.com' });
    const request: Partial<AuthenticatedRequest> = {
      headers: { authorization: `Bearer ${token}` },
    };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user).toMatchObject({ sub: '1', email: 'a@a.com' });
  });
});
