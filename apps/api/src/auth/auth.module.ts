import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module.js';
import { getJwtExpiresInSeconds, getJwtSecret } from './auth.constants.js';
import { AuthController } from './auth.controller.js';
import { AuthGuard, OptionalAuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: getJwtSecret(),
        signOptions: { expiresIn: getJwtExpiresInSeconds() },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, OptionalAuthGuard],
})
export class AuthModule {}
