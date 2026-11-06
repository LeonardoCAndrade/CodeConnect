import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OptionalAuthGuard, type AuthenticatedRequest } from './auth.guard.js';

function contextFor(request: Partial<AuthenticatedRequest>): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('OptionalAuthGuard', () => {
  const jwtService = new JwtService({ secret: 'segredo-de-teste' });
  const guard = new OptionalAuthGuard(jwtService);

  it('deixa passar sem token, como acesso anônimo', async () => {
    const request: Partial<AuthenticatedRequest> = { headers: {} };
    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });

  it('ignora token inválido em vez de bloquear', async () => {
    const request: Partial<AuthenticatedRequest> = {
      headers: { authorization: 'Bearer invalido' },
    };
    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });

  it('identifica o usuário com token válido', async () => {
    const token = await jwtService.signAsync({ sub: '1', email: 'a@a.com' });
    const request: Partial<AuthenticatedRequest> = {
      headers: { authorization: `Bearer ${token}` },
    };
    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user).toMatchObject({ sub: '1' });
  });
});
