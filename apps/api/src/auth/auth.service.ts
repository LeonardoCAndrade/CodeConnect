import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { getJwtExpiresInSeconds } from './auth.constants.js';
import { CreateTokenDto } from './dto/create-token.dto.js';
import { TokenResponseDto } from './dto/token-response.dto.js';
import type { JwtPayload } from './jwt-payload.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async createToken(dto: CreateTokenDto): Promise<TokenResponseDto> {
    const user = await this.usersService.findByCredentials(
      dto.email,
      dto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      tokenType: 'Bearer',
      expiresIn: getJwtExpiresInSeconds(),
    };
  }
}
