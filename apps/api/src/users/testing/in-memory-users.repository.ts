import { randomUUID } from 'node:crypto';
import { User } from '../user.entity.js';
import {
  EmailAlreadyExistsError,
  NewUser,
  UsersRepository,
} from '../users.repository.js';

// Implementação em memória para testes unitários, sem banco de dados.
export class InMemoryUsersRepository extends UsersRepository {
  private readonly users = new Map<string, User>();

  create(data: NewUser): Promise<User> {
    for (const user of this.users.values()) {
      if (user.email === data.email) {
        return Promise.reject(new EmailAlreadyExistsError());
      }
    }
    const user: User = { ...data, id: randomUUID(), createdAt: new Date() };
    this.users.set(user.id, user);
    return Promise.resolve(user);
  }

  findById(id: string): Promise<User | undefined> {
    return Promise.resolve(this.users.get(id));
  }

  findByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return Promise.resolve(user);
      }
    }
    return Promise.resolve(undefined);
  }
}
