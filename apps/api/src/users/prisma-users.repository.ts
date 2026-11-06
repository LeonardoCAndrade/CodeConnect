import { Injectable } from '@nestjs/common';
import { Prisma, type User as UserRecord } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { User } from './user.entity.js';
import {
  EmailAlreadyExistsError,
  NewUser,
  UsersRepository,
} from './users.repository.js';

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class PrismaUsersRepository extends UsersRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: NewUser): Promise<User> {
    try {
      return toUser(await this.prisma.user.create({ data }));
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_VIOLATION
      ) {
        throw new EmailAlreadyExistsError();
      }
      throw error;
    }
  }

  async findById(id: string): Promise<User | undefined> {
    // A coluna é uniqueidentifier: um valor fora do formato faria o SQL Server
    // falhar na conversão em vez de simplesmente não encontrar o registro.
    if (!UUID_PATTERN.test(id)) {
      return undefined;
    }
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? toUser(record) : undefined;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    return record ? toUser(record) : undefined;
  }
}

function toUser(record: UserRecord): User {
  return {
    // O SQL Server devolve uniqueidentifier em maiúsculas; a API expõe minúsculas.
    id: record.id.toLowerCase(),
    name: record.name,
    email: record.email,
    passwordHash: record.passwordHash,
    createdAt: record.createdAt,
  };
}
