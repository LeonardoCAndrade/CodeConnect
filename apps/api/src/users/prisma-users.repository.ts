import { Injectable } from '@nestjs/common';
import { isUuid, normalizeUuid } from '../common/uuid.js';
import { Prisma, type User as UserRecord } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { User } from './user.entity.js';
import {
  EmailAlreadyExistsError,
  NewUser,
  UsersRepository,
} from './users.repository.js';

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

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
    if (!isUuid(id)) {
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
    id: normalizeUuid(record.id),
    name: record.name,
    email: record.email,
    passwordHash: record.passwordHash,
    createdAt: record.createdAt,
  };
}
