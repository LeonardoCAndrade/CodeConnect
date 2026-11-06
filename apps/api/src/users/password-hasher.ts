import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keyLength: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

@Injectable()
export class PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(SALT_LENGTH);
    const key = await scryptAsync(password, salt, KEY_LENGTH);
    return `${salt.toString('hex')}:${key.toString('hex')}`;
  }

  async verify(password: string, hash: string): Promise<boolean> {
    const [saltHex, keyHex] = hash.split(':');
    if (!saltHex || !keyHex) {
      return false;
    }
    const expected = Buffer.from(keyHex, 'hex');
    const actual = await scryptAsync(
      password,
      Buffer.from(saltHex, 'hex'),
      expected.length,
    );
    return timingSafeEqual(actual, expected);
  }
}
