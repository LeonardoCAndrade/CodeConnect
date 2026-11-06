import { Module } from '@nestjs/common';
import { PasswordHasher } from './password-hasher.js';
import { PrismaUsersRepository } from './prisma-users.repository.js';
import { UsersController } from './users.controller.js';
import { UsersRepository } from './users.repository.js';
import { UsersService } from './users.service.js';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: UsersRepository, useClass: PrismaUsersRepository },
    PasswordHasher,
  ],
  exports: [UsersService],
})
export class UsersModule {}
