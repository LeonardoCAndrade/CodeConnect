import { PasswordHasher } from './password-hasher.js';

describe('PasswordHasher', () => {
  const hasher = new PasswordHasher();

  it('gera hash diferente da senha e com salt aleatório', async () => {
    const first = await hasher.hash('senha123');
    const second = await hasher.hash('senha123');

    expect(first).not.toContain('senha123');
    expect(first).not.toBe(second);
  });

  it('verifica a senha correta e rejeita a incorreta', async () => {
    const hash = await hasher.hash('senha123');

    await expect(hasher.verify('senha123', hash)).resolves.toBe(true);
    await expect(hasher.verify('outra-senha', hash)).resolves.toBe(false);
  });

  it('rejeita hash malformado', async () => {
    await expect(hasher.verify('senha123', 'invalido')).resolves.toBe(false);
  });

  it('rejeita hash com chave não hexadecimal ou de tamanho errado', async () => {
    await expect(hasher.verify('senha123', 'aabb:zz')).resolves.toBe(false);
    await expect(hasher.verify('senha123', 'aabb:')).resolves.toBe(false);
    const valid = await hasher.hash('senha123');
    const [salt, key] = valid.split(':');
    await expect(
      hasher.verify('senha123', `${salt}:${key.slice(0, 32)}`),
    ).resolves.toBe(false);
  });
});
