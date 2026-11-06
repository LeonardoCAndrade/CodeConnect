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
});
