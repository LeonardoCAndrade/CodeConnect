import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { CreateTokenDto } from './dto/create-token.dto.js';
import { TokenResponseDto } from './dto/token-response.dto.js';

@ApiTags('auth')
@Controller('auth/tokens')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({ summary: 'Efetua login e emite um token de acesso (JWT)' })
  @ApiCreatedResponse({ type: TokenResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiUnauthorizedResponse({ description: 'Email ou senha inválidos' })
  create(@Body() dto: CreateTokenDto): Promise<TokenResponseDto> {
    return this.authService.createToken(dto);
  }
}
