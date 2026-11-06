import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { PasswordHasher } from './password-hasher.js';
import { User } from './user.entity.js';
import {
  EmailAlreadyExistsError,
  UsersRepository,
} from './users.repository.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const email = normalizeEmail(dto.email);
    if (await this.usersRepository.findByEmail(email)) {
      throw new ConflictException('Email já cadastrado');
    }
    const passwordHash = await this.passwordHasher.hash(dto.password);
    try {
      const user = await this.usersRepository.create({
        name: dto.name.trim(),
        email,
        passwordHash,
      });
      return toResponse(user);
    } catch (error) {
      // Cadastro simultâneo do mesmo email: o índice único do banco garante a regra.
      if (error instanceof EmailAlreadyExistsError) {
        throw new ConflictException('Email já cadastrado');
      }
      throw error;
    }
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return toResponse(user);
  }

  async findByCredentials(
    email: string,
    password: string,
  ): Promise<User | undefined> {
    const user = await this.usersRepository.findByEmail(normalizeEmail(email));
    if (!user) {
      return undefined;
    }
    const valid = await this.passwordHasher.verify(password, user.passwordHash);
    return valid ? user : undefined;
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toResponse(user: User): UserResponseDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}
