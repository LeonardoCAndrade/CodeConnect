import { User } from './user.entity.js';

export type NewUser = Omit<User, 'id' | 'createdAt'>;

export class EmailAlreadyExistsError extends Error {
  constructor() {
    super('Email já cadastrado');
    this.name = 'EmailAlreadyExistsError';
  }
}

// Classe abstrata usada como token de injeção: o módulo escolhe a implementação.
export abstract class UsersRepository {
  /** @throws {EmailAlreadyExistsError} se o email já estiver cadastrado. */
  abstract create(data: NewUser): Promise<User>;

  abstract findById(id: string): Promise<User | undefined>;

  abstract findByEmail(email: string): Promise<User | undefined>;
}
