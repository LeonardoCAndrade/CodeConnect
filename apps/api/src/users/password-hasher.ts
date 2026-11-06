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

function isHex(value: string | undefined, bytes: number): value is string {
  return value?.length === bytes * 2 && /^[0-9a-f]+$/i.test(value);
}

@Injectable()
export class PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(SALT_LENGTH);
    const key = await scryptAsync(password, salt, KEY_LENGTH);
    return `${salt.toString('hex')}:${key.toString('hex')}`;
  }

  async verify(password: string, hash: string): Promise<boolean> {
    const [saltHex, keyHex] = hash.split(':');
    if (!isHex(saltHex, SALT_LENGTH) || !isHex(keyHex, KEY_LENGTH)) {
      return false;
    }
    const expected = Buffer.from(keyHex, 'hex');
    const actual = await scryptAsync(
      password,
      Buffer.from(saltHex, 'hex'),
      KEY_LENGTH,
    );
    return timingSafeEqual(actual, expected);
  }
}
