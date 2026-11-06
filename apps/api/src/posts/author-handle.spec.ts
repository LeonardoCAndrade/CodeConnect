import { toHandle } from './author-handle.js';

describe('toHandle', () => {
  it('deriva o identificador do nome, sem acentos e em minúsculas', () => {
    expect(toHandle('Ana Souza')).toBe('ana.souza');
    expect(toHandle('  Márcia  Lins-Alves ')).toBe('marcia.lins.alves');
  });

  it('usa um padrão quando o nome não tem letras ou números', () => {
    expect(toHandle('***')).toBe('usuario');
  });
});
