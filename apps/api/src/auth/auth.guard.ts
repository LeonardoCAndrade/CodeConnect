import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { JwtPayload } from './jwt-payload.js';

export type AuthenticatedRequest = Request & { user?: JwtPayload };

/** Exige um token Bearer válido e anexa o payload à requisição. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = await authenticate(this.jwtService, request);
    if (!user) {
      throw new UnauthorizedException();
    }
    request.user = user;
    return true;
  }
}

/**
 * Identifica o usuário quando há um token válido, sem bloquear a requisição.
 * Token ausente ou inválido segue como acesso anônimo (rotas públicas).
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.user = await authenticate(this.jwtService, request);
    return true;
  }
}

async function authenticate(
  jwtService: JwtService,
  request: Request,
): Promise<JwtPayload | undefined> {
  const token = extractTokenFromHeader(request);
  if (!token) {
    return undefined;
  }
  try {
    return await jwtService.verifyAsync<JwtPayload>(token, {
      algorithms: ['HS256'],
    });
  } catch {
    return undefined;
  }
}

function extractTokenFromHeader(request: Request): string | undefined {
  // O esquema de autenticação não diferencia maiúsculas (RFC 7235).
  const [type, token] = request.headers.authorization?.split(/\s+/) ?? [];
  return type?.toLowerCase() === 'bearer' ? token : undefined;
}
